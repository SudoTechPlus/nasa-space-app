// hooks/useNasaQueries.ts
import { useQuery, useQueries, UseQueryOptions, useQueryClient } from '@tanstack/react-query';
import { NASA_CONFIG, EONET_CATEGORIES } from '@/config/nasa';
import {
  EONETEvent,
  EONETCategory,
  EPICImage,
  NASASearchResult,
  APODData,
  EarthImageryParams,
  EONETEventsParams,
  UseEONETEventsOptions,
} from '@/types/nasa';
import React from 'react';

// Real-time event manager for EONET
class EONETEventManager {
  private static instance: EONETEventManager;
  private listeners: ((events: EONETEvent[]) => void)[] = [];
  private currentEvents: EONETEvent[] = [];
  private isPolling = false;

  static getInstance(): EONETEventManager {
    if (!EONETEventManager.instance) {
      EONETEventManager.instance = new EONETEventManager();
    }
    return EONETEventManager.instance;
  }

  async startPolling(params: EONETEventsParams = {}) {
    if (this.isPolling) return;

    this.isPolling = true;
    await this.fetchEvents(params);
    
    // Poll every 2 minutes for new events
    setInterval(() => {
      this.fetchEvents(params);
    }, 120000);
  }

  subscribe(listener: (events: EONETEvent[]) => void) {
    this.listeners.push(listener);
    listener(this.currentEvents);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private async fetchEvents(params: EONETEventsParams) {
    try {
      const searchParams = new URLSearchParams();
      if (params.status) searchParams.append('status', params.status);
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.days) searchParams.append('days', params.days.toString());
      if (params.category) searchParams.append('category', params.category.toString());

      const url = params.category 
        ? `${NASA_CONFIG.eonetBaseUrl}/categories/${params.category}`
        : `${NASA_CONFIG.eonetBaseUrl}/events`;

      const response = await fetch(`${url}?${searchParams}`);
      
      if (response.ok) {
        const data = await response.json();
        const newEvents = data.events || [];
        
        // Check if events have changed
        if (this.hasEventsChanged(newEvents)) {
          this.currentEvents = newEvents;
          this.notifyListeners();
        }
      }
    } catch (error) {
      console.error('Error fetching EONET events:', error);
    }
  }

  private hasEventsChanged(newEvents: EONETEvent[]): boolean {
    if (this.currentEvents.length !== newEvents.length) return true;
    
    // Check if any event has been updated
    return newEvents.some((newEvent, index) => {
      const currentEvent = this.currentEvents[index];
      return !currentEvent || newEvent.id !== currentEvent.id;
    });
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentEvents));
  }
}

// Enhanced EONET Events Hook with real-time updates
export const useEONETEvents = (options: UseEONETEventsOptions = {}) => {
  const { params = {}, enabled = true } = options;
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['eonet-events', params],
    queryFn: async (): Promise<{ events: EONETEvent[] }> => {
      const searchParams = new URLSearchParams();
      
      if (params.status) searchParams.append('status', params.status);
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.days) searchParams.append('days', params.days.toString());
      if (params.category) searchParams.append('category', params.category.toString());
      if (params.source) searchParams.append('source', params.source);

      const url = params.category 
        ? `${NASA_CONFIG.eonetBaseUrl}/categories/${params.category}`
        : `${NASA_CONFIG.eonetBaseUrl}/events`;

      const response = await fetch(`${url}?${searchParams}`);
      
      if (!response.ok) {
        throw new Error(`EONET API error: ${response.statusText}`);
      }
      
      return response.json();
    },
    enabled,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
    retry: 3,
  });

  // Real-time subscription for immediate updates
  React.useEffect(() => {
    if (!enabled) return;

    const eventManager = EONETEventManager.getInstance();
    const unsubscribe = eventManager.subscribe((events) => {
      queryClient.setQueryData(['eonet-events', params], { events });
    });

    eventManager.startPolling(params);

    return unsubscribe;
  }, [enabled, params, queryClient]);

  return query;
};

// Real-time EONET events subscription hook
export const useEONETLiveEvents = (params: EONETEventsParams = {}) => {
  const [events, setEvents] = React.useState<EONETEvent[]>([]);
  
  // Memoize params to prevent unnecessary effect re-runs
  const stableParams = React.useMemo(() => params, [JSON.stringify(params)]);

  React.useEffect(() => {
    const eventManager = EONETEventManager.getInstance();
    
    const unsubscribe = eventManager.subscribe((newEvents) => {
      setEvents(prevEvents => {
        if (JSON.stringify(prevEvents) === JSON.stringify(newEvents)) {
          return prevEvents;
        }
        return newEvents;
      });
    });

    eventManager.startPolling(stableParams);

    return unsubscribe;
  }, [stableParams]); // Remove queryClient dependency

  return events;
};

// Enhanced EPIC Images with caching and real-time updates
export const useEPICImages = (type: 'natural' | 'enhanced' = 'natural', date?: string) => {
  return useQuery({
    queryKey: ['epic-images', type, date],
    queryFn: async (): Promise<EPICImage[]> => {
      const url = date
        ? `${NASA_CONFIG.baseUrl}/EPIC/api/${type}/date/${date}`
        : `${NASA_CONFIG.baseUrl}/EPIC/api/${type}`;

      const response = await fetch(`${url}?api_key=${NASA_CONFIG.apiKey}`);
      
      if (!response.ok) {
        throw new Error(`EPIC API error: ${response.statusText}`);
      }
      
      return response.json();
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    refetchInterval: 1000 * 60 * 30, // Refetch every 30 minutes
  });
};

// Enhanced Earth Imagery with better caching
export const useEarthImagery = (params: EarthImageryParams) => {
  const { lat, lon, date, dim = 0.1 } = params;

  return useQuery({
    queryKey: ['earth-imagery', lat, lon, date, dim],
    queryFn: async (): Promise<string> => { // Return as data URL for immediate use
      const searchParams = new URLSearchParams({
        lat: lat.toString(),
        lon: lon.toString(),
        date,
        dim: dim.toString(),
        api_key: NASA_CONFIG.apiKey,
      });

      const response = await fetch(
        `${NASA_CONFIG.baseUrl}/planetary/earth/imagery?${searchParams}`
      );
      
      if (!response.ok) {
        throw new Error(`Earth Imagery API error: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      return URL.createObjectURL(blob); // Convert to data URL for immediate display
    },
    enabled: !!lat && !!lon && !!date,
    staleTime: 1000 * 60 * 60 * 2, // 2 hours
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};

// Real-time APOD with daily auto-refresh
export const useAPOD = (date?: string, startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['apod', date, startDate, endDate],
    queryFn: async (): Promise<APODData | APODData[]> => {
      const searchParams = new URLSearchParams({
        api_key: NASA_CONFIG.apiKey,
      });

      if (date) searchParams.append('date', date);
      if (startDate) searchParams.append('start_date', startDate);
      if (endDate) searchParams.append('end_date', endDate);

      const response = await fetch(
        `${NASA_CONFIG.baseUrl}/planetary/apod?${searchParams}`
      );
      
      if (!response.ok) {
        throw new Error(`APOD API error: ${response.statusText}`);
      }
      
      return response.json();
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours (APOD updates daily)
  });
};

// Enhanced combined events with real-time updates
export const useAirQualityEvents = (days: number = 7) => {
  const wildfires = useEONETEvents({
    params: {
      category: EONET_CATEGORIES.WILDFIRES,
      status: 'open',
      days,
      limit: 50,
    },
  });

  const dustHaze = useEONETEvents({
    params: {
      category: EONET_CATEGORIES.DUST_HAZE,
      status: 'open',
      days,
      limit: 30,
    },
  });

  const volcanoes = useEONETEvents({
    params: {
      category: EONET_CATEGORIES.VOLCANOES,
      status: 'open',
      days,
      limit: 20,
    },
  });

  const isLoading = wildfires.isLoading || dustHaze.isLoading || volcanoes.isLoading;
  const isError = wildfires.isError || dustHaze.isError || volcanoes.isError;

  const allEvents = React.useMemo(() => {
    const merged = [
      ...(wildfires.data?.events || []),
      ...(dustHaze.data?.events || []),
      ...(volcanoes.data?.events || []),
    ];

    const uniqueById = Array.from(
      new Map(merged.map(e => [e.id, e])).values()
    );

    return uniqueById.sort((a, b) => {
      const dateA = new Date(a.geometries[0]?.date || 0);
      const dateB = new Date(b.geometries[0]?.date || 0);
      return dateB.getTime() - dateA.getTime();
    });
  }, [wildfires.data, dustHaze.data, volcanoes.data]);

  return {
    data: allEvents,
    isLoading,
    isError,
    wildfires: wildfires.data?.events || [],
    dustHaze: dustHaze.data?.events || [],
    volcanoes: volcanoes.data?.events || [],
    refetch: () => {
      wildfires.refetch();
      dustHaze.refetch();
      volcanoes.refetch();
    },
  };
};

// Real-time version of combined events
export const useAirQualityLiveEvents = (days: number = 7) => {
  const wildfireEvents = useEONETLiveEvents({
    category: EONET_CATEGORIES.WILDFIRES,
    status: 'open',
    days,
    limit: 50,
  });

  const dustHazeEvents = useEONETLiveEvents({
    category: EONET_CATEGORIES.DUST_HAZE,
    status: 'open',
    days,
    limit: 30,
  });

  const volcanoEvents = useEONETLiveEvents({
    category: EONET_CATEGORIES.VOLCANOES,
    status: 'open',
    days,
    limit: 20,
  });

  return React.useMemo(() => {
    return [...wildfireEvents, ...dustHazeEvents, ...volcanoEvents].sort((a, b) => {
      const dateA = new Date(a.geometries[0]?.date || 0);
      const dateB = new Date(b.geometries[0]?.date || 0);
      return dateB.getTime() - dateA.getTime();
    });
  }, [wildfireEvents, dustHazeEvents, volcanoEvents]);
};

// Individual event hooks for backward compatibility
export const useWildfireEvents = (params: EONETEventsParams = {}) => {
  return useEONETEvents({
    params: { ...params, category: EONET_CATEGORIES.WILDFIRES }
  });
};

export const useDustHazeEvents = (params: EONETEventsParams = {}) => {
  return useEONETEvents({
    params: { ...params, category: EONET_CATEGORIES.DUST_HAZE }
  });
};

export const useVolcanicEvents = (params: EONETEventsParams = {}) => {
  return useEONETEvents({
    params: { ...params, category: EONET_CATEGORIES.VOLCANOES }
  });
};

// EONET Categories hook
export const useEONETCategories = () => {
  return useQuery({
    queryKey: ['eonet-categories'],
    queryFn: async (): Promise<EONETCategory[]> => {
      const response = await fetch(`${NASA_CONFIG.eonetBaseUrl}/categories`);
      if (!response.ok) {
        throw new Error(`EONET Categories API error: ${response.statusText}`);
      }
      const data = await response.json();
      return data.categories || [];
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};

// NASA Search hook
export const useNASASearch = (query: string, mediaType?: string) => {
  return useQuery({
    queryKey: ['nasa-search', query, mediaType],
    queryFn: async (): Promise<NASASearchResult> => {
      const searchParams = new URLSearchParams({
        q: query,
        api_key: NASA_CONFIG.apiKey,
      });
      if (mediaType) searchParams.append('media_type', mediaType);

      const response = await fetch(
        `${NASA_CONFIG.baseUrl}/search?${searchParams}`
      );
      if (!response.ok) {
        throw new Error(`NASA Search API error: ${response.statusText}`);
      }
      return response.json();
    },
    enabled: !!query,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};

// Multiple locations imagery hook
export const useMultipleLocationsImagery = (locations: EarthImageryParams[]) => {
  return useQueries({
    queries: locations.map((params) => ({
      queryKey: ['earth-imagery', params.lat, params.lon, params.date, params.dim],
      queryFn: async (): Promise<string> => {
        const { lat, lon, date, dim = 0.1 } = params;
        const searchParams = new URLSearchParams({
          lat: lat.toString(),
          lon: lon.toString(),
          date,
          dim: dim.toString(),
          api_key: NASA_CONFIG.apiKey,
        });

        const response = await fetch(
          `${NASA_CONFIG.baseUrl}/planetary/earth/imagery?${searchParams}`
        );
        if (!response.ok) {
          throw new Error(`Earth Imagery API error: ${response.statusText}`);
        }
        const blob = await response.blob();
        return URL.createObjectURL(blob);
      },
      enabled: !!params.lat && !!params.lon && !!params.date,
      staleTime: 1000 * 60 * 60 * 2, // 2 hours
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
    })),
  });
};