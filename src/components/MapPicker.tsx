import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

interface MapPickerProps {
  latitude?: number;
  longitude?: number;
  onChange: (lat: number, lng: number) => void;
}

// Custom SVG Map Pin that matches the brand color and avoids asset bundler resolution issues in Vite
const customIcon = L.divIcon({
  html: `<div class="text-primary-medium"><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3" fill="#fff"/></svg></div>`,
  className: 'custom-leaflet-marker-icon',
  iconSize: [28, 28],
  iconAnchor: [14, 28]
});

const MapPicker: React.FC<MapPickerProps> = ({ latitude, longitude, onChange }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Standard fallback center: Presidente Prudente, SP (-22.1226, -51.3888)
    const initialLat = latitude && latitude !== 0 ? latitude : -22.1226;
    const initialLng = longitude && longitude !== 0 ? longitude : -51.3888;

    // Initialize map
    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 13,
      zoomControl: true
    });
    mapRef.current = map;

    // Google Maps Tile Layers (100% Free CDN integration without API Keys)
    const googleRoads = L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      attribution: '&copy; Google Maps'
    });

    const googleHybrid = L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      attribution: '&copy; Google Maps'
    });

    // Default layer
    googleRoads.addTo(map);

    // Layer control to toggle between standard map and satellite view
    const baseMaps = {
      "Mapa": googleRoads,
      "Satélite": googleHybrid
    };
    L.control.layers(baseMaps, undefined, { position: 'topright' }).addTo(map);

    // Create marker
    const marker = L.marker([initialLat, initialLng], {
      icon: customIcon,
      draggable: true
    }).addTo(map);
    markerRef.current = marker;

    // Update coordinates when marker is dragged
    marker.on('dragend', () => {
      const position = marker.getLatLng();
      onChange(Number(position.lat.toFixed(6)), Number(position.lng.toFixed(6)));
    });

    // Update coordinates when map is clicked
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      onChange(Number(lat.toFixed(6)), Number(lng.toFixed(6)));
    });

    // Cleanup on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Sync marker position when coordinates change from outside
  useEffect(() => {
    if (mapRef.current && markerRef.current && latitude && longitude && latitude !== 0 && longitude !== 0) {
      const currentPos = markerRef.current.getLatLng();
      if (currentPos.lat !== latitude || currentPos.lng !== longitude) {
        markerRef.current.setLatLng([latitude, longitude]);
        mapRef.current.panTo([latitude, longitude]);
      }
    }
  }, [latitude, longitude]);

  return (
    <div className="relative w-full">
      <div 
        ref={mapContainerRef} 
        className="h-64 w-full rounded-2xl overflow-hidden border border-gray-200 dark:border-zinc-800 shadow-sm relative z-10" 
      />
      <div className="text-[10px] text-gray-400 mt-1 font-sans">
        Dica: Clique no mapa ou arraste o alfinete para definir a localização exata do imóvel. Alterne no topo direito para visão de Satélite.
      </div>
    </div>
  );
};

export default MapPicker;
