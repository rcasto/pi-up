const readFile = require('fs').readFile;
const promisify = require('util').promisify;
const readFilePromise = promisify(readFile);
const Client = require('ssh2').Client;
const config = require('./config.json');

const conn = new Client();

conn
    .on('ready', async () => {
        console.log('Client :: ready');

        const customScript = await readFilePromise('./custom-update.sh', {
            encoding: 'utf-8',
        });

        // console.log(customScript);

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
                    console.log(`${data}`);
                })
                .stderr.on('data', data => {
                    console.error('Error: ' + data);
                });
        });
    })
    .connect({
        host: config.host,
        port: 22,
        username: config.username,
        password: config.password,
    });