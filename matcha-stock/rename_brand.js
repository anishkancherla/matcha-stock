const { PrismaClient } = require('./src/generated/prisma');

const prisma = new PrismaClient();

async function renameBrand() {
  try {
    console.log('Step 1: Deleting empty MatchaJP brand...');
    
    // Delete the empty MatchaJP brand first
    await prisma.brand.delete({
      where: { name: 'MatchaJP' }
    });
    console.log('✅ Empty MatchaJP brand deleted');
    
    console.log('Step 2: Renaming Yamamasa Koyamaen brand to MatchaJP...');
    
    // Now rename Yamamasa Koyamaen to MatchaJP
    const updatedBrand = await prisma.brand.update({
      where: { name: 'Yamamasa Koyamaen' },
      data: { 
        name: 'MatchaJP',
        website: 'https://www.matchajp.net'
      }
    });

    console.log('✅ Brand renamed successfully:', updatedBrand);
    
  } catch (error) {
    console.error('Error renaming brand:', error);
  } finally {
    await prisma.$disconnect();
  }
}

renameBrand(); 