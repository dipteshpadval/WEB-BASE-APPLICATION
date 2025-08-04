@echo off
echo 🚀 Excel File Manager Deployment Script
echo ======================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

echo ✅ Node.js version: 
node --version

echo 📦 Installing dependencies...
call npm run install:all

REM Check if .env files exist
if not exist "backend\.env" (
    echo ⚠️  Backend .env file not found. Please create it from env.example
    echo    copy backend\env.example backend\.env
    echo    Then edit backend\.env with your configuration
)

if not exist "frontend\.env" (
    echo ⚠️  Frontend .env file not found. Creating it...
    echo VITE_API_URL=http://localhost:5000/api > frontend\.env
)

echo.
echo 🎉 Setup complete!
echo.
echo Next steps:
echo 1. Configure your environment variables:
echo    - Backend: Edit backend\.env
echo    - Frontend: Edit frontend\.env
echo.
echo 2. Set up your database (Supabase):
echo    - Create tables as described in README.md
echo.
echo 3. Configure AWS S3:
echo    - Create S3 bucket
echo    - Set up CORS
echo    - Create IAM user with S3 access
echo.
echo 4. Run the development servers:
echo    npm run dev
echo.
echo 5. Deploy to production:
echo    - Frontend: Deploy to Vercel
echo    - Backend: Deploy to Render
echo.
echo 📚 For detailed instructions, see README.md
pause 