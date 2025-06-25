#!/usr/bin/env python3
"""
Ippodo Tea Stock Scraper
Uses Shopify's JSON API + HTML parsing fallback to detect stock status reliably
"""

import requests
from bs4 import BeautifulSoup
import time
import random
import re
from datetime import datetime
from typing import Dict, Optional

class IppodoScraper:
    def __init__(self):
        self.session = requests.Session()
        self.base_url = "https://ippodotea.com"
        
    def get_random_headers(self) -> Dict[str, str]:
        """Get randomized headers to appear more human-like"""
        user_agents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2.1 Safari/605.1.15',
        ]
        
        accept_languages = [
            'en-US,en;q=0.9',
            'en-US,en;q=0.8,ja;q=0.7',
            'en-GB,en;q=0.9,en-US;q=0.8',
        ]
        
        return {
            'User-Agent': random.choice(user_agents),
            'Accept': 'application/json,text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': random.choice(accept_languages),
            'Accept-Encoding': 'gzip, deflate',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Cache-Control': 'max-age=0',
            'Referer': 'https://www.google.com/'
        }

    def extract_product_handle_from_url(self, url: str) -> str:
        """Extract the product handle from a Shopify product URL"""
        # Pattern: https://ippodotea.com/collections/matcha/products/sayaka-no-mukashi
        # We want: sayaka-no-mukashi
        
        # Remove any query parameters or fragments
        clean_url = url.split('?')[0].split('#')[0]
        
        # Extract the handle (last part after /products/)
        if '/products/' in clean_url:
            handle = clean_url.split('/products/')[-1]
            # Remove any trailing slashes
            handle = handle.rstrip('/')
            return handle
        else:
            raise ValueError(f"Could not extract product handle from URL: {url}")

    def get_product_json(self, product_url: str) -> Dict:
        """Get product data from Shopify's JSON API"""
        handle = self.extract_product_handle_from_url(product_url)
        json_url = f"{self.base_url}/products/{handle}.json"
        
        print(f"   🔗 JSON URL: {json_url}")
        
        headers = self.get_random_headers()
        # Remove accept-encoding to avoid compression issues
        headers['Accept-Encoding'] = 'gzip, deflate'
        
        response = self.session.get(json_url, headers=headers, timeout=30)
        
        print(f"   📊 Response status: {response.status_code}")
        print(f"   📊 Content-Type: {response.headers.get('content-type', 'unknown')}")
        print(f"   📊 Content-Encoding: {response.headers.get('content-encoding', 'none')}")
        print(f"   📊 Response content length: {len(response.content)}")
        print(f"   📊 First 200 chars: {response.text[:200]}")
        
        response.raise_for_status()
        
        try:
            data = response.json()
            return data
        except ValueError as e:
            print(f"   ❌ JSON parsing error: {e}")
            print(f"   📄 Response encoding: {response.encoding}")
            # Try to decode manually
            try:
                import json
                manual_data = json.loads(response.content.decode('utf-8'))
                return manual_data
            except Exception as e2:
                print(f"   ❌ Manual decode error: {e2}")
                print(f"   📄 Raw content (first 500 bytes): {response.content[:500]}")
                raise

    def check_html_for_preorder(self, product_url: str) -> Dict[str, any]:
        """Check HTML page for pre-order indicators when JSON shows unavailable"""
        print("   🔍 Checking HTML for pre-order status...")
        
        try:
            headers = self.get_random_headers()
            response = self.session.get(product_url, headers=headers, timeout=30)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            page_text = soup.get_text().lower()
            
            # Look for pre-order indicators in the HTML
            preorder_indicators = [
                'pre-order',
                'preorder', 
                'expected in stock',
                'notify me when',
                'email when available',
                'back in stock',
                'notify me'
            ]
            
            found_indicators = []
            for indicator in preorder_indicators:
                if indicator in page_text:
                    found_indicators.append(indicator)
            
            # Look for specific pre-order buttons
            buttons = soup.find_all(['button', 'input', 'a'])
            preorder_button_text = None
            
            for button in buttons:
                button_text = button.get_text(strip=True).lower()
                if any(indicator in button_text for indicator in ['pre-order', 'preorder', 'notify me']):
                    preorder_button_text = button.get_text(strip=True)
                    found_indicators.append(f"button: {preorder_button_text}")
                    break
            
            # Check for "Expected in stock by" text pattern
            expected_match = re.search(r'expected in stock by ([^.]+)', page_text)
            if expected_match:
                expected_date = expected_match.group(1).strip()
                found_indicators.append(f"expected date: {expected_date}")
            
            print(f"   📋 HTML indicators found: {found_indicators}")
            
            if found_indicators:
                return {
                    'is_preorder': True,
                    'indicators': found_indicators,
                    'button_text': preorder_button_text or 'Pre-order'
                }
            else:
                return {
                    'is_preorder': False,
                    'indicators': [],
                    'button_text': None
                }
                
        except Exception as e:
            print(f"   ❌ Error checking HTML: {e}")
            return {
                'is_preorder': False,
                'indicators': [],
                'button_text': None
            }

    def determine_stock_status(self, product_data: Dict, product_url: str) -> Dict[str, any]:
        """
        Determine stock status from Shopify product JSON data + HTML fallback
        Returns: {
            'status': 'in_stock' | 'out_of_stock' | 'pre_order' | 'unknown',
            'button_text': str,
            'confidence': float,
            'indicators_found': list,
            'inventory_details': dict
        }
        """
        indicators_found = []
        button_text = None
        status = 'unknown'
        confidence = 0.0
        inventory_details = {}
        
        product = product_data.get('product', {})
        variants = product.get('variants', [])
        
        print(f"🔍 Analyzing {len(variants)} product variants...")
        
        # Track inventory across all variants
        total_inventory = 0
        available_variants = 0
        unavailable_variants = 0
        variant_details = []
        
        for i, variant in enumerate(variants):
            variant_id = variant.get('id')
            variant_title = variant.get('title', f'Variant {i+1}')
            variant_price = variant.get('price', '0.00')
            variant_available = variant.get('available', False)
            inventory_quantity = variant.get('inventory_quantity', 0)
            inventory_policy = variant.get('inventory_policy', 'deny')
            
            variant_info = {
                'id': variant_id,
                'title': variant_title,
                'price': variant_price,
                'available': variant_available,
                'inventory_quantity': inventory_quantity,
                'inventory_policy': inventory_policy
            }
            variant_details.append(variant_info)
            
            print(f"   📦 Variant: '{variant_title}' - Available: {variant_available} - Qty: {inventory_quantity}")
            
            if variant_available:
                available_variants += 1
            else:
                unavailable_variants += 1
            
            if inventory_quantity and inventory_quantity > 0:
                total_inventory += inventory_quantity
        
        inventory_details = {
            'total_inventory': total_inventory,
            'available_variants': available_variants,
            'unavailable_variants': unavailable_variants,
            'variant_details': variant_details
        }
        
        # Determine overall stock status
        print(f"   📊 Summary: {available_variants} available, {unavailable_variants} unavailable variants")
        print(f"   📊 Total inventory: {total_inventory}")
        
        if available_variants > 0:
            # At least one variant is available
            status = 'in_stock'
            confidence = 0.95
            button_text = "Add to bag"
            indicators_found.append(f"{available_variants} variant(s) available for purchase")
            print("   ✅ IN STOCK - At least one variant is available")
            
        elif unavailable_variants > 0 and available_variants == 0:
            # All variants are unavailable - check for pre-order
            print("   🔍 All variants unavailable, checking for pre-order...")
            
            # First check JSON for pre-order indicators
            tags = product.get('tags', [])
            product_type = product.get('product_type', '')
            description = product.get('body_html', '')
            
            json_preorder_indicators = ['pre-order', 'preorder', 'expected', 'coming soon', 'notify me']
            is_preorder_json = False
            
            for indicator in json_preorder_indicators:
                if (any(indicator.lower() in tag.lower() for tag in tags) or
                    indicator.lower() in product_type.lower() or
                    indicator.lower() in description.lower()):
                    is_preorder_json = True
                    indicators_found.append(f"Found '{indicator}' in JSON data")
                    break
            
            # Check HTML for pre-order status
            html_check = self.check_html_for_preorder(product_url)
            
            if html_check['is_preorder'] or is_preorder_json:
                status = 'pre_order'
                confidence = 0.95
                button_text = html_check['button_text'] or "Pre-order"
                indicators_found.append("Pre-order detected")
                indicators_found.extend([f"HTML: {ind}" for ind in html_check['indicators']])
                print("   ⏳ PRE-ORDER - Product available for pre-order")
            else:
                status = 'out_of_stock'
                confidence = 0.9
                button_text = "Sold out"
                indicators_found.append("All variants unavailable, no pre-order found")
                print("   ❌ OUT OF STOCK - All variants unavailable, no pre-order")
        
        else:
            # No variants found - unusual
            status = 'unknown'
            confidence = 0.0
            indicators_found.append("No variants found in product data")
            print("   ❓ UNKNOWN - No variants found")
        
        return {
            'status': status,
            'button_text': button_text,
            'confidence': confidence,
            'indicators_found': indicators_found,
            'inventory_details': inventory_details
        }

    def extract_product_info(self, product_data: Dict, url: str) -> Dict[str, any]:
        """Extract product information from Shopify JSON data"""
        product = product_data.get('product', {})
        
        # Get the first variant for price info
        variants = product.get('variants', [])
        first_variant = variants[0] if variants else {}
        
        # Extract weight from title or variants
        weight = None
        title = product.get('title', '')
        weight_match = re.search(r'(\d+)g', title, re.IGNORECASE)
        if weight_match:
            weight = weight_match.group(1) + 'g'
        
        # Get main product image
        images = product.get('images', [])
        image_url = images[0].get('src') if images else None
        
        # Convert price from cents to dollars
        price_cents = first_variant.get('price', '0.00')
        try:
            price = float(price_cents)
        except (ValueError, TypeError):
            price = None
        
        return {
            'url': url,
            'name': title,
            'price': price,
            'weight': weight,
            'image_url': image_url,
            'product_id': product.get('id'),
            'handle': product.get('handle'),
            'vendor': product.get('vendor'),
            'product_type': product.get('product_type'),
            'created_at': product.get('created_at'),
            'updated_at': product.get('updated_at')
        }

    def scrape_product(self, url: str) -> Dict[str, any]:
        """
        Scrape a single product page using Shopify's JSON API + HTML fallback
        """
        print(f"\n🔍 Scraping: {url}")
        
        try:
            # Add random delay to be respectful
            time.sleep(random.uniform(1, 3))
            
            # Get product data from Shopify JSON API
            product_data = self.get_product_json(url)
            
            print(f"   📄 JSON data loaded successfully")
            
            # Extract product information
            product_info = self.extract_product_info(product_data, url)
            
            # Determine stock status (with HTML fallback for pre-order)
            stock_info = self.determine_stock_status(product_data, url)
            
            # Combine results
            result = {
                **product_info,
                **stock_info,
                'scraped_at': datetime.now().isoformat(),
                'success': True,
                'error': None
            }
            
            print(f"   📦 Product: {product_info['name']}")
            print(f"   💰 Price: ${product_info['price']}")
            print(f"   ⚖️ Weight: {product_info['weight']}")
            print(f"   📊 Status: {stock_info['status'].upper()}")
            print(f"   🎯 Confidence: {stock_info['confidence']:.1%}")
            
            return result
            
        except requests.exceptions.RequestException as e:
            error_msg = f"Network error: {e}"
            print(f"   ❌ {error_msg}")
            return {
                'url': url,
                'scraped_at': datetime.now().isoformat(),
                'success': False,
                'error': error_msg,
                'status': 'error'
            }
        except Exception as e:
            error_msg = f"Parsing error: {e}"
            print(f"   ❌ {error_msg}")
            return {
                'url': url,
                'scraped_at': datetime.now().isoformat(),
                'success': False,
                'error': error_msg,
                'status': 'error'
            }

def test_scraper():
    """Test the scraper with the specific Ippodo product"""
    
    print("🚀 Testing Ippodo Scraper (JSON + HTML Hybrid)")
    print("=" * 60)
    
    # The specific product URL from the user
    test_url = "https://ippodotea.com/collections/matcha/products/sayaka-no-mukashi"
    
    # Create scraper instance
    scraper = IppodoScraper()
    
    # Scrape the product
    result = scraper.scrape_product(test_url)
    
    # Display results
    print("\n" + "=" * 60)
    print("📊 SCRAPING RESULTS")
    print("=" * 60)
    
    if result['success']:
        print(f"✅ Success: {result['success']}")
        print(f"📦 Product Name: {result['name']}")
        print(f"💰 Price: ${result['price']}")
        print(f"⚖️ Weight: {result['weight']}")
        print(f"🏪 Vendor: {result['vendor']}")
        print(f"📊 Stock Status: {result['status'].upper()}")
        print(f"🔘 Button Text: {result['button_text']}")
        print(f"🎯 Confidence: {result['confidence']:.1%}")
        print(f"🔍 Indicators Found:")
        for indicator in result['indicators_found']:
            print(f"   - {indicator}")
        
        # Show inventory details
        if 'inventory_details' in result:
            inv = result['inventory_details']
            print(f"📦 Inventory Details:")
            print(f"   - Total Stock: {inv['total_inventory']}")
            print(f"   - Available Variants: {inv['available_variants']}")
            print(f"   - Unavailable Variants: {inv['unavailable_variants']}")
            
            print(f"   - Variant Details:")
            for variant in inv['variant_details']:
                print(f"     • {variant['title']}: ${variant['price']} - Available: {variant['available']} (Qty: {variant['inventory_quantity']})")
        
        print(f"⏰ Scraped At: {result['scraped_at']}")
    else:
        print(f"❌ Error: {result['error']}")
    
    return result

if __name__ == "__main__":
    test_scraper() 