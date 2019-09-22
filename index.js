const promisify = require('util').promisify;
const readFilePromise = promisify(require('fs').readFile);
const execPromise = promisify(require('child_process').exec);
const CronJob = require('cron').CronJob;
const nodemailer = require('nodemailer');
const config = require('./config.json');

const transporter = nodemailer.createTransport({
    sendmail: true,
});

async function sendMail(emailText) {
    const message = {
        from: `pi-up <${config.email}>`,
        to: config.email,
        subject: `pi-up Results`,
        text: emailText,
    };
    await transporter.sendMail(message);
}

async function onSchedule() {
    const customScript = await readFilePromise(config.scriptPath, {
        encoding: 'utf-8',
    });
    const { stdout, stderr } = await execPromise(customScript);

    console.log('Custom script being executed');
    console.log('----------------------------');
    console.log(customScript);

    console.log();
    console.log();

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

    if (config.email) {
        await sendMail(emailText);
    }

    console.log(emailText);
}

function onInit() {
    console.log(`Starting schedule: ${config.scheduleCron}`);

    if (config.runOnInit) {
        onSchedule();
    }

    const scheduledJob = new CronJob(config.scheduleCron, onSchedule);
    scheduledJob.start();
}

onInit();