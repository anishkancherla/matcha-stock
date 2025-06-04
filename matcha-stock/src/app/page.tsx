'use client';

import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_ALL_PRODUCTS, GET_PRODUCTS_BY_BRAND } from '../graphql/queries';
import ProductGrid from '../components/ProductGrid';
import BrandFilter from '../components/BrandFilter';
import BrandNotificationSection from '../components/BrandNotificationSection';
import Image from 'next/image';

export default function HomePage() {
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  
  const { data, loading, error } = useQuery(
    selectedBrandId ? GET_PRODUCTS_BY_BRAND : GET_ALL_PRODUCTS,
    {
      variables: selectedBrandId ? { brandId: selectedBrandId } : {},
    }
  );

  const products = selectedBrandId ? data?.products : data?.products;

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-3">
          <div className="mb-6 flex pl-4 md:pl-6">
            <Image 
              src="/images/bigmatcha.png"
              alt="Matcha"
              width={220}
              height={220}
              className="rounded-lg"
              style={{ maxWidth: '80%', height: 'auto' }}
            />
          </div>
          
          <div className="mb-6 flex ml-[-150px] mt-10">
            <Image 
              src="/images/matchalol.png"
              alt="Matcha LOL"
              width={220}
              height={220}
              className="rounded-lg"
              style={{ maxWidth: '80%', height: 'auto' }}
            />
          </div>
        </div>
        
        <div className="md:col-span-9">
          <BrandFilter 
            selectedBrandId={selectedBrandId} 
            onSelectBrand={setSelectedBrandId} 
          />
          
          {selectedBrandId ? (
            <div className="mt-6">
              <BrandNotificationSection selectedBrandId={selectedBrandId} />
            </div>
          ) : (
            <div className="mt-6 p-4 bg-green-50 text-center" style={{ borderTop: '1px solid #d4d4d4', borderBottom: '1px solid #d4d4d4' }}>
              <p className="text-green-800 font-medium">
                Select a website to sign up for brand-specific notifications!
              </p>
            </div>
          )}
          
          <div className="mt-6">
            <ProductGrid 
              products={products || []} 
              loading={loading}
              error={error}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
