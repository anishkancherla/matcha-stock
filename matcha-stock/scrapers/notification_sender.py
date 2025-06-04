#!/usr/bin/env python3
import os
import psycopg2
from datetime import datetime, timedelta
from dotenv import load_dotenv
from twilio.rest import Client

# Load environment variables
load_dotenv()

# Database connection
DATABASE_URL = os.getenv("DATABASE_URL")

# Twilio credentials
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")

def connect_to_db():
    """Connect to the PostgreSQL database"""
    try:
        conn = psycopg2.connect(DATABASE_URL)
        return conn
    except Exception as e:
        print(f"Error connecting to database: {e}")
        return None

def get_recently_restocked_products():
    """Get products that have been restocked in the last hour"""
    conn = connect_to_db()
    if not conn:
        return []
    
    try:
        cur = conn.cursor()
        # Find products that were out of stock in their second-to-last check but in stock in their last check
        query = """
        WITH ranked_history AS (
            SELECT 
                sh."productId",
                sh."inStock",
                sh."checkedAt",
                ROW_NUMBER() OVER (PARTITION BY sh."productId" ORDER BY sh."checkedAt" DESC) as rn
            FROM "StockHistory" sh
            WHERE sh."checkedAt" > NOW() - INTERVAL '1 hour'
        )
        SELECT 
            p.id,
            p.name,
            b.name as brand_name
        FROM "Product" p
        JOIN "Brand" b ON p."brandId" = b.id
        WHERE EXISTS (
            SELECT 1 FROM ranked_history rh1
            WHERE rh1."productId" = p.id AND rh1.rn = 1 AND rh1."inStock" = true
        )
        AND EXISTS (
            SELECT 1 FROM ranked_history rh2
            WHERE rh2."productId" = p.id AND rh2.rn = 2 AND rh2."inStock" = false
        )
        """
        cur.execute(query)
        products = cur.fetchall()
        return products
    except Exception as e:
        print(f"Error fetching restocked products: {e}")
        return []
    finally:
        conn.close()

def get_notifications_for_product(product_id):
    """Get all active notifications for a specific product"""
    conn = connect_to_db()
    if not conn:
        return []
    
    try:
        cur = conn.cursor()
        query = """
        SELECT 
            n.id,
            u.phone,
            u.email,
            p.name as product_name,
            b.name as brand_name
        FROM "Notification" n
        JOIN "User" u ON n."userId" = u.id
        JOIN "Product" p ON n."productId" = p.id
        JOIN "Brand" b ON p."brandId" = b.id
        WHERE n."productId" = %s AND n.active = true
        """
        cur.execute(query, (product_id,))
        notifications = cur.fetchall()
        return notifications
    except Exception as e:
        print(f"Error fetching notifications: {e}")
        return []
    finally:
        conn.close()

def send_sms_notification(phone_number, product_name, brand_name):
    """Send an SMS notification using Twilio"""
    try:
        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        
        message = client.messages.create(
            body=f"🍵 Good news! {brand_name}'s {product_name} is back in stock! Check it out soon before it sells out again.",
            from_=TWILIO_PHONE_NUMBER,
            to=phone_number
        )
        
        print(f"SMS sent to {phone_number} - SID: {message.sid}")
        return True
    except Exception as e:
        print(f"Error sending SMS: {e}")
        return False

def main():
    print(f"Starting notification sender at {datetime.now()}")
    
    # Get recently restocked products
    restocked_products = get_recently_restocked_products()
    
    for product_id, product_name, brand_name in restocked_products:
        print(f"Processing notifications for {brand_name} {product_name}")
        
        # Get notifications for this product
        notifications = get_notifications_for_product(product_id)
        
        for notification_id, phone, email, product_name, brand_name in notifications:
            if phone:
                # Send SMS notification
                if send_sms_notification(phone, product_name, brand_name):
                    print(f"Notification sent for {product_name} to {phone}")
    
    print(f"Notification sender completed at {datetime.now()}")

if __name__ == "__main__":
    main() 