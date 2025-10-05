'use client';

import { useAirQualityEvents, useEPICImages } from '@/hooks/useNasaQueries';

export function AirQualityDashboard() {
  const { data: events, isLoading, isError } = useAirQualityEvents(7);
  const { data: epicImages } = useEPICImages('natural');

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading air quality data...</div>;
  }

  if (isError) {
    return <div className="text-red-500">Error loading air quality data</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Current Air Quality Events</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events?.map(event => (
          <div key={event.id} className="border rounded-lg p-4 shadow-sm">
            <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
            <p className="text-gray-600 text-sm mb-3">{event.description}</p>
            <div className="flex flex-wrap gap-2">
              {event.categories.map(category => (
                <span
                  key={category.id}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {category.title}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}