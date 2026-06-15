'use client'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import Link from 'next/link'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const dot = (color: string) => L.divIcon({
  className: '',
  html: `<div style="width:18px;height:18px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
  iconSize: [18, 18], iconAnchor: [9, 9],
})

const stationColor = (s: any) => {
  if (s.statut === 'MAINTENANCE') return '#f97316'
  if (s.statut === 'ACTIVE' && s.placesLibres > 0) return '#22c55e'
  return '#ef4444'
}

export default function MapView({ stations, selected, onSelect }: { stations: any[]; selected: any; onSelect: (s: any) => void }) {
  return (
    <MapContainer center={[4.051, 9.768]} zoom={13} style={{ height: '100%', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap contributors"/>
      {stations.map((s: any) => (
        <Marker key={s.id} position={[s.latitude, s.longitude]} icon={dot(stationColor(s))}
          eventHandlers={{ click: () => onSelect(s) }}>
          <Popup>
            <div className="min-w-[200px]">
              <div className="font-bold text-slate-900 mb-1">{s.nom}</div>
              <div className="text-xs text-slate-500 mb-2">{s.adresse}</div>
              <div className="text-xs mb-3">Occupation : {s.totalPlaces - s.placesLibres}/{s.totalPlaces} · {s.heureOuverture}–{s.heureFermeture}</div>
              {s.statut === 'ACTIVE' && s.placesLibres > 0 && (
                <a href="/inscription" className="block text-center bg-blue-900 text-white text-xs py-1.5 px-3 rounded-lg font-semibold">
                  Réserver cette station
                </a>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
