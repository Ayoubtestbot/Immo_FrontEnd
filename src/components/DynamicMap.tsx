import dynamic from 'next/dynamic';
import type { Property } from '@prisma/client';

const Map = dynamic(() => import('./Map'), {
  ssr: false,
});

type DynamicMapProps = {
  properties: Partial<Property>[];
  height?: string;
};

const DynamicMap = ({ properties, height }: DynamicMapProps) => {
  return <Map properties={properties} height={height} />;
};

export default DynamicMap;
