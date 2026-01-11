'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';
import 'leaflet/dist/leaflet.css';

interface FacilityLocation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  distance?: number;
}

interface MapPickerProps {
  latitude: number;
  longitude: number;
  onLocationChange: (lat: number, lng: number) => void;
  address?: string;
  userLocation?: { lat: number; lng: number } | null;
  facilities?: FacilityLocation[];
}

export const MapPicker: React.FC<MapPickerProps> = ({
  latitude,
  longitude,
  onLocationChange,
  address,
  userLocation,
  facilities,
}) => {
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const lineRef = useRef<any>(null);
  const facilityMarkersRef = useRef<any[]>([]);
  const facilityLinesRef = useRef<any[]>([]);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef<boolean>(true);
  const [L, setL] = useState<any>(null);

  // Store initial coordinates and callback in refs to avoid dependency issues
  const initialLatRef = useRef(latitude);
  const initialLngRef = useRef(longitude);
  const onLocationChangeRef = useRef(onLocationChange);

  // Keep the callback ref up to date
  useEffect(() => {
    onLocationChangeRef.current = onLocationChange;
  }, [onLocationChange]);

  // Track mounted state
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Load Leaflet on client side only
  useEffect(() => {
    if (typeof window === 'undefined') return;

    import('leaflet').then((leaflet) => {
      if (!mountedRef.current) return;

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

    // Initialize map using initial coordinates from refs
    const map = L.map(mapContainerRef.current).setView(
      [initialLatRef.current, initialLngRef.current],
      15
    );

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
    const marker = L.marker([initialLatRef.current, initialLngRef.current], {
      draggable: true,
      icon: redIcon,
    }).addTo(map);

    // Handle marker drag
    marker.on('dragend', () => {
      if (!mountedRef.current) return;
      const position = marker.getLatLng();
      onLocationChangeRef.current(position.lat, position.lng);
    });

    // Handle map click
    map.on('click', (e: { latlng: { lat: any; lng: any; }; }) => {
      if (!mountedRef.current) return;
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      onLocationChangeRef.current(lat, lng);
    });

    mapRef.current = map;
    markerRef.current = marker;

    return () => {
      // Clean up markers first
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
      if (lineRef.current) {
        lineRef.current.remove();
        lineRef.current = null;
      }
      facilityMarkersRef.current.forEach((m) => m.remove());
      facilityMarkersRef.current = [];
      facilityLinesRef.current.forEach((l) => l.remove());
      facilityLinesRef.current = [];

      // Then remove the map
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markerRef.current = null;
    };
  }, [L]);

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

  // Handle multiple facilities with distances
  useEffect(() => {
    if (!L || !mapRef.current || !facilities || facilities.length === 0) return;

    // Remove existing facility markers and lines
    facilityMarkersRef.current.forEach((marker) => marker.remove());
    facilityMarkersRef.current = [];
    facilityLinesRef.current.forEach((line) => line.remove());
    facilityLinesRef.current = [];

    // Hide single marker when showing multiple facilities
    if (markerRef.current) {
      markerRef.current.remove();
    }

    // Create red icon for facility locations
    const redIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    const allCoords: [number, number][] = [];

    // Add markers for all facilities
    facilities.forEach((facility) => {
      const distanceText = facility.distance !== undefined
        ? facility.distance < 1000
          ? `${Math.round(facility.distance)} m`
          : `${(facility.distance / 1000).toFixed(2)} km`
        : '';

      const marker = L.marker([facility.latitude, facility.longitude], {
        icon: redIcon,
        draggable: false,
      })
        .addTo(mapRef.current)
        .bindPopup(`<b>${facility.name}</b>${distanceText ? `<br/>Khoảng cách: ${distanceText}` : ''}`);

      facilityMarkersRef.current.push(marker);
      allCoords.push([facility.latitude, facility.longitude]);

      // Draw line from user to each facility if user location exists
      if (userLocation) {
        const line = L.polyline(
          [
            [userLocation.lat, userLocation.lng],
            [facility.latitude, facility.longitude],
          ],
          {
            color: '#3b82f6',
            weight: 2,
            opacity: 0.5,
            dashArray: '10, 10',
          }
        ).addTo(mapRef.current);

        facilityLinesRef.current.push(line);
      }
    });

    // Add user location to bounds if available
    if (userLocation) {
      allCoords.push([userLocation.lat, userLocation.lng]);
    }

    // Fit map to show all markers
    if (allCoords.length > 0) {
      const bounds = L.latLngBounds(allCoords);
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [L, facilities, userLocation]);

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
