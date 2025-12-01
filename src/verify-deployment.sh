#!/bin/bash

# 🔍 THEE ARCHIVE - Deployment Verification Script
# This script verifies that your deployment is working correctly

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="avvwsbiqgtjcwphadypu"
FUNCTION_NAME="make-server-4d451974"
BASE_URL="https://${PROJECT_ID}.supabase.co/functions/v1/${FUNCTION_NAME}"

echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   🎬 THEE ARCHIVE - Deployment Verifier      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""

# Counter for passed/failed tests
PASSED=0
FAILED=0

# Function to test endpoint
test_endpoint() {
    local name=$1
    local url=$2
    local expected=$3
    
    echo -e "${YELLOW}Testing: ${name}${NC}"
    echo -e "   URL: ${url}"
    
    # Make request with timeout
    response=$(curl -s -w "\n%{http_code}" --max-time 10 "${url}" 2>&1)
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$http_code" = "200" ]; then
        echo -e "   ${GREEN}✅ Status: 200 OK${NC}"
        if [ -n "$expected" ]; then
            if echo "$body" | grep -q "$expected"; then
                echo -e "   ${GREEN}✅ Response contains expected data${NC}"
                PASSED=$((PASSED + 1))
            else
                echo -e "   ${RED}❌ Response missing expected data${NC}"
                echo -e "   Response: ${body:0:100}..."
                FAILED=$((FAILED + 1))
            fi
        else
            PASSED=$((PASSED + 1))
        fi
    elif [ "$http_code" = "000" ]; then
        echo -e "   ${RED}❌ Connection failed - Server not accessible${NC}"
        echo -e "   ${RED}   This means the function is NOT deployed${NC}"
        FAILED=$((FAILED + 1))
    else
        echo -e "   ${RED}❌ Status: ${http_code}${NC}"
        echo -e "   Response: ${body:0:100}..."
        FAILED=$((FAILED + 1))
    fi
    echo ""
}

# Run tests
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Starting deployment verification...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Test 1: Health Check
test_endpoint "Health Check" "${BASE_URL}/health" "ok"

# Test 2: Movies Endpoint
test_endpoint "Movies Endpoint" "${BASE_URL}/movies" "success"

# Test 3: GM Posts Endpoint
test_endpoint "GM Social Feed" "${BASE_URL}/gm-posts" "success"

# Test 4: Ad Settings
test_endpoint "Ad Settings" "${BASE_URL}/ad-settings" "success"

# Summary
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Test Results Summary${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "   ${GREEN}Passed: ${PASSED}${NC}"
echo -e "   ${RED}Failed: ${FAILED}${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║   🎉 ALL TESTS PASSED! Server is running!    ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${GREEN}✅ Your deployment is working correctly!${NC}"
    echo -e "${GREEN}✅ You can now build and upload the frontend${NC}"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo "   1. npm run build"
    echo "   2. Upload /dist folder to Stellar hosting"
    echo "   3. Add movies via admin portal"
    echo ""
    exit 0
else
    echo -e "${RED}╔════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║   ⚠️  TESTS FAILED - Action Required         ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${RED}❌ Server is not accessible or not working properly${NC}"
    echo ""
    echo -e "${YELLOW}🔧 Required Actions:${NC}"
    echo ""
    echo -e "${YELLOW}1. Deploy the Supabase Edge Function:${NC}"
    echo "   supabase login"
    echo "   supabase link --project-ref ${PROJECT_ID}"
    echo "   supabase functions deploy ${FUNCTION_NAME}"
    echo ""
    echo -e "${YELLOW}2. Set Environment Variables in Supabase Dashboard:${NC}"
    echo "   Navigate to: Edge Functions > ${FUNCTION_NAME} > Settings"
    echo "   Add these secrets:"
    echo "   - SUPABASE_URL"
    echo "   - SUPABASE_SERVICE_ROLE_KEY"
    echo ""
    echo -e "${YELLOW}3. Wait 30 seconds after deployment, then run this script again${NC}"
    echo ""
    echo -e "${BLUE}📚 For detailed instructions, see:${NC}"
    echo "   - /DEPLOYMENT_INSTRUCTIONS.md"
    echo "   - /QUICK_START.md"
    echo ""
    echo -e "${BLUE}🧪 Alternative: Open test-server.html in your browser${NC}"
    echo ""
    exit 1
fi
