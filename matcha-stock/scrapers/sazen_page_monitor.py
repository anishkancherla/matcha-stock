#!/usr/bin/env python3
"""
Sazen Tea Page Monitor
Monitors the ceremonial grade matcha page for any updates/changes
"""

import os
import hashlib
import psycopg2
from datetime import datetime
import requests
from bs4 import BeautifulSoup
import time
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database connection
DATABASE_URL = os.getenv("DATABASE_URL")

def get_db_connection():
    """Get database connection"""
    return psycopg2.connect(DATABASE_URL)

def get_page_content_hash(url):
    """Get a hash of the page content to detect changes"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        
        # Parse the HTML content
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Focus on the product content area (remove navigation, footer, etc.)
        # This makes the change detection more accurate
        product_content = soup.find('div', class_='products') or soup.find('main') or soup
        
        # Get text content and create hash
        content_text = product_content.get_text(strip=True) if product_content else response.text
        content_hash = hashlib.md5(content_text.encode('utf-8')).hexdigest()
        
        print(f"✅ Successfully fetched page content")
        print(f"📄 Content hash: {content_hash}")
        return content_hash
        
    except Exception as e:
        print(f"❌ Error fetching page content: {e}")
        return None

def get_stored_hash(product_id):
    """Get the last stored content hash for this page"""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            
            # Check if we have a stored hash in a custom field or use description
            cursor.execute("""
                SELECT "imageUrl" FROM "Product" 
                WHERE id = %s
            """, (product_id,))
            
            result = cursor.fetchone()
            return result[0] if result and result[0] else None
            
    except Exception as e:
        print(f"❌ Error getting stored hash: {e}")
        return None

def update_stored_hash(product_id, new_hash):
    """Store the new content hash"""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            
            # Store hash in imageUrl field (repurposing it for page monitoring)
            cursor.execute("""
                UPDATE "Product" 
                SET "imageUrl" = %s, "updatedAt" = %s
                WHERE id = %s
            """, (new_hash, datetime.now(), product_id))
            
            conn.commit()
            print(f"✅ Updated stored hash: {new_hash}")
            
    except Exception as e:
        print(f"❌ Error updating stored hash: {e}")

def record_page_change(product_id):
    """Record that the page has changed (similar to stock change)"""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            
            # Record in StockHistory - we'll use inStock=true to indicate "page updated"
            cursor.execute("""
                INSERT INTO "StockHistory" ("productId", "inStock", "checkedAt")
                VALUES (%s, %s, %s)
            """, (product_id, True, datetime.now()))
            
            conn.commit()
            print(f"✅ Recorded page change in history")
            
    except Exception as e:
        print(f"❌ Error recording page change: {e}")

def get_sazen_product_id():
    """Get the Sazen Tea page monitor product ID"""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT p.id FROM "Product" p
                JOIN "Brand" b ON p."brandId" = b.id
                WHERE b.name = 'Sazen Tea' 
                AND p.name = 'Ceremonial Grade Matcha Collection'
            """)
            
            result = cursor.fetchone()
            return result[0] if result else None
            
    except Exception as e:
        print(f"❌ Error getting Sazen product ID: {e}")
        return None

def main():
    """Main monitoring function"""
    print("🔍 Starting Sazen Tea page monitor...")
    
    # Get the product ID for Sazen Tea page monitor
    product_id = get_sazen_product_id()
    if not product_id:
        print("❌ Could not find Sazen Tea page monitor product in database")
        return
    
    print(f"📝 Monitoring product ID: {product_id}")
    
    # URL to monitor
    url = "https://www.sazentea.com/en/products/c22-ceremonial-grade-matcha"
    
    # Get current page content hash
    current_hash = get_page_content_hash(url)
    if not current_hash:
        print("❌ Failed to get current page content")
        return
    
    # Get stored hash
    stored_hash = get_stored_hash(product_id)
    
    if stored_hash is None:
        # First time monitoring this page
        print("🆕 First time monitoring - storing initial hash")
        update_stored_hash(product_id, current_hash)
        print("✅ Initial hash stored successfully")
        
    elif stored_hash != current_hash:
        # Page has changed!
        print("🚨 PAGE CHANGE DETECTED!")
        print(f"Old hash: {stored_hash}")
        print(f"New hash: {current_hash}")
        
        # Update stored hash
        update_stored_hash(product_id, current_hash)
        
        # Record the change
        record_page_change(product_id)
        
        print("✅ Page change recorded - users will be notified!")
        
    else:
        # No change
        print("✅ No changes detected - page content is the same")

if __name__ == "__main__":
    main() 