'use client';

import dynamic from 'next/dynamic';
import { YellowBookEntry } from '@adoptable/shared-contract';
import { Card, CardContent } from '../ui/card';

const MapWithMarkers = dynamic(
  () => import('./MapWithMarkers'),
  {
    ssr: false,
    loading: () => (
      <div className="h-96 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Loading map...</p>
      </div>
    ),
  }
);

interface SearchMapIslandProps {
  entries: YellowBookEntry[];
}

export function SearchMapIsland({ entries }: SearchMapIslandProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <MapWithMarkers entries={entries} />
      </CardContent>
    </Card>
  );
}