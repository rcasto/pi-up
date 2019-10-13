const promisify = require('util').promisify;
const readFilePromise = promisify(require('fs').readFile);
const execPromise = promisify(require('child_process').exec);
const CronJob = require('cron').CronJob;
const nodemailer = require('nodemailer');
const config = require('./config.json');

const testScriptExecutionArgument = 'testing';
const transporter = nodemailer.createTransport({
    sendmail: true,
});

async function readCustomScript(scriptPath) {
    try {
        const customScript = await readFilePromise(scriptPath, {
            encoding: 'utf-8',
        });
        return customScript;
    } catch(err) {
        console.error(`Error reading custom script file at ${scriptPath}: ${err}`);
    }
}

async function sendMail(emailAddress, emailText) {
    const message = {
        from: `pi-up <${emailAddress}>`,
        to: emailAddress,
        subject: `pi-up Results`,
        text: emailText,
    };
    await transporter.sendMail(message);
}

async function onSchedule(customScript, emailAddress) {
    try {
        console.log('Custom script is beginning execution');

        const { stdout, stderr } = await execPromise(customScript);

        console.log('Custom script output');
        console.log('--------------------');

        let emailText;

        if (stdout) {
            emailText = stdout;
        }

        if (stderr) {
            if (emailText) {
                emailText += '\n\n';
            }
            emailText += `Errors:\n${stderr}`;
        }

        if (!emailText) {
            emailText = 'Custom script had no output';
        }

        if (emailAddress) {
            await sendMail(emailAddress, emailText);
        }

        console.log(emailText);
    } catch (err) {
        console.error('An error occurred while executing the custom script');
        console.error(err.stderr);
    }
}

async function onInit() {
    const customScript = await readCustomScript(config.scriptPath);
    const isTestScriptExecution = process.argv.slice(2)
        .some(arg => arg === testScriptExecutionArgument);

    if (isTestScriptExecution) {
        await onSchedule(customScript, config.email);
        return;
    }

    if (config.runOnInit) {
        await onSchedule(customScript, config.email);
    }

    console.log(`Starting schedule: ${config.scheduleCron}`);

    const scheduledJob = new CronJob(config.scheduleCron, () => onSchedule(customScript, config.email));
    scheduledJob.start();
}

onInit();