import { useEffect, useRef, useState, useCallback } from "react";
import { fetchWeather } from "./api";

const HereMap = ({ setSearchFunctions, onBoundsChange, places,category }) => {
  const mapRef = useRef(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [map, setMap] = useState(null);
  const [platform, setPlatform] = useState(null);
  const [marker, setMarker] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [placeMarkers, setPlaceMarkers] = useState([]);
  


  useEffect(() => {
    const loadScript = (url) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = url;
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });
    };

    const loadHereMaps = async () => {
      try {
        await loadScript("https://js.api.here.com/v3/3.1/mapsjs-core.js");
        await loadScript("https://js.api.here.com/v3/3.1/mapsjs-service.js");
        await loadScript("https://js.api.here.com/v3/3.1/mapsjs-ui.js");
        await loadScript("https://js.api.here.com/v3/3.1/mapsjs-mapevents.js");
        setIsScriptLoaded(true);
      } catch (error) {
        console.error("HERE Maps script loading failed:", error);
      }
    };

    if (!window.H) {
      loadHereMaps();
    } else {
      setIsScriptLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isScriptLoaded || !mapRef.current) return;

    const apiKey = import.meta.env.VITE_HERE_MAPS_API_KEY;
    const platformInstance = new window.H.service.Platform({ apikey: apiKey });
    const defaultLayers = platformInstance.createDefaultLayers();

    const mapInstance = new window.H.Map(
      mapRef.current,
      defaultLayers.vector.normal.map,
      {
        center: { lat:  16.50745000  , lng: 80.64660000 }, // Berlin
        zoom: 13,
      }
    );
    
    new window.H.mapevents.Behavior(new window.H.mapevents.MapEvents(mapInstance));
    window.H.ui.UI.createDefault(mapInstance, defaultLayers);

    setMap(mapInstance);
    setPlatform(platformInstance);

    return () => mapInstance.dispose();
  }, [isScriptLoaded]);



  const updateBounds = useCallback(async () => {
    if (!map) return;

    const viewData = map.getViewModel().getLookAtData();
    const bounds = {
      topRight: { lat: viewData.position.lat + 0.05, lng: viewData.position.lng + 0.05 },
      bottomLeft: { lat: viewData.position.lat - 0.05, lng: viewData.position.lng - 0.05 },
    };

    console.log("Updated Bounds:", bounds);

    if (onBoundsChange) {
      onBoundsChange(bounds);
    }

    const weatherData = await fetchWeather(bounds);
    if (weatherData) {
      displayWeather(weatherData, bounds);
    }
  }, [map, onBoundsChange]);

  useEffect(() => {
    if (!map) return;

    map.addEventListener("dragend", updateBounds);
    map.addEventListener("mapviewchangeend", updateBounds);

    return () => {
      map.removeEventListener("dragend", updateBounds);
      map.removeEventListener("mapviewchangeend", updateBounds);
    };
  }, [map, updateBounds]);

  const fetchSuggestions = useCallback(
    async (query) => {
      if (!platform || !query.trim()) {
        setSuggestions([]); // Clear suggestions if query is empty
        return;
      }
  
      const placesService = platform.getSearchService();
      placesService.autosuggest(
        {
          q: query,
          at: "52.52,13.405", // Default location (Berlin)
        },
        (result) => {
          if (result.items) {
            setSuggestions(result.items);
          } else {
            setSuggestions([]); // Ensure old suggestions are cleared
          }
        },
        (error) => {
          console.error("Autocomplete error:", error);
          setSuggestions([]); // Clear suggestions on error
        }
      );
    },
    [platform]
  );
  

  const searchLocation = useCallback(
    async (location) => {
      if (!map || !platform) return;

      const geocoder = platform.getSearchService();
      geocoder.geocode(
        { q: location },
        (result) => {
          if (result.items.length > 0) {
            const { lat, lng } = result.items[0].position;
            map.setCenter({ lat, lng });
            map.setZoom(15);

            if (marker) {
              map.removeObject(marker);
            }

            const newMarker = new window.H.map.Marker({ lat, lng });
            map.addObject(newMarker);
            setMarker(newMarker);
            setSuggestions([]); // Hide suggestions
          }
        },
        (error) => {
          console.error("Geocoding error:", error);
        }
      );
    },
    [map, platform, marker]
  ); 



  useEffect(() => {
    if (setSearchFunctions) {
      setSearchFunctions({
        fetchSuggestions,
        searchLocation,
        suggestions,
        setSuggestions,
      });
    }
  }, [setSearchFunctions, fetchSuggestions, searchLocation, suggestions]);

  useEffect(() => {
    if (!map || !places) return;

    // Remove previous markers
    map.removeObjects(map.getObjects());

    places.forEach((place) => {
      if (place.position || (place.latitude && place.longitude)) {
        const position = place.position || { lat: place.latitude, lng: place.longitude };
        let labelElement;

        if (category === "Events") {
          // Marker design for Events
          const imageUrl = place.image || "https://via.placeholder.com/150";
          const name = place.name;
          const date = place.date || "";
          const time = place.time || "";
          const venue = place.venue || "N/A";
          const address = place.address || "N/A";
          const city = place.city || "N/A";
          const country = place.country || "N/A";
          const webUrl = place.url || "#";

          labelElement = document.createElement("div");
          labelElement.innerHTML = `
            <div style="
              background: white;
              border: 1px solid #ccc;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
              width: 140px; /* Slightly wider for events */
              text-align: center;
              overflow: hidden;
            ">
              <img 
                src="${imageUrl}" 
                alt="${name}" 
                style="
                  width: 100%;
                  height: 80px; /* Taller image for events */
                  object-fit: cover;
                  border-top-left-radius: 8px;
                  border-top-right-radius: 8px;
                "
              />
              <div style="padding: 5px; font-size: 12px; font-weight: bold;">
                ${name}
              </div>
              ${date && `<div style="padding: 5px; font-size: 11px; color: #666;">📅 ${date} ${time}</div>`}
              <div style="padding: 5px; font-size: 11px; color: #666;">
                📍 ${venue}, ${city}, ${country}
              </div>
              <div style="padding: 5px;">
                <a 
                  href="${webUrl}" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style="color: #007BFF; text-decoration: none; font-size: 11px;"
                >
                  🎟️ Get Tickets
                </a>
              </div>
            </div>
          `;
        } else {
          // Default marker design for Restaurants, Hotels, and Attraction Spots
          const imageUrl = place.photo?.images?.large?.url || "https://via.placeholder.com/100";
          const name = place.name;
          const rating = place.rating || "N/A";
          const distance = place.distance_string || "N/A";
          const webUrl = place.web_url || "#";

          labelElement = document.createElement("div");
          labelElement.innerHTML = `
            <div style="
              background: white;
              border: 1px solid #ccc;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
              width: 120px;
              text-align: center;
              overflow: hidden;
            ">
              <img 
                src="${imageUrl}" 
                alt="${name}" 
                style="
                  width: 100%;
                  height: 60px;
                  object-fit: cover;
                  border-top-left-radius: 8px;
                  border-top-right-radius: 8px;
                "
              />
              <div style="padding: 5px; font-size: 12px; font-weight: bold;">
                ${name}
              </div>
              <div style="padding: 5px; font-size: 11px; color: #666;">
                Rating: ${rating}
              </div>
              <div style="padding: 5px; font-size: 11px; color: #666;">
                Distance: ${distance}
              </div>
              <div style="padding: 5px;">
                <a 
                  href="${webUrl}" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style="color: #007BFF; text-decoration: none; font-size: 11px;"
                >
                  Visit Website
                </a>
              </div>
            </div>
          `;
        }

        // Create a DomMarker with the custom label (card)
        const domMarker = new window.H.map.DomMarker(position, {
          icon: new window.H.map.DomIcon(labelElement),
        });

        // Create a standard marker (pin) for the place
        const pinMarker = new window.H.map.Marker(position, {
          icon: new window.H.map.Icon("https://cdn-icons-png.flaticon.com/512/684/684908.png", { size: { w: 32, h: 32 } }),
        });

        // Add both the DomMarker (card) and the pinMarker to the map
        map.addObject(domMarker);
        map.addObject(pinMarker);
      }
    });
  }, [map, places, category]);

  let weatherMarker = null; // Global variable to store weather marker

  const displayWeather = (weatherData, bounds) => {
    if (!map || !weatherData) return;

    const { main, weather, wind } = weatherData;
    const temp = main.temp;
    const description = weather[0].description;
    const icon = `http://openweathermap.org/img/wn/${weather[0].icon}.png`;

    const weatherLabel = document.createElement("div");
    weatherLabel.innerHTML = `
      <div style="
        background: rgba(255, 255, 255, 0.9);
        border-radius: 10px;
        padding: 10px;
        text-align: center;
        font-size: 12px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      ">
        <img src="${icon}" alt="Weather" style="width: 40px; height: 40px;" />
        <div><strong>${temp}°C</strong></div>
        <div>${description}</div>
        <div>Wind: ${wind.speed} m/s</div>
      </div>
    `;

    // If a weather marker already exists, remove it before adding a new one
    if (weatherMarker) {
      map.removeObject(weatherMarker);
    }

    weatherMarker = new window.H.map.DomMarker(
      { lat: (bounds.topRight.lat + bounds.bottomLeft.lat) / 2, lng: (bounds.topRight.lng + bounds.bottomLeft.lng) / 2 },
      {
        icon: new window.H.map.DomIcon(weatherLabel),
      }
    );

    map.addObject(weatherMarker); // Add the weather marker to the map
  };




  return <div ref={mapRef} className="map-container" />;
};

export default HereMap;