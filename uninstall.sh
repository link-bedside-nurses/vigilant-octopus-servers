#!/bin/bash

# Stop Nginx service
echo "Stopping Nginx..."
sudo systemctl stop nginx

# Disable Nginx service
echo "Disabling Nginx..."
sudo systemctl disable nginx

# Remove Nginx and its configuration files
echo "Removing Nginx..."
sudo apt remove --purge -y nginx nginx-common

# Remove unused dependencies
echo "Removing unused dependencies..."
sudo apt autoremove -y

# Remove Nginx directories and files
echo "Removing Nginx directories..."
sudo rm -rf /etc/nginx
sudo rm -rf /var/log/nginx
sudo rm -rf /var/www/html

echo "Nginx has been completely removed."

