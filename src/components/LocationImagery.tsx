'use client';

import Image from 'next/image';
import { useEarthImagery } from '@/hooks/useNasaQueries';

interface LocationImageryProps {
  lat: number;
  lon: number;
  date: string;
}

export function LocationImagery({ lat, lon, date }: LocationImageryProps) {
  const { data: imageBlob, isLoading, error } = useEarthImagery({ lat, lon, date });

  if (isLoading) return <div>Loading satellite imagery...</div>;
  if (error) return <div>Error loading imagery: {(error as Error).message}</div>;

  return (
    <div>
      {imageBlob && (
        <Image
          src={URL.createObjectURL(imageBlob)}
          alt={`Satellite imagery for ${lat}, ${lon}`}
          className="rounded-lg shadow-md"
          width={500}
          height={300}
        />
      )}
    </div>
  );
}