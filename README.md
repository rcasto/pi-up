# pi-up
The goal of this project is to update a Raspberry Pi remotely using a custom script on a desired schedule.

## Scenario
I have a Raspberry Pi that I have [Pi-hole](https://pi-hole.net/) installed on and have my local network routing traffic through it to block ads.

This Raspberry Pi is setup headlessly and has no GUI. SSH access is available.

## Usage

### Configuration
To get started you will want to update the `config.json` file in this repo. Below is a sample configuration:
```json
{
    // The IP address of your Raspberry Pi
    "host": "192.168.0.112",
    // Username for Raspberry Pi
    // This typically should be pi
    "username": "pi",
    // Your SSH access password to the Raspberry Pi
    "password": "fakePiPassword",
    // Cron tab for update scheduling
    // https://crontab.guru/#45_23_*_*_1
    "scheduleCron": "45 23 * * 1",
    // Whether or not to run the job when initializing
    // Good to keep as true when testing changes to custom script
    "runOnInit": true
}
```

### Running
To run and get the update process started execute the following:
```
npm start
```