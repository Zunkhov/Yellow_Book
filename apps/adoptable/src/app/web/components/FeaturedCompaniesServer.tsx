import { YellowBookEntry } from '@adoptable/shared-contract';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { MapPin, Phone } from 'lucide-react';

interface FeaturedCompaniesServerProps {
  entries: YellowBookEntry[];
}

export function FeaturedCompaniesServer({ entries }: FeaturedCompaniesServerProps) {
  // Show first 8 entries as featured
  const featured = entries.slice(0, 8);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#333333] mb-4">
            Featured Companies
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Discover top-rated businesses in your area
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((entry) => {
            const logo = entry.metadata?.logo;

            return (
              <Link key={entry.id} href={`/yellow-books/${entry.id}`}>
                <Card className="group h-full hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-3">
                      {logo ? (
                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                          <Image
                            src={logo}
                            alt={entry.name}
                            width={48}
                            height={48}
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-xl font-bold text-white">
                            {entry.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base group-hover:text-[#FFD700] transition-colors truncate">
                          {entry.name}
                        </CardTitle>
                        <Badge variant="secondary" className="bg-[#FFD700]/20 text-[#333333] text-xs mt-1">
                          {entry.categories[0]}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                      {entry.description}
                    </p>

                    <div className="space-y-2 text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3 text-[#FFD700]" />
                        <span className="truncate">{entry.address.city}, {entry.address.state}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3 h-3 text-[#FFD700]" />
                        <span>{entry.phone}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
