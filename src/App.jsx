import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './App.css';

// Fixing leaflet icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
});

L.Marker.prototype.options.icon = DefaultIcon;

function App() {
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [userAddress, setUserAddress] = useState(null);

  const [GPSLatitude, setGPSLatitude] = useState(null);
  const [GPSLongitude, setGPSLongitude] = useState(null);

  useEffect(() => {
    const geo = navigator.geolocation;

    if (geo) {
      geo.getCurrentPosition(userCoords, geoError);
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);

  function userCoords(position) {
    const userLatitude = position.coords.latitude;
    const userLongitude = position.coords.longitude;
    setLatitude(userLatitude);
    setLongitude(userLongitude);
  }

  function geoError(error) {
    console.error("Error occurred while retrieving location: ", error.message);
  }

  const getUserAddress = async () => {
    if (latitude && longitude) {
      const url = `https://api.opencagedata.com/geocode/v1/json?key=be00404fc9864f9d8192358ed681adc5&q=${latitude},${longitude}&pretty=1&no_annotations=1`;
      const loc = await fetch(url);
      const data = await loc.json();

      if (data.results && data.results.length > 0) {
        setUserAddress(data.results[0].formatted);
      } else {
        console.error("No address found.");
      }
    } else {
      console.error("Latitude and Longitude are not available yet.");
    }
  };

  useEffect(() => {
    const geo = navigator.geolocation;

    if (geo) {
      const watchID = geo.watchPosition(userGPSCoords, geoError);

      return () => {
        geo.clearWatch(watchID);
      };
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);

  function userGPSCoords(position) {
    const userGPSLatitude = position.coords.latitude;
    const userGPSLongitude = position.coords.longitude;
    setGPSLatitude(userGPSLatitude);
    setGPSLongitude(userGPSLongitude);
  }

  return (
    <>
      <h2>Current Location</h2>
      <h3>Latitude: {latitude}</h3>
      <h3>Longitude: {longitude}</h3>
      <h3>Address: {userAddress}</h3>
      <button onClick={getUserAddress}>Get User Address</button>

      <hr />

      <h2>GPS Tracking</h2>
      <h3>GPS Latitude: {GPSLatitude}</h3>
      <h3>GPS Longitude: {GPSLongitude}</h3>

      {GPSLatitude && GPSLongitude && (
        <MapContainer
          center={[GPSLatitude, GPSLongitude]}
          zoom={13}
          style={{ height: "400px", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker position={[GPSLatitude, GPSLongitude]}>
            <Popup>
              You are here: {GPSLatitude}, {GPSLongitude}
            </Popup>
          </Marker>
        </MapContainer>
      )}
    </>
  );
}

export default App;
