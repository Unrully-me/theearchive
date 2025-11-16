#!/bin/bash

# 🚀 THEE ARCHIVE - Deployment Script
# This script builds the frontend and deploys the backend

echo "🎬 THEE ARCHIVE - Deployment Starting..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Installation failed!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 2: Build frontend
echo -e "${YELLOW}🏗️  Building frontend...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Frontend built successfully${NC}"
echo ""

# Step 3: Deploy backend to Supabase
echo -e "${YELLOW}☁️  Deploying backend to Supabase...${NC}"
echo "Make sure you're logged in to Supabase CLI!"
echo ""
supabase functions deploy make-server-4d451974
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Backend deployment failed!${NC}"
    echo "Run: supabase login"
    exit 1
fi
echo -e "${GREEN}✅ Backend deployed successfully${NC}"
echo ""

# Step 4: Instructions for Stellar upload
echo -e "${GREEN}🎉 BUILD COMPLETE!${NC}"
echo ""
echo "📁 Your production files are in: ./dist/"
echo ""
echo "🌐 Next steps:"
echo "1. Login to your Stellar hosting dashboard"
echo "2. Go to File Manager"
echo "3. Upload ALL files from ./dist/ folder"
echo "4. Your site will be LIVE on your custom domain!"
echo ""
echo -e "${YELLOW}⚠️  Don't forget to:${NC}"
echo "- Replace ad countdowns with Google AdSense code"
echo "- Upload movies to AWS S3"
echo "- Add movies via admin portal (click red dot 6x)"
echo ""
echo -e "${GREEN}🚀 Ready to go live!${NC}"
