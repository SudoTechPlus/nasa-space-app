import HealthRiskInsights from '@/components/health/HealthRiskInsights'
import PersonalExposureRisk from '@/components/health/PersonalExposureRisk'
import PollutantTable from '@/components/health/PollutantTable'
import React from 'react'

export default function Page() {
  return (
    <section
      id="health"
      className="flex flex-col gap-8 px-4 sm:px-6 lg:px-12 xl:px-20 py-10 max-w-7xl mx-auto w-full"
    >
      <HealthRiskInsights />
      <PersonalExposureRisk />
      <PollutantTable />
    </section>
  )
}
