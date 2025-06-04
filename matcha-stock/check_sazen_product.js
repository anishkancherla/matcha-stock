const { PrismaClient } = require('./src/generated/prisma');

const prisma = new PrismaClient();

async function main() {
  try {
    // Get the Sazen Tea brand
    const sazenBrand = await prisma.brand.findUnique({
      where: { name: 'Sazen Tea' },
    });

    if (!sazenBrand) {
      console.error('❌ Sazen Tea brand not found');
      return;
    }

    // List all products for this brand
    console.log('Listing all Sazen Tea products:');
    const products = await prisma.product.findMany({
      where: { brandId: sazenBrand.id },
    });

    if (products.length === 0) {
      console.log('No products found for Sazen Tea');
      return;
    }

    products.forEach(p => {
      console.log(`\nProduct ID: ${p.id}`);
      console.log(`Name: ${p.name}`);
      console.log(`Price: ${p.price}`);
      console.log(`URL: ${p.url}`);
      console.log(`Last Updated: ${p.updatedAt}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 