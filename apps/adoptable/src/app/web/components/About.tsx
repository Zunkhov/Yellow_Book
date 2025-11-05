'use client';

import { Header } from './Header';
import { Footer } from './Footer';
import { useRouter } from 'next/navigation';

export default function AboutPage() {
  const router = useRouter();

  const handleNavigate = (page: string) => {
    if (page === 'home') {
      router.push('/');
    } else if (page === 'companies') {
      router.push('/yellow-books');
    } else if (page === 'contact') {
      router.push('/contact');
    } else if (page === 'about') {
      router.push('/about');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header onNavigate={handleNavigate} currentPage="about" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-[#333333] mb-8 text-center">
          About Yellow Book
        </h1>
        <div className="prose prose-lg mx-auto text-gray-600 space-y-4">
          <p>
            Yellow Book is your premier business directory, connecting communities with local 
            companies, services, and organizations. Since our founding, we've been dedicated 
            to making it easy for people to discover and connect with businesses in their area.
          </p>
          <p>
            Our mission is to create a comprehensive, user-friendly platform that benefits 
            both consumers looking for services and businesses seeking to reach new customers. 
            We believe in the power of local commerce and the importance of strong community connections.
          </p>
          <p>
            Whether you're searching for a restaurant, need professional services, or looking 
            to promote your own business, Yellow Book is here to help you make those important connections.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}