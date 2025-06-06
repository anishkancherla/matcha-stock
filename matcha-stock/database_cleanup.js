const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupDatabase() {
  try {
    console.log('Starting database cleanup...');
    
    // First, let's see current brands
    const brands = await prisma.brand.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      }
    });
    
    console.log('\nCurrent brands:');
    brands.forEach(brand => {
      console.log(`- ${brand.name} (ID: ${brand.id}) - ${brand._count.products} products`);
    });
    
    // Find the brands we need to work with
    const matchaJpBrand = brands.find(b => b.name === 'MatchaJP');
    const yamamasaBrand = brands.find(b => b.name === 'Yamamasa Koyamaen');
    
    if (!matchaJpBrand) {
      console.log('\nNo "MatchaJP" brand found');
    } else {
      console.log(`\nFound "MatchaJP" brand with ${matchaJpBrand._count.products} products`);
    }
    
    if (!yamamasaBrand) {
      console.log('No "Yamamasa Koyamaen" brand found');
      return;
    } else {
      console.log(`Found "Yamamasa Koyamaen" brand with ${yamamasaBrand._count.products} products`);
    }
    
    // Step 1: Delete all MatchaJP products and the MatchaJP brand
    if (matchaJpBrand) {
      console.log('\nDeleting MatchaJP products...');
      const deletedProducts = await prisma.product.deleteMany({
        where: { brandId: matchaJpBrand.id }
      });
      console.log(`Deleted ${deletedProducts.count} MatchaJP products`);
      
      console.log('Deleting MatchaJP brand...');
      await prisma.brand.delete({
        where: { id: matchaJpBrand.id }
      });
      console.log('MatchaJP brand deleted');
    }
    
    // Step 2: Rename "Yamamasa Koyamaen" to "MatchaJP"
    console.log('\nRenaming "Yamamasa Koyamaen" to "MatchaJP"...');
    await prisma.brand.update({
      where: { id: yamamasaBrand.id },
      data: { name: 'MatchaJP' }
    });
    console.log('Brand renamed successfully');
    
    // Verify the changes
    const updatedBrands = await prisma.brand.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      }
    });
    
    console.log('\nFinal brands:');
    updatedBrands.forEach(brand => {
      console.log(`- ${brand.name} (ID: ${brand.id}) - ${brand._count.products} products`);
    });
    
    console.log('\nDatabase cleanup completed successfully!');
    
  } catch (error) {
    console.error('Error during database cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupDatabase(); 