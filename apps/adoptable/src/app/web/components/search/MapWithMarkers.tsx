'use client';

import { useEffect, useRef } from 'react';
import { YellowBookEntry } from '@adoptable/shared-contract';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MapWithMarkersProps {
  entries: YellowBookEntry[];
}

export default function MapWithMarkers({ entries }: MapWithMarkersProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || entries.length === 0) return;

    // Calculate center and bounds
    const lats = entries.map((e) => e.location.lat);
    const lngs = entries.map((e) => e.location.lng);

    const centerLat = lats.reduce((a, b) => a + b, 0) / lats.length;
    const centerLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;

    // Initialize map
    if (!mapRef.current) {
      mapRef.current = L.map(containerRef.current, {
        center: [centerLat, centerLng],
        zoom: 12,
        scrollWheelZoom: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(mapRef.current);
    }

    // Clear existing markers
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        mapRef.current?.removeLayer(layer);
      }
    });

    // Add markers
    const bounds = L.latLngBounds([]);

    entries.forEach((entry) => {
      const marker = L.marker([entry.location.lat, entry.location.lng])
        .addTo(mapRef.current!)
        .bindPopup(
          `
          <div style="min-width: 200px;">
            <h3 style="font-weight: bold; margin-bottom: 8px;">${entry.name}</h3>
            <p style="font-size: 12px; color: #666; margin-bottom: 8px;">${entry.categories[0]}</p>
            <p style="font-size: 12px; margin-bottom: 8px;">${entry.address.street}</p>
            <a 
              href="/yellow-books/${entry.id}" 
              style="color: #FFD700; font-weight: 600; text-decoration: none;"
            >
              View Details →
            </a>
          </div>
        `
        );

      bounds.extend([entry.location.lat, entry.location.lng]);
    });

    // Fit bounds to show all markers
    if (entries.length > 1) {
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    } else {
      mapRef.current.setView([entries[0].location.lat, entries[0].location.lng], 14);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [entries]);

  if (entries.length === 0) {
    return (
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">No locations to display</p>
      </div>
    );
  }

  return <div ref={containerRef} className="h-96 rounded-lg" />;
}