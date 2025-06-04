'use client';

import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white text-gray-900 py-8 border-t border-gray-200">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">Matcha Stock</h3>
            <p className="text-gray-600 text-sm">
              Track the availabilityyyy of your favorite matcha blends from top brands and get notified when they're back in stock!
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-600 hover:text-gray-900 transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Brands We Track</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://ippodotea.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Ippodo Tea
                </a>
              </li>
              <li>
                <a 
                  href="https://rockysmatcha.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Rocky's Matcha
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-6 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Matcha Stock. All rights reserved.</p>
          <p className="mt-2">
            This site is not affiliated with any matcha brand. We just love great matcha!
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 