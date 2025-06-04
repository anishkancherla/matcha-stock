'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@apollo/client';
import { GET_ALL_PRODUCTS, GET_PRODUCTS_BY_BRAND } from '../graphql/queries';
import ProductGrid from '../components/ProductGrid';
import BrandFilter from '../components/BrandFilter';
import BrandNotificationSection from '../components/BrandNotificationSection';
import Image from 'next/image';

export default function HomePage() {
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  
  // Refs for the bouncing images
  const image1Ref = useRef<HTMLDivElement>(null);
  const image2Ref = useRef<HTMLDivElement>(null);
  
  const { data, loading, error } = useQuery(
    selectedBrandId ? GET_PRODUCTS_BY_BRAND : GET_ALL_PRODUCTS,
    {
      variables: selectedBrandId ? { brandId: selectedBrandId } : {},
    }
  );

  const products = selectedBrandId ? data?.products : data?.products;

  useEffect(() => {
    // Initial positions for images
    let pos1 = { x: 50, y: 50 };
    let pos2 = { x: -80, y: 120 };
    
    // Initial velocities and speed
    const BASE_SPEED1 = 0.6; // Lower constant speed value
    const BASE_SPEED2 = 0.5; // Lower constant speed value
    
    // Setting initial velocity with proper magnitude
    let vel1 = { x: BASE_SPEED1 * 0.7, y: BASE_SPEED1 * 0.7 };
    let vel2 = { x: BASE_SPEED2 * 0.8, y: BASE_SPEED2 * -0.6 };
    
    // Container dimensions
    let containerWidth = 0;
    let containerHeight = 0;
    
    // Image dimensions
    let img1Width = 0;
    let img1Height = 0;
    let img2Width = 0;
    let img2Height = 0;
    
    // Animation frame ID for cleanup
    let animationId: number;
    
    // Function to normalize velocity to maintain constant speed
    const normalizeVelocity = (vx: number, vy: number, targetSpeed: number) => {
      const currentSpeed = Math.sqrt(vx * vx + vy * vy);
      if (currentSpeed === 0) return { x: targetSpeed, y: 0 }; // Avoid division by zero
      
      const ratio = targetSpeed / currentSpeed;
      return {
        x: vx * ratio,
        y: vy * ratio
      };
    };
    
    const animate = () => {
      const container = document.querySelector('.left-column') as HTMLDivElement;
      if (!container || !image1Ref.current || !image2Ref.current) return;
      
      // Get container dimensions
      const containerRect = container.getBoundingClientRect();
      containerWidth = containerRect.width;
      containerHeight = containerRect.height;
      
      // Get image dimensions
      const img1Rect = image1Ref.current.getBoundingClientRect();
      img1Width = img1Rect.width;
      img1Height = img1Rect.height;
      
      const img2Rect = image2Ref.current.getBoundingClientRect();
      img2Width = img2Rect.width;
      img2Height = img2Rect.height;
      
      // Store previous velocities to detect changes
      const prevVel1 = { ...vel1 };
      const prevVel2 = { ...vel2 };
      
      // Update positions
      pos1.x += vel1.x;
      pos1.y += vel1.y;
      
      pos2.x += vel2.x;
      pos2.y += vel2.y;
      
      // Check boundaries for first image
      let collided1 = false;
      let collided2 = false;
      
      if (pos1.x <= -300 || pos1.x + img1Width >= containerWidth) {
        vel1.x = -vel1.x; // Reverse x direction
        collided1 = true;
      }
      
      if (pos1.y <= 0 || pos1.y + img1Height >= containerHeight) {
        vel1.y = -vel1.y; // Reverse y direction
        collided1 = true;
      }
      
      // Check boundaries for second image
      if (pos2.x <= -300 || pos2.x + img2Width >= containerWidth - 50) {
        vel2.x = -vel2.x; // Reverse x direction
        collided2 = true;
      }
      
      if (pos2.y <= 0 || pos2.y + img2Height >= containerHeight) {
        vel2.y = -vel2.y; // Reverse y direction
        collided2 = true;
      }
      
      // After collision, normalize velocities to maintain constant speed
      if (collided1) {
        const normalized = normalizeVelocity(vel1.x, vel1.y, BASE_SPEED1);
        vel1.x = normalized.x;
        vel1.y = normalized.y;
      }
      
      if (collided2) {
        const normalized = normalizeVelocity(vel2.x, vel2.y, BASE_SPEED2);
        vel2.x = normalized.x;
        vel2.y = normalized.y;
      }
      
      // Apply new positions
      if (image1Ref.current) {
        image1Ref.current.style.transform = `translate(${pos1.x}px, ${pos1.y}px)`;
      }
      
      if (image2Ref.current) {
        image2Ref.current.style.transform = `translate(${pos2.x}px, ${pos2.y}px)`;
      }
      
      animationId = requestAnimationFrame(animate);
    };
    
    // Start animation
    animationId = requestAnimationFrame(animate);
    
    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-3 relative left-column" style={{ 
          height: '80vh', 
          overflow: 'visible',
          padding: 0,
          margin: 0,
          position: 'relative',
          left: 0
        }}>
          <div ref={image1Ref} className="absolute" style={{ willChange: 'transform' }}>
            <Image 
              src="/images/bigmatcha.png"
              alt="Matcha"
              width={180}
              height={180}
              className="rounded-lg"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </div>
          
          <div ref={image2Ref} className="absolute" style={{ willChange: 'transform' }}>
            <Image 
              src="/images/matchalol.png"
              alt="Matcha LOL"
              width={180}
              height={180}
              className="rounded-lg"
              style={{ maxWidth: '100%', height: 'auto' }}
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
