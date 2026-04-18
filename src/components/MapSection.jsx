import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState, useRef } from 'react';
import L from 'leaflet';

// Corrige ícone padrão
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const bikeIcon = new L.Icon({
  iconUrl: 'https://www.jav.com.br/wp-content/uploads/2017/03/map-marker-icon.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Componente auxiliar para controlar o mapa (hook do Leaflet)
function MapUpdater({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position && position.lat != null && position.lon != null) {
      // ✅ Centraliza o mapa na nova posição
      map.setView([position.lat, position.lon], 15);
    }
  }, [position, map]);

  return null;
}

export default function MapSection({ position }) {
  const initialPos = [-8.055581, -34.951640];
  const [mapPosition, setMapPosition] = useState(
    position ? [position.lat, position.lon] : initialPos
  );

  useEffect(() => {
    if (position) {
      setMapPosition([position.lat, position.lon]);
    }
  }, [position]);

  return (
    <div className="map-section">
      <h2>📍 Localização da Moto</h2>
      <MapContainer
        center={mapPosition}
        zoom={15}
        style={{ height: '300px', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={mapPosition} icon={bikeIcon}>
          <Popup>
            📍 Moto Voltz<br />
            <small>
              Lat: {mapPosition[0]?.toFixed(6)}°<br />
              Lon: {mapPosition[1]?.toFixed(6)}°
            </small>
          </Popup>
        </Marker>

        {/* 👇 Este componente atualiza o mapa quando `position` muda */}
        {position && <MapUpdater position={position} />}
      </MapContainer>
    </div>
  );
}