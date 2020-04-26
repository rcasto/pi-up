# pi-up
The goal of this project is to execute a custom update script on a Raspberry Pi according to a desired schedule and be notified of the results.

## Background
Truthfully, this project could be used to execute any custom script on a Raspberry Pi according to a desired schedule.

The primary focus with this project though, is to update a Raspberry Pi. Also, this project currently assumes the Raspberry Pi is running Pi-hole and will attempt to update that as well.

## Usage

### Prerequisites
- Must have SSH access to Raspberry Pi
- Must know the IP address of your Raspberry Pi
- [Git](https://git-scm.com/downloads) must be installed: `apt-get install git` 
- [Node.js](https://nodejs.org/en/download/) must be installed on Raspberry Pi
- Must have sendmail package installed: `apt-get install sendmail`

### Configuration
To get started you will want to update the `config.json` file in this repo. Below is a sample configuration:
```json
{
    "scheduleCron": "0 0 18 * * *",
    "runOnInit": true,
    "scriptPath": "/home/pi/pi-up/custom-update.sh",
    "email": "your-email@address.com"
}
```

- **scheduleCron** - crontab describing schedule of which to run update script. [6 fields supported, finest granularity being 1 second](https://www.npmjs.com/package/cron#available-cron-patterns).
- **runOnInit** - Whether or not the update script should be ran on initialization of schedule or not. When false, first run will happen on next scheduled occurrence.
- **scriptPath** - Path to custom script containing update routine. It's much safer to use the exact path, instead of a relative path to the script.
- **email** - Optional field for email address, email is sent to this address with results of update routine. Simply leave empty to not send an email.

### Starting scheduled update
1. SSH into Raspberry Pi
    ```
    ssh pi@<your-pi-ip-address>
    ```
2. Git clone this repo (on Raspberry Pi):
    ```
    git clone https://github.com/rcasto/pi-up
    ```
3. Change directory into repository folder:
    ```
    cd pi-up
    ```
4. Install npm package dependencies:
    ```
    npm install
    ```
5. Adjust configuration and script to your liking
6. Start update schedule:
    ```
    npm start
    ```

### Running on Raspberry Pi bootup
Edit `/etc/rc.local`, adding:
```
node /home/pi/pi-up/index.js &
```

**Note:** You will want to have changed your `scriptPath` in the configuration to use an exact path.

### Resources
- [SSH Raspberry Pi](https://www.raspberrypi.org/documentation/remote-access/ssh/)
- [Install Node.js and Npm on Raspberry Pi](https://github.com/nodesource/distributions/blob/master/README.md#debinstall)
- [Helpful crontab scheduling editor](https://crontab.guru/)
- [Run command on Raspberry Pi bootup](https://www.raspberrypi.org/documentation/linux/usage/rc-local.md)
- [Pi-hole](https://pi-hole.net/)
- [Big Blocklist Collection](https://firebog.net/)
