#!/bin/bash

# AI Service Test Runner
echo "🤖 Running AI Service Tests..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📚 Installing dependencies..."
pip install -r requirements.txt

# Run tests with coverage
echo "🧪 Running tests with coverage..."
pytest --cov=. --cov-report=xml --cov-report=term-missing -v

# Check exit code
if [ $? -eq 0 ]; then
    echo "✅ All tests passed!"
else
    echo "❌ Some tests failed!"
    exit 1
fi

echo "📊 Test coverage report generated: coverage.xml"
echo "🎉 AI Service testing complete!"