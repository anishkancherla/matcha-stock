'use client';

import React from 'react';

type Brand = {
  id: string;
  name: string;
  _count: {
    products: number;
  };
};

type BrandFilterProps = {
  brands: Brand[];
  selectedBrandId: string | null;
  onBrandSelect: (brandId: string | null) => void;
};

const BrandFilter: React.FC<BrandFilterProps> = ({ brands, selectedBrandId, onBrandSelect }) => {
  // Filter out only the backend tracking brand - show MatchaJP but not MatchaJP - Koyamaen
  const displayBrands = brands.filter(brand => 
    brand.name !== 'MatchaJP - Koyamaen'
  );

  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-2">
        {displayBrands.map((brand) => (
          <button
            key={brand.id}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors text-black ${
              selectedBrandId === brand.id
                ? 'bg-gray-300'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
            style={{ color: '#000000' }}
            onClick={() => onBrandSelect(brand.id)}
          >
            {brand.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BrandFilter; 