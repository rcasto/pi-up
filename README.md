# pi-up
The goal of this project is to update a Raspberry Pi using a custom script on a desired schedule and be notified of the results.

## Usage

### Prerequisites
- Must have SSH access to Raspberry Pi
- Git must be installed on Raspberry Pi (should be installed by default)
- Node.js must be installed on Raspberry Pi

### Configuration
To get started you will want to update the `config.json` file in this repo. Below is a sample configuration:
```json
{
    "scheduleCron": "30 0 * * *",
    "runOnInit": true,
    "scriptPath": "./custom-update.sh",
    "email": "your-email@address.com"
}
```

### Resources
- [SSH Raspberry Pi](https://www.raspberrypi.org/documentation/remote-access/ssh/)
- [Getting Git on Raspberry Pi](https://projects.raspberrypi.org/en/projects/getting-started-with-git/4)
- [Install Node.js and Npm on Raspberry Pi](https://www.instructables.com/id/Install-Nodejs-and-Npm-on-Raspberry-Pi/)
- [Extracting or Uncompressing tar.xz Files in Linux](https://scottlinux.com/2014/01/07/extracting-or-uncompressing-tar-xz-files-in-linux/)
- [Helpful crontab scheduling editor](https://crontab.guru/)