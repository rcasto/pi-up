#!/bin/bash
# A Bash script to update the Raspberry Pi and Pi-hole
echo Starting Raspberry Pi maintenance

echo Starting to update Raspberry Pi
sudo apt-get update
sudo apt-get dist-upgrade -y
sudo apt autoremove -y
echo Done updating Raspberry Pi

echo Starting to update Pi-hole
pihole -up
echo Done updating Pi-hole

echo Done Raspberry Pi maintenance