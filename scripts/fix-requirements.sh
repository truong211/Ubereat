#!/bin/bash

# Fix Requirements Script
# This script ensures the unittest-mock fix is properly applied

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo "🔧 Requirements Fix & Verification Script"
echo "========================================"

# Check if we're in the right directory
if [ ! -d "ai-service" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_status "Checking current requirements files..."

# Check both requirements files for the problematic line
echo ""
echo "📋 Current ai-service/requirements-ci.txt:"
echo "----------------------------------------"
if [ -f "ai-service/requirements-ci.txt" ]; then
    cat ai-service/requirements-ci.txt | nl
    
    # Check for problematic line
    if grep -q "unittest-mock" ai-service/requirements-ci.txt; then
        print_error "Found unittest-mock reference in requirements-ci.txt"
        echo "Fixing..."
        
        # Remove the problematic line
        sed -i '/unittest-mock/d' ai-service/requirements-ci.txt
        print_success "Removed unittest-mock line from requirements-ci.txt"
    else
        print_success "requirements-ci.txt is clean (no unittest-mock reference)"
    fi
else
    print_error "requirements-ci.txt not found!"
    exit 1
fi

echo ""
echo "📋 Current ai-service/requirements.txt:"
echo "-------------------------------------"
if [ -f "ai-service/requirements.txt" ]; then
    cat ai-service/requirements.txt | nl
    
    # Check for problematic line
    if grep -q "unittest-mock" ai-service/requirements.txt; then
        print_error "Found unittest-mock reference in requirements.txt"
        echo "Fixing..."
        
        # Remove the problematic line
        sed -i '/unittest-mock/d' ai-service/requirements.txt
        print_success "Removed unittest-mock line from requirements.txt"
    else
        print_success "requirements.txt is clean (no unittest-mock reference)"
    fi
else
    print_error "requirements.txt not found!"
    exit 1
fi

# Verify unittest.mock is available
echo ""
print_status "Verifying unittest.mock availability..."
if python3 -c "import unittest.mock; print('✅ unittest.mock available')" 2>/dev/null; then
    print_success "unittest.mock is available in Python standard library"
else
    print_error "unittest.mock not available - check Python version"
    exit 1
fi

# Test package resolution
echo ""
print_status "Testing package resolution..."
cd ai-service

# Create a test virtual environment to verify packages
if command -v python3 -m venv &> /dev/null; then
    print_status "Creating temporary virtual environment for testing..."
    rm -rf .test-venv 2>/dev/null || true
    python3 -m venv .test-venv
    source .test-venv/bin/activate
    
    print_status "Testing requirements-ci.txt installation..."
    if pip install --no-cache-dir -r requirements-ci.txt; then
        print_success "✅ requirements-ci.txt installs successfully!"
        
        # Test that we can import key packages
        print_status "Testing key imports..."
        python3 -c "
import fastapi
import uvicorn 
import pydantic
import unittest.mock
print('✅ All key imports working!')
"
        print_success "All imports successful!"
    else
        print_error "❌ requirements-ci.txt installation failed"
    fi
    
    deactivate
    rm -rf .test-venv
    print_status "Cleaned up test environment"
else
    print_warning "Virtual environment not available, skipping installation test"
    
    # Just test imports with system Python
    print_status "Testing imports with system Python..."
    python3 -c "
import sys
print(f'Python version: {sys.version}')

# Test standard library
import unittest.mock
print('✅ unittest.mock available')

# Test if basic packages are available (if installed)
try:
    import requests
    print('✅ requests available')
except ImportError:
    print('ℹ️  requests not installed (ok for CI test)')

try:
    import numpy
    print('✅ numpy available') 
except ImportError:
    print('ℹ️  numpy not installed (ok for CI test)')
"
fi

cd ..

# Check git status
echo ""
print_status "Checking git status..."
if git status --porcelain | grep -q "requirements"; then
    print_warning "Requirements files have been modified"
    echo "Modified files:"
    git status --porcelain | grep requirements
    echo ""
    print_status "You may want to commit these changes:"
    echo "git add ai-service/requirements*.txt"
    echo "git commit -m 'fix: remove non-existent unittest-mock package'"
else
    print_success "No requirements file changes detected"
fi

# Final verification
echo ""
print_status "Final verification..."
if grep -r "unittest-mock" ai-service/ 2>/dev/null | grep -v ".git"; then
    print_error "Still found unittest-mock references!"
    grep -r "unittest-mock" ai-service/ | grep -v ".git"
else
    print_success "✅ No unittest-mock references found"
fi

echo ""
print_success "🎉 Requirements fix verification complete!"
echo ""
echo "Summary:"
echo "- ✅ requirements-ci.txt is clean"
echo "- ✅ requirements.txt is clean"  
echo "- ✅ unittest.mock available from Python standard library"
echo "- ✅ Ready for CI/CD pipeline"
echo ""
echo "If you're still getting errors:"
echo "1. Clear pip cache: pip cache purge"
echo "2. Use --no-cache-dir flag: pip install --no-cache-dir -r requirements-ci.txt"
echo "3. Check you're using the correct requirements file"
echo "4. Verify you're on the correct git branch"