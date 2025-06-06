'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@apollo/client';
import { GET_ALL_PRODUCTS, GET_PRODUCTS_BY_BRAND, GET_ALL_BRANDS } from '../graphql/queries';
import ProductGrid from '../components/ProductGrid';
import BrandFilter from '../components/BrandFilter';
import BrandNotificationSection from '../components/BrandNotificationSection';
import Image from 'next/image';

export default function HomePage() {
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [visibleImages, setVisibleImages] = useState<number[]>([]);
  
  // Refs for the bouncing images
  const image1Ref = useRef<HTMLDivElement>(null);
  const image2Ref = useRef<HTMLDivElement>(null);
  const image3Ref = useRef<HTMLDivElement>(null);
  const image4Ref = useRef<HTMLDivElement>(null);
  const image5Ref = useRef<HTMLDivElement>(null);
  const image6Ref = useRef<HTMLDivElement>(null);
  
  const { data: productsData, loading, error } = useQuery(
    selectedBrandId ? GET_PRODUCTS_BY_BRAND : GET_ALL_PRODUCTS,
    {
      variables: selectedBrandId ? { brandId: selectedBrandId } : {},
    }
  );

  const { data: brandsData, loading: brandsLoading } = useQuery(GET_ALL_BRANDS);

  const products = productsData?.products || [];
  const brands = brandsData?.brands || [];
  
  // Check if selected brand is MatchaJP to hide general brand notifications
  const selectedBrand = brands.find((brand: any) => brand.id === selectedBrandId);
  const isMatchaJPSelected = selectedBrand?.name === 'MatchaJP';

  // Sequential image loading
  useEffect(() => {
    const delays = [300, 600, 900, 1200, 1500, 1800];
    
    delays.forEach((delay, index) => {
      setTimeout(() => {
        setVisibleImages(prev => [...prev, index]);
      }, delay);
    });
    
    // Clean up timeouts on unmount
    return () => {
      setVisibleImages([]);
    };
  }, []);

  useEffect(() => {
    // Initial positions for images
    let pos1 = { x: 50, y: 50 };
    let pos2 = { x: -80, y: 120 };
    let pos3 = { x: 20, y: 250 };
    let pos4 = { x: -50, y: 350 };
    let pos5 = { x: 70, y: 180 };
    let pos6 = { x: -30, y: 420 };
    
    // Initial velocities and speed
    const BASE_SPEED1 = 0.6; // Lower constant speed value
    const BASE_SPEED2 = 0.5; // Lower constant speed value
    const BASE_SPEED3 = 0.45; // Even slower for third image
    const BASE_SPEED4 = 0.55;
    const BASE_SPEED5 = 0.4;
    const BASE_SPEED6 = 0.35;
    
    // Setting initial velocity with proper magnitude
    let vel1 = { x: BASE_SPEED1 * 0.7, y: BASE_SPEED1 * 0.7 };
    let vel2 = { x: BASE_SPEED2 * 0.8, y: BASE_SPEED2 * -0.6 };
    let vel3 = { x: BASE_SPEED3 * -0.7, y: BASE_SPEED3 * 0.7 };
    let vel4 = { x: BASE_SPEED4 * 0.9, y: BASE_SPEED4 * -0.4 };
    let vel5 = { x: BASE_SPEED5 * -0.6, y: BASE_SPEED5 * -0.8 };
    let vel6 = { x: BASE_SPEED6 * 0.5, y: BASE_SPEED6 * 0.9 };
    
    // Container dimensions
    let containerWidth = 0;
    let containerHeight = 0;
    
    // Image dimensions
    let img1Width = 0, img1Height = 0;
    let img2Width = 0, img2Height = 0;
    let img3Width = 0, img3Height = 0;
    let img4Width = 0, img4Height = 0;
    let img5Width = 0, img5Height = 0;
    let img6Width = 0, img6Height = 0;
    
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
      if (!container || !image1Ref.current || !image2Ref.current || !image3Ref.current || 
          !image4Ref.current || !image5Ref.current || !image6Ref.current) return;
      
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
      
      const img3Rect = image3Ref.current.getBoundingClientRect();
      img3Width = img3Rect.width;
      img3Height = img3Rect.height;
      
      const img4Rect = image4Ref.current.getBoundingClientRect();
      img4Width = img4Rect.width;
      img4Height = img4Rect.height;
      
      const img5Rect = image5Ref.current.getBoundingClientRect();
      img5Width = img5Rect.width;
      img5Height = img5Rect.height;
      
      const img6Rect = image6Ref.current.getBoundingClientRect();
      img6Width = img6Rect.width;
      img6Height = img6Rect.height;
      
      // Update positions for all images
      pos1.x += vel1.x; pos1.y += vel1.y;
      pos2.x += vel2.x; pos2.y += vel2.y;
      pos3.x += vel3.x; pos3.y += vel3.y;
      pos4.x += vel4.x; pos4.y += vel4.y;
      pos5.x += vel5.x; pos5.y += vel5.y;
      pos6.x += vel6.x; pos6.y += vel6.y;
      
      // Collision flags for all images
      let collided1 = false, collided2 = false, collided3 = false;
      let collided4 = false, collided5 = false, collided6 = false;
      
      // Check boundaries for each image
      // Image 1
      if (pos1.x <= -150 || pos1.x + img1Width >= containerWidth) {
        vel1.x = -vel1.x;
        collided1 = true;
      }
      if (pos1.y <= 0 || pos1.y + img1Height >= containerHeight) {
        vel1.y = -vel1.y;
        collided1 = true;
      }
      
      // Image 2
      if (pos2.x <= -200 || pos2.x + img2Width >= containerWidth - 50) {
        vel2.x = -vel2.x;
        collided2 = true;
      }
      if (pos2.y <= 0 || pos2.y + img2Height >= containerHeight) {
        vel2.y = -vel2.y;
        collided2 = true;
      }
      
      // Image 3
      if (pos3.x <= -180 || pos3.x + img3Width >= containerWidth - 30) {
        vel3.x = -vel3.x;
        collided3 = true;
      }
      if (pos3.y <= 0 || pos3.y + img3Height >= containerHeight) {
        vel3.y = -vel3.y;
        collided3 = true;
      }
      
      // Image 4
      if (pos4.x <= -220 || pos4.x + img4Width >= containerWidth - 40) {
        vel4.x = -vel4.x;
        collided4 = true;
      }
      if (pos4.y <= 0 || pos4.y + img4Height >= containerHeight) {
        vel4.y = -vel4.y;
        collided4 = true;
      }
      
      // Image 5
      if (pos5.x <= -170 || pos5.x + img5Width >= containerWidth - 30) {
        vel5.x = -vel5.x;
        collided5 = true;
      }
      if (pos5.y <= 0 || pos5.y + img5Height >= containerHeight) {
        vel5.y = -vel5.y;
        collided5 = true;
      }
      
      // Image 6
      if (pos6.x <= -190 || pos6.x + img6Width >= containerWidth - 20) {
        vel6.x = -vel6.x;
        collided6 = true;
      }
      if (pos6.y <= 0 || pos6.y + img6Height >= containerHeight) {
        vel6.y = -vel6.y;
        collided6 = true;
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
      
      if (collided3) {
        const normalized = normalizeVelocity(vel3.x, vel3.y, BASE_SPEED3);
        vel3.x = normalized.x;
        vel3.y = normalized.y;
      }
      
      if (collided4) {
        const normalized = normalizeVelocity(vel4.x, vel4.y, BASE_SPEED4);
        vel4.x = normalized.x;
        vel4.y = normalized.y;
      }
      
      if (collided5) {
        const normalized = normalizeVelocity(vel5.x, vel5.y, BASE_SPEED5);
        vel5.x = normalized.x;
        vel5.y = normalized.y;
      }
      
      if (collided6) {
        const normalized = normalizeVelocity(vel6.x, vel6.y, BASE_SPEED6);
        vel6.x = normalized.x;
        vel6.y = normalized.y;
      }
      
      // Apply new positions to all images
      if (image1Ref.current) {
        image1Ref.current.style.transform = `translate(${pos1.x}px, ${pos1.y}px)`;
      }
      if (image2Ref.current) {
        image2Ref.current.style.transform = `translate(${pos2.x}px, ${pos2.y}px)`;
      }
      if (image3Ref.current) {
        image3Ref.current.style.transform = `translate(${pos3.x}px, ${pos3.y}px)`;
      }
      if (image4Ref.current) {
        image4Ref.current.style.transform = `translate(${pos4.x}px, ${pos4.y}px)`;
      }
      if (image5Ref.current) {
        image5Ref.current.style.transform = `translate(${pos5.x}px, ${pos5.y}px)`;
      }
      if (image6Ref.current) {
        image6Ref.current.style.transform = `translate(${pos6.x}px, ${pos6.y}px)`;
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
      {/* Add pop-up animation keyframes */}
      <style jsx global>{`
        @keyframes popUp {
          0% {
            opacity: 0;
            transform: scale(0);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .image-container {
          position: absolute;
          will-change: transform;
        }
        
        .image-appear {
          opacity: 0;
        }
        
        .image-appear.loaded {
          opacity: 1;
          animation-name: popUp;
          animation-duration: 0.3s;
          animation-timing-function: ease-out;
          animation-fill-mode: forwards;
        }
      `}</style>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Remove any possible left padding/margin causing white border */}
        <div className="md:col-span-3 relative left-column" style={{ 
          height: '80vh', 
          overflow: 'visible',
          padding: 0,
          margin: 0,
          position: 'relative',
          left: 0
        }}>
          {/* First image */}
          <div 
            ref={image1Ref} 
            className="absolute"
            style={{ 
              willChange: 'transform',
              display: visibleImages.includes(0) ? 'block' : 'none'
            }}
          >
            <Image 
              src="/images/bigmatcha.png"
              alt="Matcha"
              width={180}
              height={180}
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </div>
          
          {/* Second image */}
          <div 
            ref={image2Ref} 
            className="absolute"
            style={{ 
              willChange: 'transform',
              display: visibleImages.includes(1) ? 'block' : 'none'
            }}
          >
            <Image 
              src="/images/matchalol.png"
              alt="Matcha LOL"
              width={180}
              height={180}
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </div>
          
          {/* Third image */}
          <div 
            ref={image3Ref} 
            className="absolute"
            style={{ 
              willChange: 'transform',
              display: visibleImages.includes(2) ? 'block' : 'none'
            }}
          >
            <Image 
              src="/images/dolanmatcha.jpg"
              alt="Dolan Matcha"
              width={180}
              height={180}
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </div>
          
          {/* Fourth image */}
          <div 
            ref={image4Ref} 
            className="absolute"
            style={{ 
              willChange: 'transform',
              display: visibleImages.includes(3) ? 'block' : 'none'
            }}
          >
            <Image 
              src="/images/matcha.jpg"
              alt="Matcha"
              width={180}
              height={180}
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </div>
          
          {/* Fifth image */}
          <div 
            ref={image5Ref} 
            className="absolute"
            style={{ 
              willChange: 'transform',
              display: visibleImages.includes(4) ? 'block' : 'none'
            }}
          >
            <Image 
              src="/images/trap.jpg"
              alt="Trap"
              width={180}
              height={180}
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </div>
          
          {/* Sixth image */}
          <div 
            ref={image6Ref} 
            className="absolute"
            style={{ 
              willChange: 'transform',
              display: visibleImages.includes(5) ? 'block' : 'none'
            }}
          >
            <Image 
              src="/images/flask.jpg"
              alt="Flask"
              width={180}
              height={180}
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </div>
        </div>
        
        <div className="md:col-span-9">
          <BrandFilter 
            selectedBrandId={selectedBrandId} 
            onBrandSelect={setSelectedBrandId} 
            brands={brands}
          />
          
          {/* MatchaJP Header - similar to other brand headers */}
          {isMatchaJPSelected && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6" style={{ fontFamily: 'var(--roobert-mono-font)' }}>
              <div className="flex items-center">
                <h2 className="text-2xl font-bold text-gray-900 mr-3">MatchaJP</h2>
                <div className="h-8 w-auto flex-shrink-0">
                  <img 
                    src="/images/mjplogo.jpg"
                    alt="MatchaJP logo"
                    className="h-full w-auto object-contain"
                    style={{ maxHeight: '32px' }}
                  />
                </div>
              </div>
            </div>
          )}
          
          {selectedBrandId && !isMatchaJPSelected ? (
            <div className="mt-6">
              <BrandNotificationSection selectedBrandId={selectedBrandId} />
            </div>
          ) : null}
          
          {!selectedBrandId && (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <p className="text-2xl font-medium text-gray-700 mb-2">
                  Select a website above to sign up for brand-specific notifications!
                </p>
              </div>
            </div>
          )}
          
          {selectedBrandId && (
            <div className="mt-6">
              <ProductGrid 
                products={products} 
                loading={loading}
                error={error}
                selectedBrandId={selectedBrandId}
                brands={brands}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
