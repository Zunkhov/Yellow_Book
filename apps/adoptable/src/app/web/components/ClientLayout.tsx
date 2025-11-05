'use client';

import { useState, ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [currentPage, setCurrentPage] = useState('home');

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header onNavigate={handleNavigate} currentPage={currentPage} />
      
      <main>
        {children}
      </main>
      
      <Footer />
    </div>
  );
}