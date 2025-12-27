'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';
import 'leaflet/dist/leaflet.css';

interface MapPickerProps {
  latitude: number;
  longitude: number;
  onLocationChange: (lat: number, lng: number) => void;
  address?: string;
  userLocation?: { lat: number; lng: number } | null;
}

export const MapPicker: React.FC<MapPickerProps> = ({
  latitude,
  longitude,
  onLocationChange,
  address,
  userLocation,
}) => {
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const lineRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [L, setL] = useState<any>(null);

  // Load Leaflet on client side only
  useEffect(() => {
    if (typeof window === 'undefined') return;

    import('leaflet').then((leaflet) => {
      const L = leaflet.default;

      // Fix Leaflet default icon issue with Next.js
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });

      setL(() => L);
    });
  }, []);

  // Initialize map when Leaflet is loaded
  useEffect(() => {
    if (!L || !mapContainerRef.current || mapRef.current) return;

    // Initialize map
    const map = L.map(mapContainerRef.current).setView([latitude, longitude], 15);

    // Add OpenStreetMap tiles (Free!)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Create red icon for facility location
    const redIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    // Add marker
    const marker = L.marker([latitude, longitude], {
      draggable: true,
      icon: redIcon,
    }).addTo(map);

    // Handle marker drag
    marker.on('dragend', () => {
      const position = marker.getLatLng();
      onLocationChange(position.lat, position.lng);
    });

    // Handle map click
    map.on('click', (e: { latlng: { lat: any; lng: any; }; }) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      onLocationChange(lat, lng);
    });

    mapRef.current = map;
    markerRef.current = marker;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [L, latitude, longitude]);

  // Update marker position when coordinates change
  useEffect(() => {
    if (!L || !markerRef.current || !mapRef.current) return;
    const newLatLng = L.latLng(latitude, longitude);
    markerRef.current.setLatLng(newLatLng);
    mapRef.current.setView(newLatLng, mapRef.current.getZoom());
  }, [L, latitude, longitude]);

  // Handle user location marker and distance line
  useEffect(() => {
    if (!L || !mapRef.current) return;

    // Remove existing user marker and line if any
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }
    if (lineRef.current) {
      lineRef.current.remove();
      lineRef.current = null;
    }

    // Add user location marker if available
    if (userLocation) {
      // Create blue icon for user location
      const blueIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      // Add user marker
      const userMarker = L.marker([userLocation.lat, userLocation.lng], {
        icon: blueIcon,
        draggable: false,
      })
        .addTo(mapRef.current)
        .bindPopup('<b>Vị trí của bạn</b>');

      userMarkerRef.current = userMarker;

      // Draw line between user and facility
      const line = L.polyline(
        [
          [userLocation.lat, userLocation.lng],
          [latitude, longitude],
        ],
        {
          color: '#3b82f6',
          weight: 3,
          opacity: 0.7,
          dashArray: '10, 10',
        }
      ).addTo(mapRef.current);

      lineRef.current = line;

      // Fit map to show both markers
      const bounds = L.latLngBounds([
        [userLocation.lat, userLocation.lng],
        [latitude, longitude],
      ]);
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [L, userLocation, latitude, longitude]);

  return (
    <Box
      ref={mapContainerRef}
      sx={{
        width: '100%',
        height: 300,
        borderRadius: '8px',
        overflow: 'hidden',
        border: '2px solid #E0E0E0',
        '& .leaflet-container': {
          height: '100%',
          width: '100%',
        },
      }}
    />
  );
};
