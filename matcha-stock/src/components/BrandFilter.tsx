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
    <div className="bg-white p-4" style={{ fontFamily: 'var(--roobert-mono-font)' }}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filter by Website</h3>
        {selectedBrandId && (
          <button 
            onClick={() => onSelectBrand(null)} 
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Show All
          </button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {brands.map((brand: { id: string; name: string }) => (
          <button
            key={brand.id}
            onClick={() => onSelectBrand(brand.id)}
            className={`px-4 py-2 rounded-md transition-colors ${
              selectedBrandId === brand.id
                ? 'bg-green-100 text-green-800 font-medium'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
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