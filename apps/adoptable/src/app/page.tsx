import { Suspense } from 'react';
import { Hero } from './web/components/Hero';
import { CategoriesServer } from './web/components/CategoriesServer';
import { FeaturedCompaniesServer } from './web/components/FeaturedCompaniesServer';
import { YellowBookEntry } from '@adoptable/shared-contract';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

export const revalidate = 60;

async function getEntries(): Promise<YellowBookEntry[]> {
  try {
    console.log('Fetching from:', `${API_URL}/api/yellow-books`);
    const res = await fetch(`${API_URL}/api/yellow-books`, {
      next: { revalidate: 60 },
      cache: 'no-store',
    });

    console.log('Response status:', res.status);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Response error:', errorText);
      throw new Error(`Failed to fetch entries: ${res.status} ${errorText}`);
    }

    const data = await res.json();
    console.log('Fetched entries:', data.length);
    return data;
  } catch (error) {
    console.error('Error fetching entries:', error);
    return [];
  }
}


function CategoriesSkeleton() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="h-8 w-64 bg-gray-200 animate-pulse rounded mx-auto mb-4"></div>
          <div className="h-4 w-96 bg-gray-200 animate-pulse rounded mx-auto"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedCompaniesSkeleton() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="h-8 w-64 bg-gray-200 animate-pulse rounded mx-auto mb-4"></div>
          <div className="h-4 w-96 bg-gray-200 animate-pulse rounded mx-auto"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gray-200 animate-pulse rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 w-32 bg-gray-200 animate-pulse rounded mb-2"></div>
                  <div className="h-3 w-24 bg-gray-200 animate-pulse rounded"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full bg-gray-200 animate-pulse rounded"></div>
                <div className="h-3 w-3/4 bg-gray-200 animate-pulse rounded"></div>
              </div>
              <div className="mt-4 h-10 bg-gray-200 animate-pulse rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default async function Home() {
  const entries = await getEntries();

  return (
    <main className="min-h-screen">
      <Hero />

      <Suspense fallback={<CategoriesSkeleton />}>
        <CategoriesServer entries={entries} />
      </Suspense>

  
      <Suspense fallback={<FeaturedCompaniesSkeleton />}>
        <FeaturedCompaniesServer entries={entries} />
      </Suspense>
    </main>
  );
}

