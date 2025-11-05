'use client';

import { YellowBookEntry } from '@adoptable/shared-contract';
import { Card, CardContent } from '../ui/card';
import { MapPin, Phone, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface SearchResultsProps {
  entries: YellowBookEntry[];
}

export function SearchResults({ entries }: SearchResultsProps) {
  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-gray-600 text-lg">No companies found</p>
          <p className="text-gray-500 text-sm mt-2">
            Try adjusting your filters or search query
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <Card
          key={entry.id}
          className="hover:shadow-lg transition-shadow duration-300"
        >
          <CardContent className="p-6">
            <Link href={`/yellow-books/${entry.id}`}>
              <div className="flex items-start gap-4 cursor-pointer group">
                {/* Logo */}
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                  {entry.metadata?.logo ? (
                    <Image
                      src={entry.metadata.logo}
                      alt={entry.name}
                      width={64}
                      height={64}
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-xl">
                      {entry.name.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-[#333333] group-hover:text-[#FFD700] transition-colors truncate">
                    {entry.name}
                  </h3>

                  <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                    {entry.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {entry.address.city}, {entry.address.state}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      <span>{entry.phone}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {entry.categories.slice(0, 3).map((cat) => (
                      <span
                        key={cat}
                        className="text-xs px-2 py-1 bg-[#FFD700]/20 text-[#333333] rounded"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Arrow */}
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#FFD700] transition-colors flex-shrink-0 mt-1" />
              </div>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}