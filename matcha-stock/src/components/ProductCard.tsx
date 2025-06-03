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
  return (
    <div className="bg-gray-400 rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg text-white" style={{ fontFamily: 'var(--forma-display-font)' }}>
              {product.name}
              {product.weight && (
                <span className="text-sm font-light text-gray-400 ml-2"> - {product.weight}</span>
              )}
            </h3>
            <p className="text-sm text-gray-200">{product.brand.name}</p>
          </div>
          <div className={`px-2 py-1 text-xs font-bold rounded-full ${product.inStock ? 'bg-green-800 text-green-200' : 'bg-red-800 text-red-200'}`}>
            {product.inStock ? 'In Stock' : 'Out of Stock'}
          </div>
        </div>
        
        {product.price && (
          <p className="mt-2 font-bold text-white">${product.price.toFixed(2)}</p>
        )}
        
        <div className="mt-4 flex justify-between items-center">
          <a 
            href={product.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-green-400 hover:text-green-300 font-medium text-sm"
          >
            View on Website
          </a>
          
          {!product.inStock && (
            <span className="text-gray-300 text-sm italic">
              Subscribe to brand notifications above for restock alerts
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard; 