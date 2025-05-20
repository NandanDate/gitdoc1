#!/bin/bash

echo "Starting GitHub Documentation Hub..."

# Check if node modules are installed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Check if .env.local exists and remind user to update it
if [ ! -f ".env.local" ]; then
  echo "Warning: .env.local file not found!"
  echo "Creating a template .env.local file. Please update it with your GitHub credentials."
  cat > .env.local << EOF
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
GITHUB_APP_ID=your_app_id
GITHUB_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Private_Key_Here\n-----END PRIVATE KEY-----"
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
EOF
fi

# Start the development server
echo "Starting development server..."
npm run dev 