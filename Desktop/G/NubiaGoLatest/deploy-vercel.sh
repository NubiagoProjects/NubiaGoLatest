#!/bin/bash

echo "========================================"
echo "   HomeBase Vercel Deployment Script"
echo "========================================"
echo

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

echo "Checking prerequisites..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_error "Vercel CLI not found!"
    echo "Please install Vercel CLI first:"
    echo "npm install -g vercel"
    exit 1
fi

print_status "Vercel CLI found"

# Check if logged in to Vercel
if ! vercel whoami &> /dev/null; then
    print_error "Please login to Vercel first:"
    echo "vercel login"
    exit 1
fi

print_status "Logged in to Vercel"
echo

echo "Building project..."
if npm run build; then
    print_status "Build completed successfully"
else
    print_error "Build failed!"
    exit 1
fi

echo
echo "Deploying to Vercel..."
if vercel --prod; then
    echo
    print_status "Deployment completed successfully!"
    echo
    echo "Your app is now live on Vercel!"
else
    print_error "Deployment failed!"
    exit 1
fi

echo
echo "Deployment script completed!"
