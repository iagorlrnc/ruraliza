import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

interface MapViewProps {
  latitude?: number;
  longitude?: number;
  popupText?: string;
  zoom?: number;
}

// Custom SVG Map Pin matching the brand colors and avoiding path resolution issues in build environments
const customIcon = L.divIcon({
  html: `<div class="text-primary-medium"><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3" fill="#fff"/></svg></div>`,
  className: 'custom-leaflet-marker-icon',
  iconSize: [28, 28],
  iconAnchor: [14, 28]
});

const MapView: React.FC<MapViewProps> = ({ latitude, longitude, popupText, zoom = 15 }) => {
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
      zoom: zoom,
      zoomControl: true,
      scrollWheelZoom: false // disable scroll wheel zoom to allow standard page scrolling
    });
    mapRef.current = map;

    // Google Maps Tile Layers (CDN based integration, free from API key limits)
    const googleRoads = L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      attribution: '&copy; Google Maps'
    });

    const googleHybrid = L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      attribution: '&copy; Google Maps'
    });

    // Default layer setup
    googleRoads.addTo(map);

    const baseMaps = {
      "Mapa": googleRoads,
      "Satélite": googleHybrid
    };
    L.control.layers(baseMaps, undefined, { position: 'topright' }).addTo(map);

    // Create non-draggable marker
    const marker = L.marker([initialLat, initialLng], {
      icon: customIcon,
      draggable: false
    }).addTo(map);
    markerRef.current = marker;

    if (popupText) {
      marker.bindPopup(`<div style="font-family: 'Poppins', sans-serif; font-size: 11px; font-weight: bold; color: #1e3a1e;">${popupText}</div>`).openPopup();
    }

    // Cleanup on component unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [latitude, longitude, popupText, zoom]);

  // Sync position if coordinates change dynamically
  useEffect(() => {
    if (mapRef.current && markerRef.current && latitude && longitude && latitude !== 0 && longitude !== 0) {
      const currentPos = markerRef.current.getLatLng();
      if (currentPos.lat !== latitude || currentPos.lng !== longitude) {
        markerRef.current.setLatLng([latitude, longitude]);
        mapRef.current.setView([latitude, longitude], zoom);
      }
    }
  }, [latitude, longitude, zoom]);

  return (
    <div 
      ref={mapContainerRef} 
      className="h-full w-full relative z-10" 
    />
  );
};

export default MapView;
