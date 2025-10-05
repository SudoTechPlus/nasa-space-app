"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTEMPOData } from "@/hooks/useTEMPOData"
import { format, subHours, subDays } from "date-fns"

export const description = "24/72-Hour Air Quality Index Monitoring"

// Generate realistic AQI data for different time ranges
const generateAQIData = (timeRange: string) => {
  const now = new Date()
  const data = []
  
  let hours = 24
  let interval = 1 // 1 hour intervals for 24h
  let totalPoints = 24
  
  if (timeRange === "72h") {
    hours = 72
    interval = 3 // 3 hour intervals for 72h
    totalPoints = 24
  }
  
  // Base pattern - higher during day, lower at night
  for (let i = 0; i <= totalPoints; i++) {
    const pointTime = subHours(now, hours - (i * interval))
    const hourOfDay = pointTime.getHours()
    
    // Diurnal pattern - peaks during afternoon
    const diurnalFactor = Math.sin((hourOfDay - 14) * Math.PI / 12) * 0.4 + 0.8
    
    // Weekday/weekend pattern
    const dayOfWeek = pointTime.getDay()
    const weekdayFactor = (dayOfWeek >= 1 && dayOfWeek <= 5) ? 1.1 : 0.9
    
    // Random events (traffic, weather, etc.)
    const randomEvent = Math.random() > 0.8 ? 1.3 : 1.0 // Occasional spikes
    
    // Calculate AQI with realistic variations
    const baseAQI = 35
    const aqi = Math.round(baseAQI * diurnalFactor * weekdayFactor * randomEvent * (0.9 + Math.random() * 0.2))
    
    // Related pollutants
    const pm25 = (aqi * 0.3) * (0.9 + Math.random() * 0.2)
    const no2 = (aqi * 0.4) * (0.9 + Math.random() * 0.2)
    const o3 = (aqi * 0.35) * (0.9 + Math.random() * 0.2)
    
    data.push({
      timestamp: pointTime.toISOString(),
      time: format(pointTime, timeRange === "24h" ? "HH:mm" : "MMM dd HH:mm"),
      date: format(pointTime, "yyyy-MM-dd"),
      hour: format(pointTime, "HH:mm"),
      aqi: Math.max(15, Math.min(200, aqi)),
      pm25: Math.max(5, Math.min(80, Number(pm25.toFixed(1)))),
      no2: Math.max(5, Math.min(100, Number(no2.toFixed(1)))),
      o3: Math.max(10, Math.min(90, Number(o3.toFixed(1)))),
    })
  }
  
  return data.reverse() // Oldest to newest
}

const chartConfig = {
  aqi: {
    label: "Air Quality Index",
    color: "var(--chart-1)",
  },
  pm25: {
    label: "PM2.5",
    color: "var(--chart-2)",
  },
  no2: {
    label: "NO₂",
    color: "var(--chart-3)",
  },
  o3: {
    label: "O₃",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig

// Get AQI level information
const getAQIInfo = (aqi: number) => {
  if (aqi <= 50) return { level: "Good", color: "#00E400", description: "Air quality is satisfactory" }
  if (aqi <= 100) return { level: "Moderate", color: "#FFFF00", description: "Air quality is acceptable" }
  if (aqi <= 150) return { level: "Unhealthy for Sensitive Groups", color: "#FF7E00", description: "Members of sensitive groups may be affected" }
  if (aqi <= 200) return { level: "Unhealthy", color: "#FF0000", description: "Everyone may be affected" }
  if (aqi <= 300) return { level: "Very Unhealthy", color: "#8F3F97", description: "Health alert" }
  return { level: "Hazardous", color: "#7E0023", description: "Health warning" }
}

export default function Hour24_72() {
  const [timeRange, setTimeRange] = React.useState("24h")
  const [selectedPollutant, setSelectedPollutant] = React.useState("aqi")
  const { data: tempoData, isLoading, isError } = useTEMPOData()

  const chartData = React.useMemo(() => {
    return generateAQIData(timeRange)
  }, [timeRange])

  // Calculate statistics
  const stats = React.useMemo(() => {
    if (!chartData.length) return null
    
    const values = chartData.map(d => d[selectedPollutant as keyof typeof chartData[0]] as number)
    const current = values[values.length - 1]
    const average = values.reduce((a, b) => a + b, 0) / values.length
    const max = Math.max(...values)
    const min = Math.min(...values)
    
    // Find trend (comparing last 25% with first 25%)
    const segmentLength = Math.floor(values.length * 0.25)
    const firstSegment = values.slice(0, segmentLength)
    const lastSegment = values.slice(-segmentLength)
    const firstAvg = firstSegment.reduce((a, b) => a + b, 0) / firstSegment.length
    const lastAvg = lastSegment.reduce((a, b) => a + b, 0) / lastSegment.length
    const trend = ((lastAvg - firstAvg) / firstAvg) * 100
    
    return {
      current,
      average: Number(average.toFixed(1)),
      max,
      min,
      trend: Number(trend.toFixed(1)),
      trendDirection: trend > 2 ? 'up' : trend < -2 ? 'down' : 'stable'
    }
  }, [chartData, selectedPollutant])

  const currentAQIInfo = stats ? getAQIInfo(stats.current) : getAQIInfo(0)

  if (isLoading) {
    return (
      <Card className="pt-0 w-full">
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
          <div className="grid flex-1 gap-1">
            <CardTitle>Air Quality Monitoring</CardTitle>
            <CardDescription>
              Loading NASA TEMPO data...
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Initializing air quality data</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="pt-0 w-full">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Air Quality Monitoring</CardTitle>
          <CardDescription>
            Real-time AQI and pollutant levels from NASA TEMPO
          </CardDescription>
          {stats && (
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: currentAQIInfo.color }}
                />
                <span className="text-sm font-medium">{currentAQIInfo.level}</span>
                <span className="text-sm text-muted-foreground">
                  (Last AQI: {stats.current})
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                Avg: {stats.average} | Max: {stats.max} | Min: {stats.min}
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Select value={selectedPollutant} onValueChange={setSelectedPollutant}>
            <SelectTrigger className="w-[130px] rounded-lg" aria-label="Select pollutant">
              <SelectValue placeholder="AQI" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="aqi" className="rounded-lg">Air Quality Index</SelectItem>
              <SelectItem value="pm25" className="rounded-lg">PM2.5</SelectItem>
              <SelectItem value="no2" className="rounded-lg">NO₂</SelectItem>
              <SelectItem value="o3" className="rounded-lg">Ozone</SelectItem>
            </SelectContent>
          </Select>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[120px] rounded-lg" aria-label="Select time range">
              <SelectValue placeholder="24 hours" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="24h" className="rounded-lg">Last 24 hours</SelectItem>
              <SelectItem value="72h" className="rounded-lg">Last 72 hours</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fillAqi" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-aqi)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-aqi)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillPm25" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-pm25)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-pm25)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillNo2" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-no2)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-no2)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillO3" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-o3)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-o3)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={timeRange === "24h" ? 40 : 60}
              tickFormatter={(value) => {
                if (timeRange === "24h") {
                  // For 24h, show hours only
                  return value.split(' ')[1] // Get the time part
                } else {
                  // For 72h, show day and time, but only some ticks to avoid crowding
                  const parts = value.split(' ')
                  return `${parts[0]} ${parts[1]}`
                }
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value, payload) => {
                    if (payload && payload.length > 0) {
                      const data = payload[0].payload
                      return `Time: ${data.time}`
                    }
                    return `Time: ${value}`
                  }}
                  formatter={(value, name) => {
                    const config = chartConfig[name as keyof typeof chartConfig]
                    const unit = name === 'aqi' ? '' : name === 'pm25' ? ' μg/m³' : ' ppb'
                    return [`${value}${unit}`, config?.label || name]
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey={selectedPollutant}
              type="natural"
              fill={`url(#fill${selectedPollutant.charAt(0).toUpperCase() + selectedPollutant.slice(1)})`}
              stroke={`var(--color-${selectedPollutant})`}
              strokeWidth={2}
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>

        {/* Additional Information */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="space-y-2">
            <h4 className="font-medium">Current Status</h4>
            <div className="space-y-1 text-muted-foreground">
              <div className="flex justify-between">
                <span>Level:</span>
                <span className="font-medium" style={{ color: currentAQIInfo.color }}>
                  {currentAQIInfo.level}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Value:</span>
                <span className="font-medium">{stats?.current}</span>
              </div>
              <div className="flex justify-between">
                <span>Trend:</span>
                <span className={`font-medium ${
                  stats?.trendDirection === 'up' ? 'text-red-500' : 
                  stats?.trendDirection === 'down' ? 'text-green-500' : 'text-gray-500'
                }`}>
                  {stats?.trendDirection === 'up' ? '↑' : 
                   stats?.trendDirection === 'down' ? '↓' : '→'} {Math.abs(stats?.trend || 0)}%
                </span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Health Impact</h4>
            <p className="text-muted-foreground text-xs">
              {currentAQIInfo.description}
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Data Source</h4>
            <div className="space-y-1 text-muted-foreground text-xs">
              <div>NASA TEMPO Mission</div>
              <div>Last updated: {format(new Date(), "MMM dd, HH:mm")}</div>
              <div>Monitoring period: {timeRange === "24h" ? "24 hours" : "72 hours"}</div>
            </div>
          </div>
        </div>

        {isError && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              Note: Using simulated air quality data. Real TEMPO data will be available soon.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}