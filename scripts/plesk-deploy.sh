#!/usr/bin/env bash
set -euo pipefail

export NODE_ENV=production

npm install
npm run prisma:generate
npm run build

echo "Deployment build complete. Restart the Node.js app in Plesk if it was not restarted automatically."
