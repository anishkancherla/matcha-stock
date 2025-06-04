const { PrismaClient } = require('./src/generated/prisma');

const prisma = new PrismaClient();

async function main() {
  try {
    // Add Sazen Tea brand
    const sazenBrand = await prisma.brand.upsert({
      where: { name: 'Sazen Tea' },
      update: {},
      create: {
        name: 'Sazen Tea',
        website: 'https://www.sazentea.com',
      },
    });

    console.log('✅ Sazen Tea brand added successfully!');
    console.log('Brand ID:', sazenBrand.id);
    console.log('Brand Name:', sazenBrand.name);
    console.log('Website:', sazenBrand.website);

    // Add a special "page monitor" product for the ceremonial matcha page
    const pageMonitorProduct = await prisma.product.upsert({
      where: { 
        brandId_name: {
          brandId: sazenBrand.id,
          name: 'Ceremonial Grade Matcha Collection'
        }
      },
      update: {},
      create: {
        name: 'Ceremonial Grade Matcha Collection',
        url: 'https://www.sazentea.com/en/products/c22-ceremonial-grade-matcha',
        brandId: sazenBrand.id,
        weight: 'Various',
        price: 0, // No specific price since it's a collection
        imageUrl: null,
      },
    });

    console.log('✅ Sazen Tea page monitor product added successfully!');
    console.log('Product ID:', pageMonitorProduct.id);
    console.log('Product Name:', pageMonitorProduct.name);
    console.log('URL to monitor:', pageMonitorProduct.url);

  } catch (error) {
    console.error('❌ Error adding Sazen Tea brand:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 