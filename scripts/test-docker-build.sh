#!/bin/bash

# Test Docker Build Script
# This script helps test Docker builds locally before pushing to CI/CD

set -e

echo "🧪 Testing Docker builds locally..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    case $status in
        "success")
            echo -e "${GREEN}✅ $message${NC}"
            ;;
        "error")
            echo -e "${RED}❌ $message${NC}"
            ;;
        "warning")
            echo -e "${YELLOW}⚠️ $message${NC}"
            ;;
        "info")
            echo -e "${YELLOW}ℹ️ $message${NC}"
            ;;
    esac
}

# Function to build and test a Docker image
build_and_test() {
    local service=$1
    local dockerfile_path=$2
    local image_name="ubereats-${service}:test"
    
    print_status "info" "Building $service Docker image..."
    
    if docker build -t "$image_name" "$dockerfile_path"; then
        print_status "success" "$service Docker image built successfully"
        
        # Test if image exists and can be inspected
        if docker inspect "$image_name" > /dev/null 2>&1; then
            print_status "success" "$service Docker image is valid"
            
            # Get image size
            local size=$(docker images --format "table {{.Repository}}:{{.Tag}}\t{{.Size}}" | grep "$image_name" | awk '{print $2}')
            print_status "info" "$service image size: $size"
            
            return 0
        else
            print_status "error" "$service Docker image inspection failed"
            return 1
        fi
    else
        print_status "error" "$service Docker build failed"
        return 1
    fi
}

# Function to cleanup test images
cleanup() {
    print_status "info" "Cleaning up test images..."
    
    # Remove test images
    docker rmi ubereats-frontend:test 2>/dev/null || true
    docker rmi ubereats-backend:test 2>/dev/null || true
    docker rmi ubereats-ai-service:test 2>/dev/null || true
    
    # Remove dangling images
    docker image prune -f > /dev/null 2>&1 || true
    
    print_status "success" "Cleanup completed"
}

# Main execution
main() {
    print_status "info" "Starting Docker build tests..."
    
    # Check if Docker is running
    if ! docker info > /dev/null 2>&1; then
        print_status "error" "Docker is not running. Please start Docker first."
        exit 1
    fi
    
    # Track success/failure
    local build_results=()
    
    # Test Frontend build
    if build_and_test "frontend" "./frontend"; then
        build_results+=("frontend:success")
    else
        build_results+=("frontend:failed")
    fi
    
    # Test Backend build
    if build_and_test "backend" "./backend"; then
        build_results+=("backend:success")
    else
        build_results+=("backend:failed")
    fi
    
    # Test AI Service build
    if build_and_test "ai-service" "./ai-service"; then
        build_results+=("ai-service:success")
    else
        build_results+=("ai-service:failed")
    fi
    
    # Print summary
    echo ""
    print_status "info" "=== BUILD SUMMARY ==="
    
    local success_count=0
    local total_count=0
    
    for result in "${build_results[@]}"; do
        IFS=':' read -r service status <<< "$result"
        total_count=$((total_count + 1))
        
        if [ "$status" = "success" ]; then
            print_status "success" "$service build: SUCCESS"
            success_count=$((success_count + 1))
        else
            print_status "error" "$service build: FAILED"
        fi
    done
    
    # Final status
    if [ $success_count -eq $total_count ]; then
        print_status "success" "All Docker builds passed! ($success_count/$total_count)"
        echo ""
        print_status "info" "Your code is ready for CI/CD pipeline!"
        cleanup
        exit 0
    else
        print_status "error" "Some Docker builds failed! ($success_count/$total_count)"
        echo ""
        print_status "warning" "Please fix the failing builds before pushing to CI/CD."
        cleanup
        exit 1
    fi
}

# Handle script interruption
trap cleanup EXIT

# Check if help is requested
if [[ "$1" == "--help" || "$1" == "-h" ]]; then
    echo "Docker Build Test Script"
    echo ""
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  --no-cleanup   Don't cleanup test images after running"
    echo ""
    echo "This script builds and tests all Docker images locally before pushing to CI/CD."
    exit 0
fi

# Check if cleanup should be skipped
if [[ "$1" == "--no-cleanup" ]]; then
    trap - EXIT
fi

# Run main function
main