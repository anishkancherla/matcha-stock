'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white text-gray-900 shadow-md" style={{ fontFamily: 'var(--roobert-mono-font)' }}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold flex items-center pl-4 md:pl-6" style={{ fontFamily: 'var(--roobert-mono-font)' }}>
            Matcha Restock
          </Link>
          
          <div className="hidden md:flex space-x-6" style={{ fontFamily: 'var(--roobert-mono-font)' }}>
            <Link href="/about" className="hover:text-gray-600 transition-colors">
              About
            </Link>
          </div>
          
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-900 focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        
        {isMenuOpen && (
          <div className="md:hidden mt-4 space-y-3 pb-3" style={{ fontFamily: 'var(--roobert-mono-font)' }}>
            <Link href="/about" className="block hover:text-gray-600 transition-colors">
              About
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 