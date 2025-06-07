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
      const sazenProduct = await prisma.product.upsert({
    where: { url: 'https://www.sazen-tea.com/' },
    update: {},
    create: {
      name: 'Uji Matcha Collection',
      url: 'https://www.sazen-tea.com/',
      inStock: false,
      brandId: sazenBrand.id,
    },
  });

    console.log('✅ Sazen Tea page monitor product added successfully!');
    console.log('Product ID:', sazenProduct.id);
    console.log('Product Name:', sazenProduct.name);
    console.log('URL to monitor:', sazenProduct.url);

  } catch (error) {
    console.error('❌ Error adding Sazen Tea brand:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 