#!/bin/bash

# Exit immediately if any command fails
set -e

echo "📦 Installing dependencies..."
bun install

echo "🔄 Pulling latest changes from git..."
git pull

echo "🔨 Building project..."
bun run build

echo "🚀 Starting PM2 with ecosystem config..."
pm2 start ecosystem.config.js

echo "♻️ Updating PM2..."
pm2 update

echo "📡 Showing logs for 'linkbedsides'..."
pm2 logs linkbedsides
