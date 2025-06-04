const { PrismaClient } = require('./src/generated/prisma');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🧹 Setting up Ippodo Tea products...');

    // First, get or create Ippodo Tea brand
    const ippodoBrand = await prisma.brand.upsert({
      where: { name: 'Ippodo Tea' },
      update: {},
      create: {
        name: 'Ippodo Tea',
        website: 'https://ippodotea.com',
      },
    });

    console.log('✅ Ippodo Tea brand ready:', ippodoBrand.name);

    // Remove existing Ippodo products to start fresh
    // First, delete stock history for Ippodo products to avoid foreign key constraints
    const deletedHistory = await prisma.stockHistory.deleteMany({
      where: {
        product: {
          brandId: ippodoBrand.id
        }
      }
    });

    console.log(`🗑️ Removed ${deletedHistory.count} stock history records`);

    // Then delete the products
    const deletedProducts = await prisma.product.deleteMany({
      where: {
        brandId: ippodoBrand.id
      }
    });

    console.log(`🗑️ Removed ${deletedProducts.count} existing Ippodo products`);

    // Define the 6 specific products
    const products = [
      {
        name: 'Ummon no Mukashi (40g)',
        url: 'https://ippodotea.com/collections/matcha/products/ummon-no-mukashi-40g',
        weight: '40g',
        price: 58.00
      },
      {
        name: 'Ummon no Mukashi (20g)', 
        url: 'https://ippodotea.com/collections/matcha/products/ummon-no-mukashi-20g',
        weight: '20g',
        price: 32.00
      },
      {
        name: 'Sayaka no Mukashi (40g)',
        url: 'https://ippodotea.com/collections/matcha/products/sayaka-no-mukashi',
        weight: '40g',
        price: 45.00
      },
      {
        name: 'Sayaka no Mukashi (100g)',
        url: 'https://ippodotea.com/collections/matcha/products/sayaka-100g',
        weight: '100g',
        price: 110.00
      },
      {
        name: 'Ikuyo no Mukashi (30g)',
        url: 'https://ippodotea.com/collections/matcha/products/ikuyo',
        weight: '30g',
        price: 28.00
      },
      {
        name: 'Ikuyo no Mukashi (100g)',
        url: 'https://ippodotea.com/collections/matcha/products/ikuyo-100',
        weight: '100g',
        price: 85.00
      }
    ];

    // Add each product
    for (const productData of products) {
      const product = await prisma.product.create({
        data: {
          name: productData.name,
          url: productData.url,
          weight: productData.weight,
          price: productData.price,
          brandId: ippodoBrand.id,
          imageUrl: null,
        },
      });

      console.log(`✅ Added: ${product.name} - $${product.price}`);
    }

    console.log('');
    console.log('🎉 Ippodo Tea setup complete!');
    console.log(`📦 Added ${products.length} products`);
    console.log('🔗 Brand ID:', ippodoBrand.id);

  } catch (error) {
    console.error('❌ Error setting up Ippodo products:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 