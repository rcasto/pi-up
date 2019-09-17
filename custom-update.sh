#!/bin/bash
# A Bash script to update the Raspberry Pi and Pi-hole
echo Starting Raspberry Pi maintenance

echo Starting to update Raspberry Pi
# Added --allow-releaseinfo-change to fix error:
# https://www.reddit.com/r/debian/comments/ca3se6/for_people_who_gets_this_error_inrelease_changed/
sudo apt-get --allow-releaseinfo-change update
sudo apt-get dist-upgrade -y
sudo apt autoremove -y
echo Done updating Raspberry Pi

echo Starting to update Pi-hole
pihole -up
echo Done updating Pi-hole

echo Done Raspberry Pi maintenance