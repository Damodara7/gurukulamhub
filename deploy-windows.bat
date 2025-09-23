@echo off
REM Windows Deployment Script for GurukulamHub
REM This script helps prepare for deployment on a Linux server

echo ==========================================
echo GurukulamHub Deployment Preparation
echo ==========================================
echo.

echo Checking if Git is available...
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Git is not installed or not in PATH
    echo Please install Git from https://git-scm.com/
    pause
    exit /b 1
)

echo Git is available: 
git --version

echo.
echo Checking if Node.js is available...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js is available:
node --version

echo.
echo Checking if npm is available...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed or not in PATH
    pause
    exit /b 1
)

echo npm is available:
npm --version

echo.
echo ==========================================
echo Deployment Files Created:
echo ==========================================
echo.
echo 1. deploy.sh - Main deployment script for Linux
echo 2. setup-server.sh - Server setup script for Linux
echo 3. ecosystem.config.js - PM2 configuration
echo 4. nginx.conf.template - Nginx configuration template
echo 5. env.template - Environment variables template
echo 6. DEPLOYMENT.md - Comprehensive deployment guide
echo.

echo ==========================================
echo Next Steps:
echo ==========================================
echo.
echo 1. Upload these files to your Linux server
echo 2. Make scripts executable: chmod +x deploy.sh setup-server.sh
echo 3. Update deploy.sh with your repository URL
echo 4. Run setup-server.sh to prepare the server
echo 5. Run deploy.sh to deploy your application
echo.

echo ==========================================
echo Important Notes:
echo ==========================================
echo.
echo - Update REPO_URL in deploy.sh with your actual Git repository
echo - Update domain names in nginx.conf.template
echo - Configure environment variables in env.template
echo - Review DEPLOYMENT.md for detailed instructions
echo.

echo Press any key to continue...
pause >nul
