#!/bin/bash

# 🚀 THEE ARCHIVE - Automatic Deployment Script
# This script automates the entire deployment process

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="avvwsbiqgtjcwphadypu"
FUNCTION_NAME="make-server-4d451974"

# Clear screen and show banner
clear
echo -e "${PURPLE}"
cat << "EOF"
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║      🎬  THEE ARCHIVE - Automatic Deployment  🎬            ║
║                                                              ║
║           Your Ultimate Movie Library Platform              ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo -e "${CYAN}This script will automatically:${NC}"
echo "  1. ✅ Install Supabase CLI (if needed)"
echo "  2. 🔐 Login to Supabase"
echo "  3. 🔗 Link your project"
echo "  4. 🚀 Deploy backend function"
echo "  5. 📦 Install frontend dependencies"
echo "  6. 🏗️  Build frontend"
echo "  7. ✅ Verify deployment"
echo ""
echo -e "${YELLOW}⏱️  Estimated time: 5-10 minutes${NC}"
echo ""
read -p "Press Enter to start or Ctrl+C to cancel..."
echo ""

# Error handling
set -e
trap 'echo -e "${RED}❌ Script failed at line $LINENO${NC}"; exit 1' ERR

# Step 1: Check and install Supabase CLI
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}📦 Step 1/7: Checking Supabase CLI...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if command -v supabase &> /dev/null; then
    echo -e "${GREEN}✅ Supabase CLI already installed${NC}"
    supabase --version
else
    echo -e "${YELLOW}Installing Supabase CLI...${NC}"
    npm install -g supabase
    echo -e "${GREEN}✅ Supabase CLI installed successfully${NC}"
fi
echo ""

# Step 2: Login to Supabase
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}🔐 Step 2/7: Supabase Login...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Check if already logged in
if supabase projects list &> /dev/null; then
    echo -e "${GREEN}✅ Already logged in to Supabase${NC}"
else
    echo -e "${YELLOW}Opening browser for authentication...${NC}"
    supabase login
    echo -e "${GREEN}✅ Successfully logged in${NC}"
fi
echo ""

# Step 3: Link project
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}🔗 Step 3/7: Linking project...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "${CYAN}Project ID: ${PROJECT_ID}${NC}"

# Try to link (it's ok if already linked)
if supabase link --project-ref $PROJECT_ID 2>&1 | grep -q "already linked\|Finished supabase link"; then
    echo -e "${GREEN}✅ Project linked successfully${NC}"
else
    echo -e "${RED}❌ Failed to link project${NC}"
    echo -e "${YELLOW}Please check your project ID and try manually:${NC}"
    echo "   supabase link --project-ref $PROJECT_ID"
    exit 1
fi
echo ""

# Step 4: Deploy backend function
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}🚀 Step 4/7: Deploying backend function...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "${CYAN}Function: ${FUNCTION_NAME}${NC}"
echo -e "${YELLOW}This may take 1-2 minutes...${NC}"
echo ""

if supabase functions deploy $FUNCTION_NAME; then
    echo ""
    echo -e "${GREEN}✅ Backend function deployed successfully!${NC}"
else
    echo ""
    echo -e "${RED}❌ Backend deployment failed${NC}"
    echo -e "${YELLOW}Check the error above and try manually:${NC}"
    echo "   supabase functions deploy $FUNCTION_NAME"
    exit 1
fi
echo ""

# Reminder about environment variables
echo -e "${YELLOW}⚠️  IMPORTANT: Don't forget to set environment variables!${NC}"
echo -e "${CYAN}Go to: Supabase Dashboard → Edge Functions → Settings${NC}"
echo -e "${CYAN}Add these secrets:${NC}"
echo "   • SUPABASE_URL"
echo "   • SUPABASE_SERVICE_ROLE_KEY"
echo ""
read -p "Press Enter after setting environment variables (or if already set)..."
echo ""

# Step 5: Install frontend dependencies
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}📦 Step 5/7: Installing frontend dependencies...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ Dependencies already installed${NC}"
    echo -e "${YELLOW}Checking for updates...${NC}"
    npm install
else
    echo -e "${YELLOW}Installing packages (this may take a few minutes)...${NC}"
    npm install
fi
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 6: Build frontend
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}🏗️  Step 6/7: Building frontend...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "${YELLOW}Building optimized production bundle...${NC}"
npm run build

if [ -d "dist" ]; then
    echo ""
    echo -e "${GREEN}✅ Frontend built successfully!${NC}"
    echo -e "${CYAN}📁 Output location: ./dist/${NC}"
else
    echo ""
    echo -e "${RED}❌ Build failed - dist folder not created${NC}"
    exit 1
fi
echo ""

# Step 7: Verify deployment
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}✅ Step 7/7: Verifying deployment...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "${YELLOW}Waiting 10 seconds for function to initialize...${NC}"
sleep 10
echo ""

BASE_URL="https://${PROJECT_ID}.supabase.co/functions/v1/${FUNCTION_NAME}"

# Test health endpoint
echo -e "${CYAN}Testing health endpoint...${NC}"
if curl -s -f "${BASE_URL}/health" > /dev/null; then
    echo -e "${GREEN}✅ Health check passed!${NC}"
    HEALTH_OK=true
else
    echo -e "${RED}❌ Health check failed${NC}"
    HEALTH_OK=false
fi
echo ""

# Test movies endpoint
echo -e "${CYAN}Testing movies endpoint...${NC}"
if curl -s -f "${BASE_URL}/movies" > /dev/null; then
    echo -e "${GREEN}✅ Movies endpoint working!${NC}"
    MOVIES_OK=true
else
    echo -e "${RED}❌ Movies endpoint failed${NC}"
    MOVIES_OK=false
fi
echo ""

# Summary
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ "$HEALTH_OK" = true ] && [ "$MOVIES_OK" = true ]; then
    echo -e "${GREEN}"
    cat << "EOF"
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║      🎉  DEPLOYMENT SUCCESSFUL!  🎉                         ║
║                                                              ║
║         Your movie library is ready to go live!             ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
    
    echo -e "${GREEN}✅ Backend deployed and working${NC}"
    echo -e "${GREEN}✅ Frontend built successfully${NC}"
    echo -e "${GREEN}✅ All endpoints responding${NC}"
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}📤 NEXT STEPS:${NC}"
    echo ""
    echo "1. Upload frontend to hosting:"
    echo -e "   ${CYAN}Upload everything from ./dist/ folder to your web host${NC}"
    echo ""
    echo "2. Add your first movie:"
    echo "   • Visit your site"
    echo "   • Click red dot 6 times"
    echo "   • Password: 0701680Kyamundu"
    echo "   • Add movie details"
    echo ""
    echo "3. Test everything:"
    echo "   • Browse movies"
    echo "   • Test search"
    echo "   • Try video player"
    echo "   • Check admin portal"
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}🌐 Your API is live at:${NC}"
    echo -e "${CYAN}${BASE_URL}${NC}"
    echo ""
    echo -e "${GREEN}📁 Your frontend is ready in:${NC}"
    echo -e "${CYAN}./dist/${NC}"
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
else
    echo -e "${YELLOW}"
    cat << "EOF"
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║      ⚠️   DEPLOYMENT COMPLETED WITH WARNINGS  ⚠️            ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
    
    echo -e "${YELLOW}The deployment completed, but some tests failed.${NC}"
    echo ""
    echo -e "${RED}Failed checks:${NC}"
    [ "$HEALTH_OK" = false ] && echo "  ❌ Health endpoint"
    [ "$MOVIES_OK" = false ] && echo "  ❌ Movies endpoint"
    echo ""
    echo -e "${YELLOW}Possible causes:${NC}"
    echo "  1. Environment variables not set (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)"
    echo "  2. Function needs more time to initialize (wait 1-2 minutes)"
    echo "  3. Network/firewall issues"
    echo ""
    echo -e "${YELLOW}Actions to take:${NC}"
    echo "  1. Wait 1-2 minutes and run: ./verify-deployment.sh"
    echo "  2. Check Supabase Dashboard → Edge Functions → Logs"
    echo "  3. Verify environment variables are set"
    echo "  4. Open test-server.html in browser for detailed testing"
    echo ""
fi

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${CYAN}📚 Helpful Resources:${NC}"
echo "  • Quick Reference: ./QUICK_REFERENCE.md"
echo "  • Current Status: ./CURRENT_STATUS.md"
echo "  • Test Server: Open ./test-server.html in browser"
echo "  • Verify Again: ./verify-deployment.sh"
echo ""
echo -e "${PURPLE}Built with ❤️  | React + Supabase + Tailwind CSS${NC}"
echo ""
