from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="UberEats AI Service",
    description="AI/ML service for recommendations, chat support, and analytics",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class RecommendationRequest(BaseModel):
    user_id: int
    user_preferences: Optional[dict] = None
    location: Optional[dict] = None
    time_of_day: Optional[str] = None

class RecommendationResponse(BaseModel):
    restaurants: List[dict]
    menu_items: List[dict]
    confidence_score: float

class ChatMessage(BaseModel):
    message: str
    context: Optional[dict] = None

class ChatResponse(BaseModel):
    response: str
    intent: Optional[str] = None
    confidence: float

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ai-service"}

# Restaurant recommendations
@app.post("/recommendations/restaurants", response_model=RecommendationResponse)
async def get_restaurant_recommendations(request: RecommendationRequest):
    """
    Get personalized restaurant recommendations based on user preferences,
    location, and past orders.
    """
    try:
        # Placeholder implementation - replace with actual ML model
        recommendations = {
            "restaurants": [
                {
                    "id": 1,
                    "name": "Italian Bistro",
                    "cuisine": "Italian",
                    "rating": 4.5,
                    "estimated_delivery": 30,
                    "reason": "Based on your preference for Italian food"
                },
                {
                    "id": 2,
                    "name": "Sushi Palace",
                    "cuisine": "Japanese",
                    "rating": 4.7,
                    "estimated_delivery": 25,
                    "reason": "Highly rated nearby restaurant"
                }
            ],
            "menu_items": [
                {
                    "id": 101,
                    "name": "Margherita Pizza",
                    "restaurant_id": 1,
                    "price": 15.99,
                    "reason": "Popular choice for your preferences"
                }
            ],
            "confidence_score": 0.85
        }
        return recommendations
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Menu item recommendations
@app.post("/recommendations/menu-items")
async def get_menu_recommendations(restaurant_id: int, user_id: int):
    """
    Get personalized menu item recommendations for a specific restaurant.
    """
    try:
        # Placeholder implementation
        recommendations = [
            {
                "id": 101,
                "name": "Recommended Pasta",
                "price": 12.99,
                "confidence": 0.9,
                "reason": "Based on your order history"
            }
        ]
        return {"recommendations": recommendations}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# AI Chat Support
@app.post("/chat/support", response_model=ChatResponse)
async def chat_support(message: ChatMessage):
    """
    AI-powered chat support for customer queries.
    """
    try:
        # Placeholder implementation - replace with actual NLP model
        user_message = message.message.lower()
        
        if "order" in user_message and "status" in user_message:
            response = "I can help you check your order status. Please provide your order number."
            intent = "order_status"
            confidence = 0.9
        elif "delivery" in user_message and "time" in user_message:
            response = "Typical delivery times are 25-40 minutes depending on your location and restaurant preparation time."
            intent = "delivery_inquiry"
            confidence = 0.85
        elif "refund" in user_message or "cancel" in user_message:
            response = "I understand you want to cancel or request a refund. Let me connect you with our support team."
            intent = "refund_request"
            confidence = 0.88
        else:
            response = "I'm here to help! Can you please provide more details about your question?"
            intent = "general_inquiry"
            confidence = 0.6
        
        return ChatResponse(
            response=response,
            intent=intent,
            confidence=confidence
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Price prediction
@app.post("/analytics/price-prediction")
async def predict_price(restaurant_id: int, menu_items: List[dict], location: dict):
    """
    Predict optimal pricing for menu items based on market data and demand.
    """
    try:
        # Placeholder implementation
        predictions = []
        for item in menu_items:
            predictions.append({
                "item_id": item.get("id"),
                "current_price": item.get("price"),
                "suggested_price": item.get("price", 0) * 1.05,  # 5% increase
                "confidence": 0.75,
                "factors": ["demand", "competition", "location"]
            })
        
        return {"predictions": predictions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Demand forecasting
@app.get("/analytics/demand-forecast")
async def forecast_demand(restaurant_id: int, hours_ahead: int = 24):
    """
    Forecast demand for a restaurant over the next specified hours.
    """
    try:
        # Placeholder implementation
        forecast = {
            "restaurant_id": restaurant_id,
            "forecast_hours": hours_ahead,
            "predicted_orders": [
                {"hour": i, "orders": 10 + (i % 12)} for i in range(hours_ahead)
            ],
            "peak_hours": [12, 13, 19, 20],
            "confidence": 0.82
        }
        
        return forecast
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Sentiment analysis for reviews
@app.post("/analytics/sentiment")
async def analyze_sentiment(reviews: List[str]):
    """
    Analyze sentiment of customer reviews and feedback.
    """
    try:
        # Placeholder implementation
        results = []
        for review in reviews:
            # Simple keyword-based sentiment (replace with actual model)
            positive_words = ["good", "great", "excellent", "amazing", "love"]
            negative_words = ["bad", "terrible", "awful", "hate", "worst"]
            
            positive_count = sum(1 for word in positive_words if word in review.lower())
            negative_count = sum(1 for word in negative_words if word in review.lower())
            
            if positive_count > negative_count:
                sentiment = "positive"
                score = 0.7 + (positive_count * 0.1)
            elif negative_count > positive_count:
                sentiment = "negative"
                score = 0.3 - (negative_count * 0.1)
            else:
                sentiment = "neutral"
                score = 0.5
            
            results.append({
                "review": review[:50] + "...",
                "sentiment": sentiment,
                "score": min(max(score, 0), 1),
                "confidence": 0.75
            })
        
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)