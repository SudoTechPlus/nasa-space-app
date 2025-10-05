/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useTEMPOData } from "@/hooks/useTEMPOData"
import { Gauge, GaugeContainer } from "@/components/ui/gauge"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "../ui/button"

export const description = "Current Air Quality Index Display"

// Air quality index color mapping
const getAQIInfo = (aqi: number) => {
  if (aqi <= 50) return { 
    level: "Good", 
    color: "#00E400",
    description: "Air quality is satisfactory",
    icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
    bgColor: "bg-green-50",
    textColor: "text-green-800",
    borderColor: "border-green-200"
  }
  if (aqi <= 100) return { 
    level: "Moderate", 
    color: "#FFFF00",
    description: "Air quality is acceptable",
    icon: <CheckCircle2 className="h-5 w-5 text-yellow-600" />,
    bgColor: "bg-yellow-50",
    textColor: "text-yellow-800",
    borderColor: "border-yellow-200"
  }
  if (aqi <= 150) return { 
    level: "Unhealthy for Sensitive Groups", 
    color: "#FF7E00",
    description: "Members of sensitive groups may be affected",
    icon: <AlertTriangle className="h-5 w-5 text-orange-600" />,
    bgColor: "bg-orange-50",
    textColor: "text-orange-800",
    borderColor: "border-orange-200"
  }
  if (aqi <= 200) return { 
    level: "Unhealthy", 
    color: "#FF0000",
    description: "Everyone may be affected",
    icon: <AlertCircle className="h-5 w-5 text-red-600" />,
    bgColor: "bg-red-50",
    textColor: "text-red-800",
    borderColor: "border-red-200"
  }
  if (aqi <= 300) return { 
    level: "Very Unhealthy", 
    color: "#8F3F97",
    description: "Health alert: everyone may experience more serious health effects",
    icon: <AlertCircle className="h-5 w-5 text-purple-600" />,
    bgColor: "bg-purple-50",
    textColor: "text-purple-800",
    borderColor: "border-purple-200"
  }
  return { 
    level: "Hazardous", 
    color: "#7E0023",
    description: "Health warning of emergency conditions",
    icon: <AlertCircle className="h-5 w-5 text-rose-600" />,
    bgColor: "bg-rose-50",
    textColor: "text-rose-800",
    borderColor: "border-rose-200"
  }
}

// Helper function to get selected location from localStorage
const getSelectedLocation = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const savedLocation = localStorage.getItem('selectedLocation');
    return savedLocation ? JSON.parse(savedLocation) : null;
  } catch (error) {
    console.error('Error parsing selected location:', error);
    return null;
  }
}

// Get current AQI from TEMPO data
const getCurrentAQI = (tempoData: any[]) => {
  if (!tempoData || tempoData.length === 0) return null;
  
  // Get the most recent data point (last in array)
  const latestData = tempoData[tempoData.length - 1];
  return latestData?.aqi || null;
}

// Get location display name
const getLocationDisplayName = () => {
  const selectedLocation = getSelectedLocation();
  if (!selectedLocation) return "Current Location";
  
  return `${selectedLocation.city}, ${selectedLocation.country}`;
}

export default function CurrentAQIDisplay() {
  const [selectedLocation, setSelectedLocation] = React.useState<any>(null);

  const { data: tempoData, isLoading, isError, error, refetch } = useTEMPOData(
    selectedLocation?.lat,
    selectedLocation?.lng
  );

  const currentAQI = React.useMemo(() => {
    if (!tempoData || tempoData.length === 0) return null;
    return getCurrentAQI(tempoData);
  }, [tempoData]);

  const aqiInfo = currentAQI ? getAQIInfo(currentAQI) : getAQIInfo(0);
  
  // Calculate gauge value (0-100 scale for visualization)
  const gaugeValue = currentAQI ? Math.min(100, (currentAQI / 300) * 100) : 0;

  // Get last update time
  const lastUpdateTime = React.useMemo(() => {
    if (!tempoData || tempoData.length === 0) return null;
    return tempoData[tempoData.length - 1]?.timestamp 
      ? new Date(tempoData[tempoData.length - 1].timestamp) 
      : null;
  }, [tempoData]);

  React.useEffect(() => {
    setSelectedLocation(getSelectedLocation());
  }, []);


  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Current Air Quality</CardTitle>
          <CardDescription>
            Loading NASA TEMPO data for {getLocationDisplayName()}...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Initializing air quality data</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isError || !currentAQI) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Current Air Quality</CardTitle>
          <CardDescription className="font-thin">
            {getLocationDisplayName()}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-48 space-y-4">
          <div className="text-center text-red-600">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>Unable to load air quality data</p>
            <p className="text-sm text-muted-foreground mt-1">
              {error?.message || "Please check your connection and try again"}
            </p>
          </div>
          <Button 
            onClick={() => refetch()}
            variant="outline" 
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">Current Air Quality</CardTitle>
            <CardDescription className="font-thin">
              {getLocationDisplayName()}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => refetch()}
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              title="Refresh data"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            {aqiInfo.icon}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Main AQI Display */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <GaugeContainer className="w-48 h-48">
              <Gauge 
                value={gaugeValue}
                size="full"
                strokeWidth={8}
                valueFormatter={() => `${currentAQI} AQI`}
              />
            </GaugeContainer>
          </div>
          
          <div className="space-y-2">
            <Badge className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-black ${aqiInfo.bgColor} ${aqiInfo.borderColor}`}>
              <span className="font-semibold text-sm">{aqiInfo.level}</span>
            </Badge>
            <p className="text-sm text-muted-foreground">
              {aqiInfo.description}
            </p>
          </div>
        </div>

        {/* Pollutant Breakdown */}
        {tempoData && tempoData.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Pollutant Levels</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between items-center p-2 bg-muted/30 rounded">
                <span>PM2.5</span>
                <span className="font-medium">{tempoData[tempoData.length - 1].pm25.toFixed(1)} µg/m³</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-muted/30 rounded">
                <span>NO₂</span>
                <span className="font-medium">{tempoData[tempoData.length - 1].no2.toFixed(1)} ppb</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-muted/30 rounded">
                <span>O₃</span>
                <span className="font-medium">{tempoData[tempoData.length - 1].o3.toFixed(1)} ppb</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-muted/30 rounded">
                <span>SO₂</span>
                <span className="font-medium">{tempoData[tempoData.length - 1].so2.toFixed(1)} ppb</span>
              </div>
            </div>
          </div>
        )}

        {/* Data Source */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>NASA TEMPO</span>
            <span>
              Updated: {lastUpdateTime 
                ? lastUpdateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : 'No data'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

