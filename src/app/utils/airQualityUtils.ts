// utils/airQualityUtils.ts
import { format, subHours, addHours } from 'date-fns'

export interface ForecastData {
  hour: string
  timestamp: string
  aqi: number
  pm25: number
  no2: number
  temperature: number
  windSpeed: number
  humidity: number
}

export const generateHourlyForecast = (
  currentData: any, 
  hours: number = 24,
  interval: number = 3
): ForecastData[] => {
  const forecast: ForecastData[] = []
  const now = new Date()
  
  const currentAQI = currentData?.aqi || 45
  const currentPM25 = currentData?.pm25 || 12.5
  const currentNO2 = currentData?.no2 || 18.3
  
  // Consider current weather conditions for more accurate forecast
  const currentHour = now.getHours()
  const isDaytime = currentHour >= 6 && currentHour <= 18
  const baseTrend = isDaytime ? 1.1 : 0.9 // Daytime typically has higher pollution
  
  for (let i = 0; i <= hours; i += interval) {
    const hourTime = addHours(now, i)
    const hourOfDay = hourTime.getHours()
    
    // Diurnal pattern - pollution peaks during daytime
    const diurnalFactor = Math.sin((hourOfDay - 6) * Math.PI / 12) * 0.4 + 0.8
    
    // Weather influence factors
    const isRushHour = (hourOfDay >= 7 && hourOfDay <= 9) || (hourOfDay >= 16 && hourOfDay <= 18)
    const rushHourFactor = isRushHour ? 1.15 : 1.0
    
    const temperature = 15 + Math.sin((hourOfDay - 6) * Math.PI / 12) * 10
    const windSpeed = 2 + Math.random() * 8
    const humidity = 40 + Math.sin((hourOfDay - 12) * Math.PI / 12) * 20
    
    // Wind helps disperse pollution
    const windFactor = Math.max(0.7, 1 - (windSpeed * 0.03))
    
    // High humidity can trap pollutants
    const humidityFactor = 1 + (humidity > 80 ? 0.1 : 0)
    
    const combinedFactor = diurnalFactor * rushHourFactor * windFactor * humidityFactor * baseTrend
    
    const aqi = Math.round(currentAQI * combinedFactor * (0.95 + Math.random() * 0.1))
    const pm25 = currentPM25 * combinedFactor * (0.95 + Math.random() * 0.1)
    const no2 = currentNO2 * combinedFactor * (0.95 + Math.random() * 0.1)
    
    forecast.push({
      hour: format(hourTime, "HH:mm"),
      timestamp: hourTime.toISOString(),
      aqi: Math.max(0, Math.min(500, aqi)),
      pm25: Math.max(0, Number(pm25.toFixed(1))),
      no2: Math.max(0, Number(no2.toFixed(1))),
      temperature: Math.round(temperature),
      windSpeed: Number(windSpeed.toFixed(1)),
      humidity: Math.round(humidity),
    })
  }
  
  return forecast
}

export const calculateHealthRecommendation = (aqi: number): string => {
  if (aqi <= 50) {
    return "Air quality is satisfactory. Enjoy your usual outdoor activities."
  } else if (aqi <= 100) {
    return "Air quality is acceptable. Consider reducing intense outdoor activities if you are unusually sensitive."
  } else if (aqi <= 150) {
    return "Members of sensitive groups may experience health effects. The general public is less likely to be affected."
  } else if (aqi <= 200) {
    return "Everyone may begin to experience health effects. Members of sensitive groups may experience more serious health effects."
  } else if (aqi <= 300) {
    return "Health alert: everyone may experience more serious health effects."
  } else {
    return "Health warning of emergency conditions. The entire population is more likely to be affected."
  }
}