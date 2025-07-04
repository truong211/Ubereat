import pytest
from fastapi.testclient import TestClient
from main import app

@pytest.fixture
def client():
    """Create a test client for the FastAPI app."""
    return TestClient(app)

@pytest.fixture
def sample_user_data():
    """Sample user data for testing."""
    return {
        "user_id": 123,
        "user_preferences": {"cuisine": "italian", "dietary": ["vegetarian"]},
        "location": {"lat": 40.7128, "lng": -74.0060}
    }

@pytest.fixture
def sample_restaurant_data():
    """Sample restaurant data for testing."""
    return {
        "restaurant_id": 1,
        "name": "Test Restaurant",
        "cuisine": "Italian",
        "location": {"lat": 40.7128, "lng": -74.0060}
    }

@pytest.fixture
def sample_menu_items():
    """Sample menu items for testing."""
    return [
        {"id": 101, "name": "Pizza Margherita", "price": 15.99},
        {"id": 102, "name": "Pasta Carbonara", "price": 12.50},
        {"id": 103, "name": "Caesar Salad", "price": 8.99}
    ]

@pytest.fixture
def sample_reviews():
    """Sample reviews for sentiment analysis testing."""
    return [
        "The food was excellent and the service was great!",
        "Terrible experience, food was cold and awful",
        "It was okay, nothing special",
        "Amazing pizza, will definitely order again!",
        "Worst delivery ever, very disappointed"
    ]