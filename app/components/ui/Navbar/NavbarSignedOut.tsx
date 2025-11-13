'use client'
import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';

export default function NavbarSignedOut() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const links = [
    {
      key: 'explore',
      name: 'Explore',
      path: '/explore'
    },
    {
      key: 'problems',
      name: 'Problems',
      path: '/problems'
    },
    {
      key: 'product',
      name: 'Product',
      path: '/product'
    },
    {
      key: 'developer',
      name: 'Developer',
      path: '/developer'
    },
    {
      key: 'internship', 
      name: 'Internship',
      path: '/internship'
    }
  ];

  return (
    <nav className="bg-[#262626] text-white border-b border-neutral-800 w-full">
      <div className="flex items-center justify-between py-3 px-4 sm:px-6 lg:px-8">
        <Link className="flex-shrink-0" href="/">
          <div className="h-8 w-8 bg-green-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">A</span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-6 lg:gap-8 text-neutral-300">
          {links.map((link) => (
            <Link
              className="cursor-pointer text-sm transition-colors hover:text-white"
              href={link.path}
              key={link.key}
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <Link
            href="/login"
            className="px-3 lg:px-4 py-2 text-sm font-medium text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#262626] focus:ring-green-500"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="px-3 lg:px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg hover:shadow-green-500/30 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#262626] focus:ring-green-500"
          >
            Sign Up
          </Link>
        </div>

        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="sm:hidden p-2 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div
        className={`sm:hidden border-t border-neutral-800 bg-[#262626] overflow-hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 py-3 space-y-1">
          {links.map((link, index) => (
            <Link
              key={link.key}
              href={link.path}
              className={`block px-3 py-2 text-sm text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg transition-all duration-200 transform ${
                isMenuOpen
                  ? 'translate-x-0 opacity-100'
                  : '-translate-x-4 opacity-0'
              }`}
              style={{
                transitionDelay: isMenuOpen ? `${index * 50}ms` : '0ms'
              }}
              onClick={() => setIsMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="px-4 py-3 border-t border-neutral-800 space-y-2">
          <Link
            href="/login"
            className={`block w-full px-4 py-2 text-sm text-center font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white rounded-lg transition-all duration-200 transform focus:outline-none focus:ring-2 focus:ring-green-500 ${
              isMenuOpen
                ? 'translate-x-0 opacity-100'
                : '-translate-x-4 opacity-0'
            }`}
            style={{
              transitionDelay: isMenuOpen ? `${links.length * 50}ms` : '0ms'
            }}
            onClick={() => setIsMenuOpen(false)}
          >
            Login
          </Link>
          <Link
            href="/signup"
            className={`block w-full px-4 py-2 text-sm text-center font-semibold text-white bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-md transition-all duration-200 transform hover:shadow-lg hover:shadow-green-500/30 focus:outline-none focus:ring-2 focus:ring-green-500 ${
              isMenuOpen
                ? 'translate-x-0 opacity-100'
                : '-translate-x-4 opacity-0'
            }`}
            style={{
              transitionDelay: isMenuOpen ? `${(links.length + 1) * 50}ms` : '0ms'
            }}
            onClick={() => setIsMenuOpen(false)}
          >
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
}