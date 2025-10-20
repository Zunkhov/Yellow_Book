"use client"; 

import { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Categories } from './components/Categories';
import { FeaturedCompanies } from './components/FeaturedCompanies';
import { Footer } from './components/Footer';
import { CompanyDetails } from './components/CompanyDetails';
import { companies } from './data/mockData';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    setSelectedCompanyId(null);
  };

  const handleCompanyClick = (companyId: string) => {
    setSelectedCompanyId(companyId);
    setCurrentPage('company-details');
  };

  const handleCategoryClick = (category: string) => {
    setCurrentPage('companies');
    // In a real app, you'd filter companies by category
  };

  const selectedCompany = selectedCompanyId 
    ? companies.find(c => c.id === selectedCompanyId)
    : null;

  const renderContent = () => {
    if (currentPage === 'company-details' && selectedCompany) {
      return (
        <CompanyDetails
          company={selectedCompany}
          onBack={() => handleNavigate('home')}
        />
      );
    }

    if (currentPage === 'about') {
      return (
        <div className="min-h-screen bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <h1 className="text-4xl font-bold text-[#333333] mb-8 text-center">About Yellow Book</h1>
            <div className="prose prose-lg mx-auto text-gray-600">
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
        </div>
      );
    }

    if (currentPage === 'contact') {
      return (
        <div className="min-h-screen bg-white">
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
                    <p className="text-gray-600">123 Business Ave, Suite 100<br />San Francisco, CA 94102</p>
                  </div>
                  <div>
                    <strong className="text-[#333333]">Phone:</strong>
                    <p className="text-gray-600">+1 (555) 123-4567</p>
                  </div>
                  <div>
                    <strong className="text-[#333333]">Email:</strong>
                    <p className="text-gray-600">info@yellowbook.com</p>
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
        </div>
      );
    }

    if (currentPage === 'companies') {
      return (
        <div className="min-h-screen bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <h1 className="text-4xl font-bold text-[#333333] mb-8 text-center">All Companies</h1>
            <FeaturedCompanies onCompanyClick={handleCompanyClick} />
          </div>
        </div>
      );
    }

    // Default home page
    return (
      <>
        <Hero />
        <Categories onCategoryClick={handleCategoryClick} />
        <FeaturedCompanies onCompanyClick={handleCompanyClick} />
      </>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <Header onNavigate={handleNavigate} currentPage={currentPage} />
      {renderContent()}
      {currentPage !== 'company-details' && <Footer />}
    </div>
  );
}