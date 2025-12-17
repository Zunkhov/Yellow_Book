'use client';

import { Search, Menu } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AuthButton } from '@/components/AuthButton';

export function Header() {
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            href="/"
            className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-[#FFD700] rounded-lg flex items-center justify-center mr-2">
              <span className="text-[#333333] text-lg font-bold">YB</span>
            </div>
            <span className="text-xl font-bold text-[#333333]">Шар ном</span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search companies..."
                className="pl-10 pr-4 py-2 w-full border-gray-300 rounded-lg focus:ring-[#FFD700] focus:border-[#FFD700]"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors hover:text-[#FFD700] ${
                isActive('/') ? 'text-[#FFD700]' : 'text-[#333333]'
              }`}
            >
              Home
            </Link>
            <Link
              href="/yellow-books/search"
              className={`text-sm font-medium transition-colors hover:text-[#FFD700] ${
                isActive('/yellow-books') ? 'text-[#FFD700]' : 'text-[#333333]'
              }`}
            >
              Companies
            </Link>
            <Link
              href="/yellow-books/assistant"
              className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-[#FFD700] ${
                isActive('/yellow-books/assistant') ? 'text-[#FFD700]' : 'text-[#333333]'
              }`}
            >
              <span>🤖</span>
              AI Assistant
            </Link>
            <Link
              href="/about"
              className={`text-sm font-medium transition-colors hover:text-[#FFD700] ${
                isActive('/about') ? 'text-[#FFD700]' : 'text-[#333333]'
              }`}
            >
              About
            </Link>
            <Link
              href="/contact"
              className={`text-sm font-medium transition-colors hover:text-[#FFD700] ${
                isActive('/contact') ? 'text-[#FFD700]' : 'text-[#333333]'
              }`}
            >
              Contact
            </Link>
            
            <AuthButton />
          </nav>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}