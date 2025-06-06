'use client';

import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_BRAND_NOTIFICATION, REGISTER_USER } from '../graphql/mutations';
import { GET_ALL_BRANDS } from '../graphql/queries';

const YamamasaKoyamaenNotification: React.FC = () => {
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

  if (notificationResult.message) {
    return (
      <div className={`p-2 rounded text-sm ${
        notificationResult.type === 'new' 
          ? 'bg-green-100 text-green-800' 
          : 'bg-blue-100 text-blue-800'
      }`}>
        {notificationResult.message}
      </div>
    );
  }

  if (showNotifyForm) {
    return (
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="flex-1 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm font-medium"
          >
            Subscribe
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-md text-sm font-medium"
          >
            Cancel
          </button>
        </div>
        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}
      </form>
    );
  }

  return (
    <button
      onClick={handleNotifyClick}
      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm font-medium"
    >
      🔔 Get Restock Notifications
    </button>
  );
};

export default YamamasaKoyamaenNotification; 