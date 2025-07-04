# Week 2 Quick Start Guide

## 🚀 Getting Started with Week 2 Features

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v13 or higher)
- Redis (v6 or higher)

### Setup Steps

#### 1. Environment Configuration
```bash
# Copy the environment template
cp .env.example .env

# Edit .env with your database and Redis credentials
nano .env
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Database Setup
```bash
# Make sure PostgreSQL is running
# Create the database (if not exists)
createdb ubereats_dev

# Run migrations to set up the schema
npm run migration:run
```

#### 4. Start Development Server
```bash
# Start the server with hot reload
npm run start:dev
```

### 🎯 Testing the Implementation

#### 1. API Documentation
Visit `http://localhost:3001/docs` to explore the interactive API documentation.

#### 2. Test Security Headers
```bash
curl -I http://localhost:3001/api/health
```

Expected headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`

#### 3. Test Rate Limiting
```bash
# Make multiple rapid requests to trigger rate limiting
for i in {1..10}; do
  curl -X GET http://localhost:3001/api/users
  echo "Request $i completed"
done
```

#### 4. Test Error Handling
```bash
# Test validation error
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid-email","password":"short"}'
```

#### 5. Check Logs
The application logs all requests and responses in structured JSON format. Look for logs like:
```json
{
  "timestamp": "2023-12-07T10:30:00.000Z",
  "level": "LOG",
  "context": "LoggingInterceptor",
  "message": "📥 GET /api/users - 127.0.0.1",
  "method": "GET",
  "url": "/api/users",
  "duration": 45
}
```

### 🧪 Migration Commands

```bash
# Create a new migration
npm run migration:create -- src/migrations/AddNewFeature

# Generate migration from entity changes
npm run migration:generate -- src/migrations/UpdateUserEntity

# Run pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Check migration status
npm run typeorm migration:show
```

### 🔧 Available Scripts

```bash
# Development
npm run start:dev          # Start with hot reload
npm run start:debug        # Start with debug mode

# Database
npm run migration:run      # Run migrations
npm run migration:revert   # Revert last migration
npm run migration:generate # Generate new migration
npm run schema:sync        # Sync schema (dev only)

# Code Quality
npm run lint              # Run ESLint
npm run format            # Format code with Prettier
npm run test              # Run unit tests
npm run test:e2e          # Run end-to-end tests
```

### 🛡️ Security Features Overview

1. **Rate Limiting**: Protects against abuse (100 requests per 15 minutes by default)
2. **Security Headers**: Comprehensive set of security headers
3. **IP Whitelisting**: Optional IP restrictions for admin endpoints
4. **Request Logging**: All requests are logged with performance metrics
5. **Error Handling**: Standardized error responses with proper logging

### 📊 Monitoring

The application provides comprehensive logging and monitoring:

- **Request/Response Logging**: Every API call is logged
- **Performance Monitoring**: Response times and sizes tracked
- **Security Events**: Failed authentication attempts and rate limit violations
- **Database Operations**: Query performance and errors tracked

### 🔍 Troubleshooting

#### Database Connection Issues
```bash
# Check if PostgreSQL is running
pg_isready -h localhost -p 5432

# Test connection with psql
psql -h localhost -p 5432 -U username -d ubereats_dev
```

#### Redis Connection Issues
```bash
# Check if Redis is running
redis-cli ping

# Test Redis connection
redis-cli -h localhost -p 6379 ping
```

#### Port Already in Use
```bash
# Find process using port 3001
lsof -i :3001

# Kill the process
kill -9 <PID>
```

### 🚀 Ready for Week 3!

With Week 2 complete, you now have:
- ✅ Robust database schema with migrations
- ✅ Comprehensive API documentation with Swagger
- ✅ Global error handling and structured logging
- ✅ Security middleware with rate limiting and headers
- ✅ Development environment with monitoring

You're ready to move on to Week 3: User registration/login system, email verification, and role-based access control!