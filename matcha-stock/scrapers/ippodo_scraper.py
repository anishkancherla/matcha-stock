#!/usr/bin/env python3
"""
Ippodo Tea Scraper
Scrapes stock status for specific Ippodo Tea matcha products
"""

import os
import requests
from bs4 import BeautifulSoup
import psycopg2
from datetime import datetime
from dotenv import load_dotenv
import time
import re
import uuid

# Load environment variables
load_dotenv()

# Database connection
DATABASE_URL = os.getenv("DATABASE_URL")

def get_db_connection():
    """Get database connection"""
    return psycopg2.connect(DATABASE_URL)

def get_ippodo_products():
    """Get all Ippodo Tea products from database"""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT p.id, p.name, p.url, p.weight, p.price 
                FROM "Product" p
                JOIN "Brand" b ON p."brandId" = b.id
                WHERE b.name = 'Ippodo Tea'
                ORDER BY p.name
            """)
            
            products = cursor.fetchall()
            return [
                {
                    'id': row[0],
                    'name': row[1], 
                    'url': row[2],
                    'weight': row[3],
                    'price': row[4]
                }
                for row in products
            ]
            
    except Exception as e:
        print(f"❌ Error getting Ippodo products: {e}")
        return []

def check_product_stock(product_url):
    """Check if an Ippodo product is in stock"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        response = requests.get(product_url, headers=headers, timeout=30)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Method 1: Look for "Sold out" text
        sold_out_indicators = [
            soup.find(string=re.compile(r'Sold out', re.IGNORECASE)),
            soup.find('button', string=re.compile(r'Sold out', re.IGNORECASE)),
            soup.find(class_=re.compile(r'sold.*out', re.IGNORECASE)),
            soup.find('span', string=re.compile(r'Sold out', re.IGNORECASE))
        ]
        
        if any(sold_out_indicators):
            print(f"   📦 Status: OUT OF STOCK (found 'Sold out' indicator)")
            return False
        
        # Method 2: Look for "Add to bag" or similar buttons
        add_to_cart_indicators = [
            soup.find('button', string=re.compile(r'Add to bag', re.IGNORECASE)),
            soup.find('button', string=re.compile(r'Add to cart', re.IGNORECASE)),
            soup.find('input', {'type': 'submit', 'value': re.compile(r'Add', re.IGNORECASE)}),
            soup.find(class_=re.compile(r'add.*cart', re.IGNORECASE)),
            soup.find(class_=re.compile(r'add.*bag', re.IGNORECASE))
        ]
        
        if any(add_to_cart_indicators):
            print(f"   📦 Status: IN STOCK (found 'Add to bag' button)")
            return True
        
        # Method 3: Look for quantity selectors
        quantity_selectors = [
            soup.find('select', {'name': re.compile(r'quantity', re.IGNORECASE)}),
            soup.find('input', {'name': re.compile(r'quantity', re.IGNORECASE)}),
            soup.find(class_=re.compile(r'quantity', re.IGNORECASE))
        ]
        
        if any(quantity_selectors):
            print(f"   📦 Status: IN STOCK (found quantity selector)")
            return True
        
        # Method 4: Look for "Expected in stock" text (indicates out of stock)
        expected_indicators = [
            soup.find(string=re.compile(r'Expected in stock', re.IGNORECASE)),
            soup.find(string=re.compile(r'Back in stock', re.IGNORECASE)),
            soup.find(string=re.compile(r'Notify me', re.IGNORECASE))
        ]
        
        if any(expected_indicators):
            print(f"   📦 Status: OUT OF STOCK (found 'Expected in stock' text)")
            return False
        
        # Method 5: Check page title and meta for stock info
        page_title = soup.find('title')
        if page_title and 'sold out' in page_title.text.lower():
            print(f"   📦 Status: OUT OF STOCK (found in page title)")
            return False
        
        # Default: If we can't determine, assume out of stock for safety
        print(f"   ❓ Status: UNKNOWN (defaulting to OUT OF STOCK)")
        return False
        
    except Exception as e:
        print(f"   ❌ Error checking stock: {e}")
        return False

def record_stock_status(product_id, in_stock):
    """Record stock status in database"""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            
            # Generate a UUID for the record
            record_id = str(uuid.uuid4())
            
            cursor.execute("""
                INSERT INTO "StockHistory" ("id", "productId", "inStock", "checkedAt")
                VALUES (%s, %s, %s, %s)
            """, (record_id, product_id, in_stock, datetime.now()))
            
            conn.commit()
            print(f"   ✅ Stock status recorded: {'IN STOCK' if in_stock else 'OUT OF STOCK'}")
            
    except Exception as e:
        print(f"   ❌ Error recording stock status: {e}")

def main():
    """Main scraping function"""
    print("🔍 Starting Ippodo Tea scraper...")
    print(f"⏰ {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Get all Ippodo products
    products = get_ippodo_products()
    
    if not products:
        print("❌ No Ippodo products found in database")
        return
    
    print(f"📦 Found {len(products)} Ippodo products to check:")
    for product in products:
        print(f"   • {product['name']} ({product['weight']}) - ${product['price']}")
    print()
    
    # Check each product
    for i, product in enumerate(products, 1):
        print(f"🔍 Checking {i}/{len(products)}: {product['name']}")
        print(f"   🌐 URL: {product['url']}")
        
        # Check stock status
        in_stock = check_product_stock(product['url'])
        
        # Record in database
        record_stock_status(product['id'], in_stock)
        
        print()
        
        # Add delay between requests to be respectful
        if i < len(products):
            print("⏳ Waiting 3 seconds before next product...")
            time.sleep(3)
    
    print("✅ Ippodo Tea scraper completed!")
    print(f"⏰ Finished at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    main() 