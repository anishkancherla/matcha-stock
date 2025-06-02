'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { GET_ALL_PRODUCTS, GET_PRODUCTS_BY_BRAND } from '../graphql/queries';
import ProductGrid from '../components/ProductGrid';
import BrandFilter from '../components/BrandFilter';
import StockFilter from '../components/StockFilter';

type StockStatus = 'all' | 'in-stock' | 'out-of-stock';

export default function HomePage() {
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [selectedStockStatus, setSelectedStockStatus] = useState<StockStatus>('all');
  
  const { data, loading, error } = useQuery(
    selectedBrandId ? GET_PRODUCTS_BY_BRAND : GET_ALL_PRODUCTS,
    {
      variables: selectedBrandId ? { brandId: selectedBrandId } : {},
    }
  );

  const allProducts = selectedBrandId ? data?.products : data?.products;

  // Filter products by stock status
  const filteredProducts = useMemo(() => {
    if (!allProducts) return [];
    
    switch (selectedStockStatus) {
      case 'in-stock':
        return allProducts.filter((product: any) => product.inStock);
      case 'out-of-stock':
        return allProducts.filter((product: any) => !product.inStock);
      default:
        return allProducts;
    }
  }, [allProducts, selectedStockStatus]);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <BrandFilter 
            selectedBrandId={selectedBrandId} 
            onSelectBrand={setSelectedBrandId} 
          />
          <StockFilter 
            selectedStockStatus={selectedStockStatus}
            onSelectStockStatus={setSelectedStockStatus}
          />
        </div>
        
        <div className="md:col-span-3">
          <ProductGrid 
            products={filteredProducts || []} 
            loading={loading}
            error={error}
          />
        </div>
      </div>
    </div>
  );
}
