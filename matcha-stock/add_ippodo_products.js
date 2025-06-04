const { PrismaClient } = require('./src/generated/prisma');

const prisma = new PrismaClient();

async function addIppodoProducts() {
  try {
    // First, create or get the Ippodo brand
    const ippodo = await prisma.brand.upsert({
      where: { name: 'Ippodo Tea' },
      update: {},
      create: {
        name: 'Ippodo Tea',
        website: 'https://ippodotea.com'
      }
    });

    console.log('Ippodo brand:', ippodo);

    // Add Sayaka blend product
    const sayaka = await prisma.product.upsert({
      where: { 
        brandId_name: {
          brandId: ippodo.id,
          name: 'Sayaka Matcha'
        }
      },
      update: {
        description: 'Premium matcha blend with rich umami flavor',
        price: 32.00,
        url: 'https://ippodotea.com/collections/matcha-green-tea-powder/products/sayaka-matcha-40g-can',
        imageUrl: 'https://ippodotea.com/cdn/shop/products/sayaka-matcha-40g-can.jpg'
      },
      create: {
        name: 'Sayaka',
        description: 'Premium matcha blend with rich umami flavor',
        price: 32.00,
        url: 'https://ippodotea.com/collections/matcha-green-tea-powder/products/sayaka-matcha-40g-can',
        brandId: ippodo.id,
        imageUrl: 'https://ippodotea.com/cdn/shop/products/sayaka-matcha-40g-can.jpg'
      }
    });

    console.log('Sayaka Matcha product:', sayaka);

    // Add a few more popular Ippodo matcha products
    const products = [
      {
        name: 'Wakaki',
        description: 'Light and refreshing matcha with gentle sweetness',
        price: 28.00,
        url: 'https://ippodotea.com/collections/matcha-green-tea-powder/products/wakaki-matcha-40g-can'
      },
      {
        name: 'Ummon',
        description: 'Rich and full-bodied matcha with deep flavor',
        price: 45.00,
        url: 'https://ippodotea.com/collections/matcha-green-tea-powder/products/ummon-matcha-40g-can'
      },
      {
        name: 'Kanoko',
        description: 'Premium ceremonial grade matcha',
        price: 38.00,
        url: 'https://ippodotea.com/collections/matcha-green-tea-powder/products/kanoko-matcha-40g-can'
      }
    ];

    for (const product of products) {
      const result = await prisma.product.upsert({
        where: { 
          brandId_name: {
            brandId: ippodo.id,
            name: product.name
          }
        },
        update: product,
        create: {
          ...product,
          brandId: ippodo.id
        }
      });
      console.log(`Added ${product.name}:`, result.id);
    }

    console.log('\n✅ Successfully added Ippodo products!');
    
  } catch (error) {
    console.error('Error adding products:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addIppodoProducts(); 