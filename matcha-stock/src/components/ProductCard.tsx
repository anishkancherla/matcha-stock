'use client';

import React from 'react';

type ProductCardProps = {
  product: {
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
};

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  // Check if this is the Sazen Tea Uji Matcha Collection
  const isSazenUjiMatcha = product.brand.name === 'Sazen Tea' && product.name === 'Uji Matcha Collection';

  return (
    <div className="rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg" style={{ backgroundColor: '#262626' }}>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg text-white" style={{ fontFamily: 'var(--forma-display-font)' }}>
              {product.name}
            </h3>
            <p className="text-sm text-gray-200">{product.brand.name}</p>
          </div>
          {!isSazenUjiMatcha && (
            <div className={`px-2 py-1 text-xs font-bold rounded-full ${product.inStock ? 'bg-green-800 text-green-200' : 'bg-red-900 text-red-200'}`}>
              {product.inStock ? 'In Stock' : 'Out of Stock'}
            </div>
          )}
        </div>
        
        {product.price && (
          <p className="mt-2 font-bold text-white">${product.price.toFixed(2)}</p>
        )}
        
        <div className="mt-4">
          <a 
            href={product.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[#a3a3a3] hover:text-white font-medium text-sm"
          >
            View on Website
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProductCard; 