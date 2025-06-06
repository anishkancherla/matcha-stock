const { PrismaClient } = require('./src/generated/prisma');

const prisma = new PrismaClient();

async function addYamamasaKoyamaen() {
  try {
    console.log('Adding Yamamasa Koyamaen brand...');
    
    const brand = await prisma.brand.upsert({
      where: { name: 'Yamamasa Koyamaen' },
      update: {
        website: 'https://www.matchajp.net/collections/koyamaen-matcha-powder'
      },
      create: {
        name: 'Yamamasa Koyamaen',
        website: 'https://www.matchajp.net/collections/koyamaen-matcha-powder'
      }
    });

    console.log('✅ Yamamasa Koyamaen brand added:', brand);
    
  } catch (error) {
    console.error('Error adding brand:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addYamamasaKoyamaen(); 