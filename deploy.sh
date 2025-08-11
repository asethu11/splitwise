#!/bin/bash

# AWS Deployment Script for Splitwise
echo "🚀 Starting AWS deployment for Splitwise..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Please initialize git first:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    exit 1
fi

# Check if remote is set
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "❌ No remote repository found. Please add your GitHub/GitLab remote:"
    echo "   git remote add origin YOUR_REPO_URL"
    exit 1
fi

# Build the project
echo "📦 Building project..."
pnpm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the errors and try again."
    exit 1
fi

# Generate Prisma client
echo "🗄️  Generating Prisma client..."
pnpm run db:generate

# Commit and push changes
echo "📤 Pushing to repository..."
git add .
git commit -m "Deploy to AWS - $(date)"
git push origin main

echo "✅ Deployment initiated!"
echo ""
echo "📋 Next steps:"
echo "1. Go to AWS Amplify Console"
echo "2. Connect your repository"
echo "3. Set environment variables:"
echo "   - DATABASE_URL=postgresql://splitwise_admin:YOUR_PASSWORD@splitwise-db.xxxxx.us-east-2.rds.amazonaws.com:5432/postgres"
echo "   - NODE_ENV=production"
echo "4. Deploy!"
echo ""
echo "🌐 Your app will be available at: https://main.xxxxx.amplifyapp.com"
