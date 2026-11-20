
import { useState } from "react";
import L from "leaflet";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import "./CampusMap.css";

function MapClickHandler({ onSelect }) {
  useMapEvents({
    click(event) {
      onSelect(event.latlng);
    },
  });

  return null;
}

const campusBuildings = [
    {
      name: "CSPEAR Building",
      position: [14.19725, 120.88256],
    },
    {
      name: "CED Building",
      position: [14.19889, 120.88033],
    },
    {
      name: "Old CEMDS Building",
      position: [14.19996, 120.88129],
    },
    {
      name: "Student Union Building",
      position: [14.19779, 120.88226],
    },
    {
      name: "CvSU Bahay Alumni",
      position: [14.19719, 120.88293],
    },
  ];

export default function CampusMap({ onLocationsChange }) {
  const campusPosition = [14.198758, 120.881493];

  const [locations, setLocations] = useState([]);

  const addLocation = (position) => {
    if (locations.length >= 6) return;

    const updatedLocations = [
      ...locations,
      {
        name: `Meetup Location ${locations.length + 1}`,
        latitude: position.lat,
        longitude: position.lng,
      },
    ];

    setLocations(updatedLocations);
    onLocationsChange?.(updatedLocations);
  };

  const removeLocation = (index) => {
    const updatedLocations = locations
      .filter((_, i) => i !== index)
      .map((location, i) => ({
        ...location,
        name: `Meetup Location ${i + 1}`,
      }));

    setLocations(updatedLocations);
    onLocationsChange?.(updatedLocations);
  };

  return (
    <div>
      <div className="meetup-map-info">
        <strong>Choose Meetup Locations</strong>
        <p>Click the map to add possible meeting places.</p>

        <span>
          {locations.length} / 6 locations selected
        </span>

        {locations.length >= 6 && (
          <p className="map-limit-message">
            Maximum of 6 locations reached.
          </p>
        )}
      </div>

      <div className="campus-map-container">
        <MapContainer
          center={campusPosition}
          zoom={16}
          scrollWheelZoom={true}
          className="campus-map"
        >
        
        <TileLayer
  attribution='Imagery &copy; Esri, Maxar, Earthstar Geographics, and the GIS User Community'
  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
  maxZoom={19}
/>

<TileLayer
  attribution="Labels &copy; Esri"
  url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
  maxZoom={19}
/>

{campusBuildings.map((building) => (
  <Marker
    key={building.name}
    position={building.position}
    icon={L.divIcon({
      className: "campus-building-label",
      html: `<span>${building.name}</span>`,
      iconSize: [150, 28],
      iconAnchor: [75, 14],
    })}
  />
))}

          <Marker position={campusPosition}>
            <Popup>
              Cavite State University - Indang Main Campus
            </Popup>
          </Marker>

          <MapClickHandler onSelect={addLocation} />

          {locations.map((location, index) => (
            <Marker
              key={`${location.latitude}-${location.longitude}-${index}`}
              position={[
                location.latitude,
                location.longitude,
              ]}
              icon={L.divIcon({
                className: "meetup-pin-icon",
                html: `<span>${index + 1}</span>`,
                iconSize: [32, 32],
                iconAnchor: [16, 16],
              })}
            >
              <Popup>
                <strong>{location.name}</strong>

                <p>
                  {location.latitude.toFixed(6)},
                  {" "}
                  {location.longitude.toFixed(6)}
                </p>

                <button
                  type="button"
                  onClick={() => removeLocation(index)}
                >
                  Remove location
                </button>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {locations.length > 0 && (
        <div className="meetup-location-list">
          <strong>Selected locations</strong>

          {locations.map((location, index) => (
            <div
              className="meetup-location-item"
              key={index}
            >
              <span>{index + 1}. {location.name}</span>

              <button
                type="button"
                onClick={() => removeLocation(index)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {locations.length < 2 && (
        <p className="map-limit-message">
          Please select at least 2 locations.
        </p>
      )}
    </div>
  );
}
