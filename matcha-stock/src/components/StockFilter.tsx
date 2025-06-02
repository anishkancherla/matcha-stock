'use client';

import React from 'react';

type StockStatus = 'all' | 'in-stock' | 'out-of-stock';

type StockFilterProps = {
  selectedStockStatus: StockStatus;
  onSelectStockStatus: (status: StockStatus) => void;
};

const StockFilter: React.FC<StockFilterProps> = ({ selectedStockStatus, onSelectStockStatus }) => {
  const stockOptions = [
    { value: 'all' as StockStatus, label: 'All Products' },
    { value: 'in-stock' as StockStatus, label: 'In Stock' },
    { value: 'out-of-stock' as StockStatus, label: 'Out of Stock' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6" style={{ fontFamily: 'var(--roobert-mono-font)' }}>
      <h3 className="font-bold text-lg mb-3 text-gray-900">Filter by Stock</h3>
      
      <div className="space-y-2">
        {stockOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onSelectStockStatus(option.value)}
            className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
              selectedStockStatus === option.value
                ? 'bg-green-100 text-green-800 font-medium'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default StockFilter; 