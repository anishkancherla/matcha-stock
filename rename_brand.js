const { PrismaClient } = require('./src/generated/prisma');

const prisma = new PrismaClient();

async function renameBrand() {
  try {
    console.log('Renaming Yamamasa Koyamaen brand to MatchaJP...');
    
    const updatedBrand = await prisma.brand.update({
      where: { name: 'Yamamasa Koyamaen' },
      data: { name: 'MatchaJP' }
    });

    console.log('✅ Brand renamed successfully:', updatedBrand);
    
  } catch (error) {
    console.error('Error renaming brand:', error);
  } finally {
    await prisma.$disconnect();
  }
}

renameBrand(); 