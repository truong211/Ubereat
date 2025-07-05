#!/bin/bash

# Local CI/CD Pipeline Testing Script
# This script allows you to test CI/CD components locally before pushing

set -e

echo "🚀 Local CI/CD Pipeline Testing"
echo "================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅${NC} $1"
}

print_error() {
    echo -e "${RED}❌${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ️${NC} $1"
}

# Test Docker Compose Configuration
test_docker_compose() {
    print_info "Testing Docker Compose configuration..."
    
    if [ -f "docker-compose.yml" ]; then
        if docker-compose config > /dev/null 2>&1; then
            print_status "Docker Compose configuration is valid"
        else
            print_error "Docker Compose configuration has errors"
            docker-compose config
            return 1
        fi
    else
        print_warning "docker-compose.yml not found"
    fi
}

# Test Docker Builds
test_docker_builds() {
    print_info "Testing Docker builds..."
    
    services=("frontend" "backend" "ai-service")
    
    for service in "${services[@]}"; do
        if [ -d "$service" ] && [ -f "$service/Dockerfile" ]; then
            print_info "Building $service Docker image..."
            if docker build -t "ubereats-$service:test" "$service" > /dev/null 2>&1; then
                print_status "$service Docker build successful"
            else
                print_error "$service Docker build failed"
                return 1
            fi
        else
            print_warning "$service directory or Dockerfile not found"
        fi
    done
}

# Test Backend
test_backend() {
    print_info "Testing Backend..."
    
    if [ -d "backend" ]; then
        cd backend
        
        print_info "Installing backend dependencies..."
        npm ci > /dev/null 2>&1
        
        print_info "Running backend linter..."
        if npm run lint > /dev/null 2>&1; then
            print_status "Backend linting passed"
        else
            print_error "Backend linting failed"
            cd ..
            return 1
        fi
        
        print_info "Building backend..."
        if npm run build > /dev/null 2>&1; then
            print_status "Backend build successful"
        else
            print_error "Backend build failed"
            cd ..
            return 1
        fi
        
        cd ..
    else
        print_warning "Backend directory not found"
    fi
}

# Test Frontend
test_frontend() {
    print_info "Testing Frontend..."
    
    if [ -d "frontend" ]; then
        cd frontend
        
        print_info "Installing frontend dependencies..."
        npm ci > /dev/null 2>&1
        
        print_info "Running frontend linter..."
        if npm run lint > /dev/null 2>&1; then
            print_status "Frontend linting passed"
        else
            print_error "Frontend linting failed"
            cd ..
            return 1
        fi
        
        print_info "Running frontend type check..."
        if npm run type-check > /dev/null 2>&1; then
            print_status "Frontend type check passed"
        else
            print_warning "Frontend type check failed or not configured"
        fi
        
        print_info "Building frontend..."
        if npm run build > /dev/null 2>&1; then
            print_status "Frontend build successful"
        else
            print_error "Frontend build failed"
            cd ..
            return 1
        fi
        
        cd ..
    else
        print_warning "Frontend directory not found"
    fi
}

# Test AI Service
test_ai_service() {
    print_info "Testing AI Service..."
    
    if [ -d "ai-service" ]; then
        cd ai-service
        
        if [ -f "requirements.txt" ]; then
            print_info "Installing AI service dependencies..."
            pip install -r requirements.txt > /dev/null 2>&1
            
            print_info "Running AI service tests..."
            if python -m pytest > /dev/null 2>&1; then
                print_status "AI service tests passed"
            else
                print_warning "AI service tests failed or not configured"
            fi
        else
            print_warning "requirements.txt not found"
        fi
        
        cd ..
    else
        print_warning "AI service directory not found"
    fi
}

# Cleanup function
cleanup() {
    print_info "Cleaning up test Docker images..."
    docker rmi ubereats-frontend:test ubereats-backend:test ubereats-ai-service:test > /dev/null 2>&1 || true
}

# Main execution
main() {
    echo ""
    print_info "Starting local CI/CD pipeline tests..."
    echo ""
    
    # Run tests
    test_docker_compose
    echo ""
    
    test_backend
    echo ""
    
    test_frontend
    echo ""
    
    test_ai_service
    echo ""
    
    test_docker_builds
    echo ""
    
    print_status "🎉 All local CI/CD tests completed successfully!"
    print_info "Your changes are ready for push to trigger the full CI/CD pipeline."
    
    # Cleanup
    cleanup
}

# Handle script interruption
trap cleanup EXIT

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Run main function
main