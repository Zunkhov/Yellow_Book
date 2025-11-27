'use client';

import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main>
        {children}
      </main>
      
      <Footer />
    </div>
  );
}