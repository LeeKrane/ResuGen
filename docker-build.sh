#!/bin/bash

# Docker build and test script for local development

set -e

# Load environment variables from .env.docker if it exists
if [ -f .env.docker ]; then
    echo "📄 Loading environment variables from .env.docker"
    export $(cat .env.docker | grep -v '^#' | xargs)
else
    echo "⚠️  No .env.docker file found. Using default values."
    echo "   Copy .env.docker.example to .env.docker and fill in your values for production builds."
    export SUPABASE_URL="http://localhost:54321"
    export SUPABASE_KEY="dummy-key-for-local-build"
fi

echo "🐳 Building Docker image with build args..."
docker build -t resugen:local \
    --build-arg SUPABASE_URL="$SUPABASE_URL" \
    --build-arg SUPABASE_KEY="$SUPABASE_KEY" \
    .

echo "✅ Build successful! Testing the container..."

# Stop any existing container
docker stop resugen-test 2>/dev/null || true
docker rm resugen-test 2>/dev/null || true

# Run the container
echo "🚀 Starting container..."
docker run -d -p 3000:3000 --name resugen-test \
    -e SUPABASE_URL="$SUPABASE_URL" \
    -e SUPABASE_KEY="$SUPABASE_KEY" \
    resugen:local

# Wait for the container to start
echo "⏳ Waiting for container to start..."
sleep 10

# Test the health endpoint
echo "🔍 Testing health endpoint..."
if curl -f http://localhost:3000/api/health; then
    echo "✅ Health check passed!"
else
    echo "❌ Health check failed!"
    docker logs resugen-test
    exit 1
fi

echo "🎉 Docker build and test completed successfully!"
echo "Container is running at http://localhost:3000"
echo "To stop: docker stop resugen-test && docker rm resugen-test"