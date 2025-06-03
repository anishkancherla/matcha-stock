import { prisma } from '../utils/prisma';

interface ProductWithStockHistory {
  id: string;
  stockHistory: Array<{
    inStock: boolean;
  }>;
  [key: string]: any;
}

export const resolvers = {
  Query: {
    brands: async () => {
      return prisma.brand.findMany();
    },
    brand: async (_: any, { id }: { id: string }) => {
      return prisma.brand.findUnique({
        where: { id },
        include: {
          notifications: {
            include: {
              user: true,
            },
          },
        },
      });
    },
    products: async (_: any, { brandId }: { brandId?: string }) => {
      const where = brandId ? { brandId } : {};
      return prisma.product.findMany({
        where,
        include: { brand: true },
      });
    },
    product: async (_: any, { id }: { id: string }) => {
      return prisma.product.findUnique({
        where: { id },
        include: { brand: true },
      });
    },
    inStockProducts: async () => {
      // Get products that are currently in stock
      const products = await prisma.product.findMany({
        include: {
          brand: true,
          stockHistory: {
            orderBy: {
              checkedAt: 'desc',
            },
            take: 1,
          },
        },
      });

      // Filter products that are in stock based on their latest stock history
      return products.filter(
        (product: ProductWithStockHistory) => product.stockHistory[0]?.inStock === true
      );
    },
    outOfStockProducts: async () => {
      // Get products that are currently out of stock
      const products = await prisma.product.findMany({
        include: {
          brand: true,
          stockHistory: {
            orderBy: {
              checkedAt: 'desc',
            },
            take: 1,
          },
        },
      });

      // Filter products that are out of stock based on their latest stock history
      return products.filter(
        (product: ProductWithStockHistory) => product.stockHistory[0]?.inStock === false
      );
    },
    user: async (_: any, { id }: { id: string }) => {
      return prisma.user.findUnique({
        where: { id },
        include: {
          brandNotifications: {
            include: {
              brand: true,
            },
          },
        },
      });
    },
    userByEmail: async (_: any, { email }: { email: string }) => {
      return prisma.user.findUnique({
        where: { email },
        include: {
          brandNotifications: {
            include: {
              brand: true,
            },
          },
        },
      });
    },
  },
  Mutation: {
    registerUser: async (
      _: any,
      { phone, email }: { phone?: string; email?: string }
    ) => {
      if (!phone && !email) {
        throw new Error('Either phone or email is required');
      }

      // Use upsert to either find existing user or create new one
      if (email) {
        return prisma.user.upsert({
          where: { email },
          update: {}, // Don't update anything if user exists
          create: { email, phone },
        });
      } else if (phone) {
        return prisma.user.upsert({
          where: { phone },
          update: {}, // Don't update anything if user exists
          create: { phone, email },
        });
      }

      throw new Error('Invalid user data');
    },
    createBrandNotification: async (
      _: any,
      { userId, brandId }: { userId: string; brandId: string }
    ) => {
      return prisma.brandNotification.upsert({
        where: {
          userId_brandId: {
            userId,
            brandId,
          },
        },
        update: {
          active: true, // Reactivate if it was deactivated
        },
        create: {
          userId,
          brandId,
        },
        include: {
          user: true,
          brand: true,
        },
      });
    },
    deleteBrandNotification: async (_: any, { id }: { id: string }) => {
      await prisma.brandNotification.delete({
        where: { id },
      });
      return true;
    },
    createNotification: async (
      _: any,
      { userId, productId }: { userId: string; productId: string }
    ) => {
      return prisma.notification.upsert({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
        update: {
          active: true,
        },
        create: {
          userId,
          productId,
        },
      });
    },
    deleteNotification: async (_: any, { id }: { id: string }) => {
      await prisma.notification.delete({
        where: { id },
      });
      return true;
    },
    updateStockStatus: async (
      _: any,
      { productId, inStock }: { productId: string; inStock: boolean }
    ) => {
      // Create stock history record
      await prisma.stockHistory.create({
        data: {
          productId,
          inStock,
        },
      });

      // Return updated product
      return prisma.product.findUnique({
        where: { id: productId },
        include: { brand: true },
      });
    },
  },
  Product: {
    inStock: async (parent: any) => {
      // Get the latest stock history for this product
      const latestStock = await prisma.stockHistory.findFirst({
        where: { productId: parent.id },
        orderBy: { checkedAt: 'desc' },
      });

      return latestStock?.inStock || false;
    },
    lastChecked: async (parent: any) => {
      // Get the latest stock history for this product
      const latestStock = await prisma.stockHistory.findFirst({
        where: { productId: parent.id },
        orderBy: { checkedAt: 'desc' },
      });

      return latestStock?.checkedAt.toISOString() || null;
    },
  },
};

export default resolvers; 