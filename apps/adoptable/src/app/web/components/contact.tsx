'use client';

import { Header } from './Header';
import { Footer } from './Footer';
import { useRouter } from 'next/navigation';

export default function ContactPage() {
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
      <Header onNavigate={handleNavigate} currentPage="contact" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-[#333333] mb-8 text-center">Contact Us</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-semibold text-[#333333] mb-4">Get in Touch</h2>
            <p className="text-gray-600 mb-6">
              We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
            <div className="space-y-4">
              <div>
                <strong className="text-[#333333]">Address:</strong>
                <p className="text-gray-600">Peace Avenue 10<br />Ulaanbaatar, Mongolia</p>
              </div>
              <div>
                <strong className="text-[#333333]">Phone:</strong>
                <p className="text-gray-600">+976-11-123456</p>
              </div>
              <div>
                <strong className="text-[#333333]">Email:</strong>
                <p className="text-gray-600">info@yellowbook.mn</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-[#333333] mb-4">Business Hours</h3>
            <div className="space-y-2 text-gray-600">
              <div className="flex justify-between">
                <span>Monday - Friday:</span>
                <span>9:00 AM - 6:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Saturday:</span>
                <span>10:00 AM - 4:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Sunday:</span>
                <span>Closed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}