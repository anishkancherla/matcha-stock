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
UNSUBSCRIBE_SECRET = os.getenv("UNSUBSCRIBE_SECRET", "matcha-stock-default-secret")

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

def get_recently_restocked_brands():
    """Get brands that have had ANY product restocked in the last hour"""
    conn = connect_to_db()
    if not conn:
        return []
    
    try:
        cur = conn.cursor()
        # Find brands where ANY product was out of stock but is now in stock
        query = """
        WITH ranked_history AS (
            SELECT 
                sh."productId",
                sh."inStock",
                sh."checkedAt",
                ROW_NUMBER() OVER (PARTITION BY sh."productId" ORDER BY sh."checkedAt" DESC) as rn
            FROM "StockHistory" sh
            WHERE sh."checkedAt" > NOW() - INTERVAL '1 hour'
        ),
        restocked_products AS (
            SELECT DISTINCT
                p.id,
                p.name,
                p.weight,
                p.price,
                p.url,
                p."brandId",
                b.name as brand_name,
                b.website as brand_website
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
        )
        SELECT 
            rp."brandId",
            rp.brand_name,
            rp.brand_website,
            array_agg(
                json_build_object(
                    'id', rp.id,
                    'name', rp.name,
                    'weight', rp.weight,
                    'price', rp.price,
                    'url', rp.url
                )
            ) as restocked_products
        FROM restocked_products rp
        GROUP BY rp."brandId", rp.brand_name, rp.brand_website
        """
        cur.execute(query)
        brands = cur.fetchall()
        return brands
    except Exception as e:
        print(f"Error fetching restocked brands: {e}")
        return []
    finally:
        conn.close()

def get_brand_notifications(brand_id):
    """Get all active brand notifications for a specific brand"""
    conn = connect_to_db()
    if not conn:
        return []
    
    try:
        cur = conn.cursor()
        query = """
        SELECT 
            bn.id,
            u.email,
            b.name as brand_name,
            b.website as brand_website
        FROM "BrandNotification" bn
        JOIN "User" u ON bn."userId" = u.id
        JOIN "Brand" b ON bn."brandId" = b.id
        WHERE bn."brandId" = %s AND bn.active = true AND u.email IS NOT NULL
        """
        cur.execute(query, (brand_id,))
        notifications = cur.fetchall()
        return notifications
    except Exception as e:
        print(f"Error fetching brand notifications: {e}")
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

def generate_unsubscribe_url(email, brand_id=None, notification_type="brand"):
    """Generate an unsubscribe URL for an email"""
    token = generate_unsubscribe_token(email)
    
    # Base unsubscribe URL
    url = f"{BASE_URL}/api/unsubscribe?email={urllib.parse.quote(email)}&token={token}"
    
    # Add brand-specific params if provided
    if brand_id:
        url += f"&brand={brand_id}&type={notification_type}"
    
    return url

def create_brand_email_html(brand_name, brand_website, restocked_products, email, brand_id):
    """Create a beautiful HTML email template for brand restocks"""
    
    # Build product list HTML
    product_list_html = ""
    for product in restocked_products:
        weight_display = f" - {product['weight']}" if product['weight'] else ""
        price_display = f"${product['price']:.2f}" if product['price'] else "Check website for pricing"
        
        product_list_html += f"""
        <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin-bottom: 15px; border-left: 4px solid #2d5a27;">
            <h4 style="margin: 0 0 5px 0; color: #2d5a27; font-size: 18px;">{product['name']}{weight_display}</h4>
            <p style="margin: 0 0 10px 0; font-size: 16px; color: #4a7c59; font-weight: bold;">{price_display}</p>
            <a href="{product['url']}" style="color: #2d5a27; text-decoration: none; font-weight: medium;">View Product →</a>
        </div>
        """
    
    product_count = len(restocked_products)
    products_text = "product" if product_count == 1 else "products"
    
    # Generate unsubscribe link
    unsubscribe_url = generate_unsubscribe_url(email, brand_id, "brand")
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>🍵 {brand_name} Matcha Back in Stock!</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #2d5a27 0%, #4a7c59 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">🍵 {brand_name} Restock Alert!</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">{product_count} {products_text} back in stock</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
            <p style="font-size: 16px; margin-bottom: 25px;">
                Great news! {brand_name} has restocked {product_count} matcha {products_text}. Don't wait too long - premium matcha tends to sell out quickly.
            </p>
            
            <h3 style="color: #2d5a27; margin-bottom: 20px;">Now Available:</h3>
            {product_list_html}
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{brand_website}" style="background: #2d5a27; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">🛒 Shop {brand_name}</a>
            </div>
            
            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin-top: 25px;">
                <h4 style="margin: 0 0 10px 0; color: #2d5a27;">💡 Pro Tips:</h4>
                <ul style="margin: 0; padding-left: 20px; color: #4a7c59;">
                    <li>High-quality matcha sells out fast - order soon!</li>
                    <li>Store in a cool, dark place for best freshness</li>
                    <li>Check the harvest date for the freshest experience</li>
                    <li>Consider ordering multiple sizes if available</li>
                </ul>
            </div>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 10px 10px; text-align: center; border: 1px solid #e0e0e0; border-top: none;">
            <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">
                This notification was sent by <strong>Matcha Stock</strong><br>
                You're subscribed to {brand_name} restock alerts.
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

def send_brand_email_notification(email, brand_name, brand_website, restocked_products, brand_id):
    """Send a brand restock email notification using Resend"""
    try:
        product_count = len(restocked_products)
        products_text = "product" if product_count == 1 else "products"
        subject = f"🍵 {brand_name} has {product_count} matcha {products_text} back in stock!"
        
        # Create HTML content
        html_content = create_brand_email_html(brand_name, brand_website, restocked_products, email, brand_id)
        
        # Generate unsubscribe URL for plain text version
        unsubscribe_url = generate_unsubscribe_url(email, brand_id, "brand")
        
        # Create plain text version
        product_list_text = ""
        for product in restocked_products:
            weight_display = f" - {product['weight']}" if product['weight'] else ""
            price_display = f"${product['price']:.2f}" if product['price'] else "Check website for pricing"
            product_list_text += f"• {product['name']}{weight_display} - {price_display}\n  {product['url']}\n\n"
        
        plain_text = f"""
🍵 {brand_name} Restock Alert!

Great news! {brand_name} has restocked {product_count} matcha {products_text}:

{product_list_text}

Don't wait too long - premium matcha tends to sell out quickly.

Shop {brand_name}: {brand_website}

---
This notification was sent by Matcha Stock
You're subscribed to {brand_name} restock alerts.

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
        print(f"Brand email sent to {email} - ID: {email_result.get('id', 'Unknown')}")
        return True
    except Exception as e:
        print(f"Error sending brand email to {email}: {e}")
        return False

def main():
    print(f"Starting brand email notification sender at {datetime.now()}")
    
    if not RESEND_API_KEY:
        print("❌ RESEND_API_KEY not found in environment variables!")
        return
    
    # Get brands with recently restocked products
    restocked_brands = get_recently_restocked_brands()
    
    if not restocked_brands:
        print("No brands with recently restocked products found.")
        return
    
    for brand_id, brand_name, brand_website, restocked_products_json in restocked_brands:
        print(f"Processing brand notifications for {brand_name} ({len(restocked_products_json)} products)")
        
        # Get brand notifications
        notifications = get_brand_notifications(brand_id)
        
        for notification_id, email, brand_name, brand_website in notifications:
            if email:
                # Send brand email notification
                if send_brand_email_notification(email, brand_name, brand_website, restocked_products_json, brand_id):
                    print(f"Brand notification sent for {brand_name} to {email}")
    
    print(f"Brand email notification sender completed at {datetime.now()}")

if __name__ == "__main__":
    main() 