'use client'

// IMPORTANT: This file imports `leaflet` and `react-leaflet` directly which both
// touch `window`. It must only be loaded on the client. Always import this file
// via `next/dynamic({ ssr: false })` from a wrapper component.

import React, { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Leaflet's default marker icons rely on relative URLs that don't survive bundlers
// (Next.js / webpack). Point them to the unpkg CDN so the marker actually renders.
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
})

const DEFAULT_CENTER = [20.5937, 78.9629] // Geographic center of India

const ClickHandler = ({ onClick }) => {
  useMapEvents({
    click(e) {
      onClick?.(e.latlng.lat, e.latlng.lng)
    }
  })
  return null
}

const Recenter = ({ marker }) => {
  const map = useMap()
  useEffect(() => {
    if (marker) {
      map.setView([marker.lat, marker.lng], Math.max(map.getZoom(), 15), { animate: true })
    }
  }, [marker?.lat, marker?.lng, map])
  return null
}

const OsmMapInner = ({ marker, onMapClick, onMarkerDragEnd, height = 350 }) => {
  const center = marker ? [marker.lat, marker.lng] : DEFAULT_CENTER
  const initialZoom = marker ? 15 : 5

  return (
    <MapContainer
      center={center}
      zoom={initialZoom}
      scrollWheelZoom
      style={{ width: '100%', height, borderRadius: 8 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      />
      <ClickHandler onClick={onMapClick} />
      <Recenter marker={marker} />
      {marker && (
        <Marker
          position={[marker.lat, marker.lng]}
          draggable
          eventHandlers={{
            dragend: e => {
              const { lat, lng } = e.target.getLatLng()
              onMarkerDragEnd?.(lat, lng)
            }
          }}
        />
      )}
    </MapContainer>
  )
}

export default OsmMapInner
