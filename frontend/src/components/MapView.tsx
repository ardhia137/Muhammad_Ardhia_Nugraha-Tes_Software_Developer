import { useEffect, useMemo } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { STATUS_COLORS, STATUS_LABELS, TYPE_LABELS } from "../status";
import type { Entity } from "../types";

interface MapViewProps {
  entities: Entity[];
  selected: Entity | null;
  onSelect: (id: number) => void;
  onMapClick: (latitude: number, longitude: number) => void;
}

function ClickHandler({ onMapClick }: { onMapClick: MapViewProps["onMapClick"] }) {
  useMapEvents({
    click: (event) => {
      onMapClick(
        Number(event.latlng.lat.toFixed(7)),
        Number(event.latlng.lng.toFixed(7)),
      );
    },
  });
  return null;
}

function FlyToSelected({ entity }: { entity: Entity | null }) {
  const map = useMap();
  const id = entity?.id;
  const latitude = entity?.latitude;
  const longitude = entity?.longitude;

  useEffect(() => {
    if (id == null || latitude == null || longitude == null) return;
    map.flyTo([latitude, longitude], Math.max(map.getZoom(), 12), { duration: 0.6 });
  }, [id, latitude, longitude, map]);

  return null;
}

export default function MapView({ entities, selected, onSelect, onMapClick }: MapViewProps) {
  const icons = useMemo(() => {
    const cache = new Map<string, L.DivIcon>();
    return (entity: Entity, isSelected: boolean) => {
      const key = `${entity.status}-${isSelected}`;
      const cached = cache.get(key);
      if (cached) return cached;
      const icon = L.divIcon({
        className: "marker-icon",
        html: `<span class="marker-dot${isSelected ? " marker-dot--selected" : ""}" style="background:${STATUS_COLORS[entity.status]}"></span>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });
      cache.set(key, icon);
      return icon;
    };
  }, []);

  return (
    <MapContainer center={[-2.5, 118]} zoom={5} className="map-container" scrollWheelZoom>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onMapClick={onMapClick} />
      <FlyToSelected entity={selected} />

      {entities.map((entity) => (
        <Marker
          key={entity.id}
          position={[entity.latitude, entity.longitude]}
          icon={icons(entity, selected?.id === entity.id)}
          eventHandlers={{ click: () => onSelect(entity.id) }}
        >
          <Popup>
            <div className="popup">
              <strong>{entity.name}</strong>
              <div className="popup-meta">
                {TYPE_LABELS[entity.type]} · {STATUS_LABELS[entity.status]}
              </div>
              <button type="button" className="link-button" onClick={() => onSelect(entity.id)}>
                Lihat detail
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
