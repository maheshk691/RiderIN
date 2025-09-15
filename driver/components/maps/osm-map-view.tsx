import React from 'react';
import MapView, { MapViewProps, PROVIDER_DEFAULT } from 'react-native-maps';

interface OSMMapViewProps extends MapViewProps {
  children?: React.ReactNode;
}

export const OSMMapView: React.FC<OSMMapViewProps> = ({ children, ...props }) => {
  return (
    <MapView
      {...props}
      provider={PROVIDER_DEFAULT}
      mapType="standard"
      // Use OSM tiles by default
      customMapStyle={[]}
    >
      {children}
    </MapView>
  );
};

export default OSMMapView;
