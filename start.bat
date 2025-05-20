@echo off
echo Starting GitHub Documentation Hub...

:: Check if node modules are installed
if not exist "node_modules" (
  echo Installing dependencies...
  call npm install
)

:: Check if .env.local exists and remind user to update it
if not exist ".env.local" (
  echo Warning: .env.local file not found!
  echo Creating a template .env.local file. Please update it with your GitHub credentials.
  (
    echo GITHUB_CLIENT_ID=your_client_id
    echo GITHUB_CLIENT_SECRET=your_client_secret
    echo GITHUB_APP_ID=your_app_id
    echo GITHUB_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Private_Key_Here\n-----END PRIVATE KEY-----"
    echo NEXTAUTH_URL=http://localhost:3000
    echo NEXTAUTH_SECRET=your_nextauth_secret
  ) > .env.local
)

:: Start the development server
echo Starting development server...
npm run dev 