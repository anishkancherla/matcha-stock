'use client';

import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_ALL_BRANDS } from '../graphql/queries';

type BrandFilterProps = {
  selectedBrandId: string | null;
  onSelectBrand: (brandId: string | null) => void;
};

const BrandFilter: React.FC<BrandFilterProps> = ({ selectedBrandId, onSelectBrand }) => {
  const { data, loading, error } = useQuery(GET_ALL_BRANDS);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-300 rounded w-full mb-4" />
        <div className="h-8 bg-gray-300 rounded w-full mb-2" />
        <div className="h-8 bg-gray-300 rounded w-full mb-2" />
        <div className="h-8 bg-gray-300 rounded w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <p>Unable to load brands. Please try again later.</p>
      </div>
    );
  }

  const brands = data?.brands || [];

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6" style={{ fontFamily: 'var(--roobert-mono-font)' }}>
      <h3 className="font-bold text-lg mb-3 text-gray-900">Filter by Brand</h3>
      
      <div className="space-y-2">
        <button
          onClick={() => onSelectBrand(null)}
          className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
            selectedBrandId === null
              ? 'bg-green-100 text-green-800 font-medium'
              : 'hover:bg-gray-100 text-gray-700'
          }`}
        >
          All Brands
        </button>
        
        {brands.map((brand: { id: string; name: string }) => (
          <button
            key={brand.id}
            onClick={() => onSelectBrand(brand.id)}
            className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
              selectedBrandId === brand.id
                ? 'bg-green-100 text-green-800 font-medium'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            {brand.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BrandFilter; 