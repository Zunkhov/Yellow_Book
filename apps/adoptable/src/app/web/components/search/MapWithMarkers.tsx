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
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!containerRef.current || entries.length === 0) return;

    // Агуу сайн cleanup хийх
    const cleanup = () => {
      // Clean up markers
      markersRef.current.forEach(marker => {
        try {
          marker.remove();
        } catch (e) {
          // Ignore
        }
      });
      markersRef.current = [];

      // Clean up map
      if (mapRef.current) {
        try {
          mapRef.current.off();
          mapRef.current.remove();
        } catch (e) {
          console.error('Error removing map:', e);
        }
        mapRef.current = null;
      }

      // DOM-г бүрэн цэвэрлэх - Leaflet internal state арилгах
      if (containerRef.current) {
        // Leaflet-ийн internal ID-г арилгах
        delete (containerRef.current as any)._leaflet_id;
        containerRef.current.innerHTML = '';
      }
    };

    cleanup();

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      if (!containerRef.current) return;

      // Calculate center and bounds
      const lats = entries.map((e) => e.location.lat);
      const lngs = entries.map((e) => e.location.lng);

      const centerLat = lats.reduce((a, b) => a + b, 0) / lats.length;
      const centerLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;

      try {
        // Шинэ div үүсгэх - огт цэвэр DOM element
        const mapDiv = document.createElement('div');
        mapDiv.style.width = '100%';
        mapDiv.style.height = '100%';
        mapDiv.style.borderRadius = '0.5rem';
        containerRef.current.appendChild(mapDiv);
        
        // Initialize map шинэ div дээр
        mapRef.current = L.map(mapDiv, {
          center: [centerLat, centerLng],
          zoom: 12,
          scrollWheelZoom: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
        }).addTo(mapRef.current);

        // Add markers
        const bounds = L.latLngBounds([]);

        entries.forEach((entry) => {
          const logo = entry.metadata?.logo;
          const logoHtml = logo 
            ? `<img src="${logo}" alt="${entry.name}" style="width: 48px; height: 48px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;" />`
            : `<div style="width: 48px; height: 48px; background: #FFD700; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 8px; font-weight: bold; font-size: 20px; color: #333;">${entry.name.charAt(0)}</div>`;
          
          const marker = L.marker([entry.location.lat, entry.location.lng])
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

        // Fit bounds to show all markers
        if (entries.length > 1) {
          mapRef.current.fitBounds(bounds, { padding: [50, 50] });
        } else {
          mapRef.current.setView([entries[0].location.lat, entries[0].location.lng], 14);
        }
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    }, 150);

    return () => {
      clearTimeout(timeoutId);
      cleanup();
    };
  }, [entries]);

  if (entries.length === 0) {
    return (
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">No locations to display</p>
      </div>
    );
  }

  const mapKey = `map-${entries.length}-${entries[0]?.id || 'default'}`;

  return (
    <div 
      key={mapKey}
      ref={containerRef} 
      className="h-96 rounded-lg" 
    />
  );
}