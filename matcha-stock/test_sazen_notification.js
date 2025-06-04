const { PrismaClient } = require('./src/generated/prisma');

const prisma = new PrismaClient();

async function main() {
  try {
    // Get the Sazen Tea product
    const sazenProduct = await prisma.product.findFirst({
      where: {
        brand: {
          name: 'Sazen Tea'
        },
        name: 'Ceremonial Grade Matcha Collection'
      },
      include: {
        brand: true
      }
    });

    if (!sazenProduct) {
      console.log('❌ Sazen Tea product not found');
      return;
    }

    console.log('✅ Found Sazen Tea product:', sazenProduct.name);
    console.log('📝 Product ID:', sazenProduct.id);

    // First, insert a "false" record (simulating page was unchanged)
    const pastTime = new Date(Date.now() - 10 * 60 * 1000); // 10 minutes ago
    const oldRecord = await prisma.stockHistory.create({
      data: {
        productId: sazenProduct.id,
        inStock: false,
        checkedAt: pastTime
      }
    });

    console.log('✅ Added "before" record (unchanged state)');
    console.log('📅 Past time:', oldRecord.checkedAt);

    // Then, insert a "true" record (simulating page change detected)
    const stockHistory = await prisma.stockHistory.create({
      data: {
        productId: sazenProduct.id,
        inStock: true,
        checkedAt: new Date()
      }
    });

    console.log('✅ Added "after" record (page changed!)');
    console.log('📅 Change time:', stockHistory.checkedAt);
    console.log('🔍 StockHistory ID:', stockHistory.id);
    
    console.log('');
    console.log('🚀 Now run the email notification sender:');
    console.log('   python scrapers/brand_email_notification_sender.py');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 