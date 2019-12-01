#!/bin/bash
# A Bash script to update the Raspberry Pi and Pi-hole
echo Starting Raspberry Pi maintenance

echo Starting to update Raspberry Pi

# Using technique from below url to detect if command exists
# https://stackoverflow.com/a/677212
if ! hash apt-get 2>/dev/null; then
    # echoes the message to stderr
    # https://stackoverflow.com/a/23550347
    >&2 echo apt-get command does not exist
    exit 1
fi

# Added --allow-releaseinfo-change to fix error:
# https://www.reddit.com/r/debian/comments/ca3se6/for_people_who_gets_this_error_inrelease_changed/
sudo apt-get --allow-releaseinfo-change update
sudo apt-get dist-upgrade -y
sudo apt autoremove -y
echo Done updating Raspberry Pi

if hash pihole 2>/dev/null; then
    echo Starting to update Pi-hole
    pihole -up
    echo Done updating Pi-hole

    echo Updating Pi-hole gravity
    pihole -g
    echo Done updating Pi-hole gravity
else
    echo pihole not installed, skipping Pi-hole routine
fi

echo Done Raspberry Pi maintenance