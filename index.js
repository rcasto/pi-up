const path = require('path');
const promisify = require('util').promisify;
const readFilePromise = promisify(require('fs').readFile);
const execPromise = promisify(require('child_process').exec);
const CronJob = require('cron').CronJob;
const nodemailer = require('nodemailer');

/**
 * @typedef {Object} SmtpConfig
 * @property {string} host
 * @property {number} port
 * @property {string} username
 * @property {string} password
 */

/**
 * @typedef {Object} PiUpConfig
 * @property {string} [scheduleCron] crontab describing schedule of which to run update script.
 * @property {boolean} [runOnInit]
 * @property {string} [scriptPath]
 * @property {string} [email]
 * @property {string} [name]
 * @property {SmtpConfig} [smtpInfo]
 */

const testScriptExecutionArgument = 'testing';
/**
 * @type {PiUpConfig}
 */
const defaultConfig = Object.freeze({
    scheduleCron: '',
    runOnInit: true,
    scriptPath: path.resolve(__dirname, './custom-update.sh'),
    email: '',
    name: '',
    smtpInfo: {
        host: '',
        port: 587,
        username: '',
        password: ''
    }
});

/**
 * @param {string} scriptPath
 * @returns {Promise<string>} The custom script file contents as a string
 */
async function readCustomScript(scriptPath) {
    try {
        const customScript = await readFilePromise(scriptPath, {
            encoding: 'utf-8',
        });
        return customScript;
    } catch (err) {
        console.error(`Error reading custom script file at ${scriptPath}: ${err}`);
    }
}

/**
 * @param {string} emailText 
 * @param {PiUpConfig} config
 * @returns {Promise<void>}
 */
async function sendMail(emailText, config) {
    if (!config.email) {
        console.log(`No email address provided, not sending email.`);
        return;
    }

    try {
        const transporter = nodemailer.createTransport({
            host: config.smtpInfo.host,
            port: config.smtpInfo.port,
            secure: false,
            auth: {
                user: config.smtpInfo.username,
                pass: config.smtpInfo.password
            }
        });
        const message = {
            from: `pi-up <${config.email}>`,
            to: config.email,
            subject: config.name ?
                `${config.name} - pi-up results` :
                `pi-up results`,
            text: emailText,
        };

        await transporter.sendMail(message);

        console.log(`Successfully sent email to ${config.email}`);
    } catch (err) {
        console.error(`Failed to send email to ${config.email}\n${err}`);
    }
}

/**
 * @param {string} customScript 
 * @param {PiUpConfig} config 
 * @returns {Promise<void>}
 */
async function onSchedule(customScript, config) {
    let emailText;

    try {
        console.log('Custom script is beginning execution');

        const { stdout, stderr } = await execPromise(customScript);

        console.log('Custom script output');
        console.log('--------------------');

        if (stdout) {
            emailText = stdout;
        }

        if (stderr) {
            if (emailText) {
                emailText += '\n\n';
            }
            emailText += `Custom script error output:\n${stderr}`;
        }

        if (!emailText) {
            emailText = 'Custom script had no output';
        }

        console.log(emailText);
    } catch (err) {
        emailText = `An error occurred while executing the custom script\n${err}`;
        console.error(emailText);
    } finally {
        await sendMail(emailText, config);
    }
}

/**
 * 
 * @param {PiUpConfig} [config] Optional configuration for overriding pi-up defaults
 */
async function onInit(config = defaultConfig) {
    config = {
        ...defaultConfig,
        ...config
    };

    const customScript = await readCustomScript(config.scriptPath);
    const isTestScriptExecution = process.argv.slice(2)
        .some(arg => arg === testScriptExecutionArgument);

    if (isTestScriptExecution || config.runOnInit) {
        await onSchedule(customScript, config);

        if (isTestScriptExecution) {
            // Only testing the script out once, no need to start
            // scheduling the cron job
            return;
        }
    }

    if (config.scheduleCron) {
        console.log(`Starting schedule: ${config.scheduleCron}`);
        
        const scheduledJob = new CronJob(config.scheduleCron,
            () => onSchedule(customScript, config));
        scheduledJob.start();
    }
}

module.exports = onInit;