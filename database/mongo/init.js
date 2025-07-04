// Switch to ubereats database
db = db.getSiblingDB('ubereats');

// Create collections with validation schemas

// Chat messages collection for customer support
db.createCollection('chat_messages', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['order_id', 'sender_id', 'sender_type', 'message', 'timestamp'],
      properties: {
        order_id: { bsonType: 'int' },
        sender_id: { bsonType: 'int' },
        sender_type: { 
          bsonType: 'string',
          enum: ['customer', 'driver', 'restaurant', 'support']
        },
        message: { bsonType: 'string' },
        message_type: {
          bsonType: 'string',
          enum: ['text', 'image', 'location', 'system']
        },
        timestamp: { bsonType: 'date' },
        read_by: { bsonType: 'array' },
        attachments: { bsonType: 'array' }
      }
    }
  }
});

// Real-time order tracking events
db.createCollection('order_events', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['order_id', 'event_type', 'timestamp'],
      properties: {
        order_id: { bsonType: 'int' },
        event_type: {
          bsonType: 'string',
          enum: ['order_placed', 'order_confirmed', 'preparing', 'ready_for_pickup', 'picked_up', 'on_the_way', 'delivered', 'cancelled']
        },
        timestamp: { bsonType: 'date' },
        location: {
          bsonType: 'object',
          properties: {
            latitude: { bsonType: 'double' },
            longitude: { bsonType: 'double' }
          }
        },
        estimated_time: { bsonType: 'int' },
        notes: { bsonType: 'string' }
      }
    }
  }
});

// User activity analytics
db.createCollection('user_analytics', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['user_id', 'event_type', 'timestamp'],
      properties: {
        user_id: { bsonType: 'int' },
        session_id: { bsonType: 'string' },
        event_type: {
          bsonType: 'string',
          enum: ['login', 'logout', 'search', 'view_restaurant', 'view_menu', 'add_to_cart', 'place_order', 'rate_order']
        },
        timestamp: { bsonType: 'date' },
        metadata: { bsonType: 'object' },
        device_info: {
          bsonType: 'object',
          properties: {
            device_type: { bsonType: 'string' },
            browser: { bsonType: 'string' },
            os: { bsonType: 'string' }
          }
        }
      }
    }
  }
});

// Restaurant analytics and insights
db.createCollection('restaurant_analytics', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['restaurant_id', 'date', 'metrics'],
      properties: {
        restaurant_id: { bsonType: 'int' },
        date: { bsonType: 'date' },
        metrics: {
          bsonType: 'object',
          properties: {
            total_orders: { bsonType: 'int' },
            total_revenue: { bsonType: 'double' },
            average_order_value: { bsonType: 'double' },
            customer_count: { bsonType: 'int' },
            average_rating: { bsonType: 'double' },
            preparation_time: { bsonType: 'double' },
            popular_items: { bsonType: 'array' }
          }
        }
      }
    }
  }
});

// AI recommendations and insights
db.createCollection('ai_recommendations', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['user_id', 'recommendation_type', 'generated_at'],
      properties: {
        user_id: { bsonType: 'int' },
        recommendation_type: {
          bsonType: 'string',
          enum: ['restaurant', 'menu_item', 'cuisine', 'promotional']
        },
        recommendations: { bsonType: 'array' },
        confidence_score: { bsonType: 'double' },
        generated_at: { bsonType: 'date' },
        expires_at: { bsonType: 'date' },
        model_version: { bsonType: 'string' }
      }
    }
  }
});

// Notifications
db.createCollection('notifications', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['user_id', 'type', 'title', 'message', 'created_at'],
      properties: {
        user_id: { bsonType: 'int' },
        type: {
          bsonType: 'string',
          enum: ['order_update', 'promotion', 'system', 'support']
        },
        title: { bsonType: 'string' },
        message: { bsonType: 'string' },
        is_read: { bsonType: 'bool' },
        created_at: { bsonType: 'date' },
        action_url: { bsonType: 'string' },
        metadata: { bsonType: 'object' }
      }
    }
  }
});

// Create indexes for performance
db.chat_messages.createIndex({ order_id: 1, timestamp: -1 });
db.chat_messages.createIndex({ sender_id: 1, timestamp: -1 });

db.order_events.createIndex({ order_id: 1, timestamp: -1 });
db.order_events.createIndex({ event_type: 1, timestamp: -1 });

db.user_analytics.createIndex({ user_id: 1, timestamp: -1 });
db.user_analytics.createIndex({ event_type: 1, timestamp: -1 });

db.restaurant_analytics.createIndex({ restaurant_id: 1, date: -1 });

db.ai_recommendations.createIndex({ user_id: 1, generated_at: -1 });
db.ai_recommendations.createIndex({ expires_at: 1 }, { expireAfterSeconds: 0 });

db.notifications.createIndex({ user_id: 1, created_at: -1 });
db.notifications.createIndex({ is_read: 1, created_at: -1 });

// Insert sample data
db.chat_messages.insertMany([
  {
    order_id: 1,
    sender_id: 1,
    sender_type: 'customer',
    message: 'How long until my order arrives?',
    message_type: 'text',
    timestamp: new Date(),
    read_by: [],
    attachments: []
  }
]);

db.notifications.insertMany([
  {
    user_id: 1,
    type: 'system',
    title: 'Welcome to UberEats!',
    message: 'Thank you for joining us. Enjoy your first order!',
    is_read: false,
    created_at: new Date(),
    metadata: { welcome_bonus: true }
  }
]);

print('MongoDB collections initialized successfully!');