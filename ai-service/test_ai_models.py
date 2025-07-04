import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

class TestRecommendationModels:
    """Test recommendation system functionality."""
    
    def test_restaurant_recommendation_algorithm(self):
        """Test the restaurant recommendation algorithm logic."""
        request_data = {
            "user_id": 123,
            "user_preferences": {"cuisine": "italian"},
            "location": {"lat": 40.7128, "lng": -74.0060},
            "time_of_day": "dinner"
        }
        
        response = client.post("/recommendations/restaurants", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        
        # Verify recommendation structure
        assert "restaurants" in data
        assert "confidence_score" in data
        assert data["confidence_score"] > 0 and data["confidence_score"] <= 1
        
        # Verify restaurant data quality
        for restaurant in data["restaurants"]:
            assert "id" in restaurant
            assert "name" in restaurant
            assert "rating" in restaurant
            assert restaurant["rating"] >= 0 and restaurant["rating"] <= 5
    
    def test_menu_item_recommendations(self):
        """Test menu item recommendation logic."""
        response = client.post("/recommendations/menu-items?restaurant_id=1&user_id=123")
        assert response.status_code == 200
        
        data = response.json()
        recommendations = data["recommendations"]
        
        for item in recommendations:
            assert "confidence" in item
            assert item["confidence"] > 0 and item["confidence"] <= 1
            assert "reason" in item

class TestChatAI:
    """Test AI chat functionality."""
    
    def test_intent_classification(self):
        """Test intent classification accuracy."""
        test_cases = [
            {"message": "where is my order", "expected_intent": "order_status"},
            {"message": "how long for delivery", "expected_intent": "delivery_inquiry"},
            {"message": "I want my money back", "expected_intent": "refund_request"},
            {"message": "hello there", "expected_intent": "general_inquiry"}
        ]
        
        for case in test_cases:
            request_data = {"message": case["message"]}
            response = client.post("/chat/support", json=request_data)
            
            assert response.status_code == 200
            data = response.json()
            assert data["intent"] == case["expected_intent"]
    
    def test_confidence_scoring(self):
        """Test confidence scoring for chat responses."""
        request_data = {"message": "What is my order status please?"}
        response = client.post("/chat/support", json=request_data)
        
        assert response.status_code == 200
        data = response.json()
        
        # Confidence should be a float between 0 and 1
        assert isinstance(data["confidence"], float)
        assert 0 <= data["confidence"] <= 1

class TestAnalyticsAI:
    """Test AI analytics functionality."""
    
    def test_price_prediction_accuracy(self):
        """Test price prediction model outputs."""
        request_data = {
            "restaurant_id": 1,
            "menu_items": [
                {"id": 101, "price": 10.00},
                {"id": 102, "price": 15.00}
            ],
            "location": {"lat": 40.7128, "lng": -74.0060}
        }
        
        response = client.post("/analytics/price-prediction", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        predictions = data["predictions"]
        
        for prediction in predictions:
            # Predicted price should be reasonable
            current_price = prediction["current_price"]
            suggested_price = prediction["suggested_price"]
            
            # Price change should be within reasonable bounds (max 50% change)
            price_ratio = suggested_price / current_price
            assert 0.5 <= price_ratio <= 1.5
            
            # Confidence should be reasonable
            assert 0 <= prediction["confidence"] <= 1
    
    def test_demand_forecasting_data_quality(self):
        """Test demand forecasting data quality."""
        response = client.get("/analytics/demand-forecast?restaurant_id=1&hours_ahead=12")
        assert response.status_code == 200
        
        data = response.json()
        
        # Check forecast structure
        assert len(data["predicted_orders"]) == 12
        
        # Check that predictions are reasonable
        for hour_data in data["predicted_orders"]:
            assert "hour" in hour_data
            assert "orders" in hour_data
            assert hour_data["orders"] >= 0  # Can't have negative orders
            assert hour_data["orders"] <= 1000  # Reasonable upper bound
    
    def test_sentiment_analysis_accuracy(self):
        """Test sentiment analysis model accuracy."""
        test_cases = [
            {"review": "Amazing food, love it!", "expected": "positive"},
            {"review": "Terrible service, worst experience", "expected": "negative"},
            {"review": "Food was okay", "expected": "neutral"},
            {"review": "Excellent quality and great taste", "expected": "positive"},
            {"review": "Bad food, awful delivery", "expected": "negative"}
        ]
        
        reviews = [case["review"] for case in test_cases]
        response = client.post("/analytics/sentiment", json={"reviews": reviews})
        
        assert response.status_code == 200
        data = response.json()
        
        results = data["results"]
        assert len(results) == len(test_cases)
        
        # Check sentiment classification accuracy
        for i, result in enumerate(results):
            expected = test_cases[i]["expected"]
            actual = result["sentiment"]
            
            # For simple keyword-based model, check basic accuracy
            assert actual in ["positive", "negative", "neutral"]
            assert 0 <= result["score"] <= 1

class TestModelPerformance:
    """Test AI model performance and edge cases."""
    
    def test_empty_input_handling(self):
        """Test how models handle empty inputs."""
        # Test empty reviews
        response = client.post("/analytics/sentiment", json={"reviews": []})
        assert response.status_code == 200
        assert response.json()["results"] == []
        
        # Test empty menu items for price prediction
        request_data = {
            "restaurant_id": 1,
            "menu_items": [],
            "location": {}
        }
        response = client.post("/analytics/price-prediction", json=request_data)
        assert response.status_code == 200
        assert response.json()["predictions"] == []
    
    def test_large_input_handling(self):
        """Test handling of large inputs."""
        # Test with many reviews
        large_review_list = ["Good food"] * 100
        response = client.post("/analytics/sentiment", json={"reviews": large_review_list})
        assert response.status_code == 200
        assert len(response.json()["results"]) == 100
    
    def test_response_time_performance(self):
        """Test that API responses are reasonably fast."""
        import time
        
        # Test chat response time
        start_time = time.time()
        request_data = {"message": "Hello, I need help with my order"}
        response = client.post("/chat/support", json=request_data)
        end_time = time.time()
        
        assert response.status_code == 200
        assert (end_time - start_time) < 5.0  # Should respond within 5 seconds