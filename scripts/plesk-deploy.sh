#!/usr/bin/env bash
set -euo pipefail

export NODE_ENV=production

if [ -z "${AUTH_SECRET:-${NEXTAUTH_SECRET:-}}" ]; then
  echo "AUTH_SECRET is required in production. Generate one with: npx auth secret"
  exit 1
fi

npm install
npm run prisma:generate
npm run build

echo "Deployment build complete. Restart the Node.js app in Plesk if it was not restarted automatically."
