'use client'; // ← ADD THIS LINE

import { ArrowLeft, MapPin, Phone, Mail, Globe, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { YellowBookEntry } from '@adoptable/shared-contract';
import dynamic from 'next/dynamic';
import Image from 'next/image';

const MapIsland = dynamic(() => import('./MapIsland'), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-200 animate-pulse rounded-lg" />,
});

interface CompanyDetailsProps {
  entry: YellowBookEntry;
  onBack?: () => void; // ← Make optional
}

export function CompanyDetails({ entry, onBack }: CompanyDetailsProps) {
  const gallery = entry.metadata?.images ?? [];
  const logo = entry.metadata?.logo;
  const founded = entry.metadata?.founded;
  const services = entry.metadata?.services ?? [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            {onBack && ( // ← Only show if onBack provided
              <Button
                variant="ghost"
                onClick={onBack}
                className="mb-0 hover:bg-[#FFD700]/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Directory
              </Button>
            )}

            <div className="flex items-center gap-4 ml-2">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                {logo ? (
                  <Image src={logo} alt={entry.name} width={64} height={64} className="object-cover" />
                ) : (
                  <div className="text-xl font-bold text-[#333333]">{entry.name.charAt(0)}</div>
                )}
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#333333]">
                  {entry.name}
                </h1>
                <p className="text-gray-600 text-sm sm:text-base mt-1">
                  {entry.description}
                </p>

                <div className="flex items-center gap-3 mt-3 flex-wrap">
                  {entry.categories.map((cat) => (
                    <Badge key={cat} variant="secondary" className="bg-[#FFD700]/20 text-[#333333]">
                      {cat}
                    </Badge>
                  ))}

                  {founded && (
                    <span className="inline-flex items-center text-xs text-gray-500 bg-white border px-2 py-1 rounded">
                      <Calendar className="w-4 h-4 mr-2 text-[#FFD700]" />
                      Founded {founded}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-[#333333]">About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  {entry.description}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-[#333333]">Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {services.map((s: string) => (
                    <div key={s} className="flex items-center gap-3 bg-gray-50 p-3 rounded">
                      <span className="w-2 h-2 rounded-full bg-[#FFD700] inline-block" />
                      <span className="text-sm text-gray-700">{s}</span>
                    </div>
                  ))}
                  {services.length === 0 && (
                    <p className="text-sm text-gray-500">No services listed.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-[#333333]">Gallery</CardTitle>
              </CardHeader>
              <CardContent>
                {gallery.length > 0 ? (
                  <div className="flex gap-3 overflow-x-auto py-2">
                    {gallery.map((src, idx) => (
                      <div key={idx} className="w-40 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                        <Image src={src} alt={`${entry.name}-img-${idx}`} width={320} height={192} className="object-cover" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No images available.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-[#333333]">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-[#FFD700] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-[#333333]">Address</p>
                    <address className="text-gray-600 text-sm not-italic">
                      {entry.address.street}<br />
                      {entry.address.city}, {entry.address.state} {entry.address.postalCode}<br />
                      {entry.address.country}
                    </address>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-[#FFD700] flex-shrink-0" />
                  <div>
                    <p className="font-medium text-[#333333]">Phone</p>
                    <a
                      href={`tel:${entry.phone}`}
                      className="text-gray-600 text-sm hover:text-[#FFD700]"
                    >
                      {entry.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-[#FFD700] flex-shrink-0" />
                  <div>
                    <p className="font-medium text-[#333333]">Email</p>
                    <a
                      href={`mailto:${entry.email}`}
                      className="text-gray-600 text-sm hover:text-[#FFD700]"
                    >
                      {entry.email}
                    </a>
                  </div>
                </div>

                {entry.website && (
                  <div className="flex items-center space-x-3">
                    <Globe className="w-5 h-5 text-[#FFD700] flex-shrink-0" />
                    <div>
                      <p className="font-medium text-[#333333]">Website</p>
                      <a
                        href={entry.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 text-sm hover:text-[#FFD700] break-all"
                      >
                        {entry.website}
                      </a>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-[#333333]">Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full h-56 rounded-lg overflow-hidden bg-gray-100">
                  <MapIsland
                    lat={entry.location.lat}
                    lng={entry.location.lng}
                    name={entry.name}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}