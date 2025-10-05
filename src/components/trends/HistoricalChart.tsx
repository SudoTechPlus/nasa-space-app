"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
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
import { Badge } from "@/components/ui/badge"
import { useTEMPOHistoricalData } from "@/hooks/useTEMPOData"
import { format, subDays, subMonths, subYears, parseISO } from "date-fns"
import { TrendingUp, TrendingDown, Calendar, MapPin } from "lucide-react"

export const description = "Historical Air Quality Trends"

// Generate realistic historical pollution data
const generateHistoricalData = (timeRange: string, location?: string) => {
  const now = new Date()
  const data = []
  
  let points = 30
  let dateFunction = (i: number) => subDays(now, i)
  let dateFormat = "MMM dd"
  
  if (timeRange === "1y") {
    points = 12
    dateFunction = (i: number) => subMonths(now, i)
    dateFormat = "MMM yyyy"
  } else if (timeRange === "5y") {
    points = 5
    dateFunction = (i: number) => subYears(now, i)
    dateFormat = "yyyy"
  } else if (timeRange === "3m") {
    points = 90
    dateFunction = (i: number) => subDays(now, i)
    dateFormat = "MMM dd"
  }

  // Base pollution levels with seasonal variations and long-term trends
  const baseLevels = getBaseLevelsByLocation(location)
  const seasonalAmplitude = 15 // How much seasonal variation
  const longTermTrend = -0.8 // Slight improvement trend per year

  for (let i = points; i >= 0; i--) {
    const date = dateFunction(i)
    const month = date.getMonth()
    const year = date.getFullYear()
    
    // Seasonal pattern - higher in winter (heating) and summer (ozone)
    const seasonal = Math.sin((month - 2) * Math.PI / 6) * seasonalAmplitude
    
    // Long-term trend (slight improvement over years)
    const yearsFromNow = (now.getFullYear() - year) + (now.getMonth() - date.getMonth()) / 12
    const trendEffect = longTermTrend * yearsFromNow
    
    // Random events (wildfires, dust storms, etc.)
    const randomEvent = Math.random() > 0.95 ? 40 : Math.random() > 0.98 ? -20 : 0
    
    // Calculate pollutants with realistic correlations
    const baseAQI = baseLevels.aqi + seasonal + trendEffect + randomEvent
    const aqi = Math.max(10, Math.min(300, baseAQI))
    
    data.push({
      date: date.toISOString().split('T')[0],
      displayDate: format(date, dateFormat),
      fullDate: format(date, "MMM dd, yyyy"),
      aqi: Math.round(aqi),
      pm25: Math.max(2, Math.min(80, (aqi * 0.28) * (0.9 + Math.random() * 0.2))),
      no2: Math.max(5, Math.min(60, (aqi * 0.35) * (0.9 + Math.random() * 0.2))),
      o3: Math.max(10, Math.min(90, (aqi * 0.32) * (0.9 + Math.random() * 0.2))),
      so2: Math.max(1, Math.min(25, (aqi * 0.15) * (0.9 + Math.random() * 0.2))),
      month: format(date, "MMM"),
      year: year.toString(),
      season: getSeason(month),
    })
  }
  
  return data.reverse()
}

const getBaseLevelsByLocation = (location?: string) => {
  const bases = {
    urban: { aqi: 65, pm25: 18, no2: 25, o3: 35, so2: 8 },
    suburban: { aqi: 45, pm25: 12, no2: 15, o3: 30, so2: 4 },
    rural: { aqi: 35, pm25: 8, no2: 10, o3: 25, so2: 2 },
    industrial: { aqi: 75, pm25: 22, no2: 35, o3: 40, so2: 15 },
  }
  
  return bases[location as keyof typeof bases] || bases.urban
}

const getSeason = (month: number) => {
  if (month >= 2 && month <= 4) return 'Spring'
  if (month >= 5 && month <= 7) return 'Summer'
  if (month >= 8 && month <= 10) return 'Fall'
  return 'Winter'
}

const chartConfig = {
  aqi: {
    label: "Air Quality Index",
    color: "var(--chart-1)",
  },
  pm25: {
    label: "PM2.5 (μg/m³)",
    color: "var(--chart-2)",
  },
  no2: {
    label: "NO₂ (ppb)",
    color: "var(--chart-3)",
  },
  o3: {
    label: "O₃ (ppb)",
    color: "var(--chart-4)",
  },
  so2: {
    label: "SO₂ (ppb)",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig

const locations = [
  { id: "urban", name: "Urban Area", description: "City center with traffic" },
  { id: "suburban", name: "Suburban", description: "Residential areas" },
  { id: "rural", name: "Rural", description: "Countryside" },
  { id: "industrial", name: "Industrial", description: "Near industrial zones" },
]

const timeRanges = [
  { id: "3m", name: "3 Months", description: "Short-term trends" },
  { id: "1y", name: "1 Year", description: "Seasonal patterns" },
  { id: "5y", name: "5 Years", description: "Long-term trends" },
]

export default function HistoricalPollutionChart() {
  const [timeRange, setTimeRange] = React.useState("1y")
  const [selectedPollutant, setSelectedPollutant] = React.useState("aqi")
  const [selectedLocation, setSelectedLocation] = React.useState("urban")
  const [showComparison, setShowComparison] = React.useState(false)

  const { data: historicalData, isLoading } = useTEMPOHistoricalData(timeRange, selectedLocation)
  
  const chartData = React.useMemo(() => {
    return generateHistoricalData(timeRange, selectedLocation)
  }, [timeRange, selectedLocation])

  // Calculate trends and statistics
  const stats = React.useMemo(() => {
    if (!chartData.length) return null
    
    const values = chartData.map(d => d[selectedPollutant as keyof typeof chartData[0]] as number)
    const current = values[values.length - 1]
    const average = values.reduce((a, b) => a + b, 0) / values.length
    const max = Math.max(...values)
    const min = Math.min(...values)
    
    // Calculate overall trend
    const firstQuarter = values.slice(0, Math.floor(values.length * 0.25))
    const lastQuarter = values.slice(-Math.floor(values.length * 0.25))
    const startAvg = firstQuarter.reduce((a, b) => a + b, 0) / firstQuarter.length
    const endAvg = lastQuarter.reduce((a, b) => a + b, 0) / lastQuarter.length
    const trend = ((endAvg - startAvg) / startAvg) * 100

    // Find peak pollution periods
    const peakPeriods = chartData
      .filter(d => d[selectedPollutant as keyof typeof chartData[0]] as number > average * 1.2)
      .map(d => d.season)
    
    const seasonCount = peakPeriods.reduce((acc, season) => {
      acc[season] = (acc[season] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const worstSeason = Object.entries(seasonCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown'

    return {
      current: Number(current.toFixed(1)),
      average: Number(average.toFixed(1)),
      max: Number(max.toFixed(1)),
      min: Number(min.toFixed(1)),
      trend: Number(trend.toFixed(1)),
      trendDirection: trend > 2 ? 'up' : trend < -2 ? 'down' : 'stable',
      improvement: startAvg - endAvg,
      worstSeason,
      peakCount: peakPeriods.length,
    }
  }, [chartData, selectedPollutant])

  const getTrendDescription = (trend: number, direction: string) => {
    if (direction === 'up') {
      return `Deteriorating by ${Math.abs(trend)}% over this period`
    } else if (direction === 'down') {
      return `Improving by ${Math.abs(trend)}% over this period`
    }
    return `Remaining relatively stable`
  }

  const getAQILevel = (aqi: number) => {
    if (aqi <= 50) return { level: "Good", color: "#00E400" }
    if (aqi <= 100) return { level: "Moderate", color: "#FFFF00" }
    if (aqi <= 150) return { level: "Unhealthy for Sensitive", color: "#FF7E00" }
    if (aqi <= 200) return { level: "Unhealthy", color: "#FF0000" }
    return { level: "Very Unhealthy", color: "#8F3F97" }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historical Air Quality Trends</CardTitle>
          <CardDescription>
            Loading historical pollution data...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Analyzing historical patterns</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-full overflow-hidden">
      <CardHeader className="px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1 flex-1 min-w-0">
            <CardTitle className="text-lg sm:text-xl truncate font-bold">Historical Air Quality Trends</CardTitle>
            <CardDescription className="text-sm line-clamp-2 sm:line-clamp-1 font-thin">
              Long-term pollution patterns and seasonal variations from NASA TEMPO
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="flex items-center gap-1 text-xs">
              <Calendar className="h-3 w-3" />
              <span className="truncate">{timeRanges.find(t => t.id === timeRange)?.name}</span>
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1 text-xs">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{locations.find(l => l.id === selectedLocation)?.name}</span>
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 px-4 sm:px-6">
        {/* Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Time Range</label>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeRanges.map(range => (
                  <SelectItem key={range.id} value={range.id}>
                    {range.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Location Type</label>
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {locations.map(location => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Pollutant</label>
            <Select value={selectedPollutant} onValueChange={setSelectedPollutant}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aqi">Air Quality Index</SelectItem>
                <SelectItem value="pm25">PM2.5</SelectItem>
                <SelectItem value="no2">Nitrogen Dioxide</SelectItem>
                <SelectItem value="o3">Ozone</SelectItem>
                <SelectItem value="so2">Sulfur Dioxide</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="space-y-1 p-3 bg-muted/50 rounded-lg">
              <div className="text-sm text-muted-foreground">Current</div>
              <div className="text-xl sm:text-2xl font-bold">{stats.current}</div>
              <div className="text-xs flex items-center gap-1 min-h-[20px]">
                {stats.trendDirection === 'up' ? (
                  <TrendingUp className="h-3 w-3 text-red-500 flex-shrink-0" />
                ) : stats.trendDirection === 'down' ? (
                  <TrendingDown className="h-3 w-3 text-green-500 flex-shrink-0" />
                ) : null}
                <span className={`truncate ${stats.trendDirection === 'up' ? 'text-red-600' : stats.trendDirection === 'down' ? 'text-green-600' : 'text-gray-600'}`}>
                  {getTrendDescription(stats.trend, stats.trendDirection)}
                </span>
              </div>
            </div>
            
            <div className="space-y-1 p-3 bg-muted/50 rounded-lg">
              <div className="text-sm text-muted-foreground">Average</div>
              <div className="text-xl sm:text-2xl font-bold">{stats.average}</div>
              <div className="text-xs text-muted-foreground truncate">
                Range: {stats.min} - {stats.max}
              </div>
            </div>
            
            <div className="space-y-1 p-3 bg-muted/50 rounded-lg">
              <div className="text-sm text-muted-foreground">Peak Periods</div>
              <div className="text-xl sm:text-2xl font-bold">{stats.peakCount}</div>
              <div className="text-xs text-muted-foreground truncate">
                Worst in {stats.worstSeason}
              </div>
            </div>
            
            <div className="space-y-1 p-3 bg-muted/50 rounded-lg">
              <div className="text-sm text-muted-foreground">Net Change</div>
              <div className={`text-xl sm:text-2xl font-bold ${stats.improvement > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.improvement > 0 ? '↓' : '↑'} {Math.abs(stats.improvement).toFixed(1)}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                Overall {stats.improvement > 0 ? 'improvement' : 'deterioration'}
              </div>
            </div>
          </div>
        )}

        {/* Chart */}
        <div className="h-[300px] sm:h-[350px] lg:h-[400px] w-full">
          <ChartContainer config={chartConfig} className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart 
                data={chartData} 
                margin={{ 
                  top: 10, 
                  right: timeRange === '5y' ? 10 : 20, 
                  left: 0, 
                  bottom: 0 
                }}
              >
                <defs>
                  {Object.keys(chartConfig).map((key) => (
                    <linearGradient key={key} id={`fill-${key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={`var(--color-${key})`} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={`var(--color-${key})`} stopOpacity={0}/>
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="displayDate"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={timeRange === '5y' ? 50 : timeRange === '1y' ? 30 : 15}
                  interval="preserveStartEnd"
                  tick={{ fontSize: timeRange === '5y' ? 10 : 12 }}
                />
                <YAxis 
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  width={timeRange === '5y' ? 30 : 35}
                  tick={{ fontSize: 12 }}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent 
                      labelFormatter={(value, payload) => {
                        if (payload && payload.length > 0) {
                          return payload[0].payload.fullDate
                        }
                        return value
                      }}
                      formatter={(value, name) => {
                        const config = chartConfig[name as keyof typeof chartConfig]
                        const unit = name === 'aqi' ? '' : name === 'pm25' ? ' μg/m³' : ' ppb'
                        return [`${value}${unit}`, config?.label || name]
                      }}
                    />
                  }
                />
                <Area
                  type="monotone"
                  dataKey={selectedPollutant}
                  stroke={`var(--color-${selectedPollutant})`}
                  fill={`url(#fill-${selectedPollutant})`}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
                <ChartLegend content={<ChartLegendContent />} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-3">
            <h4 className="font-semibold text-sm sm:text-base">Seasonal Patterns</h4>
            <div className="text-sm text-muted-foreground space-y-2">
              <p className="leading-relaxed">
                • <strong>Winter:</strong> Higher PM2.5 from heating and temperature inversions
              </p>
              <p className="leading-relaxed">
                • <strong>Summer:</strong> Increased ozone formation from sunlight and heat
              </p>
              <p className="leading-relaxed">
                • <strong>Spring/Fall:</strong> Generally better air quality with moderate temperatures
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-sm sm:text-base">Historical Context</h4>
            <div className="text-sm text-muted-foreground space-y-2">
              <p className="leading-relaxed">
                • Air quality has generally improved over the past decade due to regulations
              </p>
              <p className="leading-relaxed">
                • Wildfire seasons are becoming more significant pollution sources
              </p>
              <p className="leading-relaxed">
                • Urban areas show distinct weekday/weekend traffic patterns
              </p>
            </div>
          </div>
        </div>

        {/* Data Source */}
        <div className="text-xs text-muted-foreground border-t pt-4">
          <p className="leading-relaxed">
            <strong>Data Sources:</strong> NASA TEMPO Mission, Historical Air Quality Records, 
            EPA Monitoring Networks. Data simulated based on typical patterns until full TEMPO 
            historical data becomes available.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}