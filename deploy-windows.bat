@echo off
REM Windows Deployment Script for GurukulamHub

echo ==========================================
echo GurukulamHub Windows Deployment
echo ==========================================
echo.

REM Configuration
set APP_NAME=gurukulamhub
set REPO_URL=https://github.com/Damodara7/gurukulamhub.git
set DEPLOY_DIR=C:\var\www\%APP_NAME%
set GIT_BRANCH=main

echo Starting deployment for %APP_NAME%...

REM Check if required tools are installed
where git >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Git is not installed. Please install Git from https://git-scm.com/
    pause
    exit /b 1
)

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed. Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed. Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo All required tools are installed.

REM Create deployment directory
if not exist "%DEPLOY_DIR%" (
    echo Creating deployment directory %DEPLOY_DIR%...
    mkdir "%DEPLOY_DIR%"
)

REM Clone or pull code
echo Cloning or pulling latest code...
if exist "%DEPLOY_DIR%\.git" (
    cd /d "%DEPLOY_DIR%"
    git pull origin %GIT_BRANCH%
) else (
    git clone %REPO_URL% "%DEPLOY_DIR%"
    cd /d "%DEPLOY_DIR%"
)

REM Install dependencies
echo Installing Node.js dependencies...
npm ci --production=false

REM Create environment file
echo Setting up environment variables...
if not exist "%DEPLOY_DIR%\.env.local" (
    echo Creating .env.local file...
    (
        echo # Database Configuration
        echo DATABASE_URL=mongodb+srv://gurkulhub_dbuser:2025Mongodb@cluster0.dlhzk.mongodb.net/gurkulhub?retryWrites=true^&w=majority^&appName=Cluster0
        echo.
        echo # NextAuth Configuration
        echo NEXTAUTH_URL=http://localhost:3000
        echo NEXTAUTH_SECRET=LSy/VCrsA5GAvwQhMTGkohdviqCcJLkHPHtrIuJtyJ0=
        echo.
        echo # Redis Configuration
        echo REDIS_URL=redis://localhost:6379
        echo.
        echo # Node Environment
        echo NODE_ENV=production
        echo.
        echo # API Configuration
        echo API_BASE_URL=http://localhost:3000/api
    ) > "%DEPLOY_DIR%\.env.local"
)

REM Build the application
echo Building the Next.js application...
npm run build

REM Install PM2 globally if not installed
where pm2 >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing PM2 globally...
    npm install -g pm2
)

REM Start application with PM2
echo Starting application with PM2...
pm2 stop %APP_NAME% 2>nul
pm2 start npm --name %APP_NAME% -- start
pm2 save

REM Wait and check if app is running
echo Waiting for application to start...
timeout /t 5 /nobreak >nul

REM Check if application is responding
curl -f http://localhost:3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Application is responding on port 3000
) else (
    echo ⚠️  Application may not be responding. Check PM2 logs: pm2 logs %APP_NAME%
)

echo.
echo ==========================================
echo Deployment Summary
echo ==========================================
echo Application Name: %APP_NAME%
echo Deployment Directory: %DEPLOY_DIR%
echo PM2 Process Name: %APP_NAME%
echo Port: 3000
echo.
echo ==========================================
echo Access Your App
echo ==========================================
echo Local: http://localhost:3000
echo Network: http://YOUR_COMPUTER_IP:3000
echo Any device on same WiFi: http://YOUR_COMPUTER_IP:3000
echo.
echo ==========================================
echo Useful Commands
echo ==========================================
echo View logs: pm2 logs %APP_NAME%
echo Restart app: pm2 restart %APP_NAME%
echo Stop app: pm2 stop %APP_NAME%
echo View status: pm2 status
echo Monitor: pm2 monit
echo.

echo ✅ Deployment complete for %APP_NAME%!
echo.
echo Press any key to continue...
pause >nul
