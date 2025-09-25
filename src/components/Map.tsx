'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { Property } from '@prisma/client';

// Fix for default icon issue with webpack
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon.src,
    shadowUrl: iconShadow.src
});

L.Marker.prototype.options.icon = DefaultIcon;


type MapProps = {
  properties: Partial<Property>[];
  height?: string;
};

const Map = ({ properties, height = '400px' }: MapProps) => {
  const validProperties = properties.filter(p => p.latitude && p.longitude);

  if (validProperties.length === 0) {
    return <p>Aucune propriété avec des coordonnées valides à afficher sur la carte.</p>;
  }

  const center = {
    lat: validProperties[0].latitude!,
    lng: validProperties[0].longitude!,
  };

  return (
    <MapContainer center={[center.lat, center.lng]} zoom={13} style={{ height, width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {validProperties.map(property => (
        <Marker key={property.id} position={[property.latitude!, property.longitude!]}>
          <Popup>
            {property.address}<br />
            {property.city}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default Map;
