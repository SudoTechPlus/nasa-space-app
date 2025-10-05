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
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useTEMPOData } from "@/hooks/useTEMPOData"
import { useAirQualityEvents } from "@/hooks/useNasaQueries"
import {
  Heart,
  Wind,
  Eye,
  Brain,
  Baby,
  User,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Shield,
  Calendar,
  Clock,
  MapPin,
  Check
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MultiSelectConditions } from "../ui/multi-select"

export const description = "Health Risk Insights from Air Quality Data"

interface HealthProfile {
  age: string
  conditions: string[]
  sensitivity: 'low' | 'medium' | 'high'
}

const defaultHealthProfile: HealthProfile = {
  age: 'adult',
  conditions: [],
  sensitivity: 'medium'
}

const getAQIInfo = (aqi: number) => {
  if (aqi <= 50) return { 
    level: "Good", 
    color: "#00E400",
    risk: "Low",
    description: "Air quality is satisfactory"
  }
  if (aqi <= 100) return { 
    level: "Moderate", 
    color: "#FFFF00",
    risk: "Moderate",
    description: "Air quality is acceptable"
  }
  if (aqi <= 150) return { 
    level: "Unhealthy for Sensitive Groups", 
    color: "#FF7E00",
    risk: "High for Sensitive Groups",
    description: "Members of sensitive groups may be affected"
  }
  if (aqi <= 200) return { 
    level: "Unhealthy", 
    color: "#FF0000",
    risk: "High",
    description: "Everyone may be affected"
  }
  if (aqi <= 300) return { 
    level: "Very Unhealthy", 
    color: "#8F3F97",
    risk: "Very High",
    description: "Health alert: everyone may experience more serious health effects"
  }
  return { 
    level: "Hazardous", 
    color: "#7E0023",
    risk: "Hazardous",
    description: "Health warning of emergency conditions"
  }
}

const conditionsOptions = [
  { value: "respiratory", label: "Respiratory Condition" },
  { value: "heart", label: "Heart Condition" },
  { value: "pregnant", label: "Pregnancy" },
  { value: "active", label: "Active Lifestyle" },
]

const getHealthRisks = (aqi: number, profile: HealthProfile) => {
  const risks = []
  
  if (aqi > 50) {
    risks.push({
      icon: <Wind className="h-4 w-4" />,
      title: "Respiratory System",
      description: "Irritation of airways, coughing, difficulty breathing",
      severity: aqi > 100 ? "high" : "medium" as const
    })
  }

  if (aqi > 100) {
    risks.push({
      icon: <Heart className="h-4 w-4" />,
      title: "Cardiovascular System",
      description: "Increased risk of heart attacks and strokes",
      severity: aqi > 150 ? "high" : "medium" as const
    })

    risks.push({
      icon: <Eye className="h-4 w-4" />,
      title: "Eyes & Skin",
      description: "Irritation, redness, and discomfort",
      severity: "low" as const
    })
  }

  if (aqi > 150) {
    risks.push({
      icon: <Brain className="h-4 w-4" />,
      title: "Cognitive Function",
      description: "Reduced cognitive performance and increased fatigue",
      severity: "medium" as const
    })
  }

  // Profile-specific risks
  if (profile.conditions.includes('respiratory') && aqi > 50) {
    risks.push({
      icon: <Wind className="h-4 w-4" />,
      title: "Asthma/COPD Risk",
      description: "High risk of exacerbation - use inhaler as directed",
      severity: "high" as const
    })
  }

  if (profile.conditions.includes('heart') && aqi > 100) {
    risks.push({
      icon: <Heart className="h-4 w-4" />,
      title: "Cardiac Risk",
      description: "Increased strain on cardiovascular system",
      severity: "high" as const
    })
  }

  if (profile.conditions.includes('pregnant') && aqi > 100) {
    risks.push({
      icon: <Baby className="h-4 w-4" />,
      title: "Pregnancy Risk",
      description: "Potential impact on fetal development",
      severity: "medium" as const
    })
  }

  if (profile.age === 'elderly' && aqi > 100) {
    risks.push({
      icon: <User className="h-4 w-4" />,
      title: "Elderly Risk",
      description: "Increased vulnerability to respiratory and cardiac issues",
      severity: "high" as const
    })
  }

  if (profile.age === 'child' && aqi > 50) {
    risks.push({
      icon: <Baby className="h-4 w-4" />,
      title: "Children's Risk",
      description: "Developing lungs more susceptible to damage",
      severity: "medium" as const
    })
  }

  return risks
}

const getActivityRecommendations = (aqi: number, profile: HealthProfile) => {
  const recommendations = []

  if (aqi <= 50) {
    recommendations.push({
      activity: "All outdoor activities",
      recommendation: "Safe for everyone",
      icon: <CheckCircle2 className="h-4 w-4 text-green-600" />
    })
  } else if (aqi <= 100) {
    recommendations.push({
      activity: "Intense outdoor exercise",
      recommendation: profile.sensitivity === 'high' ? "Consider reducing intensity" : "Generally safe",
      icon: profile.sensitivity === 'high' ? <AlertTriangle className="h-4 w-4 text-yellow-600" /> : <CheckCircle2 className="h-4 w-4 text-green-600" />
    })
  } else if (aqi <= 150) {
    recommendations.push({
      activity: "Outdoor exercise",
      recommendation: "Sensitive groups should reduce prolonged exertion",
      icon: <AlertTriangle className="h-4 w-4 text-orange-600" />
    })
    if (profile.conditions.includes('respiratory') || profile.conditions.includes('heart')) {
      recommendations.push({
        activity: "Outdoor activities",
        recommendation: "Limit time outdoors and avoid exertion",
        icon: <AlertTriangle className="h-4 w-4 text-red-600" />
      })
    }
  } else if (aqi <= 200) {
    recommendations.push({
      activity: "All outdoor activities",
      recommendation: "Everyone should reduce prolonged exertion",
      icon: <AlertTriangle className="h-4 w-4 text-red-600" />
    })
  } else {
    recommendations.push({
      activity: "Any outdoor activities",
      recommendation: "Avoid all outdoor physical activities",
      icon: <AlertTriangle className="h-4 w-4 text-purple-600" />
    })
  }

  return recommendations
}

const getProtectiveMeasures = (aqi: number, profile: HealthProfile) => {
  const measures = []

  if (aqi > 100) {
    measures.push({
      measure: "Wear N95 mask outdoors",
      priority: aqi > 150 ? "high" : "medium" as const,
      icon: <Shield className="h-4 w-4" />
    })

    measures.push({
      measure: "Use air purifiers indoors",
      priority: aqi > 150 ? "high" : "medium" as const,
      icon: <Shield className="h-4 w-4" />
    })
  }

  if (aqi > 150) {
    measures.push({
      measure: "Keep windows closed",
      priority: "high" as const,
      icon: <Shield className="h-4 w-4" />
    })

    if (profile.conditions.includes('respiratory')) {
      measures.push({
        measure: "Carry rescue inhaler at all times",
        priority: "high" as const,
        icon: <Shield className="h-4 w-4" />
      })
    }
  }

  if (aqi > 200) {
    measures.push({
      measure: "Consider relocating if possible",
      priority: "high" as const,
      icon: <Shield className="h-4 w-4" />
    })
  }

  // Always include basic measures
  measures.push({
    measure: "Stay hydrated",
    priority: "low" as const,
    icon: <Shield className="h-4 w-4" />
  })

  return measures
}

const calculateRiskScore = (aqi: number, profile: HealthProfile) => {
  let score = aqi / 5 // Base score from AQI

  // Adjust based on health profile
  if (profile.conditions.includes('respiratory')) score += 20
  if (profile.conditions.includes('heart')) score += 25
  if (profile.conditions.includes('pregnant')) score += 15
  if (profile.age === 'elderly') score += 20
  if (profile.age === 'child') score += 15
  if (profile.sensitivity === 'high') score += 10

  return Math.min(100, Math.max(0, score))
}

export default function HealthRiskInsights() {
  const { data: tempoData, isLoading: tempoLoading } = useTEMPOData()
  const { data: events } = useAirQualityEvents(7)
  const [healthProfile, setHealthProfile] = React.useState<HealthProfile>(defaultHealthProfile)

  const currentAQI = React.useMemo(() => {
    if (!tempoData || tempoData.length === 0) return 45
    return tempoData[tempoData.length - 1]?.aqi || 45
  }, [tempoData])

  const aqiInfo = getAQIInfo(currentAQI)
  const healthRisks = getHealthRisks(currentAQI, healthProfile)
  const activityRecommendations = getActivityRecommendations(currentAQI, healthProfile)
  const protectiveMeasures = getProtectiveMeasures(currentAQI, healthProfile)
  const riskScore = calculateRiskScore(currentAQI, healthProfile)

  const updateHealthProfile = (updates: Partial<HealthProfile>) => {
    setHealthProfile(prev => ({ ...prev, ...updates }))
  }

  if (tempoLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Health Risk Insights</CardTitle>
          <CardDescription>
            Analyzing air quality health impacts...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading health risk assessment</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <section id="health">

      {/* Active Events Warning */}
      {events && events.length > 0 && (
        <div className="p-4 bg-gray-50/10 border border-gray-400/10 rounded-lg mb-10">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-orange-700 mb-2">
                {events.length} natural event{events.length !== 1 ? 's' : ''} may be affecting air quality in your region:
              </p>
              <div className="space-y-1">
                {events.slice(0, 3).map((event, index) => (
                  <div key={index} className="text-sm text-orange-600 font-thin">
                    • {event.title} ({event.categories.map(cat => cat.title).join(', ')})
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between p-5">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-2xl" />
                Health Risk Insights
              </CardTitle>
              <CardDescription className="font-thin text-xl">
                Personalized health recommendations based on current air quality
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="flex items-start justify-around gap-12">
            {/* Risk Score & Overview */}
            <div className="flex items-center justify-center gap-15">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Personal Risk Score</span>
                  
                </div>
                <Progress value={riskScore} className="h-2" />
                <div className="text-xs text-muted-foreground flex justify-between">
                  {riskScore < 30 ? "Low risk" : 
                  riskScore < 60 ? "Moderate risk" : 
                  riskScore < 80 ? "High risk" : "Very high risk"}
                  <span className="text-xs font-bold">{riskScore}/100</span>
                </div>
              </div>
            </div>

            {/* Health Profile Settings */}
            <div className="p-4 bg-muted/50 rounded-lg w-full">
              <h3 className="font-semibold mb-3">Your Health Profile</h3>
              <div className="flex items-start gap-6">
                {/* Age Group with Shadcn UI Select */}
                <div className="space-y-2 w-full">
                  <Label htmlFor="age">Age Group</Label>
                  <Select
                    value={healthProfile.age}
                    onValueChange={(val: string) => updateHealthProfile({ age: val })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select age group..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Age Groups</SelectLabel>
                        <SelectItem value="child">Child (0-12)</SelectItem>
                        <SelectItem value="teen">Teen (13-17)</SelectItem>
                        <SelectItem value="adult">Adult (18-64)</SelectItem>
                        <SelectItem value="elderly">Elderly (65+)</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2 w-full">
                  <Label htmlFor="conditions">Health Conditions / Lifestyle</Label>
                  <MultiSelectConditions
                    value={healthProfile.conditions}
                    onChange={(vals) =>
                      setHealthProfile((prev) => ({ ...prev, conditions: vals }))
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Health Risks */}
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {healthRisks.map((risk, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    risk.severity === 'high' ? 'bg-red-50/10' :
                    risk.severity === 'medium' ? 'bg-orange-50/10' :
                    'bg-yellow-50/5'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-1 rounded ${
                      risk.severity === 'high' ? 'bg-red-100/10 text-red-600' :
                      risk.severity === 'medium' ? 'bg-orange-100/10 text-orange-600' :
                      'bg-yellow-100 text-yellow-600'
                    }`}>
                      {risk.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">{risk.title}</h4>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            risk.severity === 'high' ? 'text-red-700 border-red-300/10' :
                            risk.severity === 'medium' ? 'text-orange-700 border-orange-300/10' :
                            'text-yellow-700 border-yellow-300/10'
                          }`}
                        >
                          {risk.severity.charAt(0).toUpperCase() + risk.severity.slice(1)} Risk
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{risk.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Recommendations */}
          <div>
            <h3 className="font-semibold mb-3">Activity Recommendations</h3>
            <div className="space-y-2">
              {activityRecommendations.map((rec, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-background border rounded-lg">
                  <div className="flex items-center gap-3">
                    {rec.icon}
                    <div>
                      <div className="font-medium text-sm">{rec.activity}</div>
                      <div className="text-sm text-muted-foreground">{rec.recommendation}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Protective Measures */}
          <div>
            <h3 className="font-semibold mb-3">Protective Measures</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {protectiveMeasures.map((measure, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    measure.priority === 'high' ? 'bg-blue-50 border-blue-200' :
                    measure.priority === 'medium' ? 'bg-blue-50/50 border-blue-200/50' :
                    'bg-muted/50 border-muted'
                  }`}
                >
                  <div className={`p-1 rounded ${
                    measure.priority === 'high' ? 'bg-blue-100 text-blue-600' :
                    measure.priority === 'medium' ? 'bg-blue-100/50 text-blue-600' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {measure.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{measure.measure}</span>
                      {measure.priority === 'high' && (
                        <Badge variant="destructive" className="text-xs">High Priority</Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          

          {/* Data Source & Disclaimer */}
          <div className="text-xs text-muted-foreground border-t pt-4">
            <p className="mb-2">
              <strong>Data Sources:</strong> NASA TEMPO Mission, EPA Air Quality Guidelines, WHO Health Recommendations
            </p>
            <p>
              <strong>Disclaimer:</strong> This health risk assessment is for informational purposes only and should not replace professional medical advice. 
              Consult with healthcare providers for personalized medical guidance.
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}