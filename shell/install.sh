#!/bin/bash

# Function to reset a package by uninstalling and optionally reinstalling it
reset_package() {
    package=$1
    install_cmd=$2
    config_files=("${!3}")  # Array of configuration files/directories to delete

    echo "Checking if $package is installed..."
    if command -v $package &> /dev/null; then
        echo "$package is installed. Uninstalling..."
        sudo apt purge --auto-remove -y $package

        # Delete configuration files
        for config_file in "${config_files[@]}"; do
            if [ -e $config_file ]; then
                echo "Removing $config_file..."
                sudo rm -rf $config_file
            fi
        done

        # Verify uninstallation
        if ! command -v $package &> /dev/null; then
            echo "$package has been uninstalled successfully."
        else
            echo "Failed to uninstall $package. Check the status."
        fi
    else
        echo "$package is not currently installed."
    fi

    # Reinstall if required
    if [[ "$REINSTALL" == "yes" ]]; then
        echo "Reinstalling $package..."
        eval $install_cmd
        if command -v $package &> /dev/null; then
            echo "$package reinstalled successfully!"
        else
            echo "Failed to reinstall $package."
        fi
    fi
}

# Reset Node.js function
reset_nodejs() {
    local node_config_files=("/etc/apt/sources.list.d/nodesource.list")
    reset_package "node" "curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - && sudo apt install -y nodejs" node_config_files[@]
}

# Reset Nginx function
reset_nginx() {
    local nginx_config_files=("/etc/nginx" "/var/log/nginx" "/var/lib/nginx" "/etc/systemd/system/nginx.service.d")
    reset_package "nginx" "sudo apt update && sudo apt install -y nginx" nginx_config_files[@]
}

# Reset Redis function
reset_redis() {
    local redis_config_files=("/etc/redis" "/var/lib/redis" "/var/log/redis" "/etc/systemd/system/redis.service.d")
    reset_package "redis-server" "sudo apt update && sudo apt install -y redis-server" redis_config_files[@]
}

# Check and install required tools
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

# Main script execution
echo "This script will reset Node.js, NGINX, and Redis to their default configurations."
read -p "Do you want to reinstall the packages after resetting? (yes/no): " REINSTALL

echo "Choose an option:"
echo "1. Reset Node.js"
echo "2. Reset Nginx"
echo "3. Reset Redis"
echo "4. Reset all (Node.js, Nginx, Redis)"
read -p "Enter your choice (1, 2, 3, or 4): " choice

case $choice in
    1)
        reset_nodejs
        ;;
    2)
        reset_nginx
        ;;
    3)
        reset_redis
        ;;
    4)
        echo "Resetting all tools (Node.js, NGINX, Redis)..."
        reset_nodejs
        reset_nginx
        reset_redis
        ;;
    *)
        echo "Invalid option. Please run the script again and choose a valid option."
        ;;
esac

echo "Script execution completed."
