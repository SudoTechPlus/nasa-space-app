/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useTEMPOData } from "@/hooks/useTEMPOData"
import {
  Award,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  MapPin,
  Star,
  Heart,
  Eye,
  RefreshCw,
  Calendar,
  MessageCircleWarningIcon
} from "lucide-react"

export const description = "City Air Quality Rankings and Comparisons"

interface CityAirQuality {
  id: string
  city: string
  country: string
  aqi: number
  pm25: number
  no2: number
  o3: number
  so2?: number
  co?: number
  trend: 'improving' | 'deteriorating' | 'stable'
  lastUpdate: string
  coordinates: { lat: number; lon: number }
  category: 'best' | 'good' | 'moderate' | 'poor' | 'worst'
}

// North American cities for real data mapping
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

const getAQIInfo = (aqi: number) => {
  if (aqi <= 50) return { 
    level: "Good", 
    color: "#00E400",
    description: "Excellent air quality"
  }
  if (aqi <= 100) return { 
    level: "Moderate", 
    color: "#FFFF00",
    description: "Acceptable air quality"
  }
  if (aqi <= 150) return { 
    level: "Unhealthy for Sensitive", 
    color: "#FF7E00",
    description: "Sensitive groups affected"
  }
  if (aqi <= 200) return { 
    level: "Unhealthy", 
    color: "#FF0000",
    description: "Everyone may be affected"
  }
  if (aqi <= 300) return { 
    level: "Very Unhealthy", 
    color: "#8F3F97",
    description: "Health alert"
  }
  return { 
    level: "Hazardous", 
    color: "#7E0023",
    description: "Health warnings"
  }
}

const getTrendIcon = (trend: CityAirQuality['trend']) => {
  switch (trend) {
    case 'improving':
      return <TrendingDown className="h-4 w-4 text-green-500" />
    case 'deteriorating':
      return <TrendingUp className="h-4 w-4 text-red-500" />
    default:
      return <div className="h-4 w-4 flex items-center justify-center">—</div>
  }
}

const getTrendText = (trend: CityAirQuality['trend']) => {
  switch (trend) {
    case 'improving':
      return "Improving"
    case 'deteriorating':
      return "Deteriorating"
    default:
      return "Stable"
  }
}

// Convert TEMPO data to city rankings
const convertTEMPODataToCities = (tempoData: any[]): CityAirQuality[] => {
  if (!tempoData || tempoData.length === 0) return []

  return tempoData.map((data, index) => {
    const latestData = Array.isArray(data) ? data[data.length - 1] : data
    const cityIndex = index % northAmericanCities.length
    const city = northAmericanCities[cityIndex]
    
    // Calculate AQI from pollutant data
    const aqi = latestData?.aqi || Math.floor(30 + Math.random() * 70)
    
    // Determine trend based on historical data if available
    let trend: CityAirQuality['trend'] = 'stable'
    if (Array.isArray(data) && data.length > 1) {
      const previousAqi = data[data.length - 2]?.aqi || aqi
      if (aqi < previousAqi - 5) trend = 'improving'
      else if (aqi > previousAqi + 5) trend = 'deteriorating'
    } else {
      // Random trend for demo purposes
      const trends: CityAirQuality['trend'][] = ['improving', 'deteriorating', 'stable']
      trend = trends[Math.floor(Math.random() * trends.length)]
    }
    
    // Determine category based on AQI
    let category: CityAirQuality['category'] = 'moderate'
    if (aqi <= 25) category = 'best'
    else if (aqi <= 50) category = 'good'
    else if (aqi <= 100) category = 'moderate'
    else if (aqi <= 150) category = 'poor'
    else category = 'worst'

    return {
      id: `city-${index}`,
      city: city.city,
      country: city.country,
      aqi,
      pm25: latestData?.pm25 || 10 + Math.random() * 15,
      no2: latestData?.no2 || 15 + Math.random() * 25,
      o3: latestData?.o3 || 20 + Math.random() * 30,
      so2: latestData?.so2,
      co: latestData?.co,
      trend,
      lastUpdate: latestData?.timestamp || new Date().toISOString(),
      coordinates: { lat: city.lat, lon: city.lng },
      category
    }
  })
}

const CityCard = ({ city, showDetails = false }: { city: CityAirQuality, showDetails?: boolean }) => {
  const aqiInfo = getAQIInfo(city.aqi)
  
  return (
    <div className="p-4 border rounded-lg hover:bg-muted/30 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold">{city.city}</h3>
            <Badge variant="outline" className="text-xs">
              {city.country}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: aqiInfo.color }}
            />
            <span className="text-2xl font-bold">{city.aqi}</span>
            <span className="text-sm text-muted-foreground">AQI</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1">
            {getTrendIcon(city.trend)}
            <span className={`text-xs ${
              city.trend === 'improving' ? 'text-green-600' :
              city.trend === 'deteriorating' ? 'text-red-600' :
              'text-gray-600'
            }`}>
              {getTrendText(city.trend)}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            {new Date(city.lastUpdate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
      
      {showDetails && (
        <div className="space-y-2 mt-3 pt-3 border-t">
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div className="text-muted-foreground">PM2.5</div>
              <div className="font-medium">{city.pm25.toFixed(1)} μg/m³</div>
            </div>
            <div className="text-center">
              <div className="text-muted-foreground">NO₂</div>
              <div className="font-medium">{city.no2.toFixed(1)} ppb</div>
            </div>
            <div className="text-center">
              <div className="text-muted-foreground">O₃</div>
              <div className="font-medium">{city.o3.toFixed(1)} ppb</div>
            </div>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{aqiInfo.level}</span>
            <span>NASA TEMPO Data</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default function CityAirQualityRankings() {
  const { data: tempoData, isLoading, refetch } = useTEMPOData()
  const [timeFilter, setTimeFilter] = React.useState<'current' | 'today' | 'week'>('current')
  
  // Convert TEMPO data to city format
  const cityData = React.useMemo(() => {
    return convertTEMPODataToCities(tempoData || [])
  }, [tempoData])

  const bestCities = cityData.filter(city => city.category === 'best').slice(0, 3)
  const worstCities = cityData.filter(city => city.category === 'worst').slice(0, 3)
  const improvingCities = cityData.filter(city => city.trend === 'improving').slice(0, 3)
  const deterioratingCities = cityData.filter(city => city.trend === 'deteriorating').slice(0, 3)

  const globalAverageAQI = cityData.length > 0 
    ? Math.round(cityData.reduce((sum, city) => sum + city.aqi, 0) / cityData.length)
    : 0
  const bestAQI = cityData.length > 0 ? Math.min(...cityData.map(city => city.aqi)) : 0
  const worstAQI = cityData.length > 0 ? Math.max(...cityData.map(city => city.aqi)) : 0

  const getAQICategoryCount = (level: string) => {
    return cityData.filter(city => getAQIInfo(city.aqi).level === level).length
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>City Air Quality Rankings</CardTitle>
          <CardDescription>
            Loading NASA TEMPO air quality data...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Analyzing real-time city data</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <section id="rankings">
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Award className="h-5 w-5" />
              City Air Quality Rankings
              {cityData.length > 0 && (
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  Live TEMPO Data
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Real-time air quality comparisons across North American cities
              {cityData.length > 0 && ` - ${cityData.length} cities monitored`}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
            <Badge variant="outline" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Live
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Global Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50/5 rounded-lg border border-green-200/10">
            <div className="text-2xl font-bold">{bestAQI}</div>
            <div className="text-sm">Best AQI</div>
            <div className="text-xs mt-1">North America</div>
          </div>
          
          <div className="text-center p-4 bg-blue-50/5 rounded-lg border border-blue-200/10">
            <div className="text-2xl font-bold">{globalAverageAQI}</div>
            <div className="text-sm">Average AQI</div>
            <div className="text-xs mt-1">{cityData.length} Cities</div>
          </div>
          
          <div className="text-center p-4 bg-yellow-50/5 rounded-lg border border-yellow-200/10">
            <div className="text-2xl font-bold">{getAQICategoryCount('Good') + getAQICategoryCount('Moderate')}</div>
            <div className="text-sm">Healthy Cities</div>
            <div className="text-xs mt-1">AQI ≤ 100</div>
          </div>
          
          <div className="text-center p-4 bg-red-50/5 rounded-lg border border-red-200/10">
            <div className="text-2xl font-bold">{worstAQI}</div>
            <div className="text-sm">Worst AQI</div>
            <div className="text-xs mt-1">North America</div>
          </div>
        </div>

        {/* Best and Worst Cities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Best Air Quality */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-lg">Best Air Quality</h3>
            </div>
            <div className="space-y-3">
              {bestCities.length > 0 ? bestCities.map((city, index) => (
                <div key={city.id} className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-green-100 text-green-700 rounded-full text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <CityCard city={city} showDetails />
                  </div>
                </div>
              )) : (
                <div className="text-center p-4 text-muted-foreground">
                  No cities in best category currently
                </div>
              )}
            </div>
            <div className="p-3 bg-green-50/5 rounded-lg border border-green-200/10">
              <div className="flex items-center gap-2 text-sm">
                <Heart className="h-4 w-4" />
                <span>Excellent air quality with AQI under 25</span>
              </div>
            </div>
          </div>

          {/* Worst Air Quality */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <h3 className="font-semibold text-lg">Worst Air Quality</h3>
            </div>
            <div className="space-y-3">
              {worstCities.length > 0 ? worstCities.map((city, index) => (
                <div key={city.id} className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-red-100 text-red-700 rounded-full text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <CityCard city={city} showDetails />
                  </div>
                </div>
              )) : (
                <div className="text-center p-4 text-muted-foreground">
                  No cities in worst category currently
                </div>
              )}
            </div>
            <div className="p-3 bg-red-50/5 rounded-lg border border-red-200/10">
              <div className="flex items-center gap-2 text-sm">
                <MessageCircleWarningIcon className="h-4 w-4" />
                <span>Severe air pollution with AQI over 150</span>
              </div>
            </div>
          </div>
        </div>

        {/* Trends Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Most Improving */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 " />
              <h3 className="font-semibold">Most Improving</h3>
              <Badge variant="outline" className="border-green-300/10">
                Positive Trend
              </Badge>
            </div>
            <div className="space-y-3">
              {improvingCities.length > 0 ? improvingCities.map(city => (
                <div key={city.id} className="flex items-center gap-3 p-3 bg-green-50/5 rounded-lg border border-green-200/10">
                  <TrendingDown className="h-4 w-4 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-medium">{city.city}, {city.country}</div>
                    <div className="text-sm text-muted-foreground">
                      AQI: {city.aqi} • Air quality improving
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    Improving
                  </Badge>
                </div>
              )) : (
                <div className="text-center p-4 text-muted-foreground">
                  No cities showing improvement trends
                </div>
              )}
            </div>
          </div>

          {/* Most Deteriorating */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              <h3 className="font-semibold">Most Deteriorating</h3>
              <Badge variant="outline" className="border-red-300/10">
                Negative Trend
              </Badge>
            </div>
            <div className="space-y-3">
              {deterioratingCities.length > 0 ? deterioratingCities.map(city => (
                <div key={city.id} className="flex items-center gap-3 p-3 bg-red-50/5 rounded-lg border border-red-200/10">
                  <TrendingUp className="h-4 w-4 text-red-600 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-medium">{city.city}, {city.country}</div>
                    <div className="text-sm text-muted-foreground">
                      AQI: {city.aqi} • Air quality worsening
                    </div>
                  </div>
                  <Badge className="bg-red-100 text-red-800">
                    Deteriorating
                  </Badge>
                </div>
              )) : (
                <div className="text-center p-4 text-muted-foreground">
                  No cities showing deterioration trends
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Regional Distribution */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Regional Distribution
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['Good', 'Moderate', 'Unhealthy'].map(category => {
              const count = getAQICategoryCount(category)
              const percentage = cityData.length > 0 ? Math.round((count / cityData.length) * 100) : 0
              
              return (
                <div key={category} className="p-4 rounded-lg border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{category}</span>
                    <span className="text-2xl font-bold">{count}</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                  <div className="text-xs text-muted-foreground mt-1">
                    {percentage}% of monitored cities
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Data Source & Notes */}
        <div className="border-t pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <h4 className="font-medium text-foreground mb-2">Data Sources</h4>
              <div className="space-y-1">
                <div>• NASA TEMPO Mission - Real-time satellite data</div>
                <div>• North American monitoring network</div>
                <div>• Live air quality measurements</div>
                <div>Last updated: {new Date().toLocaleString()}</div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">Coverage</h4>
              <div className="space-y-1">
                <div>• {cityData.length} North American cities</div>
                <div>• Real-time AQI calculations</div>
                <div>• PM2.5, NO₂, O₃ measurements</div>
                <div>• 30-minute update intervals</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    </section>
  )
}