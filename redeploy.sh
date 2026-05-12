#!/bin/bash
# Run this on the production server to rebuild and restart after a git pull
# Usage: bash redeploy.sh

set -e

echo "==> Pulling latest code from git..."
git pull origin main

echo "==> Installing dependencies..."
npm install --legacy-peer-deps

echo "==> Building Next.js app (this may take 2-3 minutes)..."
npm run build

echo "==> Restarting Phusion Passenger..."
mkdir -p tmp && touch tmp/restart.txt

echo ""
echo "✓ Deploy complete! The site should be live."
