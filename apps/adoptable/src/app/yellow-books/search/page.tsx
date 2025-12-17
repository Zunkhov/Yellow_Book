import { Suspense } from 'react';
import { SearchFilters } from '../../web/components/search/SearchFilters';
import { SearchResults } from '../../web/components/search/SearchResults';
import { SearchMapIsland } from '../../web/components/search/SearchMapIsland';
import { YellowBookEntry } from '@adoptable/shared-contract';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

async function searchEntries(searchParams: {
  q?: string;
  category?: string;
  city?: string;
  sort?: string;
}): Promise<YellowBookEntry[]> {
  try {
    const res = await fetch(`${API_URL}/api/yellow-books`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      console.error('Failed to fetch entries');
      return [];
    }

    let entries: YellowBookEntry[] = await res.json();

    if (searchParams.q) {
      const query = searchParams.q.toLowerCase();
      entries = entries.filter(
        (e) =>
          e.name.toLowerCase().includes(query) ||
          e.description.toLowerCase().includes(query) ||
          e.categories.some((cat) => cat.toLowerCase().includes(query))
      );
    }

    if (searchParams.category) {
      entries = entries.filter((e) =>
        e.categories.some(
          (cat) => cat.toLowerCase() === searchParams.category?.toLowerCase()
        )
      );
    }

    if (searchParams.city) {
      entries = entries.filter(
        (e) => e.address.city.toLowerCase() === searchParams.city?.toLowerCase()
      );
    }

    if (searchParams.sort === 'name') {
      entries.sort((a, b) => a.name.localeCompare(b.name));
    } else if (searchParams.sort === 'city') {
      entries.sort((a, b) => a.address.city.localeCompare(b.address.city));
    }

    console.log(`🔍 Search results: ${entries.length} entries`);

    return entries;
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}

async function getFilterOptions(): Promise<{
  categories: string[];
  cities: string[];
}> {
  try {
    const res = await fetch(`${API_URL}/api/yellow-books`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) return { categories: [], cities: [] };

    const entries: YellowBookEntry[] = await res.json();

    const categories = Array.from(
      new Set(entries.flatMap((e) => e.categories))
    ).sort();

    const cities = Array.from(
      new Set(entries.map((e) => e.address.city))
    ).sort();

    return { categories, cities };
  } catch (err) {
    console.error("Filter fetch error:", err);
    return { categories: [], cities: [] };
  }
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { q?: string; category?: string };
}) {
  const query = searchParams.q || searchParams.category || 'Companies';

  return {
    title: `Search: ${query} | Yellow Book`,
    description: `Find ${query} in our business directory`,
  };
}

function FiltersSkeleton() {
  return (
    <div className="space-y-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow p-6">
          <div className="h-6 w-32 bg-gray-200 animate-pulse rounded mb-4"></div>
          <div className="space-y-2">
            {[...Array(3)].map((_, j) => (
              <div key={j} className="h-10 bg-gray-200 animate-pulse rounded"></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function MapSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="h-96 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Loading map...</p>
      </div>
    </div>
  );
}

function ResultsSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gray-200 animate-pulse rounded-lg"></div>
            <div className="flex-1 space-y-3">
              <div className="h-6 w-48 bg-gray-200 animate-pulse rounded"></div>
              <div className="h-4 w-full bg-gray-200 animate-pulse rounded"></div>
              <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string; city?: string; sort?: string };
}) {
  const [entries, filterOptions] = await Promise.all([
    searchEntries(searchParams),
    getFilterOptions(),
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Results Summary */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-gray-600">
            <span className="font-semibold text-[#333333]">{entries.length}</span> компани олдлоо
            {searchParams.q && <span> - &quot;{searchParams.q}&quot;</span>}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Suspense fallback={<FiltersSkeleton />}>
              <SearchFilters
                categories={filterOptions.categories}
                cities={filterOptions.cities}
                currentParams={searchParams}
              />
            </Suspense>
          </div>

          <div className="lg:col-span-3 space-y-6">
            <Suspense fallback={<MapSkeleton />}>
              <SearchMapIsland entries={entries} />
            </Suspense>

            <Suspense fallback={<ResultsSkeleton />}>
              <SearchResults entries={entries} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

export const revalidate = 60;