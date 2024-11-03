#!/bin/bash

# Update the package list
echo "Updating package list..."
sudo apt update

# Install Nginx
echo "Installing Nginx..."
sudo apt install -y nginx

# Start Nginx service
echo "Starting Nginx..."
sudo systemctl start nginx

# Enable Nginx to start on boot
echo "Enabling Nginx to start on boot..."
sudo systemctl enable nginx

# Allow Nginx in the firewall
echo "Configuring firewall to allow Nginx..."
sudo ufw allow 'Nginx Full'

echo "Nginx has been successfully installed and started."
