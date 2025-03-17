import React, { useEffect, useRef, useState } from "react";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { fromLonLat } from "ol/proj";
import { Overlay } from "ol";

const OpenLayersMapComponent = ({ locations, className }) => {
  const mapContainerRef = useRef(null);
  const [selectedLocation, setSelectedLocation] = useState(null); // Track the selected location
  const [currentIndex, setCurrentIndex] = useState(0); // Track the current marker index
  const popupRef = useRef(null); // Reference to the popup element
  const mapRef = useRef(null); // Reference to the map instance

  useEffect(() => {
    if (mapContainerRef.current && locations.length > 0) {
      const map = new Map({
        target: mapContainerRef.current,
        layers: [
          new TileLayer({
            source: new OSM(), // Using OpenStreetMap as the tile source
          }),
        ],
        view: new View({
          center: fromLonLat([locations[0].lng, locations[0].lat]), // Center the map on the first location
          zoom: 10, // Adjust the zoom level as needed
        }),
      });

      // Store the map instance in a ref
      mapRef.current = map;

      // Create a popup overlay
      const popup = new Overlay({
        element: popupRef.current,
        autoPan: false, // Automatically pan the map when the popup is near the edge
        offset: [0, 30], // Offset the popup 10 pixels above the marker
        autoPanAnimation: {
          duration: 250, // Animation duration for auto-pan
        },
      });
      map.addOverlay(popup);

      // Add markers for each location
      locations.forEach((location, index) => {
        if (!location.lat || !location.lng) {
          console.warn('Invalid coordinates for location:', location);
          return; // Skip invalid locations
        }

        const marker = new Overlay({
          position: fromLonLat([location.lng, location.lat]), // Set marker at the location
          element: document.createElement("div"), // Create a custom marker element
        });

        // Style the marker
        marker.getElement().style.backgroundColor = "red"; // Red for visibility
        marker.getElement().style.width = "10px";
        marker.getElement().style.height = "10px";
        marker.getElement().style.borderRadius = "50%";
        marker.getElement().style.border = "2px solid white"; // Optional: Add a border
        marker.getElement().style.cursor = "pointer"; // Change cursor to pointer

        // Add a label to the marker (e.g., 1, 2, 3, etc.)
        const label = document.createElement("div");
        label.className = "marker-label";
        label.textContent = index + 1; // Number the markers
        marker.getElement().appendChild(label);

        // Add click event to the marker
        marker.getElement().addEventListener("click", () => {
          setSelectedLocation(location); // Set the selected location
          popup.setPosition(fromLonLat([location.lng, location.lat])); // Position the popup
        });

        map.addOverlay(marker);
      });

      // Add click event to the map to close the popup
      map.on("click", (event) => {
        setSelectedLocation(null); // Hide the popup
      });

      // Cleanup on unmount
      return () => {
        map.setTarget(undefined);
      };
    }
  }, [locations]);

  // Function to navigate to the next marker
  const goToNextMarker = () => {
    if (locations.length > 0) {
      const nextIndex = (currentIndex + 1) % locations.length; // Cycle through the locations
      setCurrentIndex(nextIndex);
      const location = locations[nextIndex];
      mapRef.current.getView().setCenter(fromLonLat([location.lng, location.lat])); // Center the map on the next marker
      setSelectedLocation(location); // Update the selected location
    }
  };

  // Function to navigate to the previous marker
  const goToPreviousMarker = () => {
    if (locations.length > 0) {
      const prevIndex = (currentIndex - 1 + locations.length) % locations.length; // Cycle through the locations
      setCurrentIndex(prevIndex);
      const location = locations[prevIndex];
      mapRef.current.getView().setCenter(fromLonLat([location.lng, location.lat])); // Center the map on the previous marker
      setSelectedLocation(location); // Update the selected location
    }
  };

  return (
    <div className="relative">
      <div ref={mapContainerRef} className={className} />
      {/* Popup for displaying location details */}
      <div
        ref={popupRef}
        className="ol-popup absolute bg-white p-4 rounded-lg shadow-md w-64 transform -translate-x-1/2 -translate-y-full"
        style={{ display: selectedLocation ? "block" : "none" }}
      >
        {selectedLocation && (
          <>
            <h3 className="text-lg font-semibold mb-2">{selectedLocation.label}</h3>
            <p className="text-sm"><strong>Latitude:</strong> {selectedLocation.lat}</p>
            <p className="text-sm"><strong>Longitude:</strong> {selectedLocation.lng}</p>
            <p className="text-sm"><strong>IP Address:</strong> {selectedLocation.ipAddress}</p>
            <p className="text-sm"><strong>ISP:</strong> {selectedLocation.isp}</p>
            <p className="text-sm"><strong>Organization:</strong> {selectedLocation.org}</p>
            <p className="text-sm"><strong>Timezone:</strong> {selectedLocation.timezone}</p>
            <p className="text-sm"><strong>Type:</strong> {selectedLocation.type}</p>
          </>
        )}
      </div>
      {/* Navigation buttons */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
        <button onClick={goToPreviousMarker} className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600">
          Previous
        </button>
        <button onClick={goToNextMarker} className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600">
          Next
        </button>
      </div>
    </div>
  );
};

export default OpenLayersMapComponent;  
