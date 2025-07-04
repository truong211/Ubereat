import pytest
from fastapi.testclient import TestClient
from main import app

# Create test client
client = TestClient(app)

def test_health_check():
    """Test the health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "ai-service"

def test_restaurant_recommendations():
    """Test restaurant recommendations endpoint."""
    request_data = {
        "user_id": 123,
        "user_preferences": {"cuisine": "italian"},
        "location": {"lat": 40.7128, "lng": -74.0060},
        "time_of_day": "evening"
    }
    
    response = client.post("/recommendations/restaurants", json=request_data)
    assert response.status_code == 200
    
    data = response.json()
    assert "restaurants" in data
    assert "menu_items" in data
    assert "confidence_score" in data
    assert isinstance(data["restaurants"], list)
    assert isinstance(data["menu_items"], list)
    assert isinstance(data["confidence_score"], float)

def test_restaurant_recommendations_minimal():
    """Test restaurant recommendations with minimal data."""
    request_data = {
        "user_id": 456
    }
    
    response = client.post("/recommendations/restaurants", json=request_data)
    assert response.status_code == 200
    
    data = response.json()
    assert "restaurants" in data
    assert len(data["restaurants"]) > 0

def test_menu_recommendations():
    """Test menu item recommendations endpoint."""
    response = client.post("/recommendations/menu-items?restaurant_id=1&user_id=123")
    assert response.status_code == 200
    
    data = response.json()
    assert "recommendations" in data
    assert isinstance(data["recommendations"], list)

def test_chat_support_order_status():
    """Test chat support for order status inquiry."""
    request_data = {
        "message": "What is my order status?",
        "context": {"user_id": 123}
    }
    
    response = client.post("/chat/support", json=request_data)
    assert response.status_code == 200
    
    data = response.json()
    assert "response" in data
    assert "intent" in data
    assert "confidence" in data
    assert data["intent"] == "order_status"
    assert isinstance(data["confidence"], float)

def test_chat_support_delivery_inquiry():
    """Test chat support for delivery time inquiry."""
    request_data = {
        "message": "How long will delivery take?"
    }
    
    response = client.post("/chat/support", json=request_data)
    assert response.status_code == 200
    
    data = response.json()
    assert data["intent"] == "delivery_inquiry"
    assert data["confidence"] > 0.8

def test_chat_support_refund_request():
    """Test chat support for refund requests."""
    request_data = {
        "message": "I want to cancel my order and get a refund"
    }
    
    response = client.post("/chat/support", json=request_data)
    assert response.status_code == 200
    
    data = response.json()
    assert data["intent"] == "refund_request"

def test_chat_support_general():
    """Test chat support for general inquiries."""
    request_data = {
        "message": "Hello, I need help"
    }
    
    response = client.post("/chat/support", json=request_data)
    assert response.status_code == 200
    
    data = response.json()
    assert data["intent"] == "general_inquiry"

def test_price_prediction():
    """Test price prediction endpoint."""
    request_data = {
        "restaurant_id": 1,
        "menu_items": [
            {"id": 101, "price": 15.99},
            {"id": 102, "price": 12.50}
        ],
        "location": {"lat": 40.7128, "lng": -74.0060}
    }
    
    response = client.post("/analytics/price-prediction", json=request_data)
    assert response.status_code == 200
    
    data = response.json()
    assert "predictions" in data
    assert len(data["predictions"]) == 2
    
    for prediction in data["predictions"]:
        assert "item_id" in prediction
        assert "current_price" in prediction
        assert "suggested_price" in prediction
        assert "confidence" in prediction

def test_demand_forecast():
    """Test demand forecasting endpoint."""
    response = client.get("/analytics/demand-forecast?restaurant_id=1&hours_ahead=24")
    assert response.status_code == 200
    
    data = response.json()
    assert "restaurant_id" in data
    assert "forecast_hours" in data
    assert "predicted_orders" in data
    assert "peak_hours" in data
    assert "confidence" in data
    assert data["restaurant_id"] == 1
    assert len(data["predicted_orders"]) == 24

def test_demand_forecast_default_hours():
    """Test demand forecasting with default hours."""
    response = client.get("/analytics/demand-forecast?restaurant_id=2")
    assert response.status_code == 200
    
    data = response.json()
    assert data["forecast_hours"] == 24

def test_sentiment_analysis():
    """Test sentiment analysis endpoint."""
    request_data = {
        "reviews": [
            "The food was excellent and the service was great!",
            "Terrible experience, food was cold and awful",
            "It was okay, nothing special"
        ]
    }
    
    response = client.post("/analytics/sentiment", json=request_data)
    assert response.status_code == 200
    
    data = response.json()
    assert "results" in data
    assert len(data["results"]) == 3
    
    results = data["results"]
    
    # Check positive sentiment
    assert results[0]["sentiment"] == "positive"
    assert results[0]["score"] > 0.5
    
    # Check negative sentiment
    assert results[1]["sentiment"] == "negative"
    assert results[1]["score"] < 0.5
    
    # Check neutral sentiment
    assert results[2]["sentiment"] == "neutral"
    assert results[2]["score"] == 0.5

def test_sentiment_analysis_empty_list():
    """Test sentiment analysis with empty reviews list."""
    request_data = {"reviews": []}
    
    response = client.post("/analytics/sentiment", json=request_data)
    assert response.status_code == 200
    
    data = response.json()
    assert data["results"] == []

class TestAPIValidation:
    """Test API input validation."""
    
    def test_restaurant_recommendations_invalid_user_id(self):
        """Test restaurant recommendations with invalid user_id type."""
        request_data = {"user_id": "invalid"}
        
        response = client.post("/recommendations/restaurants", json=request_data)
        assert response.status_code == 422  # Validation error
    
    def test_chat_support_missing_message(self):
        """Test chat support without message field."""
        request_data = {"context": {"user_id": 123}}
        
        response = client.post("/chat/support", json=request_data)
        assert response.status_code == 422  # Validation error
    
    def test_price_prediction_invalid_restaurant_id(self):
        """Test price prediction with invalid restaurant_id."""
        request_data = {
            "restaurant_id": "invalid",
            "menu_items": [],
            "location": {}
        }
        
        response = client.post("/analytics/price-prediction", json=request_data)
        assert response.status_code == 422  # Validation error

class TestErrorHandling:
    """Test error handling scenarios."""
    
    def test_menu_recommendations_missing_params(self):
        """Test menu recommendations without required parameters."""
        response = client.post("/recommendations/menu-items")
        assert response.status_code == 422  # Missing required parameters
    
    def test_demand_forecast_invalid_restaurant_id(self):
        """Test demand forecast with invalid restaurant_id."""
        response = client.get("/analytics/demand-forecast?restaurant_id=invalid")
        assert response.status_code == 422  # Validation error

if __name__ == "__main__":
    pytest.main([__file__])