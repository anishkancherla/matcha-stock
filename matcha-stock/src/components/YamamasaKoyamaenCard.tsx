'use client';

import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_BRAND_NOTIFICATION, REGISTER_USER } from '../graphql/mutations';
import { GET_ALL_BRANDS } from '../graphql/queries';

const YamamasaKoyamaenCard: React.FC = () => {
  const [showNotifyForm, setShowNotifyForm] = useState(false);
  const [email, setEmail] = useState('');
  const [notificationResult, setNotificationResult] = useState<{
    type: 'new' | 'existing' | null;
    message: string;
  }>({ type: null, message: '' });
  const [error, setError] = useState('');

  const [registerUser] = useMutation(REGISTER_USER);
  const [createBrandNotification] = useMutation(CREATE_BRAND_NOTIFICATION);

  // Get the MatchaJP - Koyamaen brand ID
  const { data: brandsData } = useQuery(GET_ALL_BRANDS);
  const yamamasaBrand = brandsData?.brands?.find((brand: any) => brand.name === 'MatchaJP - Koyamaen');
  
  // Debug logging
  console.log('YamamasaKoyamaenCard - Available brands:', brandsData?.brands?.map((b: any) => b.name));
  console.log('YamamasaKoyamaenCard - Found Yamamasa brand:', yamamasaBrand);

  const handleNotifyClick = () => {
    setShowNotifyForm(true);
    setError('');
    setNotificationResult({ type: null, message: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!yamamasaBrand) {
      setError('Brand not found');
      return;
    }

    try {
      setError('');

      // Register or get existing user
      const userResult = await registerUser({
        variables: { email: email.trim() },
      });

      if (!userResult.data?.registerUser?.id) {
        throw new Error('Failed to register user');
      }

      const userId = userResult.data.registerUser.id;

      // Create brand notification
      const notificationResult = await createBrandNotification({
        variables: {
          userId,
          brandId: yamamasaBrand.id,
        },
      });

      if (notificationResult.data?.createBrandNotification) {
        setNotificationResult({
          type: 'new',
          message: `✅ You'll be notified when any Yamamasa Koyamaen product is back in stock!`,
        });
        setShowNotifyForm(false);
        setEmail('');
      }
    } catch (err: any) {
      console.error('Notification signup error:', err);
      if (err.message?.includes('already exists') || err.message?.includes('duplicate')) {
        setNotificationResult({
          type: 'existing',
          message: `ℹ️ You're already signed up for Yamamasa Koyamaen notifications!`,
        });
        setShowNotifyForm(false);
        setEmail('');
      } else {
        setError('Failed to set up notification. Please try again.');
      }
    }
  };

  const handleCancel = () => {
    setShowNotifyForm(false);
    setEmail('');
    setError('');
  };

  return (
    <div className="rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg" style={{ backgroundColor: '#262626' }}>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg text-white" style={{ fontFamily: 'var(--forma-display-font)' }}>
              Yamamasa Koyamaen
            </h3>
          </div>
        </div>
        
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

        {/* Show restock notification button */}
        {!showNotifyForm && !notificationResult.message && (
          <div className="mt-4">
            <button
              onClick={handleNotifyClick}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium transition-colors text-sm w-full mb-2"
            >
              🔔 Get Restock Notifications
            </button>
          </div>
        )}

        {/* Email form */}
        {showNotifyForm && (
          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
            <div className="flex space-x-2">
              <button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium transition-colors text-sm"
              >
                Subscribe
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md font-medium transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
            {error && (
              <div className="text-red-400 text-sm">{error}</div>
            )}
          </form>
        )}

        {/* View on Website link */}
        <div className="mt-4">
          <a 
            href="https://www.matchajp.net/collections/koyamaen-matcha-powder"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors text-sm"
          >
            View on Website
          </a>
        </div>
      </div>
    </div>
  );
};

export default YamamasaKoyamaenCard; 