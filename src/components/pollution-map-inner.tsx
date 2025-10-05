/* eslint-disable @typescript-eslint/no-explicit-any */
// components/pollution-map-inner.tsx
"use client"

import * as React from "react"
import dynamic from 'next/dynamic'
import { useMapEvents, useMap } from 'react-leaflet'

// Dynamically import Leaflet components to avoid SSR
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
)
const Circle = dynamic(
  () => import('react-leaflet').then((mod) => mod.Circle),
  { ssr: false }
)

import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Fix for default markers in Leaflet with Next.js - only run on client
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  })
}

// Custom pollution icons
const createPollutionIcon = (aqi: number, size: number = 32) => {
  const getColor = (aqi: number) => {
    if (aqi <= 50) return "#00E400"
    if (aqi <= 100) return "#FFFF00"
    if (aqi <= 150) return "#FF7E00"
    if (aqi <= 200) return "#FF0000"
    if (aqi <= 300) return "#8F3F97"
    return "#7E0023"
  }

  return L.divIcon({
    className: 'pollution-marker',
    html: `
      <div style="
        background-color: ${getColor(aqi)};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: ${size * 0.4}px;
      ">${aqi}</div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

const createEventIcon = () => {
  return L.divIcon({
    className: 'event-marker',
    html: `
      <div style="
        background-color: #FF6B35;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        animation: pulse 2s infinite;
      ">
        <div style="
          width: 12px;
          height: 12px;
          background-color: white;
          border-radius: 50%;
        "></div>
      </div>
      <style>
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
      </style>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })
}

interface PollutionMapInnerProps {
  center: [number, number]
  zoom: number
  data: any[]
  events: any[]
  selectedLayer: string
  onMarkerClick: (data: any) => void
  onMapMove: (center: [number, number], zoom: number) => void
}

function MapEvents({ onMapMove }: { onMapMove: (center: [number, number], zoom: number) => void }) {
  const MapEventsComponent = () => {
    const map = useMapEvents({
      moveend: () => {
        const center = map.getCenter()
        onMapMove([center.lat, center.lng], map.getZoom())
      },
      zoomend: () => {
        const center = map.getCenter()
        onMapMove([center.lat, center.lng], map.getZoom())
      },
    })
    return null
  }
  
  return <MapEventsComponent />
}

function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const MapControllerComponent = () => {
    const map = useMap()
    
    React.useEffect(() => {
      map.setView(center, zoom)
    }, [center, zoom, map])

    return null
  }
  
  return <MapControllerComponent />
}

// Helper to remove duplicate events by ID
const removeDuplicateEvents = (events: any[]) => {
  const seen = new Set()
  return events.filter(event => {
    if (seen.has(event.id)) {
      return false
    }
    seen.add(event.id)
    return true
  })
}

export default function PollutionMapInner({
  center,
  zoom,
  data,
  events,
  selectedLayer,
  onMarkerClick,
  onMapMove
}: PollutionMapInnerProps) {
  const [isClient, setIsClient] = React.useState(false)

  React.useEffect(() => {
    setIsClient(true)
  }, [])

  const getRadius = (aqi: number) => {
    return Math.max(10000, aqi * 500)
  }

  const getColor = (aqi: number) => {
    if (aqi <= 50) return "#00E400"
    if (aqi <= 100) return "#FFFF00"
    if (aqi <= 150) return "#FF7E00"
    if (aqi <= 200) return "#FF0000"
    if (aqi <= 300) return "#8F3F97"
    return "#7E0023"
  }

  // Remove duplicate events
  const uniqueEvents = React.useMemo(() => {
    return removeDuplicateEvents(events || [])
  }, [events])

  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-full bg-muted/20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      </div>
    )
  }

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <MapController center={center} zoom={zoom} />
      <MapEvents onMapMove={onMapMove} />

      {/* Pollution markers */}
      {selectedLayer !== "events" && data.map((point) => (
        <Marker
          key={`${point.id}-${point.type || 'data'}`}
          position={[point.lat, point.lng]}
          icon={createPollutionIcon(point.aqi, point.type === "event" ? 28 : 32)}
          eventHandlers={{
            click: () => onMarkerClick(point),
          }}
        >
          <Popup>
            <div className="p-2 min-w-[200px]">
              <h3 className="font-semibold mb-2">{point.city}</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>AQI:</span>
                  <span className="font-medium">{point.aqi}</span>
                </div>
                <div className="flex justify-between">
                  <span>PM2.5:</span>
                  <span className="font-medium">{point.pm25} μg/m³</span>
                </div>
                <div className="flex justify-between">
                  <span>NO₂:</span>
                  <span className="font-medium">{point.no2} ppb</span>
                </div>
                {point.o3 && (
                  <div className="flex justify-between">
                    <span>O₃:</span>
                    <span className="font-medium">{point.o3} ppb</span>
                  </div>
                )}
                {point.so2 && (
                  <div className="flex justify-between">
                    <span>SO₂:</span>
                    <span className="font-medium">{point.so2} ppb</span>
                  </div>
                )}
                {point.co && (
                  <div className="flex justify-between">
                    <span>CO:</span>
                    <span className="font-medium">{point.co} ppm</span>
                  </div>
                )}
              </div>
              {point.type === "event" && (
                <div className="mt-2 p-2 bg-orange-50 rounded text-xs">
                  Active air quality event
                </div>
              )}
              {point.type === "tempo" && (
                <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                  NASA TEMPO Data
                </div>
              )}
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Event markers */}
      {selectedLayer === "events" && uniqueEvents.map((event) => {
        if (!event.geometries || !event.geometries[0]) return null
        
        const geometry = event.geometries[0]
        if (geometry.type !== "Point") return null
        
        const [lng, lat] = geometry.coordinates as [number, number]
        
        return (
          <Marker
            key={`event-${event.id}-${lat}-${lng}`}
            position={[lat, lng]}
            icon={createEventIcon()}
            eventHandlers={{
              click: () => onMarkerClick({
                city: event.title,
                lat,
                lng,
                aqi: 120,
                pm25: 25,
                no2: 35,
                level: "unhealthySensitive",
                type: "event",
                eventData: event
              }),
            }}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <h3 className="font-semibold mb-2">{event.title}</h3>
                <div className="text-sm space-y-1">
                  <div>
                    <strong>Type:</strong> {event.categories.map((cat: any) => cat.title).join(", ")}
                  </div>
                  {event.description && (
                    <div>
                      <strong>Description:</strong> {event.description}
                    </div>
                  )}
                  <div className="mt-2 p-2 bg-red-50 rounded text-xs">
                    This event may affect air quality in the region
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        )
      })}

      {/* Pollution circles for AQI layer */}
      {selectedLayer === "aqi" && data.map((point) => (
        <Circle
          key={`circle-${point.id}-${point.lat}-${point.lng}`}
          center={[point.lat, point.lng]}
          radius={getRadius(point.aqi)}
          pathOptions={{
            fillColor: getColor(point.aqi),
            fillOpacity: 0.2,
            color: getColor(point.aqi),
            opacity: 0.6,
            weight: 2,
          }}
        />
      ))}
    </MapContainer>
  )
}