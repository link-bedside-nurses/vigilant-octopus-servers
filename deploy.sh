#!/bin/bash

cd /root/vigilant-octopus-servers

git pull origin v1.1

if [ -d "dist/" ]; then
  rm -rf dist/
  echo "Removed existing dist/ directory."
else
  echo "No dist/ directory found."
fi

npm run build

pm2 reload linkbedsides

pm2 logs
