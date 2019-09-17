# piUp
The goal of this project is to update a Raspberry Pi remotely using a custom script on a desired schedule.

## Scenario
I have a Raspberry Pi that I have [Pi-hole](https://pi-hole.net/) installed on and have my local network routing traffic through it to block ads.

This Raspberry Pi is setup headlessly and has no GUI. SSH access is available.

## Notes
- Password incorrect error / connection connect errors should be friendlier
- Caution should be advised in executing arbitrary script remotely, typically integrators will be the one writing this though
- On error with a update, a email or sms should be sent to alert that there is an update routine issue that needs looked at