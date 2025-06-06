'use client';

import React from 'react';
import ProductCard from './ProductCard';
import YamamasaKoyamaenCard from './YamamasaKoyamaenCard';

type Product = {
  id: string;
  name: string;
  weight?: string;
  price?: number;
  imageUrl?: string;
  url: string;
  inStock: boolean;
  lastChecked?: string;
  brand: {
    id: string;
    name: string;
  };
};

type ProductGridProps = {
  products: Product[];
  loading?: boolean;
  error?: any;
  selectedBrandId?: string | null;
  brands?: any[];
};

const ProductGrid: React.FC<ProductGridProps> = ({ products, loading, error, selectedBrandId, brands }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
            <div className="w-full h-48 bg-gray-300" />
            <div className="p-4">
              <div className="h-6 bg-gray-300 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-300 rounded w-1/2 mb-4" />
              <div className="h-4 bg-gray-300 rounded w-full mb-2" />
              <div className="h-4 bg-gray-300 rounded w-full mb-4" />
              <div className="flex justify-between items-center">
                <div className="h-5 bg-gray-300 rounded w-1/3" />
                <div className="h-8 bg-gray-300 rounded w-1/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> Unable to load products. Please try again later.</span>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-xl font-medium text-gray-700">No products found</h3>
        <p className="text-gray-500 mt-2">Check back later for new matcha products!</p>
      </div>
    );
  }

  // Check if MatchaJP is selected to show Yamamasa Koyamaen card
  const selectedBrand = brands?.find(brand => brand.id === selectedBrandId);
  const isMatchaJPSelected = selectedBrand?.name === 'MatchaJP';
  
  // Debug logging
  console.log('ProductGrid - selectedBrandId:', selectedBrandId);
  console.log('ProductGrid - selectedBrand:', selectedBrand);
  console.log('ProductGrid - isMatchaJPSelected:', isMatchaJPSelected);

  // Filter out regular MatchaJP products when MatchaJP is selected (we show the special card instead)
  const filteredProducts = isMatchaJPSelected 
    ? products.filter(product => product.brand.name !== 'MatchaJP')
    : products;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Show Yamamasa Koyamaen card first when MatchaJP is selected */}
      {isMatchaJPSelected && <YamamasaKoyamaenCard />}
      
      {filteredProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid; 