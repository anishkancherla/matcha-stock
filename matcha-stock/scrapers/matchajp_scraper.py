#!/usr/bin/env python3
import os
import time
import random
import re
import requests
from bs4 import BeautifulSoup
import psycopg2
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database connection
DATABASE_URL = os.getenv("DATABASE_URL")

def connect_to_db():
    """Connect to the PostgreSQL database"""
    try:
        conn = psycopg2.connect(DATABASE_URL)
        return conn
    except Exception as e:
        print(f"Error connecting to database: {e}")
        return None

def get_brand_id(brand_name):
    """Get brand ID from database"""
    conn = connect_to_db()
    if not conn:
        return None
    
    try:
        cur = conn.cursor()
        cur.execute('SELECT id FROM "Brand" WHERE name = %s', (brand_name,))
        result = cur.fetchone()
        return result[0] if result else None
    except Exception as e:
        print(f"Error getting brand ID: {e}")
        return None
    finally:
        conn.close()

def scrape_matchajp_koyamaen_page(page_num=1):
    """Scrape a specific page of MatchaJP Koyamaen products"""
    print(f"🔍 Scraping MatchaJP Koyamaen page {page_num}...")
    
    # Base URL with pagination
    if page_num == 1:
        url = "https://www.matchajp.net/collections/koyamaen-matcha-powder"
    else:
        url = f"https://www.matchajp.net/collections/koyamaen-matcha-powder?page={page_num}"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
    }
    
    try:
        # Add random delay to be respectful
        time.sleep(random.uniform(2, 4))
        
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        products = []
        
        # Look for product links directly
        all_links = soup.find_all('a', href=True)
        product_links = [link for link in all_links if '/products/' in link.get('href', '')]
        print(f"Debug: Found {len(product_links)} product links on page {page_num}")
        
        # Group product links by their href to avoid duplicates
        unique_products = {}
        
        for link in product_links:
            try:
                product_url = "https://www.matchajp.net" + link['href']
                
                # Skip if we've already processed this product
                if product_url in unique_products:
                    continue
                
                # Extract product name from the link text or nearby elements
                product_name = link.get_text(strip=True)
                
                # If link text is empty, look for nearby text
                if not product_name or len(product_name) < 3:
                    # Look for parent container with product info
                    parent = link.parent
                    if parent:
                        name_element = (parent.find('h3') or parent.find('h2') or 
                                      parent.find('h4') or parent.find('.product-title'))
                        if name_element:
                            product_name = name_element.get_text(strip=True)
                
                if not product_name or len(product_name) < 3:
                    continue
                
                # Look for price in parent container
                parent = link.parent
                price = None
                price_element = None
                if parent:
                    price_element = (parent.find('span', class_='price-item') or 
                                   parent.find('span', class_='price') or
                                   parent.find('div', class_='price') or
                                   parent.find(string=re.compile(r'\$\d+')))
                
                if price_element:
                    if hasattr(price_element, 'get_text'):
                        price_text = price_element.get_text(strip=True)
                    else:
                        price_text = str(price_element).strip()
                    
                    # Extract numeric price from text like "$19.00"
                    price_match = re.search(r'\$?([\d.,]+)', price_text)
                    if price_match:
                        try:
                            price = float(price_match.group(1).replace(',', ''))
                        except ValueError:
                            price = None
                
                # Extract image URL from parent
                image_url = None
                if parent:
                    img_element = parent.find('img')
                    if img_element and img_element.get('src'):
                        image_url = img_element['src']
                        if image_url.startswith('//'):
                            image_url = 'https:' + image_url
                
                # Check if in stock - look for various out of stock indicators
                in_stock = True
                if parent:
                    # Look for various stock status indicators
                    stock_indicators = parent.find_all(string=True)
                    stock_text = ' '.join([text.strip().lower() for text in stock_indicators])
                    
                    # Check for common out of stock phrases
                    out_of_stock_phrases = [
                        'sold out', 'out of stock', 'unavailable', 
                        'not available', 'temporarily unavailable',
                        '在庫切れ', '売り切れ'  # Japanese terms
                    ]
                    
                    for phrase in out_of_stock_phrases:
                        if phrase in stock_text:
                            in_stock = False
                            break
                    
                    # Also check for CSS classes that might indicate stock status
                    if in_stock:  # Only check if we haven't found out of stock text
                        out_of_stock_classes = ['sold-out', 'out-of-stock', 'unavailable', 'disabled']
                        for element in parent.find_all():
                            if element.get('class'):
                                classes = ' '.join(element.get('class')).lower()
                                for stock_class in out_of_stock_classes:
                                    if stock_class in classes:
                                        in_stock = False
                                        break
                            if not in_stock:
                                break
                
                # Extract weight from product name if available
                weight = None
                weight_match = re.search(r'(\d+)g', product_name, re.IGNORECASE)
                if weight_match:
                    weight = weight_match.group(1) + 'g'
                
                # Add to unique products to avoid duplicates
                unique_products[product_url] = {
                    'name': product_name,
                    'price': price,
                    'weight': weight,
                    'image_url': image_url,
                    'url': product_url,
                    'in_stock': in_stock
                }
                
                # Debug: Print some stock text for first few products
                if len(unique_products) < 3:
                    sample_text = stock_text[:100] if 'stock_text' in locals() else 'No stock text found'
                    print(f"🔍 Debug stock text sample: {sample_text}")
                
                print(f"📦 Found: {product_name} - ${price} - {'In Stock' if in_stock else 'Out of Stock'}")
                
            except Exception as e:
                print(f"Error parsing product link: {e}")
                continue
        
        # Convert unique products to list
        products = list(unique_products.values())
        
        print(f"✅ Page {page_num}: Found {len(products)} products")
        return products
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Error fetching page {page_num}: {e}")
        return []
    except Exception as e:
        print(f"❌ Error parsing page {page_num}: {e}")
        return []

def scrape_all_koyamaen_pages():
    """Scrape all pages of MatchaJP Koyamaen products (pages 1-5)"""
    print("🚀 Starting MatchaJP Koyamaen scraper for all pages...")
    
    all_products = []
    total_pages = 5  # Based on the website having 5 pages
    
    for page_num in range(1, total_pages + 1):
        page_products = scrape_matchajp_koyamaen_page(page_num)
        all_products.extend(page_products)
        
        # Be respectful - longer delay between pages
        if page_num < total_pages:
            time.sleep(random.uniform(3, 6))
    
    print(f"🎉 Total products found across all pages: {len(all_products)}")
    return all_products

def update_products_in_db(products, brand_id):
    """Update products in the database"""
    if not products:
        print("No products to update")
        return
    
    conn = connect_to_db()
    if not conn:
        return
    
    try:
        cur = conn.cursor()
        
        for product in products:
            # Upsert product
            cur.execute("""
                INSERT INTO "Product" (id, name, weight, price, "imageUrl", url, "brandId", "createdAt", "updatedAt")
                VALUES (gen_random_uuid(), %s, %s, %s, %s, %s, %s, NOW(), NOW())
                ON CONFLICT ("brandId", name) 
                DO UPDATE SET 
                    weight = EXCLUDED.weight,
                    price = EXCLUDED.price,
                    "imageUrl" = EXCLUDED."imageUrl",
                    url = EXCLUDED.url,
                    "updatedAt" = NOW()
                RETURNING id
            """, (
                product['name'],
                product['weight'],
                product['price'],
                product['image_url'],
                product['url'],
                brand_id
            ))
            
            result = cur.fetchone()
            product_id = result[0] if result else None
            
            if product_id:
                # Update stock history
                cur.execute("""
                    INSERT INTO "StockHistory" (id, "productId", "inStock", "checkedAt")
                    VALUES (gen_random_uuid(), %s, %s, NOW())
                """, (product_id, product['in_stock']))
                
                print(f"✅ Updated: {product['name']}")
        
        conn.commit()
        print(f"✅ Successfully updated {len(products)} products in database")
        
    except Exception as e:
        print(f"❌ Error updating database: {e}")
        conn.rollback()
    finally:
        conn.close()

def main():
    print(f"🍵 MatchaJP Koyamaen Scraper started at {datetime.now()}")
    
    # Get brand ID
    brand_id = get_brand_id('MatchaJP - Koyamaen')
    if not brand_id:
        print("❌ Brand not found in database. Please add 'MatchaJP - Koyamaen' brand first.")
        return
    
    # Scrape all pages
    products = scrape_all_koyamaen_pages()
    
    # Update database
    if products:
        update_products_in_db(products, brand_id)
    else:
        print("❌ No products found to update")
    
    print(f"🏁 MatchaJP Koyamaen Scraper completed at {datetime.now()}")

if __name__ == "__main__":
    main() 