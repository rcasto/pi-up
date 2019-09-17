const readFile = require('fs').readFile;
const promisify = require('util').promisify;
const readFilePromise = promisify(readFile);
const Client = require('ssh2').Client;
const config = require('./config.json');

const conn = new Client();
conn
    .on('ready', async () => {
        console.log('SSH connection established');

        const customScript = await readFilePromise('./custom-update.sh', {
            encoding: 'utf-8',
        });
        console.log('Custom script to execute');
        console.log('------------------------');
        console.log(customScript);
        console.log('------------------------');

        console.log('Executing custom script');
        console.log('-----------------------');

        conn.exec(customScript, (err, stream) => {
            if (err) {
                throw err;
            }

            stream
                .on('close', (code, signal) => {
                    console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
                    conn.end();
                })
                .on('data', data => {
                    process.stdout.write(`${data}`);
                })
                .stderr.on('data', data => {
                    console.error('Error: ' + data);
                });
        });
    })
    .on('error', (err) => {
        console.error(`Error occurred, maybe check your password is correct? Error details below.`);
        console.error(err);
    })
    .connect({
        host: config.host,
        port: 22,
        username: config.username,
        password: config.password,
    });