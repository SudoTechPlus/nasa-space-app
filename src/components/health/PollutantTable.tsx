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
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useTEMPOData } from "@/hooks/useTEMPOData"
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Info,
  Eye,
  Wind,
  Heart,
  Brain,
  Calendar
} from "lucide-react"

export const description = "Pollutant Levels and Health Impact Table"

interface Pollutant {
  id: string
  name: string
  chemicalFormula: string
  currentLevel: number
  unit: string
  whoGuideline: number
  epaGuideline: number
  trend: 'up' | 'down' | 'stable'
  healthEffects: string[]
  sources: string[]
  color: string
  riskLevel: 'low' | 'moderate' | 'high' | 'very-high'
}

const getPollutantColor = (level: number, guideline: number) => {
  const ratio = level / guideline
  if (ratio <= 0.5) return "#00E400" // Good
  if (ratio <= 1) return "#FFFF00"   // Moderate
  if (ratio <= 2) return "#FF7E00"   // Unhealthy for sensitive
  if (ratio <= 3) return "#FF0000"   // Unhealthy
  return "#8F3F97"                   // Very unhealthy
}

const getRiskLevel = (level: number, guideline: number): Pollutant['riskLevel'] => {
  const ratio = level / guideline
  if (ratio <= 0.5) return 'low'
  if (ratio <= 1) return 'moderate'
  if (ratio <= 2) return 'high'
  return 'very-high'
}

const calculateTrend = (currentData: any, previousData: any, pollutantId: string): 'up' | 'down' | 'stable' => {
  if (!currentData || !previousData) return 'stable'
  
  const current = currentData[pollutantId as keyof typeof currentData] as number
  const previous = previousData[pollutantId as keyof typeof previousData] as number
  
  if (!current || !previous) return 'stable'
  
  const change = ((current - previous) / previous) * 100
  
  if (change > 5) return 'up'
  if (change < -5) return 'down'
  return 'stable'
}

// Base pollutant data structure with guidelines and metadata
const basePollutantData: Omit<Pollutant, 'currentLevel' | 'trend' | 'riskLevel'>[] = [
  {
    id: "pm25",
    name: "Fine Particulate Matter",
    chemicalFormula: "PM₂.₅",
    unit: "μg/m³",
    whoGuideline: 5,
    epaGuideline: 12,
    healthEffects: [
      "Lung cancer risk",
      "Respiratory diseases",
      "Cardiovascular issues",
      "Premature mortality"
    ],
    sources: [
      "Vehicle emissions",
      "Industrial processes",
      "Wildfires",
      "Power plants"
    ],
    color: "#FF6B6B"
  },
  {
    id: "pm10",
    name: "Coarse Particulate Matter",
    chemicalFormula: "PM₁₀",
    unit: "μg/m³",
    whoGuideline: 15,
    epaGuideline: 35,
    healthEffects: [
      "Respiratory irritation",
      "Asthma exacerbation",
      "Reduced lung function"
    ],
    sources: [
      "Dust and construction",
      "Industrial emissions",
      "Agriculture"
    ],
    color: "#4ECDC4"
  },
  {
    id: "no2",
    name: "Nitrogen Dioxide",
    chemicalFormula: "NO₂",
    unit: "ppb",
    whoGuideline: 10,
    epaGuideline: 53,
    healthEffects: [
      "Asthma development",
      "Bronchitis symptoms",
      "Increased respiratory infections"
    ],
    sources: [
      "Vehicle exhaust",
      "Power plants",
      "Industrial combustion"
    ],
    color: "#45B7D1"
  },
  {
    id: "o3",
    name: "Ozone",
    chemicalFormula: "O₃",
    unit: "ppb",
    whoGuideline: 50,
    epaGuideline: 70,
    healthEffects: [
      "Chest pain and coughing",
      "Throat irritation",
      "Worsening of lung diseases"
    ],
    sources: [
      "Chemical reactions in atmosphere",
      "Industrial emissions",
      "Vehicle exhaust"
    ],
    color: "#96CEB4"
  },
  {
    id: "so2",
    name: "Sulfur Dioxide",
    chemicalFormula: "SO₂",
    unit: "ppb",
    whoGuideline: 7,
    epaGuideline: 75,
    healthEffects: [
      "Respiratory symptoms",
      "Airway inflammation",
      "Asthma exacerbation"
    ],
    sources: [
      "Coal and oil burning",
      "Industrial processes",
      "Power generation"
    ],
    color: "#FFEAA7"
  },
  {
    id: "co",
    name: "Carbon Monoxide",
    chemicalFormula: "CO",
    unit: "ppm",
    whoGuideline: 4,
    epaGuideline: 9,
    healthEffects: [
      "Headaches and dizziness",
      "Reduced oxygen delivery",
      "Cardiovascular strain"
    ],
    sources: [
      "Vehicle exhaust",
      "Industrial processes",
      "Residential heating"
    ],
    color: "#DDA0DD"
  }
]

const RiskBadge = ({ level }: { level: Pollutant['riskLevel'] }) => {
  const config = {
    low: { label: "Low", className: "bg-green-100 text-green-800 border-green-200" },
    moderate: { label: "Moderate", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
    high: { label: "High", className: "bg-orange-100 text-orange-800 border-orange-200" },
    'very-high': { label: "Very High", className: "bg-red-100 text-red-800 border-red-200" }
  }

  return (
    <Badge variant="outline" className={`text-xs ${config[level].className}`}>
      {config[level].label}
    </Badge>
  )
}

const TrendIcon = ({ trend }: { trend: Pollutant['trend'] }) => {
  if (trend === 'up') return <TrendingUp className="h-4 w-4 text-red-500" />
  if (trend === 'down') return <TrendingDown className="h-4 w-4 text-green-500" />
  return <Minus className="h-4 w-4 text-gray-500" />
}

export default function PollutantTable() {
  const { data: tempoData, isLoading, error } = useTEMPOData()
  const [expandedRow, setExpandedRow] = React.useState<string | null>(null)

  // Transform TEMPO data into pollutant data
  const updatedPollutantData = React.useMemo(() => {
    if (!tempoData || tempoData.length === 0) {
      // Return base data with zero values if no TEMPO data
      return basePollutantData.map(pollutant => ({
        ...pollutant,
        currentLevel: 0,
        trend: 'stable' as const,
        riskLevel: 'low' as const
      }))
    }

    const latestData = tempoData[tempoData.length - 1]
    const previousData = tempoData.length > 1 ? tempoData[tempoData.length - 2] : null

    return basePollutantData.map(pollutant => {
      const currentLevel = latestData[pollutant.id as keyof typeof latestData] as number || 0
      const trend = calculateTrend(latestData, previousData, pollutant.id)
      
      return {
        ...pollutant,
        currentLevel,
        trend,
        riskLevel: getRiskLevel(currentLevel, pollutant.whoGuideline)
      }
    })
  }, [tempoData])

  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id)
  }

  const getComplianceStatus = (current: number, guideline: number, agency: 'WHO' | 'EPA') => {
    const ratio = current / guideline
    if (ratio <= 1) return { status: "Compliant", color: "text-green-600" }
    if (ratio <= 1.5) return { status: "Moderate", color: "text-yellow-600" }
    if (ratio <= 2) return { status: "Poor", color: "text-orange-600" }
    return { status: "Critical", color: "text-red-600" }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pollutant Levels</CardTitle>
          <CardDescription>
            Loading current pollutant measurements from NASA TEMPO...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Analyzing real-time pollutant data</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pollutant Levels</CardTitle>
          <CardDescription>
            Error loading data from NASA TEMPO
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48">
          <div className="text-center text-red-600">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">Failed to load real-time data</p>
            <p className="text-xs text-muted-foreground mt-1">Using baseline information</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const hasRealData = tempoData && tempoData.length > 0

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Pollutant Levels & Guidelines
              {hasRealData && (
                <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700">
                  Live Data
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {hasRealData 
                ? "Real-time measurements from NASA TEMPO compared to health guidelines"
                : "Baseline pollutant information - waiting for real-time data"
              }
            </CardDescription>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date().toLocaleDateString()}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-4 font-semibold text-sm">Pollutant</th>
                <th className="text-left p-4 font-semibold text-sm">Current Level</th>
                <th className="text-left p-4 font-semibold text-sm">WHO Guideline</th>
                <th className="text-left p-4 font-semibold text-sm">EPA Standard</th>
                <th className="text-left p-4 font-semibold text-sm">Trend</th>
                <th className="text-left p-4 font-semibold text-sm">Risk Level</th>
                <th className="w-10 p-4"></th>
              </tr>
            </thead>
            <tbody>
              {updatedPollutantData.map((pollutant) => {
                const whoCompliance = getComplianceStatus(pollutant.currentLevel, pollutant.whoGuideline, 'WHO')
                const epaCompliance = getComplianceStatus(pollutant.currentLevel, pollutant.epaGuideline, 'EPA')
                const whoRatio = (pollutant.currentLevel / pollutant.whoGuideline) * 100
                const epaRatio = (pollutant.currentLevel / pollutant.epaGuideline) * 100

                return (
                  <React.Fragment key={pollutant.id}>
                    <tr 
                      className="border-b hover:bg-muted/30 cursor-pointer transition-colors"
                      onClick={() => toggleRow(pollutant.id)}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: getPollutantColor(pollutant.currentLevel, pollutant.whoGuideline) }}
                          />
                          <div>
                            <div className="font-medium">{pollutant.name}</div>
                            <div className="text-sm text-muted-foreground">{pollutant.chemicalFormula}</div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="font-medium">
                            {pollutant.currentLevel > 0 ? pollutant.currentLevel.toFixed(1) : '--'} {pollutant.unit}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {hasRealData ? 'real-time' : 'no data'}
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{pollutant.whoGuideline} {pollutant.unit}</span>
                            <span className={`text-xs ${whoCompliance.color}`}>
                              {whoCompliance.status}
                            </span>
                          </div>
                          <Progress
                            value={Math.min(100, whoRatio)}
                            className="h-1"
                            style={{
                              backgroundColor: '#e5e7eb',
                              '--progress-color': getPollutantColor(pollutant.currentLevel, pollutant.whoGuideline)
                            } as React.CSSProperties & { '--progress-color': string }}
                          />
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{pollutant.epaGuideline} {pollutant.unit}</span>
                            <span className={`text-xs ${epaCompliance.color}`}>
                              {epaCompliance.status}
                            </span>
                          </div>
                          <Progress
                            value={Math.min(100, epaRatio)}
                            className="h-1"
                            style={{
                              backgroundColor: '#e5e7eb',
                              '--progress-color': getPollutantColor(pollutant.currentLevel, pollutant.epaGuideline)
                            } as React.CSSProperties & { '--progress-color': string }}
                          />
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <TrendIcon trend={pollutant.trend} />
                          <span className="text-sm capitalize">{pollutant.trend}</span>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <RiskBadge level={pollutant.riskLevel} />
                      </td>
                      
                      <td className="p-4">
                        <button className="p-1 hover:bg-muted rounded transition-colors">
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </td>
                    </tr>
                    
                    {/* Expanded Details Row */}
                    {expandedRow === pollutant.id && (
                      <tr className="border-b bg-muted/20">
                        <td colSpan={7} className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Health Effects */}
                            <div className="space-y-3">
                              <h4 className="font-semibold flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-orange-600" />
                                Health Effects
                              </h4>
                              <div className="space-y-2">
                                {pollutant.healthEffects.map((effect, index) => (
                                  <div key={index} className="flex items-start gap-2 text-sm">
                                    <div className="w-1 h-1 bg-muted-foreground rounded-full mt-2 flex-shrink-0" />
                                    <span>{effect}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            {/* Sources */}
                            <div className="space-y-3">
                              <h4 className="font-semibold flex items-center gap-2">
                                <Wind className="h-4 w-4 text-blue-600" />
                                Primary Sources
                              </h4>
                              <div className="space-y-2">
                                {pollutant.sources.map((source, index) => (
                                  <div key={index} className="flex items-start gap-2 text-sm">
                                    <div className="w-1 h-1 bg-muted-foreground rounded-full mt-2 flex-shrink-0" />
                                    <span>{source}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            {/* Additional Info */}
                            <div className="space-y-3">
                              <h4 className="font-semibold flex items-center gap-2">
                                <Brain className="h-4 w-4 text-purple-600" />
                                Health Impact
                              </h4>
                              <div className="text-sm space-y-1">
                                <div className="flex justify-between">
                                  <span>Exposure Risk:</span>
                                  <RiskBadge level={pollutant.riskLevel} />
                                </div>
                                <div className="flex justify-between">
                                  <span>WHO Compliance:</span>
                                  <span className={whoCompliance.color}>{whoCompliance.status}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>EPA Compliance:</span>
                                  <span className={epaCompliance.color}>{epaCompliance.status}</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Recommendations */}
                            <div className="space-y-3">
                              <h4 className="font-semibold flex items-center gap-2">
                                <Heart className="h-4 w-4 text-red-600" />
                                Recommendations
                              </h4>
                              <div className="text-sm space-y-1">
                                {pollutant.riskLevel === 'low' && (
                                  <p>Normal activities are safe. No special precautions needed.</p>
                                )}
                                {pollutant.riskLevel === 'moderate' && (
                                  <p>Sensitive individuals should consider reducing prolonged outdoor exertion.</p>
                                )}
                                {pollutant.riskLevel === 'high' && (
                                  <p>Everyone should reduce prolonged outdoor exertion. Sensitive groups should avoid outdoor activities.</p>
                                )}
                                {pollutant.riskLevel === 'very-high' && (
                                  <p>Avoid all outdoor activities. Use air purifiers and keep windows closed.</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Legend and Notes */}
        <div className="p-4 border-t bg-muted/20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold">Compliance Legend</h4>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span>Compliant (≤100% guideline)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span>Moderate (100-150%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500" />
                  <span>Poor (150-200%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span>Critical (200%)</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">Data Sources</h4>
              <div className="text-muted-foreground space-y-1">
                <div>• NASA TEMPO Mission - Real-time measurements</div>
                <div>• WHO Global Air Quality Guidelines</div>
                <div>• EPA National Ambient Air Quality Standards</div>
                <div>Last updated: {new Date().toLocaleTimeString()}</div>
                {!hasRealData && (
                  <div className="text-amber-600 text-xs">
                    • Currently showing baseline data - waiting for TEMPO feed
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}