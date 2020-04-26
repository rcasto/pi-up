const promisify = require('util').promisify;
const readFilePromise = promisify(require('fs').readFile);
const execPromise = promisify(require('child_process').exec);
const CronJob = require('cron').CronJob;
const nodemailer = require('nodemailer');
const config = require('./config.json');

const testScriptExecutionArgument = 'testing';
const transporter = nodemailer.createTransport({
    host: config.smtpInfo.host,
    port: config.smtpInfo.port,
    secure: false,
    auth: {
        user: config.smtpInfo.username,
        pass: config.smtpInfo.password
    }
});

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

async function sendMail(emailAddress, emailText, name) {
    if (!config.email) {
        console.log(`No email address provided, not sending email.`);
        return;
    }

    try {
        const message = {
            from: `pi-up <${emailAddress}>`,
            to: emailAddress,
            subject: name ?
                `${name} - pi-up results` :
                `pi-up results`,
            text: emailText,
        };

        await transporter.sendMail(message);

        console.log(`Successfully sent email to ${emailAddress}`);
    } catch (err) {
        console.error(`Failed to send email to ${emailAddress}\n${err}`);
    }
}

async function onSchedule(customScript, emailAddress, name = '') {
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
        await sendMail(emailAddress, emailText, name);
    }
}

async function onInit() {
    const customScript = await readCustomScript(config.scriptPath);
    const isTestScriptExecution = process.argv.slice(2)
        .some(arg => arg === testScriptExecutionArgument);

    if (isTestScriptExecution || config.runOnInit) {
        await onSchedule(customScript, config.email, config.name);

        if (isTestScriptExecution) {
            // Only testing the script out once, no need to start
            // scheduling the cron job
            return;
        }
    }

    console.log(`Starting schedule: ${config.scheduleCron}`);

    const scheduledJob = new CronJob(config.scheduleCron, () => onSchedule(customScript, config.email, config.name));
    scheduledJob.start();
}

onInit();