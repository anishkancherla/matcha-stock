'use client';

import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_BRAND_NOTIFICATION, REGISTER_USER } from '../graphql/mutations';

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

type ProductCardProps = {
  product: Product;
};

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [showNotifyForm, setShowNotifyForm] = useState(false);
  const [email, setEmail] = useState('');
  const [notificationResult, setNotificationResult] = useState<{
    type: 'new' | 'existing' | null;
    message: string;
  }>({ type: null, message: '' });
  const [error, setError] = useState('');

  const [registerUser] = useMutation(REGISTER_USER);
  const [createBrandNotification] = useMutation(CREATE_BRAND_NOTIFICATION);

  // Check if this is the Sazen Tea Uji Matcha Collection or MatchaJP products
  const isSazenUjiMatcha = product.brand.name === 'Sazen Tea' && product.name === 'Uji Matcha Collection';
  const isMatchaJP = product.brand.name === 'MatchaJP';
  const isYamamasaKoyamaen = product.brand.name === 'MatchaJP - Koyamaen';

  const handleNotifyClick = () => {
    setShowNotifyForm(true);
    setError('');
    setNotificationResult({ type: null, message: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      // Register user with email (or get existing)
      const { data: userData } = await registerUser({ variables: { email } });
      
      if (userData?.registerUser?.id) {
        // Get the MatchaJP - Koyamaen brand ID for backend notifications
        const response = await fetch('/api/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `
              query GetBrands {
                brands {
                  id
                  name
                }
              }
            `,
          }),
        });

        const brandsData = await response.json();
        const matchaJpKoyamaenBrand = brandsData.data.brands.find(
          (brand: any) => brand.name === 'MatchaJP - Koyamaen'
        );

        if (matchaJpKoyamaenBrand) {
          // Create brand notification for MatchaJP - Koyamaen (backend tracking)
          await createBrandNotification({
            variables: {
              userId: userData.registerUser.id,
              brandId: matchaJpKoyamaenBrand.id,
            },
          });
          
          setNotificationResult({
            type: 'new',
            message: `Success! You'll get notified when any MatchaJP matcha restocks! 📧`
          });
          setShowNotifyForm(false);
        } else {
          setError('Backend brand not found. Please try again.');
        }
      }
    } catch (error) {
      setError('Something went wrong. Please try again.');
      console.error('Error creating notification:', error);
    }
  };

  return (
    <div className="rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg" style={{ backgroundColor: '#262626' }}>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg text-white" style={{ fontFamily: 'var(--forma-display-font)' }}>
              {product.name}
            </h3>
            {!isMatchaJP && !isYamamasaKoyamaen && <p className="text-sm text-gray-200">{product.brand.name}</p>}
          </div>
          {!isSazenUjiMatcha && !isMatchaJP && !isYamamasaKoyamaen && (
            <div className={`px-2 py-1 text-xs font-bold rounded-full ${product.inStock ? 'bg-green-800 text-green-200' : 'bg-red-900 text-red-200'}`}>
              {product.inStock ? 'In Stock' : 'Out of Stock'}
            </div>
          )}
        </div>
        
        {product.price && (
          <p className="mt-2 font-bold text-white">${product.price.toFixed(2)}</p>
        )}
        
        {/* Notification success/error messages */}
        {notificationResult.message && (
          <div className={`mt-3 p-2 rounded text-sm ${
            notificationResult.type === 'new' 
              ? 'bg-green-900 text-green-200' 
              : 'bg-blue-900 text-blue-200'
          }`}>
            {notificationResult.message}
          </div>
        )}

        {/* Show restock notification button for MatchaJP (but not for Yamamasa Koyamaen products) */}
        {isMatchaJP && !showNotifyForm && !notificationResult.message && (
          <div className="mt-4">
            <button
              onClick={handleNotifyClick}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium transition-colors text-sm w-full mb-2"
            >
              🔔 Get Restock Notifications
            </button>
          </div>
        )}

        {/* Email form for MatchaJP */}
        {isMatchaJP && showNotifyForm && (
          <div className="mt-4">
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 text-sm"
                required
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md font-medium transition-colors text-sm"
                >
                  Subscribe
                </button>
                <button
                  type="button"
                  onClick={() => setShowNotifyForm(false)}
                  className="text-gray-400 hover:text-white px-3 py-2 text-sm"
                >
                  Cancel
                </button>
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
            </form>
          </div>
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