"use client"

import * as React from "react"

interface PollutionDataPoint {
  id: string
  city: string
  country: string
  lat: number
  lng: number
  aqi: number
  pm25: number
  no2: number
  o3?: number
  so2?: number
  co?: number
  level: string
  type?: "tempo" | "event" | "mock"
  eventData?: any
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { useAirQualityEvents } from "@/hooks/useNasaQueries"
import { useTEMPOData } from "@/hooks/useTEMPOData"
import { MapPin, Navigation, Layers, Filter, RefreshCw, AlertTriangle } from "lucide-react"

// Dynamic import for Leaflet to avoid SSR issues
const PollutionMap = React.lazy(() => import('../../components/pollution-map-inner'))

export const description = "Interactive Pollution Map with NASA Data"

// North American cities with real coordinates
const northAmericanCities = [
  // United States
  { city: "New York", country: "United States", lat: 40.7128, lng: -74.0060 },
  { city: "Los Angeles", country: "United States", lat: 34.0522, lng: -118.2437 },
  { city: "Chicago", country: "United States", lat: 41.8781, lng: -87.6298 },
  { city: "Houston", country: "United States", lat: 29.7604, lng: -95.3698 },
  { city: "Phoenix", country: "United States", lat: 33.4484, lng: -112.0740 },
  { city: "Philadelphia", country: "United States", lat: 39.9526, lng: -75.1652 },
  { city: "San Antonio", country: "United States", lat: 29.4241, lng: -98.4936 },
  { city: "San Diego", country: "United States", lat: 32.7157, lng: -117.1611 },
  { city: "Dallas", country: "United States", lat: 32.7767, lng: -96.7970 },
  { city: "San Jose", country: "United States", lat: 37.3382, lng: -121.8863 },

  // Canada
  { city: "Toronto", country: "Canada", lat: 43.6532, lng: -79.3832 },
  { city: "Montreal", country: "Canada", lat: 45.5017, lng: -73.5673 },
  { city: "Vancouver", country: "Canada", lat: 49.2827, lng: -123.1207 },
  { city: "Calgary", country: "Canada", lat: 51.0447, lng: -114.0719 },
  { city: "Edmonton", country: "Canada", lat: 53.5461, lng: -113.4938 },
  { city: "Ottawa", country: "Canada", lat: 45.4215, lng: -75.6972 },

  // Mexico
  { city: "Mexico City", country: "Mexico", lat: 19.4326, lng: -99.1332 },
  { city: "Guadalajara", country: "Mexico", lat: 20.6597, lng: -103.3496 },
  { city: "Monterrey", country: "Mexico", lat: 25.6866, lng: -100.3161 },
  { city: "Puebla", country: "Mexico", lat: 19.0414, lng: -98.2063 },
]

const pollutionLevels = {
  good: { label: "Good", color: "#00E400", description: "0-50 AQI" },
  moderate: { label: "Moderate", color: "#FFFF00", description: "51-100 AQI" },
  unhealthySensitive: { label: "Unhealthy for Sensitive Groups", color: "#FF7E00", description: "101-150 AQI" },
  unhealthy: { label: "Unhealthy", color: "#FF0000", description: "151-200 AQI" },
  veryUnhealthy: { label: "Very Unhealthy", color: "#8F3F97", description: "201-300 AQI" },
  hazardous: { label: "Hazardous", color: "#7E0023", description: "301-500 AQI" },
}

const mapLayers = [
  { id: "events", name: "Natural Events", description: "Wildfires, dust storms, etc." },
  { id: "aqi", name: "Air Quality Index", description: "Current AQI measurements" },
  { id: "pm25", name: "PM2.5 Particles", description: "Fine particulate matter" },
  { id: "no2", name: "Nitrogen Dioxide", description: "NO₂ levels" },
]

// Calculate AQI from pollutant data
const calculateAQI = (pollutant: any): number => {
  const pm25 = pollutant.pm25 || 0
  if (pm25 <= 12) return Math.floor((pm25 / 12) * 50)
  if (pm25 <= 35.4) return Math.floor(50 + ((pm25 - 12.1) / (35.4 - 12.1)) * 50)
  if (pm25 <= 55.4) return Math.floor(100 + ((pm25 - 35.5) / (55.4 - 35.5)) * 50)
  if (pm25 <= 150.4) return Math.floor(150 + ((pm25 - 55.5) / (150.4 - 55.5)) * 50)
  if (pm25 <= 250.4) return Math.floor(200 + ((pm25 - 150.5) / (250.4 - 150.5)) * 100)
  return 300 + Math.floor((pm25 - 250.5) / 50) * 50
}

const getLevelFromAQI = (aqi: number): string => {
  if (aqi <= 50) return "good"
  if (aqi <= 100) return "moderate"
  if (aqi <= 150) return "unhealthySensitive"
  if (aqi <= 200) return "unhealthy"
  if (aqi <= 300) return "veryUnhealthy"
  return "hazardous"
}

// Convert TEMPO data to map points using North American cities
const convertTEMPODataToMapPoints = (tempoData: any[]): PollutionDataPoint[] => {
  if (!tempoData || tempoData.length === 0) return []

  return tempoData.map((data, index) => {
    const latestData = Array.isArray(data) ? data[data.length - 1] : data
    
    const aqi = calculateAQI(latestData)
    const cityIndex = index % northAmericanCities.length
    const city = northAmericanCities[cityIndex]
    
    return {
      id: `tempo-${index}`,
      city: city.city,
      country: city.country,
      lat: city.lat,
      lng: city.lng,
      aqi,
      pm25: latestData.pm25 || 0,
      no2: latestData.no2 || 0,
      o3: latestData.o3,
      so2: latestData.so2,
      co: latestData.co,
      level: getLevelFromAQI(aqi),
      type: "tempo"
    }
  })
}

// Remove duplicate events by ID
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

export default function PollutionMapComponent() {
  const [selectedLayer, setSelectedLayer] = React.useState("events")
  const [aqiThreshold, setAqiThreshold] = React.useState([50])
  const [selectedEvent, setSelectedEvent] = React.useState<PollutionDataPoint | null>(null)
  const [mapCenter, setMapCenter] = React.useState<[number, number]>([39.8283, -98.5795])
  const [mapZoom, setMapZoom] = React.useState(4)
  const [isClient, setIsClient] = React.useState(false)

  const { data: events, isLoading: eventsLoading, refetch: refetchEvents } = useAirQualityEvents(7)
  const { data: tempoData, isLoading: tempoLoading } = useTEMPOData()

  // Set client-side flag to avoid hydration mismatches
  React.useEffect(() => {
    setIsClient(true)
  }, [])

  // Convert TEMPO data to map points
  const tempoMapPoints = React.useMemo(() => {
    return convertTEMPODataToMapPoints(tempoData || [])
  }, [tempoData])

  // Remove duplicate events
  const uniqueEvents = React.useMemo(() => {
    return removeDuplicateEvents(events || [])
  }, [events])

  const pollutionData = React.useMemo(() => {
    const data: PollutionDataPoint[] = []
    
    // Add TEMPO data points
    if (tempoMapPoints.length > 0) {
      data.push(...tempoMapPoints)
    } else {
      // Fallback to North American cities with mock data
      data.push(...northAmericanCities.slice(0, 10).map((city, index) => ({
        id: `mock-${index}`,
        city: city.city,
        country: city.country,
        lat: city.lat,
        lng: city.lng,
        aqi: Math.floor(30 + Math.random() * 70),
        pm25: 10 + Math.random() * 15,
        no2: 15 + Math.random() * 25,
        level: "moderate",
        type: "mock"
      })))
    }
    
    // Add EONET events
    if (uniqueEvents) {
      uniqueEvents.forEach(event => {
        if (event.geometries && event.geometries[0]) {
          const geometry = event.geometries[0]
          if (geometry.type === "Point") {
            const [lng, lat] = geometry.coordinates as [number, number]
            data.push({
              id: `event-${event.id}`,
              city: event.title,
              country: "Event Location",
              lat,
              lng,
              aqi: 120,
              pm25: 25,
              no2: 35,
              level: "unhealthySensitive",
              type: "event",
              eventData: event
            })
          }
        }
      })
    }
    
    return data.filter(point => point.aqi >= aqiThreshold[0])
  }, [tempoMapPoints, uniqueEvents, aqiThreshold])

  const handleMarkerClick = React.useCallback((data: PollutionDataPoint) => {
    setSelectedEvent(data)
  }, [])

  const handleLocateMe = React.useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter([position.coords.latitude, position.coords.longitude])
          setMapZoom(10)
        },
        (error) => {
          console.error("Error getting location:", error)
        }
      )
    }
  }, [])

  const handleRefreshData = React.useCallback(() => {
    refetchEvents()
  }, [refetchEvents])

  const handleMapMove = React.useCallback((center: [number, number], zoom: number) => {
    setMapCenter(center)
    setMapZoom(zoom)
  }, [])

  const getPollutionLevel = React.useCallback((aqi: number) => {
    if (aqi <= 50) return pollutionLevels.good
    if (aqi <= 100) return pollutionLevels.moderate
    if (aqi <= 150) return pollutionLevels.unhealthySensitive
    if (aqi <= 200) return pollutionLevels.unhealthy
    if (aqi <= 300) return pollutionLevels.veryUnhealthy
    return pollutionLevels.hazardous
  }, [])

  const handleLayerChange = React.useCallback((value: string) => {
    setSelectedLayer(value)
  }, [])

  const handleAqiThresholdChange = React.useCallback((value: number[]) => {
    setAqiThreshold(value)
  }, [])

  const isLoading = eventsLoading || tempoLoading

  // Don't render anything during SSR to avoid hydration mismatches
  if (!isClient) {
    return (
      <Card className="w-full h-full">
        <CardHeader>
          <CardTitle>Pollution Map</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Initializing map...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Pollution Map
              {tempoMapPoints.length > 0 && (
                <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700">
                  Live TEMPO Data
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Real-time air quality monitoring with NASA TEMPO data across North America
              {tempoMapPoints.length > 0 && ` - ${tempoMapPoints.length} monitoring points`}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleLocateMe}>
              <Navigation className="h-4 w-4 mr-1" />
              Locate Me
            </Button>
            <Button variant="outline" size="sm" onClick={handleRefreshData} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="flex h-[600px]">
          {/* Controls Sidebar */}
          <div className="w-80 border-r bg-muted/20 p-4 space-y-4">
            {/* Layer Selection */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                <h3 className="font-semibold">Map Layers</h3>
              </div>
              <Select value={selectedLayer} onValueChange={handleLayerChange}>
    <SelectTrigger>
      <SelectValue placeholder="Select layer" />
    </SelectTrigger>
    <SelectContent>
      {mapLayers.map(layer => (
        <SelectItem key={layer.id} value={layer.id}>
          {layer.name}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>

            </div>

            {/* AQI Filter */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <h3 className="font-semibold">AQI Threshold</h3>
              </div>
              <div className="space-y-2">
                <Slider
                  value={aqiThreshold}
                  onValueChange={handleAqiThresholdChange}
                  max={300}
                  step={10}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Show AQI ≥ {aqiThreshold[0]}</span>
                </div>
              </div>
            </div>

            {/* Data Status */}
            <div className="space-y-3">
              <h3 className="font-semibold">Data Status</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                  <span className="text-sm">TEMPO Points</span>
                  <Badge variant="outline">{tempoMapPoints.length}</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                  <span className="text-sm">Events</span>
                  <Badge variant="outline">{uniqueEvents?.length || 0}</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-purple-50 rounded-lg">
                  <span className="text-sm">Cities Covered</span>
                  <Badge variant="outline">{northAmericanCities.length}</Badge>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-3">
              <h3 className="font-semibold">Air Quality Legend</h3>
              <div className="space-y-2">
                {Object.entries(pollutionLevels).map(([key, level]) => (
                  <div key={key} className="flex items-center gap-2 text-sm">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: level.color }}
                    />
                    <span>{level.label}</span>
                    <Badge variant="outline" className="ml-auto text-xs">
                      {level.description}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Events Count */}
            {uniqueEvents && uniqueEvents.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold">Active Events</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <div>
                      <div className="font-medium text-sm">{uniqueEvents.length} events</div>
                      <div className="text-xs text-muted-foreground">
                        Affecting air quality
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Data Source */}
            <div className="pt-4 border-t">
              <div className="text-xs text-muted-foreground space-y-1">
                <div className="font-medium">Data Sources:</div>
                <div>• NASA TEMPO Mission</div>
                <div>• EONET Natural Events</div>
                <div>• North America Coverage</div>
                <div>Last updated: {new Date().toLocaleTimeString()}</div>
                {tempoMapPoints.length === 0 && (
                  <div className="text-amber-600 text-xs mt-1">
                    Using demonstration data
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Map Container */}
          <div className="flex-1 relative">
            <React.Suspense fallback={
              <div className="flex items-center justify-center h-full bg-muted/20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Loading map...</p>
                </div>
              </div>
            }>
              <PollutionMap
                center={mapCenter}
                zoom={mapZoom}
                data={pollutionData}
                events={uniqueEvents}
                selectedLayer={selectedLayer}
                onMarkerClick={handleMarkerClick}
                onMapMove={handleMapMove}
              />
            </React.Suspense>

            {/* Selected Event Panel */}
            {selectedEvent && (
              <div className="absolute top-4 right-4 w-80 bg-background/95 backdrop-blur-sm rounded-lg border shadow-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{selectedEvent.city}</h3>
                    <div className="text-sm text-muted-foreground">{selectedEvent.country}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedEvent(null)}
                  >
                    ×
                  </Button>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getPollutionLevel(selectedEvent.aqi).color }}
                    />
                    <span className="font-medium">AQI: {selectedEvent.aqi}</span>
                    <Badge variant="outline" className="ml-auto">
                      {getPollutionLevel(selectedEvent.aqi).label}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="space-y-1">
                      <div className="text-muted-foreground">PM2.5</div>
                      <div className="font-medium">{selectedEvent.pm25.toFixed(1)} μg/m³</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-muted-foreground">NO₂</div>
                      <div className="font-medium">{selectedEvent.no2.toFixed(1)} ppb</div>
                    </div>
                    {selectedEvent.o3 && (
                      <div className="space-y-1">
                        <div className="text-muted-foreground">O₃</div>
                        <div className="font-medium">{selectedEvent.o3.toFixed(1)} ppb</div>
                      </div>
                    )}
                    {selectedEvent.so2 && (
                      <div className="space-y-1">
                        <div className="text-muted-foreground">SO₂</div>
                        <div className="font-medium">{selectedEvent.so2.toFixed(1)} ppb</div>
                      </div>
                    )}
                  </div>

                  {selectedEvent.eventData && (
                    <div className="pt-2 border-t">
                      <h4 className="font-medium text-sm mb-2">Event Details</h4>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>{selectedEvent.eventData.categories.map((cat: any) => cat.title).join(", ")}</div>
                        {selectedEvent.eventData.description && (
                          <div>{selectedEvent.eventData.description}</div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedEvent.type === "tempo" && (
                    <div className="pt-2 border-t">
                      <div className="text-xs text-blue-600">
                        NASA TEMPO Real-time Data
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t">
                    <div className="text-xs text-muted-foreground">
                      Last updated: {new Date().toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Map Controls Overlay */}
            <div className="absolute bottom-4 left-4 flex gap-2">
              <Badge variant="secondary" className="bg-background/95 backdrop-blur-sm">
                {pollutionData.length} monitoring points
              </Badge>
              {uniqueEvents && uniqueEvents.length > 0 && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  {uniqueEvents.length} active events
                </Badge>
              )}
              {tempoMapPoints.length > 0 && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Live TEMPO Data
                </Badge>
              )}
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                North America
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}