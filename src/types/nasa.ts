// types/nasa.ts
export interface EONETEvent {
  id: string;
  title: string;
  description: string;
  link: string;
  categories: Array<{
    id: number;
    title: string;
  }>;
  sources: Array<{
    id: string;
    url: string;
  }>;
  geometries: Array<{
    date: string;
    type: string;
    coordinates: [number, number] | [number, number][];
  }>;
}

export interface EONETCategory {
  id: number;
  title: string;
  link: string;
  description: string;
  layers: string;
}

export interface EPICImage {
  identifier: string;
  caption: string;
  image: string;
  version: string;
  centroid_coordinates: {
    lat: number;
    lon: number;
  };
  date: string;
  coords: {
    centroid_coordinates: {
      lat: number;
      lon: number;
    };
  };
}

export interface EarthImageryParams {
  lat: number;
  lon: number;
  date: string;
  dim?: number;
}

export interface NASASearchResult {
  collection: {
    items: Array<{
      data: Array<{
        title: string;
        description: string;
        date_created: string;
      }>;
      links: Array<{
        href: string;
        rel: string;
        render?: string;
      }>;
    }>;
  };
}

export interface APODData {
  date: string;
  explanation: string;
  hdurl?: string;
  media_type: string;
  service_version: string;
  title: string;
  url: string;
  thumbnail_url?: string;
}

export interface EONETEventsParams {
  source?: string;
  status?: 'open' | 'closed';
  limit?: number;
  days?: number;
  category?: number;
}

export interface UseEONETEventsOptions {
  params?: EONETEventsParams;
  enabled?: boolean;
}