const { PrismaClient } = require('./src/generated/prisma');

const prisma = new PrismaClient();

async function addYamamasaProduct() {
  try {
    console.log('Adding Yamamasa Koyamaen brand product...');
    
    // Find the Yamamasa Koyamaen brand
    const brand = await prisma.brand.findUnique({
      where: { name: 'Yamamasa Koyamaen' }
    });

    if (!brand) {
      console.error('❌ Yamamasa Koyamaen brand not found. Run add_matchajp_brand.js first.');
      return;
    }

    // Add a single product that represents the brand
    const product = await prisma.product.upsert({
      where: {
        brandId_name: {
          brandId: brand.id,
          name: 'Yamamasa Koyamaen'
        }
      },
      update: {
        url: 'https://www.matchajp.net/collections/koyamaen-matcha-powder'
      },
      create: {
        name: 'Yamamasa Koyamaen',
        url: 'https://www.matchajp.net/collections/koyamaen-matcha-powder',
        brandId: brand.id
      }
    });

    console.log('✅ Yamamasa Koyamaen product added:', product);
    
    // Add a stock history entry to make it appear in product lists
    await prisma.stockHistory.create({
      data: {
        productId: product.id,
        inStock: true // This doesn't matter since we won't show stock status
      }
    });

    console.log('✅ Stock history added for Yamamasa Koyamaen product');
    
  } catch (error) {
    console.error('Error adding Yamamasa Koyamaen product:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addYamamasaProduct(); 