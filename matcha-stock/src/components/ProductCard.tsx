'use client';

import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_NOTIFICATION, REGISTER_USER } from '../graphql/mutations';

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
  const [showNotifyForm, setShowNotifyForm] = useState(false);
  const [phone, setPhone] = useState('');
  const [notificationSent, setNotificationSent] = useState(false);
  const [error, setError] = useState('');

  const [registerUser] = useMutation(REGISTER_USER);
  const [createNotification] = useMutation(CREATE_NOTIFICATION);

  const handleNotifyClick = () => {
    setShowNotifyForm(true);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phone) {
      setError('Please enter a valid phone number');
      return;
    }

    try {
      // Register user first
      const { data: userData } = await registerUser({ variables: { phone } });
      
      if (userData?.registerUser?.id) {
        // Create notification
        await createNotification({
          variables: {
            userId: userData.registerUser.id,
            productId: product.id,
          },
        });
        
        setNotificationSent(true);
        setShowNotifyForm(false);
      }
    } catch (error) {
      setError('Something went wrong. Please try again.');
      console.error('Error creating notification:', error);
    }
  };

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
          
          {!product.inStock && !notificationSent && (
            <button
              onClick={handleNotifyClick}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm"
            >
              Notify Me
            </button>
          )}
          
          {notificationSent && (
            <span className="text-green-400 text-sm">Notification Set!</span>
          )}
        </div>
        
        {showNotifyForm && (
          <div className="mt-4 border-t border-gray-500 pt-4">
            <form onSubmit={handleSubmit}>
              <label className="block text-sm font-medium text-gray-100 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 555-5555"
                className="w-full px-3 py-2 border border-gray-500 bg-gray-500 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
              {error && <p className="mt-1 text-red-400 text-xs">{error}</p>}
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowNotifyForm(false)}
                  className="mr-2 text-gray-200 hover:text-gray-100 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm"
                >
                  Set Alert
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard; 