import Link from 'next/link';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <AlertCircle className="w-16 h-16 text-[#FFD700] mx-auto mb-6" />
        
        <h1 className="text-6xl font-bold text-[#333333] mb-4">404</h1>
        
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Company Not Found
        </h2>
        
        <p className="text-gray-600 mb-8">
          The company you&apos;re looking for doesn&apos;t exist or has been removed from our directory.
        </p>
        
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 bg-[#FFD700] text-[#333333] font-semibold rounded-lg hover:bg-[#FFD700]/90 transition-colors shadow-md"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}