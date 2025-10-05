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
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTEMPOData } from "@/hooks/useTEMPOData"
import { useAirQualityEvents } from '@/hooks/useNasaQueries'
import {
  Calculator,
  AlertTriangle,
  DollarSign,
  Heart,
  MapPin,
  User,
  Activity,
  Shield,
  MessageCircleWarningIcon,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

export const description = "Personal Exposure Risk Prediction with Cost Analysis"

interface ExposureProfile {
  hoursOutdoors: number
  activityLevel: 'sedentary' | 'moderate' | 'vigorous'
  useMask: boolean
  hasAirPurifier: boolean
  commuteType: 'none' | 'walking' | 'public' | 'car'
  workEnvironment: 'office' | 'outdoor' | 'industrial' | 'remote'
  healthConditions: string[]
}

const defaultExposureProfile: ExposureProfile = {
  hoursOutdoors: 4,
  activityLevel: 'moderate',
  useMask: false,
  hasAirPurifier: false,
  commuteType: 'car',
  workEnvironment: 'office',
  healthConditions: []
}

interface CostBreakdown {
  healthcare: number
  productivity: number
  medication: number
  equipment: number
  total: number
}

const calculateExposureRisk = (aqi: number, profile: ExposureProfile) => {
  // Base exposure based on AQI
  let exposureFactor = aqi / 50 // Normalize to good AQI level
  
  // Adjust based on time outdoors
  exposureFactor *= (profile.hoursOutdoors / 8)
  
  // Activity level adjustment (breathing rate)
  const activityMultipliers = {
    sedentary: 1.0,
    moderate: 1.5,
    vigorous: 2.2
  }
  exposureFactor *= activityMultipliers[profile.activityLevel]
  
  // Commute type adjustments
  const commuteMultipliers = {
    none: 1.0,
    walking: 1.8,
    public: 1.4,
    car: 1.2
  }
  exposureFactor *= commuteMultipliers[profile.commuteType]
  
  // Work environment adjustments
  const workMultipliers = {
    office: 1.0,
    outdoor: 2.5,
    industrial: 3.0,
    remote: 0.8
  }
  exposureFactor *= workMultipliers[profile.workEnvironment]
  
  // Protective measures
  if (profile.useMask) exposureFactor *= 0.6
  if (profile.hasAirPurifier) exposureFactor *= 0.7
  
  return Math.min(100, Math.max(0, exposureFactor * 20))
}

const calculateCostBreakdown = (riskScore: number, profile: ExposureProfile): CostBreakdown => {
  const baseCost = riskScore * 2 // Base cost multiplier
  
  const costs = {
    healthcare: baseCost * 0.4, // Doctor visits, emergency care
    productivity: baseCost * 0.3, // Missed work days, reduced efficiency
    medication: baseCost * 0.2, // Inhalers, allergy meds, etc.
    equipment: baseCost * 0.1, // Air purifiers, masks, filters
  }
  
  // Additional costs for specific conditions
  if (profile.healthConditions.includes('asthma')) costs.medication += 15
  if (profile.healthConditions.includes('heart')) costs.healthcare += 20
  if (profile.healthConditions.includes('respiratory')) costs.healthcare += 25
  
  // Equipment costs if not already owned
  if (!profile.hasAirPurifier) costs.equipment += 50
  if (!profile.useMask) costs.equipment += 5
  
  const total = Object.values(costs).reduce((sum, cost) => sum + cost, 0)
  
  return {
    healthcare: Math.round(costs.healthcare),
    productivity: Math.round(costs.productivity),
    medication: Math.round(costs.medication),
    equipment: Math.round(costs.equipment),
    total: Math.round(total)
  }
}

const getRiskLevel = (score: number) => {
  if (score <= 20) return { level: "Low", color: "#00E40020", description: "Minimal health impact expected" }
  if (score <= 40) return { level: "Moderate", color: "#FFFF0020", description: "Some health effects possible" }
  if (score <= 60) return { level: "High", color: "#FF7E0020", description: "Significant health risk" }
  if (score <= 80) return { level: "Very High", color: "#FF000020", description: "Serious health concerns" }
  return { level: "Severe", color: "#8F3F9720", description: "Critical health risk" }
}

const getHealthRecommendations = (riskScore: number, profile: ExposureProfile) => {
  const recommendations = []
  
  if (riskScore > 30) {
    recommendations.push({
      action: "Reduce outdoor time",
      impact: "High",
      cost: 0,
      description: "Limit outdoor activities during peak pollution hours"
    })
  }
  
  if (riskScore > 50 && !profile.useMask) {
    recommendations.push({
      action: "Use N95 mask outdoors",
      impact: "High",
      cost: 15,
      description: "Reduce inhalation of harmful particles by 60%"
    })
  }
  
  if (riskScore > 40 && !profile.hasAirPurifier) {
    recommendations.push({
      action: "Install HEPA air purifier",
      impact: "Medium",
      cost: 200,
      description: "Improve indoor air quality significantly"
    })
  }
  
  if (riskScore > 60) {
    recommendations.push({
      action: "Reschedule outdoor exercise",
      impact: "Medium",
      cost: 0,
      description: "Move workouts to indoor facilities or cleaner times"
    })
  }
  
  if (profile.hoursOutdoors > 6 && riskScore > 30) {
    recommendations.push({
      action: "Reduce outdoor exposure",
      impact: "High",
      cost: 0,
      description: "Consider working from home if possible"
    })
  }
  
  return recommendations
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

export default function PersonalExposureRisk() {
  const { data: tempoData, isLoading } = useTEMPOData()
  const { data: events } = useAirQualityEvents(3)
  const [exposureProfile, setExposureProfile] = React.useState<ExposureProfile>(defaultExposureProfile)
  const [showDetailedBreakdown, setShowDetailedBreakdown] = React.useState(false)
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const currentAQI = React.useMemo(() => {
    if (!tempoData || tempoData.length === 0) return 45
    return tempoData[tempoData.length - 1]?.aqi || 45
  }, [tempoData])

  const riskScore = calculateExposureRisk(currentAQI, exposureProfile)
  const riskInfo = getRiskLevel(riskScore)
  const costBreakdown = calculateCostBreakdown(riskScore, exposureProfile)
  const recommendations = getHealthRecommendations(riskScore, exposureProfile)

  const updateExposureProfile = (updates: Partial<ExposureProfile>) => {
    setExposureProfile(prev => ({ ...prev, ...updates }))
  }

  const toggleHealthCondition = (condition: string) => {
    const currentConditions = [...exposureProfile.healthConditions]
    const index = currentConditions.indexOf(condition)
    
    if (index > -1) {
      currentConditions.splice(index, 1)
    } else {
      currentConditions.push(condition)
    }
    
    updateExposureProfile({ healthConditions: currentConditions })
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Personal Exposure Risk</CardTitle>
          <CardDescription>
            Calculating your personalized risk assessment...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Analyzing exposure factors</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <section id="estimate">
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Calculator className="h-5 w-5" />
              Personal Exposure Risk & Cost Analysis
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Predict your health risk and economic impact from today&apos;s air quality
            </CardDescription>
          </div>
          <Badge 
            className="flex items-center gap-1 text-foreground w-fit"
            style={{ backgroundColor: riskInfo.color }}
          >
            <MapPin className="h-3 w-3" />
            {riskInfo.level} Risk
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Risk Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="text-center p-3 sm:p-4 bg-muted/50 rounded-lg">
            <div className="text-xl sm:text-2xl font-bold">
              {Math.round(riskScore)}/100
            </div>
            <div className="text-xs sm:text-sm font-medium">Exposure Risk Score</div>
            <div className="text-xs text-muted-foreground mt-1">{riskInfo.description}</div>
          </div>
          
          <div className="text-center p-3 sm:p-4 bg-muted/50 rounded-lg">
            <div className="text-xl sm:text-2xl font-bold">
              {formatCurrency(costBreakdown.total)}
            </div>
            <div className="text-xs sm:text-sm font-medium">Estimated Monthly Cost</div>
            <div className="text-xs text-muted-foreground mt-1">Health & productivity impact</div>
          </div>
          
          <div className="text-center p-3 sm:p-4 bg-muted/50 rounded-lg">
            <div className="text-xl sm:text-2xl font-bold">{currentAQI}</div>
            <div className="text-xs sm:text-sm font-medium">Current AQI</div>
            <div className="text-xs text-muted-foreground mt-1">Air Quality Index</div>
          </div>
        </div>

        {/* Exposure Profile Settings */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <h3 className="font-semibold mb-4 flex items-center gap-2 text-sm sm:text-base">
            <User className="h-4 w-4" />
            Your Exposure Profile
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Hours Outdoors */}
            <div className="space-y-3">
              <Label htmlFor="hoursOutdoors" className="text-sm">Hours Outdoors Today</Label>
              <div className="space-y-2">
                <Slider
                  id="hoursOutdoors"
                  value={[exposureProfile.hoursOutdoors]}
                  onValueChange={([value]) => updateExposureProfile({ hoursOutdoors: value })}
                  max={12}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs sm:text-sm">
                  <span>{exposureProfile.hoursOutdoors} hours</span>
                  <span className="text-muted-foreground">Daily exposure</span>
                </div>
              </div>
            </div>

            {/* Activity Level */}
            <div className="space-y-2">
              <Label className="text-sm">Activity Level</Label>
              <div className="flex gap-1 sm:gap-2">
                {(['sedentary', 'moderate', 'vigorous'] as const).map(level => (
                  <Button
                    key={level}
                    variant={exposureProfile.activityLevel === level ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateExposureProfile({ activityLevel: level })}
                    className="flex-1 capitalize text-xs"
                  >
                    {isMobile ? level.slice(0, 3) : level}
                  </Button>
                ))}
              </div>
            </div>

            {/* Commute Type */}
            <div className="space-y-2">
              <Label className="text-sm">Commute Type</Label>
              <Select
                value={exposureProfile.commuteType}
                onValueChange={(value: any) => updateExposureProfile({ commuteType: value })}
              >
                <SelectTrigger className="w-full text-sm">
                  <SelectValue placeholder="Select commute type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Commute</SelectItem>
                  <SelectItem value="walking">Walking</SelectItem>
                  <SelectItem value="public">Public Transport</SelectItem>
                  <SelectItem value="car">Car</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Work Environment */}
            <div className="space-y-2">
              <Label className="text-sm">Work Environment</Label>
              <Select
                value={exposureProfile.workEnvironment}
                onValueChange={(value: any) => updateExposureProfile({ workEnvironment: value })}
              >
                <SelectTrigger className="w-full text-sm">
                  <SelectValue placeholder="Select work environment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="office">Office</SelectItem>
                  <SelectItem value="outdoor">Outdoor</SelectItem>
                  <SelectItem value="industrial">Industrial</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Protective Measures */}
            <div className="space-y-3 md:col-span-2 lg:col-span-1">
              <Label className="text-sm">Protective Measures</Label>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="useMask" className="text-sm flex-1">Use N95 Mask</Label>
                  <Switch
                    id="useMask"
                    checked={exposureProfile.useMask}
                    onCheckedChange={(checked) => updateExposureProfile({ useMask: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="hasAirPurifier" className="text-sm flex-1">Home Air Purifier</Label>
                  <Switch
                    id="hasAirPurifier"
                    checked={exposureProfile.hasAirPurifier}
                    onCheckedChange={(checked) => updateExposureProfile({ hasAirPurifier: checked })}
                  />
                </div>
              </div>
            </div>

            {/* Health Conditions */}
            <div className="space-y-2 md:col-span-2 lg:col-span-3">
              <Label className="text-sm">Health Conditions</Label>
              <div className="flex flex-wrap gap-2">
                {['asthma', 'respiratory', 'heart'].map(condition => (
                  <Badge
                    key={condition}
                    variant={exposureProfile.healthConditions.includes(condition) ? "default" : "outline"}
                    className="cursor-pointer capitalize text-xs"
                    onClick={() => toggleHealthCondition(condition)}
                  >
                    {condition}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2 text-sm sm:text-base">
              <DollarSign className="h-4 w-4" />
              Monthly Cost Breakdown
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetailedBreakdown(!showDetailedBreakdown)}
              className="text-xs"
            >
              {showDetailedBreakdown ? (
                <>
                  Hide Details
                  <ChevronUp className="h-3 w-3 ml-1" />
                </>
              ) : (
                <>
                  Show Details
                  <ChevronDown className="h-3 w-3 ml-1" />
                </>
              )}
            </Button>
          </div>

          <div className="space-y-4">
            {/* Total Cost Bar */}
            <div className="p-3 sm:p-4 bg-blue-50/5 rounded-lg border border-gray-50/5">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
                <span className="font-medium text-sm sm:text-base">Total Estimated Monthly Cost</span>
                <span className="text-xl sm:text-2xl font-bold text-green-600">
                  {formatCurrency(costBreakdown.total)}
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Combined health and economic impact of air pollution exposure
              </div>
            </div>

            {/* Cost Categories */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
              {[
                { key: 'healthcare' as const, label: 'Healthcare', icon: Heart },
                { key: 'productivity' as const, label: 'Productivity', icon: Activity, },
                { key: 'medication' as const, label: 'Medication', icon: Shield, },
                { key: 'equipment' as const, label: 'Equipment', icon: MessageCircleWarningIcon }
              ].map(({ key, label, icon: Icon, color }) => (
                <div key={key} className="p-3 rounded-lg border bg-background/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`h-3 w-3 sm:h-4 sm:w-4 ${color}`} />
                    <span className="text-xs sm:text-sm font-medium">{label}</span>
                  </div>
                  <div className="text-base sm:text-lg font-bold">{formatCurrency(costBreakdown[key])}</div>
                  <div className="text-xs text-muted-foreground">
                    {Math.round((costBreakdown[key] / costBreakdown.total) * 100)}% of total
                  </div>
                </div>
              ))}
            </div>

            {/* Detailed Breakdown */}
            {showDetailedBreakdown && (
              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="font-medium mb-3 text-sm sm:text-base">Cost Details</h4>
                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="flex justify-between items-center">
                    <span>Doctor visits & emergency care</span>
                    <span className="font-medium">{formatCurrency(costBreakdown.healthcare * 0.6)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Specialist consultations</span>
                    <span className="font-medium">{formatCurrency(costBreakdown.healthcare * 0.4)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Missed work days</span>
                    <span className="font-medium">{formatCurrency(costBreakdown.productivity * 0.7)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Reduced work efficiency</span>
                    <span className="font-medium">{formatCurrency(costBreakdown.productivity * 0.3)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Prescription medications</span>
                    <span className="font-medium">{formatCurrency(costBreakdown.medication * 0.8)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Over-the-counter treatments</span>
                    <span className="font-medium">{formatCurrency(costBreakdown.medication * 0.2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Risk Mitigation Recommendations */}
        <div>
          <h3 className="font-semibold mb-4 flex items-center gap-2 text-sm sm:text-base">
            <AlertTriangle className="h-4 w-4" />
            Risk Mitigation Recommendations
          </h3>
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div key={index} className="flex items-start gap-3 p-3 sm:p-4 border rounded-lg">
                <div className={`p-2 rounded flex-shrink-0 ${
                  rec.impact === 'High' ? 'bg-red-100 text-red-600' :
                  rec.impact === 'Medium' ? 'bg-orange-100 text-orange-600' :
                  'bg-yellow-100 text-yellow-600'
                }`}>
                  <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm sm:text-base">{rec.action}</h4>
                    <div className="flex gap-2">
                      <Badge variant="outline" className={
                        rec.impact === 'High' ? 'text-red-700 border-red-300 text-xs' :
                        rec.impact === 'Medium' ? 'text-orange-700 border-orange-300 text-xs' :
                        'text-yellow-700 border-yellow-300 text-xs'
                      }>
                        {rec.impact} Impact
                      </Badge>
                      {rec.cost > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {formatCurrency(rec.cost)}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">{rec.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Methodology & Disclaimer */}
        <div className="border-t pt-4">
          <div className="text-xs text-muted-foreground space-y-2">
            <p>
              <strong>Methodology:</strong> Cost estimates based on EPA health impact assessments, 
              WHO economic burden studies, and NASA TEMPO air quality data. Calculations consider 
              exposure duration, activity levels, and protective measures.
            </p>
            <p>
              <strong>Disclaimer:</strong> These are estimates for informational purposes only. 
              Actual costs may vary based on individual health factors, insurance coverage, and 
              regional healthcare costs. Consult healthcare providers for personalized medical advice.
            </p>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
              <span>Data source: NASA TEMPO Mission</span>
              <span>Last updated: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    </section>
  )
}