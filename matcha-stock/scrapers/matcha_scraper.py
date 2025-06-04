#!/usr/bin/env python3
import os
import json
import time
import psycopg2
from datetime import datetime
from dotenv import load_dotenv
from playwright.sync_api import sync_playwright

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

def get_brands():
    """Get all brands from the database"""
    conn = connect_to_db()
    if not conn:
        return []
    
    try:
        cur = conn.cursor()
        cur.execute("SELECT id, name, website FROM \"Brand\"")
        brands = cur.fetchall()
        return brands
    except Exception as e:
        print(f"Error fetching brands: {e}")
        return []
    finally:
        conn.close()

def get_products_by_brand(brand_id):
    """Get all products for a specific brand from the database"""
    conn = connect_to_db()
    if not conn:
        return []
    
    try:
        cur = conn.cursor()
        cur.execute("SELECT id, name, url FROM \"Product\" WHERE \"brandId\" = %s", (brand_id,))
        products = cur.fetchall()
        return products
    except Exception as e:
        print(f"Error fetching products: {e}")
        return []
    finally:
        conn.close()

def update_stock_status(product_id, in_stock):
    """Update the stock status for a product"""
    conn = connect_to_db()
    if not conn:
        return False
    
    try:
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO \"StockHistory\" (id, \"productId\", \"inStock\", \"checkedAt\") VALUES (gen_random_uuid(), %s, %s, %s)",
            (product_id, in_stock, datetime.now())
        )
        conn.commit()
        return True
    except Exception as e:
        print(f"Error updating stock status: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()

def scrape_ippodo(product_url):
    """Scrape Ippodo website to check if a matcha product is in stock"""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        try:
            page.goto(product_url, wait_until="networkidle")
            
            # Check for out-of-stock indicators
            out_of_stock_element = page.query_selector('span.product-form__inventory.product-form__inventory--out')
            
            in_stock = not bool(out_of_stock_element)
            
            browser.close()
            return in_stock
        except Exception as e:
            print(f"Error scraping Ippodo: {e}")
            browser.close()
            return None

def scrape_rockys_matcha(product_url):
    """Scrape Rocky's Matcha website to check if a matcha product is in stock"""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        try:
            page.goto(product_url, wait_until="networkidle")
            
            # Check for out-of-stock indicators
            out_of_stock_element = page.query_selector('span.sold_out')
            
            in_stock = not bool(out_of_stock_element)
            
            browser.close()
            return in_stock
        except Exception as e:
            print(f"Error scraping Rocky's Matcha: {e}")
            browser.close()
            return None

def scrape_product(brand_name, product_url):
    """Scrape a product based on the brand name"""
    if "ippodo" in brand_name.lower():
        return scrape_ippodo(product_url)
    elif "rocky" in brand_name.lower():
        return scrape_rockys_matcha(product_url)
    else:
        print(f"No scraper available for brand: {brand_name}")
        return None

def main():
    print(f"Starting matcha stock scraper at {datetime.now()}")
    
    # Get all brands
    brands = get_brands()
    
    for brand_id, brand_name, website in brands:
        print(f"Processing brand: {brand_name}")
        
        # Get all products for this brand
        products = get_products_by_brand(brand_id)
        
        for product_id, product_name, product_url in products:
            print(f"Checking stock for: {product_name}")
            
            # Scrape the product
            in_stock = scrape_product(brand_name, product_url)
            
            if in_stock is not None:
                # Update the stock status
                if update_stock_status(product_id, in_stock):
                    status = "IN STOCK" if in_stock else "OUT OF STOCK"
                    print(f"{product_name} is {status}")
            
            # Sleep to avoid overloading the server
            time.sleep(2)
    
    print(f"Matcha stock scraper completed at {datetime.now()}")

if __name__ == "__main__":
    main() 