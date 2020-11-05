import React, { useState, useEffect } from "react";
import { GoogleMap, LoadScript, Marker, MarkerClusterer } from "@react-google-maps/api";
//npm i @react-google-maps/api
import axios from "axios";
import { Event } from "../../models/event";
import API_KEY from "./googleMapKey";
import { Title } from "./styledComponent";

const mapContainerStyle = {
  width: "100%",
  height: "400px",
};

const Map: React.FC = () => {
  const [allEvents, setAllEvents] = useState<Event[]>();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents: () => Promise<void> = async () => {
    const { data } = await axios({
      method: "get",
      url: "http://localhost:3001/events/all",
    });
    const events = data;
    setAllEvents(events);
  };

  return (
    <>
      <Title>Geolocation Map</Title>
      <LoadScript googleMapsApiKey={API_KEY}>
        <GoogleMap
          options={{
            disableDefaultUI: true,
          }}
          mapContainerStyle={mapContainerStyle}
          center={{ lat: 31.45, lng: 35 }}
          zoom={1.5}
        >
          <MarkerClusterer averageCenter enableRetinaIcons gridSize={80}>
            {(clusterer) =>
              allEvents ? (
                allEvents.map((event) => (
                  <Marker
                    key={event._id}
                    clusterer={clusterer}
                    position={{
                      lat: event.geolocation.location.lat,
                      lng: event.geolocation.location.lng,
                    }}
                  />
                ))
              ) : (
                <h1>Loader</h1>
              )
            }
          </MarkerClusterer>
        </GoogleMap>
      </LoadScript>
    </>
  );
};

export default Map;
