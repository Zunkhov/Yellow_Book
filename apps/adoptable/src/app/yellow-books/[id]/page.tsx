import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { YellowBookEntry } from '@adoptable/shared-contract';
import { CompanyDetails } from '../../web/components/CompanyDetails';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

// SSG - Generate static params for all entries
export async function generateStaticParams() {
  try {
    const res = await fetch(`${API_URL}/api/yellow-books`, {
      next: { revalidate: 3600 }
    });
    
    if (!res.ok) {
      console.error('Failed to fetch entries for static params');
      return [];
    }
    
    const entries: YellowBookEntry[] = await res.json();
    
    console.log(`🔨 SSG: Generating ${entries.length} static pages`);
    
    return entries.map((entry) => ({
      id: entry.id,
    }));
  } catch (error) {
    console.error('Error in generateStaticParams:', error);
    return [];
  }
}

// Allow dynamic params for new entries
export const dynamicParams = true;
export const revalidate = 3600; // Revalidate every hour

async function getEntry(id: string): Promise<YellowBookEntry | null> {
  try {
    const res = await fetch(`${API_URL}/api/yellow-books/${id}`, {
      next: { 
        tags: [`entry-${id}`],
        revalidate: 3600
      }
    });
    
    if (!res.ok) {
      return null;
    }
    
    return res.json();
  } catch (error) {
    console.error(`Error fetching entry ${id}:`, error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const entry = await getEntry(params.id);
  
  if (!entry) {
    return {
      title: 'Company Not Found | Yellow Book',
    };
  }
  
  return {
    title: `${entry.name} | Yellow Book`,
    description: entry.description,
    keywords: entry.categories.join(', '),
  };
}

function DetailsSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-16 bg-white border-b animate-pulse"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="h-10 w-32 bg-gray-200 animate-pulse rounded"></div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="h-8 w-64 bg-gray-200 animate-pulse rounded mb-4"></div>
              <div className="h-4 w-full bg-gray-200 animate-pulse rounded mb-2"></div>
              <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded"></div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="h-64 bg-gray-200 animate-pulse rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function CompanyPage({ params }: { params: { id: string } }) {
  const entry = await getEntry(params.id);
  
  if (!entry) {
    notFound();
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link 
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-[#FFD700] transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
        </div>
      </header>
      
      <Suspense fallback={<DetailsSkeleton />}>
        <CompanyDetails entry={entry} />
      </Suspense>
    </div>
  );
}