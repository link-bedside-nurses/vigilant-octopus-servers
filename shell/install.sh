#!/bin/bash

# Function to check and install a package
check_and_install() {
    package=$1
    install_cmd=$2

    if ! command -v $package &> /dev/null; then
        echo "$package is not installed. Installing..."
        eval $install_cmd
        if [ $? -eq 0 ]; then
            echo "$package installed successfully!"
        else
            echo "Failed to install $package."
        fi
    else
        echo "$package is already installed."
    fi
}

# Function to install Node.js
install_nodejs() {
    echo "Updating package list..."
    sudo apt update

    echo "Installing prerequisites..."
    sudo apt install -y curl software-properties-common

    echo "Adding NodeSource repository for Node.js 22..."
    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -

    echo "Installing Node.js 22..."
    sudo apt install -y nodejs

    echo "Verifying Node.js installation..."
    if command -v node &> /dev/null; then
        echo "Node.js version:"
        node -v
        echo "Node.js installed successfully!"
    else
        echo "Node.js installation failed. Check the status."
    fi
}

# Function to uninstall Node.js
uninstall_nodejs() {
    echo "Removing Node.js..."
    sudo apt purge --auto-remove -y nodejs

    echo "Verifying the uninstallation..."
    if ! command -v node &> /dev/null; then
        echo "Node.js has been uninstalled successfully!"
    else
        echo "Node.js uninstallation failed. Check the status."
    fi
}

# Function to install Nginx
install_nginx() {
    echo "Updating package list..."
    sudo apt update

    echo "Installing Nginx..."
    sudo apt install -y nginx

    echo "Starting Nginx service..."
    sudo systemctl start nginx

    echo "Enabling Nginx to start on boot..."
    sudo systemctl enable nginx

    echo "Verifying Nginx installation..."
    if systemctl status nginx | grep "active (running)"; then
        echo "Nginx installed and running successfully!"
    else
        echo "Nginx installation failed. Check the status."
    fi
}

# Function to uninstall Nginx
uninstall_nginx() {
    echo "Stopping Nginx service..."
    sudo systemctl stop nginx

    echo "Removing Nginx..."
    sudo apt purge --auto-remove -y nginx

    echo "Verifying the uninstallation..."
    if ! command -v nginx &> /dev/null; then
        echo "Nginx has been uninstalled successfully!"
    else
        echo "Nginx uninstallation failed. Check the status."
    fi
}

# Function to install Redis
install_redis() {
    echo "Updating package list..."
    sudo apt update

    echo "Installing Redis server..."
    sudo apt install -y redis-server

    echo "Configuring Redis to run as a service..."
    sudo sed -i 's/supervised no/supervised systemd/' /etc/redis/redis.conf

    echo "Restarting Redis server..."
    sudo systemctl restart redis-server

    echo "Enabling Redis to start on boot..."
    sudo systemctl enable redis-server

    echo "Verifying Redis installation..."
    if systemctl status redis-server | grep "active (running)"; then
        echo "Redis server installed and running successfully!"
    else
        echo "Redis server installation failed. Check the status."
    fi
}

# Function to uninstall Redis
uninstall_redis() {
    echo "Stopping Redis server..."
    sudo systemctl stop redis-server

    echo "Removing Redis server and related packages..."
    sudo apt purge --auto-remove -y redis-server

    echo "Deleting Redis configuration and data files..."
    sudo rm -rf /etc/redis
    sudo rm -rf /var/lib/redis
    sudo rm -rf /var/log/redis

    echo "Removing Redis user and group..."
    sudo deluser redis
    sudo delgroup redis

    echo "Verifying the uninstallation..."
    if ! command -v redis-server &> /dev/null; then
        echo "Redis server has been uninstalled successfully!"
    else
        echo "Redis server uninstallation failed. Check the status."
    fi
}

# Update package list before checking other packages
echo "Updating package list..."
sudo apt update

# Check and install required tools
check_and_install "ifconfig" "sudo apt install -y net-tools"
check_and_install "htop" "sudo apt install -y htop"

# Check and install yarn
if ! command -v yarn &> /dev/null; then
    echo "yarn is not installed. Installing with npm..."
    if ! command -v npm &> /dev/null; then
        echo "npm is not installed. Please install npm first."
        exit 1
    fi
    npm install -g yarn
    if [ $? -eq 0 ]; then
        echo "yarn installed successfully!"
    else
        echo "Failed to install yarn."
    fi
else
    echo "yarn is already installed."
fi

# Check and install pm2
check_and_install "pm2" "npm install -g pm2"

# Main script execution
echo "Choose an option:"
echo "1. Install Node.js 22"
echo "2. Uninstall Node.js"
echo "3. Install Nginx"
echo "4. Uninstall Nginx"
echo "5. Install Redis"
echo "6. Uninstall Redis"
read -p "Enter your choice (1, 2, 3, 4, 5, or 6): " choice

case $choice in
    1)
        install_nodejs
        ;;
    2)
        uninstall_nodejs
        ;;
    3)
        install_nginx
        ;;
    4)
        uninstall_nginx
        ;;
    5)
        install_redis
        ;;
    6)
        uninstall_redis
        ;;
    *)
        echo "Invalid option. Please run the script again and choose a valid option."
        ;;
esac

echo "Script execution completed."
