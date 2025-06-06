#!/usr/bin/env python3
import os
import hmac
import time
import hashlib
import urllib.parse
import psycopg2
from datetime import datetime, timedelta
from dotenv import load_dotenv
import resend

# Load environment variables
load_dotenv()

# Database connection
DATABASE_URL = os.getenv("DATABASE_URL")
BASE_URL = os.getenv("NEXT_PUBLIC_APP_URL", "http://localhost:4001")

# Resend API key
RESEND_API_KEY = os.getenv("RESEND_API_KEY")
FROM_EMAIL = os.getenv("FROM_EMAIL", "notifications@your-domain.com")

# Initialize Resend
resend.api_key = RESEND_API_KEY

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
            p.weight,
            p.price,
            p.url,
            b.name as brand_name,
            b.website
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
            u.email,
            p.name as product_name,
            p.weight,
            p.price,
            p.url,
            b.name as brand_name,
            b.website
        FROM "Notification" n
        JOIN "User" u ON n."userId" = u.id
        JOIN "Product" p ON n."productId" = p.id
        JOIN "Brand" b ON p."brandId" = b.id
        WHERE n."productId" = %s AND n.active = true AND u.email IS NOT NULL
        """
        cur.execute(query, (product_id,))
        notifications = cur.fetchall()
        return notifications
    except Exception as e:
        print(f"Error fetching notifications: {e}")
        return []
    finally:
        conn.close()

def generate_unsubscribe_token(email):
    """Generate a secure unsubscribe token"""
    timestamp = str(int(time.time()))
    message = f"{email}:{timestamp}"
    
    # Create HMAC SHA-256 hash
    h = hmac.new(
        UNSUBSCRIBE_SECRET.encode(), 
        message.encode(), 
        hashlib.sha256
    ).hexdigest()
    
    return f"{timestamp}.{h}"

def generate_unsubscribe_url(email, product_id=None, notification_type="product"):
    """Generate an unsubscribe URL for an email"""
    token = generate_unsubscribe_token(email)
    
    # Base unsubscribe URL
    url = f"{BASE_URL}/api/unsubscribe?email={urllib.parse.quote(email)}&token={token}"
    
    # Add product-specific params if provided
    if product_id:
        url += f"&brand={product_id}&type={notification_type}"
    
    return url

def create_email_html(product_name, brand_name, weight, price, product_url, brand_website, email, product_id):
    """Create a beautiful HTML email template"""
    weight_display = f" - {weight}" if weight else ""
    price_display = f"${price:.2f}" if price else "Check website for pricing"
    
    # Unsubscribe functionality temporarily disabled
    unsubscribe_url = "#"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>🍵 Matcha Back in Stock!</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #2d5a27 0%, #4a7c59 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">🍵 Great News!</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">Your matcha is back in stock</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                <h2 style="margin: 0 0 10px 0; color: #2d5a27; font-size: 24px;">{brand_name}</h2>
                <h3 style="margin: 0 0 15px 0; color: #4a7c59; font-size: 20px;">{product_name}{weight_display}</h3>
                <p style="margin: 0; font-size: 18px; font-weight: bold; color: #2d5a27;">{price_display}</p>
            </div>
            
            <p style="font-size: 16px; margin-bottom: 25px;">
                The matcha you've been waiting for is now available! Don't wait too long - premium matcha tends to sell out quickly.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{product_url}" style="background: #2d5a27; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">🛒 Shop Now</a>
            </div>
            
            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin-top: 25px;">
                <h4 style="margin: 0 0 10px 0; color: #2d5a27;">💡 Pro Tips:</h4>
                <ul style="margin: 0; padding-left: 20px; color: #4a7c59;">
                    <li>High-quality matcha sells out fast - order soon!</li>
                    <li>Store in a cool, dark place for best freshness</li>
                    <li>Check the harvest date for the freshest experience</li>
                </ul>
            </div>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 10px 10px; text-align: center; border: 1px solid #e0e0e0; border-top: none;">
            <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">
                This notification was sent by <strong>Matcha Stock</strong><br>
                <a href="{brand_website}" style="color: #2d5a27;">Visit {brand_name} website</a>
            </p>
            
            <div style="margin-top: 15px; border-top: 1px solid #e0e0e0; padding-top: 15px;">
                <p style="margin: 0; font-size: 12px; color: #888;">
                    Don't want these notifications anymore?<br>
                    <span style="color: #888;">Unsubscribe (coming soon)</span>
                </p>
            </div>
        </div>
    </body>
    </html>
    """
    return html_content

def send_email_notification(email, product_name, brand_name, weight, price, product_url, brand_website, product_id):
    """Send an email notification using Resend"""
    try:
        weight_display = f" - {weight}" if weight else ""
        subject = f"🍵 {brand_name} {product_name}{weight_display} is back in stock!"
        
        # Create HTML content
        html_content = create_email_html(product_name, brand_name, weight, price, product_url, brand_website, email, product_id)
        
        # Generate unsubscribe URL for plain text version
        unsubscribe_url = generate_unsubscribe_url(email, product_id, "product")
        
        # Create plain text version
        plain_text = f"""
🍵 Great News! Your matcha is back in stock!

{brand_name} - {product_name}{weight_display}
Price: ${price:.2f if price else "Check website for pricing"}

The matcha you've been waiting for is now available! 
Don't wait too long - premium matcha tends to sell out quickly.

Shop now: {product_url}

Visit {brand_name}: {brand_website}

---
This notification was sent by Matcha Stock

---
Don't want to receive these notifications anymore?
Contact us to unsubscribe (feature coming soon)
        """.strip()
        
        params = {
            "from": FROM_EMAIL,
            "to": [email],
            "subject": subject,
            "html": html_content,
            "text": plain_text
        }
        
        email_result = resend.Emails.send(params)
        print(f"Email sent to {email} - ID: {email_result.get('id', 'Unknown')}")
        return True
    except Exception as e:
        print(f"Error sending email to {email}: {e}")
        return False

def main():
    print(f"Starting email notification sender at {datetime.now()}")
    
    if not RESEND_API_KEY:
        print("❌ RESEND_API_KEY not found in environment variables!")
        return
    
    # Get recently restocked products
    restocked_products = get_recently_restocked_products()
    
    if not restocked_products:
        print("No recently restocked products found.")
        return
    
    for product_id, product_name, weight, price, product_url, brand_name, brand_website in restocked_products:
        print(f"Processing notifications for {brand_name} {product_name}")
        
        # Get notifications for this product
        notifications = get_notifications_for_product(product_id)
        
        for notification_id, email, product_name, weight, price, product_url, brand_name, brand_website in notifications:
            if email:
                # Send email notification
                if send_email_notification(email, product_name, brand_name, weight, price, product_url, brand_website, product_id):
                    print(f"Notification sent for {product_name} to {email}")
    
    print(f"Email notification sender completed at {datetime.now()}")

if __name__ == "__main__":
    main() 