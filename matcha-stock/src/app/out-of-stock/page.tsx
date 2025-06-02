'use client';

import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_OUT_OF_STOCK_PRODUCTS } from '../../graphql/queries';
import ProductGrid from '../../components/ProductGrid';

export default function OutOfStockPage() {
  const { data, loading, error } = useQuery(GET_OUT_OF_STOCK_PRODUCTS);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-green-800">Out of Stock Matcha</h1>
        <p className="text-gray-600 mt-2">
          These matcha products are currently unavailable. Set up notifications to be alerted when they're back in stock!
        </p>
      </div>

      <ProductGrid 
        products={data?.outOfStockProducts || []} 
        loading={loading}
        error={error}
      />
    </div>
  );
} 