const promisify = require('util').promisify;
const readFilePromise = promisify(require('fs').readFile);
const execPromise = promisify(require('child_process').exec);
const CronJob = require('cron').CronJob;
const nodemailer = require('nodemailer');
const config = require('./config.json');

const transporter = nodemailer.createTransport({
    sendmail: true,
});

async function sendMail(emailText, wasSuccessful) {
    const message = {
        from: `pi-up <${config.email}>`,
        to: config.email,
        subject: `pi-up Results - ${wasSuccessful ? 'Success' : 'Failed'}`,
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

    let emailText = 'Custom script had no output';
    let wasJobSuccessful = true;

    if (stderr) {
        emailText = `An error occurred\n${stderr}`;
        wasJobSuccessful = false;
    } else if (stdout) {
        emailText = stdout;
    }

    if (wasJobSuccessful) {
        console.log(emailText);
    } else {
        console.error(emailText);
    }

    if (config.email) {
        await sendMail(emailText, wasJobSuccessful);
    }
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