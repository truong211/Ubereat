#!/bin/bash

# UberEats Clone Setup Script
echo "🍔 Setting up UberEats Clone Development Environment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create environment file from example
if [ ! -f .env ]; then
    echo "📋 Creating environment file..."
    cp .env.example .env
    echo "✅ Environment file created. Please edit .env with your configuration."
else
    echo "✅ Environment file already exists."
fi

# Create necessary directories
echo "📁 Creating additional directories..."
mkdir -p logs uploads docs/api

# Frontend setup
echo "🎨 Setting up Frontend..."
if [ -d "frontend" ]; then
    cd frontend
    if [ -f "package.json" ]; then
        echo "📦 Installing frontend dependencies..."
        npm install
        echo "✅ Frontend dependencies installed."
    fi
    cd ..
fi

# Backend setup
echo "🔧 Setting up Backend..."
if [ -d "backend" ]; then
    cd backend
    if [ -f "package.json" ]; then
        echo "📦 Installing backend dependencies..."
        npm install
        echo "✅ Backend dependencies installed."
    fi
    cd ..
fi

# AI Service setup
echo "🤖 Setting up AI Service..."
if [ -d "ai-service" ]; then
    cd ai-service
    if [ ! -d "venv" ]; then
        echo "🐍 Creating Python virtual environment..."
        python3 -m venv venv
    fi
    
    echo "📦 Activating virtual environment and installing Python dependencies..."
    source venv/bin/activate
    pip install -r requirements.txt
    deactivate
    echo "✅ AI Service dependencies installed."
    cd ..
fi

# Create Docker network if not exists
echo "🐳 Creating Docker network..."
docker network create uber-eats-network 2>/dev/null || echo "Network already exists"

# Build and start services
echo "🚀 Building and starting services with Docker Compose..."
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Check service health
echo "🏥 Checking service health..."
echo "Frontend: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "Not responding")"
echo "Backend: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001 || echo "Not responding")"
echo "AI Service: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health || echo "Not responding")"

echo ""
echo "🎉 Setup complete! Your UberEats clone is ready for development."
echo ""
echo "📍 Access points:"
echo "   Frontend:    http://localhost:3000"
echo "   Backend API: http://localhost:3001"
echo "   AI Service:  http://localhost:8000"
echo "   AI Docs:     http://localhost:8000/docs"
echo ""
echo "🔧 Development commands:"
echo "   Start all:   docker-compose up"
echo "   Stop all:    docker-compose down"
echo "   View logs:   docker-compose logs -f [service-name]"
echo "   Rebuild:     docker-compose up --build"
echo ""
echo "📚 Next steps:"
echo "   1. Edit .env file with your API keys"
echo "   2. Check the README.md for detailed documentation"
echo "   3. Visit http://localhost:8000/docs for AI service API docs"
echo ""
echo "Happy coding! 🚀"