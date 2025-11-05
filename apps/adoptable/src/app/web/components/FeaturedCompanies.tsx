'use client';

import { YellowBookEntry } from '@adoptable/shared-contract';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface FeaturedCompaniesProps {
  entries: YellowBookEntry[];
  onCompanyClick?: (id: string) => void;
}

export function FeaturedCompanies({ entries, onCompanyClick }: FeaturedCompaniesProps) {
  const router = useRouter();

  const handleClick = (id: string) => {
    if (onCompanyClick) {
      onCompanyClick(id);
    } else {
      router.push(`/yellow-books/${id}`);
    }
  };

  const featuredEntries = entries.slice(0, 4); // 4 companies for grid

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#333333] mb-4">
            Featured Companies
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Discover top-rated businesses and organizations in our directory
          </p>
        </div>

        {featuredEntries.length === 0 ? (
          <div className="text-center text-gray-600">
            <p>No listings available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredEntries.map((entry) => {
              return (
                <Card
                  key={entry.id}
                  className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md overflow-hidden bg-white"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                        {entry.metadata?.logo ? (
                          <Image
                            src={entry.metadata.logo}
                            alt={entry.name}
                            width={48}
                            height={48}
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                            {entry.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base text-[#333333] group-hover:text-[#FFD700] transition-colors truncate">
                          {entry.name}
                        </h3>
                        <p className="text-xs text-gray-500 capitalize truncate">
                          {entry.categories[0]}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0 space-y-4">
                    <p className="text-sm text-gray-600 line-clamp-3 min-h-[60px]">
                      {entry.description}
                    </p>
                    
                    <div className="text-xs text-gray-500 space-y-1">
                      <p className="truncate">
                        {entry.address.street}, {entry.address.city}, {entry.address.state} {entry.address.postalCode}
                      </p>
                      {entry.metadata?.founded && (
                        <p>Founded: {entry.metadata.founded}</p>
                      )}
                    </div>

                    <Button
                      onClick={() => handleClick(entry.id)}
                      className="w-full bg-[#FFD700] hover:bg-[#FFD700]/90 text-[#333333] font-semibold transition-colors"
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}