import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom ISS icon matching reference (satellite style or simple circle)
const issIcon = L.divIcon({
  html: `<div class="relative">
    <div class="w-8 h-8 bg-blue-500/20 border-2 border-red-500 rounded-full flex items-center justify-center animate-pulse">
      <div class="w-2 h-2 bg-red-500 rounded-full"></div>
    </div>
    <div class="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full blur-[2px]"></div>
  </div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

function RecenterMap({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom());
    }
  }, [position]);
  return null;
}

export default function ISSMap({ issLocation, path }) {
  const center = issLocation ? [issLocation.lat, issLocation.lon] : [0, 0];

  return (
    <div className="w-full h-full bg-blue-100/50 dark:bg-blue-900/20">
      <MapContainer
        center={center}
        zoom={3}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" // Cleaner map style matching reference
        />
        
        {issLocation && (
          <>
            <Marker position={[issLocation.lat, issLocation.lon]} icon={issIcon} />
            <RecenterMap position={[issLocation.lat, issLocation.lon]} />
          </>
        )}

        {path.length > 1 && (
          <Polyline
            positions={path}
            color="#EF4444" // Red matching reference
            weight={2}
            opacity={0.8}
          />
        )}
      </MapContainer>
    </div>
  );
}
