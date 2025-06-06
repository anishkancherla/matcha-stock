const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function getBrands() {
  try {
    const brands = await prisma.brand.findMany({
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    });
    
    console.log('Brands in production database:');
    brands.forEach(brand => {
      console.log(`- ${brand.name} (ID: ${brand.id}) - ${brand._count.products} products`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getBrands(); 