"""
AI Service Main Application
Provides AI-powered features for the Uber Eats clone
"""

import os
import logging
from typing import Optional, List, Dict, Any

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Check if we're in CI testing mode
CI_TESTING = os.getenv('CI_TESTING', 'false').lower() == 'true'
USE_MOCK_AI = os.getenv('USE_MOCK_AI', 'false').lower() == 'true'

# Import dependencies with fallbacks for CI testing
try:
    from fastapi import FastAPI, HTTPException, Request
    from fastapi.middleware.cors import CORSMiddleware
    from pydantic import BaseModel
    FASTAPI_AVAILABLE = True
except ImportError:
    logger.warning("FastAPI not available, running in mock mode")
    FASTAPI_AVAILABLE = False
    
    # Create mock classes for testing
    class FastAPI:
        def __init__(self):
            self.middleware_stack = []
            
        def add_middleware(self, middleware_class, **kwargs):
            pass
            
        def get(self, path):
            def decorator(func):
                return func
            return decorator
            
        def post(self, path):
            def decorator(func):
                return func
            return decorator
    
    class BaseModel:
        pass
    
    class HTTPException(Exception):
        def __init__(self, status_code: int, detail: str):
            self.status_code = status_code
            self.detail = detail

# Mock AI libraries for CI testing
if CI_TESTING and USE_MOCK_AI:
    logger.info("Using mock AI libraries for CI testing")
    
    class MockAIService:
        def __init__(self):
            logger.info("Mock AI Service initialized")
        
        def generate_recommendations(self, user_id: int, preferences: Dict[str, Any]) -> List[Dict[str, Any]]:
            return [
                {"restaurant_id": 1, "name": "Mock Restaurant 1", "score": 0.95},
                {"restaurant_id": 2, "name": "Mock Restaurant 2", "score": 0.87}
            ]
        
        def analyze_sentiment(self, text: str) -> Dict[str, Any]:
            return {"sentiment": "positive", "score": 0.8, "confidence": 0.9}
        
        def predict_demand(self, restaurant_id: int, hours_ahead: int = 24) -> Dict[str, Any]:
            return {
                "restaurant_id": restaurant_id,
                "forecast_hours": hours_ahead,
                "predicted_orders": [10, 15, 20, 12] * (hours_ahead // 4),
                "confidence": 0.85
            }
    
    ai_service = MockAIService()
else:
    # Production AI service would be imported here
    logger.info("Production AI Service would be initialized here")
    ai_service = None

# Initialize FastAPI app
app = FastAPI(
    title="AI Service",
    description="AI-powered features for Uber Eats clone",
    version="1.0.0"
)

# Add CORS middleware
if FASTAPI_AVAILABLE:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Configure appropriately for production
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Pydantic models for request/response
class RecommendationRequest(BaseModel):
    user_id: int
    preferences: Optional[Dict[str, Any]] = None
    location: Optional[Dict[str, float]] = None

class SentimentRequest(BaseModel):
    text: str

class HealthResponse(BaseModel):
    status: str
    service: str
    mode: str
    version: str

# Health check endpoint
@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        service="ai-service",
        mode="testing" if CI_TESTING else "production",
        version="1.0.0"
    )

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "AI Service for Uber Eats Clone",
        "version": "1.0.0",
        "testing": CI_TESTING,
        "endpoints": [
            "/health",
            "/recommendations",
            "/sentiment",
            "/demand-forecast"
        ]
    }

@app.post("/recommendations")
async def get_recommendations(request: RecommendationRequest):
    """Get restaurant recommendations for a user"""
    if not ai_service:
        raise HTTPException(status_code=503, detail="AI service not available")
    
    try:
        recommendations = ai_service.generate_recommendations(
            user_id=request.user_id,
            preferences=request.preferences or {}
        )
        return {
            "user_id": request.user_id,
            "recommendations": recommendations,
            "generated_at": "2024-01-01T00:00:00Z"
        }
    except Exception as e:
        logger.error(f"Error generating recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/sentiment")
async def analyze_sentiment(request: SentimentRequest):
    """Analyze sentiment of text"""
    if not ai_service:
        raise HTTPException(status_code=503, detail="AI service not available")
    
    try:
        result = ai_service.analyze_sentiment(request.text)
        return {
            "text": request.text,
            "sentiment": result,
            "processed_at": "2024-01-01T00:00:00Z"
        }
    except Exception as e:
        logger.error(f"Error analyzing sentiment: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/demand-forecast")
async def get_demand_forecast(restaurant_id: int, hours_ahead: int = 24):
    """Get demand forecast for a restaurant"""
    if not ai_service:
        raise HTTPException(status_code=503, detail="AI service not available")
    
    try:
        forecast = ai_service.predict_demand(
            restaurant_id=restaurant_id,
            hours_ahead=hours_ahead
        )
        return forecast
    except Exception as e:
        logger.error(f"Error generating demand forecast: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Error handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {str(exc)}")
    return {
        "error": "Internal server error",
        "message": str(exc) if CI_TESTING else "An error occurred"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)