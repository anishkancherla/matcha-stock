const { PrismaClient } = require('./src/generated/prisma');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting update process...');
  try {
    // Get the Sazen Tea brand
    const sazenBrand = await prisma.brand.findUnique({
      where: { name: 'Sazen Tea' },
    });

    if (!sazenBrand) {
      console.error('❌ Sazen Tea brand not found');
      return;
    }

    console.log('Found Sazen Tea brand:', sazenBrand.id);

    // List all products for this brand for debugging
    console.log('Listing all products for this brand:');
    const allProducts = await prisma.product.findMany({
      where: { brandId: sazenBrand.id },
    });

    console.log(`Found ${allProducts.length} products:`);
    allProducts.forEach(p => {
      console.log(`- ${p.id}: ${p.name}`);
    });

    // Find the product to update (using case-insensitive search)
    const oldProduct = await prisma.product.findFirst({
      where: {
        brandId: sazenBrand.id,
        name: {
          contains: 'Ceremonial Grade Matcha',
          mode: 'insensitive'
        }
      }
    });

    if (!oldProduct) {
      console.error('❌ Product not found');
      return;
    }

    console.log('✅ Found product to update:', oldProduct);

    // Update the product name and remove the price
    console.log('Updating product...');
    const updatedProduct = await prisma.product.update({
      where: {
        id: oldProduct.id
      },
      data: {
        name: 'Uji Matcha Collection',
        price: null // Remove the "0" price
      }
    });

    console.log('✅ Successfully updated product:');
    console.log('Old name:', oldProduct.name);
    console.log('New name:', updatedProduct.name);
    console.log('Old price:', oldProduct.price);
    console.log('New price:', updatedProduct.price);
    console.log('Update complete!');

  } catch (error) {
    console.error('❌ Error updating product:', error);
  } finally {
    console.log('Disconnecting from database...');
    await prisma.$disconnect();
    console.log('Done!');
  }
}

main().catch(e => {
  console.error('Uncaught error:', e);
  process.exit(1);
}); 