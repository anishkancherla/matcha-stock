const { PrismaClient } = require('./src/generated/prisma');

const prisma = new PrismaClient();

async function checkBrands() {
  try {
    console.log('Current brands in database:');
    
    const brands = await prisma.brand.findMany({
      include: {
        _count: {
          select: {
            products: true,
            brandNotifications: true
          }
        }
      }
    });

    brands.forEach(brand => {
      console.log(`\n📦 ${brand.name}`);
      console.log(`   ID: ${brand.id}`);
      console.log(`   Website: ${brand.website}`);
      console.log(`   Products: ${brand._count.products}`);
      console.log(`   Notifications: ${brand._count.brandNotifications}`);
    });
    
  } catch (error) {
    console.error('Error checking brands:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkBrands(); 