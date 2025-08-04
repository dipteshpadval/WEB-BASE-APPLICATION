#!/bin/bash

# Excel File Manager Deployment Script
# This script helps set up and deploy the application

set -e

echo "🚀 Excel File Manager Deployment Script"
echo "======================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm run install:all

# Check if .env files exist
if [ ! -f "backend/.env" ]; then
    echo "⚠️  Backend .env file not found. Please create it from env.example"
    echo "   cp backend/env.example backend/.env"
    echo "   Then edit backend/.env with your configuration"
fi

if [ ! -f "frontend/.env" ]; then
    echo "⚠️  Frontend .env file not found. Creating it..."
    echo "VITE_API_URL=http://localhost:5000/api" > frontend/.env
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Configure your environment variables:"
echo "   - Backend: Edit backend/.env"
echo "   - Frontend: Edit frontend/.env"
echo ""
echo "2. Set up your database (Supabase):"
echo "   - Create tables as described in README.md"
echo ""
echo "3. Configure AWS S3:"
echo "   - Create S3 bucket"
echo "   - Set up CORS"
echo "   - Create IAM user with S3 access"
echo ""
echo "4. Run the development servers:"
echo "   npm run dev"
echo ""
echo "5. Deploy to production:"
echo "   - Frontend: Deploy to Vercel"
echo "   - Backend: Deploy to Render"
echo ""
echo "📚 For detailed instructions, see README.md" 