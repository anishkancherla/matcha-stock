const { PrismaClient } = require('./src/generated/prisma');

const prisma = new PrismaClient();

async function addMatchaJPBrand() {
  try {
    console.log('Adding MatchaJP brand...');
    
    const brand = await prisma.brand.upsert({
      where: { name: 'MatchaJP' },
      update: {},
      create: {
        name: 'MatchaJP',
        website: 'https://www.matchajp.net'
      }
    });

    console.log('✅ MatchaJP brand added:', brand);
    
    // Also add a specific collection/sub-brand for Koyamaen
    const koyamaenBrand = await prisma.brand.upsert({
      where: { name: 'MatchaJP - Koyamaen' },
      update: {},
      create: {
        name: 'MatchaJP - Koyamaen',
        website: 'https://www.matchajp.net/collections/koyamaen-matcha-powder'
      }
    });

    console.log('✅ MatchaJP - Koyamaen brand added:', koyamaenBrand);
    
    // Add the new Yamamasa Koyamaen brand for the frontend
    const yamamasaBrand = await prisma.brand.upsert({
      where: { name: 'Yamamasa Koyamaen' },
      update: {
        website: 'https://www.matchajp.net/collections/koyamaen-matcha-powder'
      },
      create: {
        name: 'Yamamasa Koyamaen',
        website: 'https://www.matchajp.net/collections/koyamaen-matcha-powder'
      }
    });

    console.log('✅ Yamamasa Koyamaen brand added:', yamamasaBrand);
    
  } catch (error) {
    console.error('Error adding brands:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addMatchaJPBrand(); 