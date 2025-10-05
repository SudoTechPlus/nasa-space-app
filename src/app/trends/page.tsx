import Chart3 from '@/components/Chart3'
import Chart4 from '@/components/Chart4'
import Hour24 from '@/components/Hour24'
import NextHour24 from '@/components/NextHour24'
import AirQualityChart from '@/components/trends/AirQualityChart'
import HistoricalPollutionChart from '@/components/trends/HistoricalChart'
import CityAirQualityRankings from '@/components/trends/Leaderboards'
import React from 'react'

export default function ForecastAndTrendsPage() {
  return (
    <section id="forecasts-and-trends" className="w-full pb-15">
      {/* Header */}
      <section
        id="main-trends"
        className="px-4 sm:px-6 lg:px-12 mt-10 mb-6 text-center lg:text-left"
      >
        <h1 className="text-2xl lg:text-3xl font-bold">Forecast and Trends</h1>
        <p className="text-sm sm:text-base font-thin">
          View and track the current air quality index
        </p>
      </section>

      {/* Content */}
      <main className="flex flex-col gap-12 px-4 sm:px-6 lg:px-12">
        {/* Charts grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 lg:gap-10">
          <AirQualityChart />
          <Hour24 />
        </div>

        <NextHour24 />
        <HistoricalPollutionChart />
        <CityAirQualityRankings />
      </main>
    </section>
  )
}
