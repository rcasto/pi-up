#!/usr/bin/env node

const piUp = require('./index');
const fs = require('fs');

const commandName = 'pi-up';
const commandArgs = process.argv.slice(2);

/**
 * A helper method used to read a Node.js readable stream into string
 * @param {fs.ReadStream} readableStream
 * @returns {Promise<string>}
 */
async function streamToString(readableStream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        readableStream.setEncoding('utf8');
        readableStream.on('data', data => {
            chunks.push(data.toString());
        });
        readableStream.on('end', () => {
            resolve(chunks.join(''));
        });
        readableStream.on('error', reject);
    });
}

/**
 * Takes in a file path, reads the contents of the file in stream like fashion, and
 * asynchronously returns the contents of the file as a string.
 * @param {string} filePath
 * @returns {Promise<string>} 
 */
async function readFileToString(filePath) {
    const readerStream = fs.createReadStream(filePath);
    return streamToString(readerStream);
}

if (commandArgs.length <= 0) {
    console.log(`Usage: npx ${commandName} <package1> <package2> ... <packageN> or ${commandName} <package1> <package2> ... <packageN>`);
} else {
    const configFilePath = commandArgs[0];
    readFileToString(configFilePath)
        .then(configAsString => {
            try {
                const configAsJson = JSON.parse(configAsString);
                return configAsJson;
            } catch (err) {
                throw new Error(`${configFilePath} refers to a file that is invalid JSON`);
            }
        })
        .then(config => piUp(config))
        .catch(err => console.error(err));
}