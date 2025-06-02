'use client';

import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_IN_STOCK_PRODUCTS } from '../../graphql/queries';
import ProductGrid from '../../components/ProductGrid';

export default function InStockPage() {
  const { data, loading, error } = useQuery(GET_IN_STOCK_PRODUCTS);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-green-800">In Stock Matcha</h1>
        <p className="text-gray-600 mt-2">
          These matcha products are currently available for purchase.
        </p>
      </div>

      <ProductGrid 
        products={data?.inStockProducts || []} 
        loading={loading}
        error={error}
      />
    </div>
  );
} 