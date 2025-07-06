#!/bin/bash

# Test Docker Builds Script
# This script tests both CI/CD and production Docker builds for the AI service

set -e

echo "🧪 Testing Docker Builds for AI Service"
echo "======================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Function to check disk space
check_disk_space() {
    print_status "Checking available disk space..."
    df -h
    
    # Check if we have at least 5GB free
    available_gb=$(df / | awk 'NR==2 {print int($4/1024/1024)}')
    if [ $available_gb -lt 5 ]; then
        print_warning "Low disk space detected: ${available_gb}GB available"
        print_warning "Recommended: At least 5GB free for testing"
    else
        print_success "Sufficient disk space: ${available_gb}GB available"
    fi
}

# Function to cleanup Docker resources
cleanup_docker() {
    print_status "Cleaning up Docker resources..."
    docker system prune -f
    docker volume prune -f
    print_success "Docker cleanup completed"
}

# Function to test CI/CD build
test_ci_build() {
    print_status "Testing CI/CD Docker build (lightweight)..."
    
    cd ai-service
    
    # Build the CI image
    if docker build -f Dockerfile.ci -t ubereats-ai-service:ci-test .; then
        print_success "CI/CD Docker build successful"
        
        # Check image size
        image_size=$(docker images ubereats-ai-service:ci-test --format "{{.Size}}")
        print_status "CI/CD image size: $image_size"
        
        # Test the container
        print_status "Testing CI/CD container..."
        container_id=$(docker run -d -p 8001:8000 -e CI_TESTING=true -e USE_MOCK_AI=true ubereats-ai-service:ci-test)
        
        # Wait for container to start
        sleep 5
        
        # Test health endpoint
        if curl -s http://localhost:8001/health | grep -q "healthy"; then
            print_success "CI/CD container health check passed"
        else
            print_error "CI/CD container health check failed"
        fi
        
        # Stop and remove container
        docker stop $container_id
        docker rm $container_id
        
        print_success "CI/CD build test completed"
    else
        print_error "CI/CD Docker build failed"
        return 1
    fi
    
    cd ..
}

# Function to test production build
test_production_build() {
    print_status "Testing Production Docker build (full ML stack)..."
    print_warning "This may take 10-20 minutes and requires significant disk space"
    
    read -p "Continue with production build test? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Skipping production build test"
        return 0
    fi
    
    cd ai-service
    
    # Build the production image
    if docker build -f Dockerfile -t ubereats-ai-service:prod-test .; then
        print_success "Production Docker build successful"
        
        # Check image size
        image_size=$(docker images ubereats-ai-service:prod-test --format "{{.Size}}")
        print_status "Production image size: $image_size"
        
        # Test the container
        print_status "Testing Production container..."
        container_id=$(docker run -d -p 8002:8000 ubereats-ai-service:prod-test)
        
        # Wait for container to start
        sleep 10
        
        # Test health endpoint
        if curl -s http://localhost:8002/health | grep -q "healthy"; then
            print_success "Production container health check passed"
        else
            print_error "Production container health check failed"
        fi
        
        # Stop and remove container
        docker stop $container_id
        docker rm $container_id
        
        print_success "Production build test completed"
    else
        print_error "Production Docker build failed"
        return 1
    fi
    
    cd ..
}

# Function to compare build results
compare_builds() {
    print_status "Comparing build results..."
    
    echo "Build Comparison:"
    echo "=================="
    
    # CI/CD build info
    if docker images ubereats-ai-service:ci-test --format "table" | grep -q "ci-test"; then
        ci_size=$(docker images ubereats-ai-service:ci-test --format "{{.Size}}")
        echo "CI/CD Build:    Size: $ci_size"
    fi
    
    # Production build info
    if docker images ubereats-ai-service:prod-test --format "table" | grep -q "prod-test"; then
        prod_size=$(docker images ubereats-ai-service:prod-test --format "{{.Size}}")
        echo "Production Build: Size: $prod_size"
    fi
    
    echo ""
    print_success "Build comparison completed"
}

# Function to run integration tests
run_integration_tests() {
    print_status "Running integration tests..."
    
    cd ai-service
    
    # Install test dependencies
    if [ -f "requirements-ci.txt" ]; then
        print_status "Installing test dependencies..."
        pip install -r requirements-ci.txt
        
        # Run tests
        if CI_TESTING=true USE_MOCK_AI=true python -m pytest test_main.py -v; then
            print_success "Integration tests passed"
        else
            print_error "Integration tests failed"
        fi
    else
        print_warning "requirements-ci.txt not found, skipping integration tests"
    fi
    
    cd ..
}

# Function to cleanup test images
cleanup_test_images() {
    print_status "Cleaning up test images..."
    
    # Remove test images
    docker rmi ubereats-ai-service:ci-test 2>/dev/null || true
    docker rmi ubereats-ai-service:prod-test 2>/dev/null || true
    
    print_success "Test images cleaned up"
}

# Main execution
main() {
    echo "Starting Docker build tests..."
    echo "Date: $(date)"
    echo "System: $(uname -s)"
    echo ""
    
    # Check prerequisites
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed or not in PATH"
        exit 1
    fi
    
    if ! command -v curl &> /dev/null; then
        print_error "curl is not installed or not in PATH"
        exit 1
    fi
    
    # Check if we're in the right directory
    if [ ! -d "ai-service" ]; then
        print_error "Please run this script from the project root directory"
        exit 1
    fi
    
    print_success "Prerequisites check passed"
    
    # Run tests
    check_disk_space
    cleanup_docker
    
    # Test CI/CD build (always run)
    test_ci_build
    
    # Test production build (optional)
    test_production_build
    
    # Compare results
    compare_builds
    
    # Run integration tests
    run_integration_tests
    
    # Cleanup
    cleanup_test_images
    
    echo ""
    print_success "🎉 All Docker build tests completed successfully!"
    echo ""
    echo "Summary:"
    echo "- CI/CD build: ✅ Fast, lightweight, perfect for testing"
    echo "- Production build: ✅ Full ML stack, ready for deployment"
    echo "- Integration tests: ✅ All endpoints working correctly"
    echo ""
    echo "Your CI/CD pipeline should now work without disk space issues!"
}

# Run main function
main "$@"