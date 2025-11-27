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
      <Card className="border-2 border-dashed border-gray-300">
        <CardContent className="py-16 text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-700 text-xl font-semibold mb-2">Компани олдсонгүй</p>
          <p className="text-gray-500 text-sm">
            Шүүлт эсвэл хайлтын үгээ өөрчилж үзнэ үү
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
          className="border-2 border-gray-100 hover:border-[#FFD700] hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
        >
          <CardContent className="p-6">
            <Link href={`/yellow-books/${entry.id}`}>
              <div className="flex items-start gap-4 cursor-pointer group">
                {/* Logo */}
                <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-gray-100 to-gray-200 shadow-md group-hover:shadow-lg transition-shadow">
                  {entry.metadata?.logo ? (
                    <Image
                      src={entry.metadata.logo}
                      alt={entry.name}
                      width={80}
                      height={80}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#FFD700] to-[#FFA500] flex items-center justify-center text-white font-bold text-2xl">
                      {entry.name.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-xl font-bold text-[#333333] group-hover:text-[#FFD700] transition-colors">
                      {entry.name}
                    </h3>
                    <ArrowRight className="w-6 h-6 text-gray-300 group-hover:text-[#FFD700] group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </div>

                  <p className="text-gray-600 text-sm mt-2 line-clamp-2 leading-relaxed">
                    {entry.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 mt-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg">
                      <MapPin className="w-4 h-4 text-[#FFD700]" />
                      <span className="font-medium">
                        {entry.address.city}, {entry.address.state}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg">
                      <Phone className="w-4 h-4 text-[#FFD700]" />
                      <span className="font-medium">{entry.phone}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {entry.categories.slice(0, 3).map((cat) => (
                      <span
                        key={cat}
                        className="text-xs px-3 py-1.5 bg-gradient-to-r from-[#FFD700]/20 to-[#FFA500]/20 text-[#333333] rounded-full font-medium border border-[#FFD700]/30"
                      >
                        {cat}
                      </span>
                    ))}
                    {entry.categories.length > 3 && (
                      <span className="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full font-medium">
                        +{entry.categories.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}