'use client';

import { useEffect, useRef, useState } from 'react';
import { YellowBookEntry } from '@adoptable/shared-contract';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Leaflet marker icon fix
const createIcon = () =>
  L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

interface MapWithMarkersProps {
  entries: YellowBookEntry[];
}

export default function MapWithMarkers({ entries }: MapWithMarkersProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !containerRef.current || entries.length === 0) return;

    // Calculate center
    const centerLat = entries.reduce((sum, e) => sum + e.location.lat, 0) / entries.length;
    const centerLng = entries.reduce((sum, e) => sum + e.location.lng, 0) / entries.length;

    // Cleanup previous map
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    try {
      // Initialize map
      mapRef.current = L.map(containerRef.current, {
        center: [centerLat, centerLng],
        zoom: 12,
        scrollWheelZoom: true,
      });

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(mapRef.current);

      // Add markers
      const bounds = L.latLngBounds([]);
      const icon = createIcon();

      entries.forEach((entry) => {
        const logo = entry.metadata?.logo;
        const logoHtml = logo 
          ? `<img src="${logo}" alt="${entry.name}" style="width: 48px; height: 48px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;" />`
          : `<div style="width: 48px; height: 48px; background: #FFD700; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 8px; font-weight: bold; font-size: 20px; color: #333;">${entry.name.charAt(0)}</div>`;
        
        const marker = L.marker([entry.location.lat, entry.location.lng], { icon })
          .addTo(mapRef.current!)
          .bindPopup(
            `
            <div style="min-width: 200px;">
              ${logoHtml}
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

        markersRef.current.push(marker);
        bounds.extend([entry.location.lat, entry.location.lng]);
      });

      // Fit bounds
      if (entries.length > 1) {
        mapRef.current.fitBounds(bounds, { padding: [50, 50] });
      } else {
        mapRef.current.setView([entries[0].location.lat, entries[0].location.lng], 14);
      }
    } catch (error) {
      console.error('Error initializing map:', error);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [isMounted, entries]);

  if (!isMounted) {
    return (
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Loading map...</p>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">No locations to display</p>
      </div>
    );
  }

  return <div ref={containerRef} className="h-96 rounded-lg" />;
}