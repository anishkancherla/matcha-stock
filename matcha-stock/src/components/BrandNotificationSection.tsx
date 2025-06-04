'use client';

import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, gql } from '@apollo/client';
import { CREATE_BRAND_NOTIFICATION, REGISTER_USER } from '../graphql/mutations';
import { GET_ALL_BRANDS, CHECK_BRAND_NOTIFICATION } from '../graphql/queries';
import Image from 'next/image';

type BrandNotificationSectionProps = {
  selectedBrandId: string;
};

const BrandNotificationSection: React.FC<BrandNotificationSectionProps> = ({ selectedBrandId }) => {
  const [showNotifyForm, setShowNotifyForm] = useState(false);
  const [email, setEmail] = useState('');
  const [notificationResult, setNotificationResult] = useState<{
    type: 'new' | 'existing' | null;
    message: string;
  }>({ type: null, message: '' });
  const [error, setError] = useState('');

  const [registerUser] = useMutation(REGISTER_USER);
  const [createBrandNotification] = useMutation(CREATE_BRAND_NOTIFICATION);

  // Get brand data
  const { data: brandsData } = useQuery(GET_ALL_BRANDS);
  const selectedBrand = brandsData?.brands?.find((brand: any) => brand.id === selectedBrandId);

  // Reset notification state when selectedBrandId changes
  useEffect(() => {
    setNotificationResult({ type: null, message: '' });
    setShowNotifyForm(false);
    setEmail('');
    setError('');
  }, [selectedBrandId]);

  const handleNotifyClick = () => {
    setShowNotifyForm(true);
    setError('');
    setNotificationResult({ type: null, message: '' });
  };

  // Function to get the logo for the selected brand
  const getBrandLogo = () => {
    if (!selectedBrand) return null;
    
    if (selectedBrand.name.includes('Ippodo')) {
      return '/images/ippodologo.jpg';
    } else if (selectedBrand.name.includes('Sazen')) {
      return '/images/sazen-tea-logo-blk-white (1).png';
    }
    
    return null;
  };

  const brandLogo = getBrandLogo();

  const checkExistingNotification = async (email: string) => {
    try {
      console.log('🔍 Checking for existing notification...', { email, selectedBrandId });
      
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query CheckBrandNotification($email: String!) {
              userByEmail(email: $email) {
                id
                email
                brandNotifications {
                  id
                  brand {
                    id
                  }
                  active
                }
              }
            }
          `,
          variables: { email },
        }),
      });

      const data = await response.json();
      console.log('📡 Full GraphQL Response:', data);

      if (data.errors) {
        console.error('❌ GraphQL Errors:', data.errors);
        return { user: null, hasNotification: false };
      }

      if (data?.data?.userByEmail) {
        const user = data.data.userByEmail;
        console.log('👤 Found user:', user);
        console.log('🔔 User notifications:', user.brandNotifications);
        
                 const existingNotification = user.brandNotifications.find(
           (notification: any) => {
             console.log(`Comparing: ${notification.brand.id} === ${selectedBrandId} && ${notification.active}`);
             return notification.brand.id === selectedBrandId && notification.active;
           }
         );
        
        console.log('🎯 Existing notification found:', !!existingNotification);
        
        if (existingNotification) {
          console.log('✨ Found matching notification:', existingNotification);
        }
        
        return { user, hasNotification: !!existingNotification };
      } else {
        console.log('👤 No user found with email:', email);
      }
      
      return { user: null, hasNotification: false };
    } catch (error) {
      console.error('💥 Error checking existing notification:', error);
      return { user: null, hasNotification: false };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      // First check if user already has this notification
      const { user, hasNotification } = await checkExistingNotification(email);

      if (hasNotification) {
        setNotificationResult({
          type: 'existing',
          message: `You're already subscribed to ${selectedBrand?.name} notifications! 🎉`
        });
        setShowNotifyForm(false);
        return;
      }

      // Register user with email (or get existing)
      const { data: userData } = await registerUser({ variables: { email } });
      
      if (userData?.registerUser?.id) {
        // Create brand notification
        await createBrandNotification({
          variables: {
            userId: userData.registerUser.id,
            brandId: selectedBrandId,
          },
        });
        
        setNotificationResult({
          type: 'new',
          message: `Success! You'll now get notified when any ${selectedBrand?.name} product restocks! 📧`
        });
        setShowNotifyForm(false);
      }
    } catch (error) {
      setError('Something went wrong. Please try again.');
      console.error('Error creating brand notification:', error);
    }
  };

  if (!selectedBrand) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6" style={{ fontFamily: 'var(--roobert-mono-font)' }}>
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <h2 className="text-2xl font-bold text-gray-900 mr-3">{selectedBrand.name}</h2>
          {brandLogo && (
            <div className="h-8 w-auto flex-shrink-0">
              <Image 
                src={brandLogo}
                alt={`${selectedBrand.name} logo`}
                width={40}
                height={32}
                className="h-full w-auto object-contain"
              />
            </div>
          )}
        </div>
        
        <div className="flex flex-col items-end">
          {!notificationResult.type && !showNotifyForm && (
            <button
              onClick={handleNotifyClick}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
            >
              🔔 Get Brand Notifications
            </button>
          )}
          
          {notificationResult.type && (
            <div className="text-center">
              <div className={`font-medium mb-1 ${notificationResult.type === 'new' ? 'text-green-600' : 'text-blue-600'}`}>
                {notificationResult.type === 'new' ? '✅ Subscribed!' : '🔔 Already Subscribed!'}
              </div>
              <div className="text-sm text-gray-500 max-w-xs">
                {notificationResult.message}
              </div>
              <button
                onClick={() => setNotificationResult({ type: null, message: '' })}
                className="text-xs text-gray-400 hover:text-gray-600 mt-2"
              >
                Try another email
              </button>
            </div>
          )}
        </div>
      </div>
      
      {showNotifyForm && (
        <div className="mt-6 border-t border-gray-200 pt-6">
          <form onSubmit={handleSubmit} className="max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="flex gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                required
              />
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
              >
                Subscribe
              </button>
              <button
                type="button"
                onClick={() => setShowNotifyForm(false)}
                className="text-gray-500 hover:text-gray-700 px-4 py-2"
              >
                Cancel
              </button>
            </div>
            {error && <p className="mt-2 text-red-600 text-sm">{error}</p>}
          </form>
        </div>
      )}
    </div>
  );
};

export default BrandNotificationSection; 