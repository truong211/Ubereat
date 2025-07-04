# 🍔 UberEats Clone - Full Stack Food Delivery Platform

A comprehensive food delivery platform built with modern technologies including Next.js, NestJS, FastAPI, and AI/ML capabilities.

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Maps**: Mapbox GL JS
- **Real-time**: Socket.IO Client
- **State Management**: React Hooks / Context API
- **UI Components**: Heroicons, Custom components

### Backend
- **Framework**: NestJS with TypeScript
- **Real-time**: Socket.IO
- **Authentication**: JWT with Passport.js
- **Validation**: Class Validator & Class Transformer
- **ORM**: TypeORM (PostgreSQL) + Mongoose (MongoDB)

### AI/ML Service
- **Framework**: FastAPI with Python
- **AI Libraries**: TensorFlow, PyTorch, Transformers
- **NLP**: OpenAI GPT, Rasa
- **ML**: HuggingFace models, Scikit-learn

### Databases
- **Primary**: PostgreSQL (Users, Orders, Restaurants)
- **NoSQL**: MongoDB (Analytics, Chat, Real-time data)
- **Cache**: Redis (Sessions, Caching)

### DevOps & Infrastructure
- **Containerization**: Docker & Docker Compose
- **Reverse Proxy**: Nginx
- **CI/CD**: GitHub Actions
- **Deployment**: Vercel (Frontend), Railway (Backend)

## 📁 Project Structure

```
uber-eats-clone/
├── frontend/                 # Next.js React application
│   ├── src/
│   │   ├── app/             # App router pages
│   │   ├── components/      # Reusable components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilities and configurations
│   │   └── types/          # TypeScript type definitions
│   ├── public/             # Static assets
│   └── Dockerfile
├── backend/                  # NestJS API server
│   ├── src/
│   │   ├── modules/        # Feature modules
│   │   ├── common/         # Shared utilities
│   │   ├── entities/       # Database entities
│   │   └── guards/         # Authentication guards
│   └── Dockerfile
├── ai-service/              # FastAPI ML service
│   ├── main.py             # FastAPI application
│   ├── models/             # ML models
│   ├── services/           # AI services
│   ├── requirements.txt    # Python dependencies
│   └── Dockerfile
├── database/               # Database initialization
│   ├── postgres/           # PostgreSQL schemas
│   └── mongo/              # MongoDB collections
├── docker-configs/         # Infrastructure configuration
│   └── nginx.conf          # Nginx reverse proxy
├── docs/                   # Documentation
├── docker-compose.yml      # Multi-service setup
└── README.md
```

## 🛠️ Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for AI service development)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd uber-eats-clone
```

### 2. Environment Setup
```bash
# Copy environment variables
cp .env.example .env

# Edit the .env file with your configuration
nano .env
```

### 3. Start with Docker Compose
```bash
# Build and start all services
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **AI Service**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 🔧 Local Development

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

### Backend Development
```bash
cd backend
npm install
npm run start:dev
```

### AI Service Development
```bash
cd ai-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

## 🏗️ Core Features

### 🍕 User Features
- **Authentication**: Sign up, login, password reset
- **Restaurant Discovery**: Browse restaurants with filters
- **Menu Browsing**: View menus with categories and customization
- **Cart Management**: Add items, modify quantities, apply coupons
- **Order Placement**: Checkout with multiple payment options
- **Real-time Tracking**: Live order status and delivery tracking
- **Reviews & Ratings**: Rate restaurants and drivers
- **Order History**: View past orders and reorder

### 🏪 Restaurant Features
- **Dashboard**: Analytics, orders, and revenue insights
- **Menu Management**: Add/edit items, categories, and pricing
- **Order Management**: Accept/reject orders, update status
- **Analytics**: Sales reports, popular items, customer insights
- **Profile Management**: Update restaurant information and hours

### 🚗 Driver Features
- **Driver App**: Accept orders, navigation, and earnings
- **Real-time Location**: GPS tracking for customers
- **Earnings Dashboard**: Track daily and weekly earnings
- **Route Optimization**: Efficient delivery routes

### 🤖 AI/ML Features
- **Personalized Recommendations**: ML-powered restaurant and food suggestions
- **Demand Forecasting**: Predict peak hours and demand patterns
- **Price Optimization**: Dynamic pricing based on demand and competition
- **Chat Support**: AI-powered customer support chatbot
- **Sentiment Analysis**: Analyze customer reviews and feedback
- **Fraud Detection**: Identify suspicious orders and transactions

### ⚡ Real-time Features
- **Live Order Tracking**: Real-time status updates via WebSocket
- **Driver Location**: Live driver location on map
- **Chat System**: Real-time messaging between customers, restaurants, and drivers
- **Notifications**: Push notifications for order updates
- **Live Analytics**: Real-time dashboard updates for restaurants

## 🗄️ Database Schema

### PostgreSQL Tables
- `users` - User accounts and profiles
- `restaurants` - Restaurant information and settings
- `menu_items` - Food items with pricing and details
- `orders` - Order information and status
- `order_items` - Individual items in orders
- `reviews` - Customer reviews and ratings
- `driver_locations` - Real-time driver GPS coordinates

### MongoDB Collections
- `chat_messages` - Real-time messaging
- `order_events` - Order tracking events
- `user_analytics` - User behavior and analytics
- `restaurant_analytics` - Restaurant performance metrics
- `ai_recommendations` - ML-generated recommendations
- `notifications` - Push notifications and alerts

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access**: Different permissions for customers, restaurants, drivers, admins
- **Rate Limiting**: API rate limiting to prevent abuse
- **Input Validation**: Comprehensive input sanitization
- **CORS Configuration**: Secure cross-origin resource sharing
- **Password Hashing**: Bcrypt for secure password storage
- **Environment Variables**: Sensitive data in environment files

## 📊 Monitoring & Analytics

- **Application Metrics**: Performance monitoring
- **User Analytics**: Behavior tracking and insights
- **Business Intelligence**: Revenue, orders, and growth metrics
- **Error Tracking**: Comprehensive error logging
- **Health Checks**: Service availability monitoring

## 🚀 Deployment

### Frontend Deployment (Vercel)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd frontend
vercel --prod
```

### Backend Deployment (Railway)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy backend
cd backend
railway login
railway link
railway up
```

### Full Stack Deployment (Docker)
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy to your server
docker-compose -f docker-compose.prod.yml up -d
```

## 🧪 Testing

### Frontend Testing
```bash
cd frontend
npm run test        # Unit tests
npm run test:e2e    # End-to-end tests
```

### Backend Testing
```bash
cd backend
npm run test        # Unit tests
npm run test:e2e    # End-to-end tests
npm run test:cov    # Coverage report
```

### AI Service Testing
```bash
cd ai-service
pytest              # Run tests
pytest --cov        # Coverage report
```

## 📝 API Documentation

### Backend API
- **Base URL**: `http://localhost:3001/api`
- **Authentication**: Bearer JWT token
- **Documentation**: Available at `/api/docs` (Swagger)

### AI Service API
- **Base URL**: `http://localhost:8000`
- **Documentation**: Available at `/docs` (FastAPI automatic docs)

### Key Endpoints
```
POST /api/auth/login              # User authentication
GET  /api/restaurants             # List restaurants
POST /api/orders                  # Place order
GET  /api/orders/:id/track        # Track order
POST /ai/recommendations/restaurants # Get recommendations
POST /ai/chat/support             # AI chat support
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation in `/docs`
- Review the API documentation at `/docs` endpoints

## 🔗 External APIs Required

1. **Mapbox**: For maps and location services
   - Get token: https://www.mapbox.com/
   
2. **OpenAI**: For AI chat support
   - Get API key: https://platform.openai.com/
   
3. **HuggingFace**: For ML models
   - Get token: https://huggingface.co/

4. **Stripe** (Optional): For payments
   - Get keys: https://stripe.com/

---

Built with ❤️ for the food delivery revolution! 🚀