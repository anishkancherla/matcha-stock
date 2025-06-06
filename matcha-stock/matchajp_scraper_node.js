const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const cheerio = require('cheerio');
const { setTimeout } = require('timers/promises');

const prisma = new PrismaClient();

async function scrapeMatchaJPKoyamaenPage(pageNum = 1) {
  console.log(`🔍 Scraping MatchaJP Koyamaen page ${pageNum}...`);
  
  const url = pageNum === 1 
    ? "https://www.matchajp.net/collections/koyamaen-matcha-powder"
    : `https://www.matchajp.net/collections/koyamaen-matcha-powder?page=${pageNum}`;
  
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate',
    'Connection': 'keep-alive',
  };
  
  try {
    // Add random delay to be respectful
    await setTimeout(Math.random() * 2000 + 2000);
    
    const response = await axios.get(url, { headers, timeout: 30000 });
    const $ = cheerio.load(response.data);
    const products = [];
    
    // Look for product links
    const productLinks = $('a[href*="/products/"]');
    console.log(`Debug: Found ${productLinks.length} product links on page ${pageNum}`);
    
    const uniqueProducts = new Map();
    
    productLinks.each((index, element) => {
      try {
        const $link = $(element);
        const href = $link.attr('href');
        const productUrl = "https://www.matchajp.net" + href;
        
        // Skip if already processed
        if (uniqueProducts.has(productUrl)) return;
        
        // Extract product name
        let productName = $link.text().trim();
        
        // If link text is empty, look for nearby text
        if (!productName || productName.length < 3) {
          const $parent = $link.parent();
          const nameElement = $parent.find('h3, h2, h4, .product-title').first();
          if (nameElement.length) {
            productName = nameElement.text().trim();
          }
        }
        
        if (!productName || productName.length < 3) return;
        
        // Look for price in parent container
        const $parent = $link.parent();
        let price = null;
        const $priceElement = $parent.find('.price-item, .price, [class*="price"]').first();
        
        if ($priceElement.length) {
          const priceText = $priceElement.text().trim();
          const priceMatch = priceText.match(/\$?([\d.,]+)/);
          if (priceMatch) {
            try {
              price = parseFloat(priceMatch[1].replace(',', ''));
            } catch (e) {
              price = null;
            }
          }
        }
        
        // Extract image URL
        let imageUrl = null;
        const $img = $parent.find('img').first();
        if ($img.length && $img.attr('src')) {
          imageUrl = $img.attr('src');
          if (imageUrl.startsWith('//')) {
            imageUrl = 'https:' + imageUrl;
          }
        }
        
        // Check if in stock
        let inStock = true;
        const stockText = $parent.text().toLowerCase();
        const outOfStockPhrases = [
          'sold out', 'out of stock', 'unavailable', 
          'not available', 'temporarily unavailable',
          '在庫切れ', '売り切れ'
        ];
        
        for (const phrase of outOfStockPhrases) {
          if (stockText.includes(phrase)) {
            inStock = false;
            break;
          }
        }
        
        // Also check for CSS classes
        if (inStock) {
          const outOfStockClasses = ['sold-out', 'out-of-stock', 'unavailable', 'disabled'];
          $parent.find('*').each((i, el) => {
            const classes = $(el).attr('class') || '';
            for (const stockClass of outOfStockClasses) {
              if (classes.toLowerCase().includes(stockClass)) {
                inStock = false;
                return false; // Break out of loop
              }
            }
          });
        }
        
        // Extract weight from product name
        let weight = null;
        const weightMatch = productName.match(/(\d+)g/i);
        if (weightMatch) {
          weight = weightMatch[1] + 'g';
        }
        
        uniqueProducts.set(productUrl, {
          name: productName,
          price,
          weight,
          imageUrl,
          url: productUrl,
          inStock
        });
        
        console.log(`📦 Found: ${productName} - $${price} - ${inStock ? 'In Stock' : 'Out of Stock'}`);
        
      } catch (error) {
        console.error('Error parsing product link:', error);
      }
    });
    
    const productsArray = Array.from(uniqueProducts.values());
    console.log(`✅ Page ${pageNum}: Found ${productsArray.length} products`);
    return productsArray;
    
  } catch (error) {
    console.error(`Error scraping page ${pageNum}:`, error);
    return [];
  }
}

async function scrapeAllKoyamaenPages() {
  console.log('🍵 Starting MatchaJP Koyamaen scraper...');
  let allProducts = [];
  let pageNum = 1;
  let hasMorePages = true;
  
  while (hasMorePages && pageNum <= 10) { // Limit to 10 pages max
    const products = await scrapeMatchaJPKoyamaenPage(pageNum);
    
    if (products.length === 0) {
      hasMorePages = false;
    } else {
      allProducts = allProducts.concat(products);
      pageNum++;
    }
  }
  
  console.log(`🎯 Total products found: ${allProducts.length}`);
  return allProducts;
}

async function updateProductsInDb(products, brandId) {
  console.log(`📊 Updating ${products.length} products in database...`);
  let createdCount = 0;
  let updatedCount = 0;
  
  for (const product of products) {
    try {
      // Check if product exists
      const existingProduct = await prisma.product.findFirst({
        where: {
          name: product.name,
          brandId: brandId
        }
      });
      
      if (existingProduct) {
        // Update existing product
        await prisma.product.update({
          where: { id: existingProduct.id },
          data: {
            price: product.price,
            weight: product.weight,
            imageUrl: product.imageUrl,
            url: product.url
          }
        });
        
        // Create stock history entry
        await prisma.stockHistory.create({
          data: {
            productId: existingProduct.id,
            inStock: product.inStock,
            checkedAt: new Date()
          }
        });
        
        updatedCount++;
        console.log(`✅ Updated: ${product.name}`);
      } else {
        // Create new product
        const newProduct = await prisma.product.create({
          data: {
            name: product.name,
            price: product.price,
            weight: product.weight,
            imageUrl: product.imageUrl,
            url: product.url,
            brandId: brandId
          }
        });
        
        // Create initial stock history entry
        await prisma.stockHistory.create({
          data: {
            productId: newProduct.id,
            inStock: product.inStock,
            checkedAt: new Date()
          }
        });
        
        createdCount++;
        console.log(`🆕 Created: ${product.name}`);
      }
    } catch (error) {
      console.error(`Error updating product ${product.name}:`, error);
    }
  }
  
  console.log(`✅ Successfully created ${createdCount} and updated ${updatedCount} products in database`);
}

async function main() {
  try {
    console.log(`🍵 MatchaJP Koyamaen Scraper started at ${new Date()}`);
    
    // Get brand ID
    const brand = await prisma.brand.findUnique({
      where: { name: 'MatchaJP - Koyamaen' }
    });
    
    if (!brand) {
      console.log('❌ Brand "MatchaJP - Koyamaen" not found in database. Creating it...');
      
      const newBrand = await prisma.brand.create({
        data: {
          name: 'MatchaJP - Koyamaen',
          website: 'https://www.matchajp.net/collections/koyamaen-matcha-powder'
        }
      });
      
      console.log('✅ Created brand:', newBrand);
      brandId = newBrand.id;
    } else {
      brandId = brand.id;
      console.log(`✅ Found brand: ${brand.name} (ID: ${brandId})`);
    }
    
    // Scrape products
    const products = await scrapeAllKoyamaenPages();
    
    if (products.length > 0) {
      await updateProductsInDb(products, brandId);
    } else {
      console.log('❌ No products found to update');
    }
    
    console.log(`🏁 MatchaJP Koyamaen Scraper completed at ${new Date()}`);
    
  } catch (error) {
    console.error('Error in main:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 