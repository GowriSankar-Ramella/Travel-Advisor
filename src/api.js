import axios from "axios";

export const fetchRestaurants = async (bounds) => {
    if (!bounds || !bounds.bottomLeft || !bounds.topRight) {
      console.error("Invalid bounds object:", bounds);
      return [];
    }
  
    try {
      const response = await axios.get(
        "https://travel-advisor.p.rapidapi.com/restaurants/list-in-boundary",
        {
          params: {
            bl_latitude: bounds.bottomLeft.lat, 
            tr_latitude: bounds.topRight.lat,  
            bl_longitude: bounds.bottomLeft.lng,   
            tr_longitude: bounds.topRight.lng,   
            restaurant_tagcategory_standalone: "10591",
            restaurant_tagcategory: "10591",
            limit: "30",
            currency: "USD",
            open_now: "false",
            lunit: "km",
            lang: "en_US",
          },
          headers: {
            "X-RapidAPI-Key": import.meta.env.VITE_RAPIDAPI_KEY,
            "X-RapidAPI-Host": "travel-advisor.p.rapidapi.com",
          },
        }
      );
  
      console.log("API Response:", response.data); // Debugging
  
      if (!response.data || !response.data.data) {
        console.error("No restaurant data found:", response.data);
        return [];
      }
  
      return response.data.data; // ✅ Return only the restaurant array
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      return [];
    }
  };


export const fetchAttractions = async (bounds) => {
    if (!bounds || !bounds.bottomLeft || !bounds.topRight) {
      console.error("Invalid bounds object:", bounds);
      return [];
    }
  
    try {
      const response = await axios.get(
        "https://travel-advisor.p.rapidapi.com/attractions/list-in-boundary",
        {
          params: {
            bl_latitude: bounds.bottomLeft.lat, 
            tr_latitude: bounds.topRight.lat,  
            bl_longitude: bounds.bottomLeft.lng,   
            tr_longitude: bounds.topRight.lng,   
            restaurant_tagcategory_standalone: "10591",
            restaurant_tagcategory: "10591",
            limit: "30",
            currency: "USD",
            open_now: "false",
            lunit: "km",
            lang: "en_US",
          },
          headers: {
            "X-RapidAPI-Key": import.meta.env.VITE_RAPIDAPI_KEY,
            "X-RapidAPI-Host": "travel-advisor.p.rapidapi.com",
          },
        }
      );
  
      console.log("API Response:", response.data); // Debugging
  
      if (!response.data || !response.data.data) {
        console.error("No restaurant data found:", response.data);
        return [];
      }
  
      return response.data.data; // ✅ Return only the restaurant array
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      return [];
    }
  };

// import axios from "axios";

const HERE_API_KEY = import.meta.env.VITE_HERE_MAPS_API_KEY; // Replace with your API key

// Function to fetch places from HERE API based on category
export const fetchHotels = async (bounds) => {
  try {
    const { bottomLeft, topRight } = bounds;

    const categoryType = "hotel"; // Default to restaurant

    const response = await axios.get(
      `https://discover.search.hereapi.com/v1/discover`,
      {
        params: {
          at: `${(bottomLeft.lat + topRight.lat) / 2},${(bottomLeft.lng + topRight.lng) / 2}`, // Center of bounds
          q: categoryType, // Search category
          limit: 20, // Max results
          apiKey: HERE_API_KEY, // API Key
        },
      }
    );

    return response.data.items.map((place) => ({
      name: place.title,
      address: place.address?.label || "No address available",
      rating: "N/A", // No rating field in response
      category: place.categories?.[0]?.name || "Unknown",
      position: place.position, // lat, lng
      website: place.contacts?.[0]?.www?.[0]?.value || "#", // Get first available website
      photo: place.icon || "https://via.placeholder.com/150", // Default placeholder image
    }));
  } catch (error) {
    console.error("Error fetching HERE Hotels:", error);
    return [];
  }
};

export const fetchWeather = async (bounds) => {
  if (!bounds || !bounds.bottomLeft || !bounds.topRight) {
    console.error("Invalid bounds object:", bounds);
    return null;
  }

  try {
    const lat = (bounds.bottomLeft.lat + bounds.topRight.lat) / 2; // Center latitude
    const lon = (bounds.bottomLeft.lng + bounds.topRight.lng) / 2; // Center longitude
    const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY; // Store API key in .env

    const response = await axios.get("https://api.openweathermap.org/data/2.5/weather", {
      params: {
        lat,
        lon,
        units: "metric", // Change to 'imperial' for Fahrenheit
        appid: apiKey,
      },
    });

    console.log("Weather Data:", response.data);
    return response.data; // Return weather data
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return null;
  }
};

export const fetchEvents = async (bounds) => {
  if (!bounds || !bounds.bottomLeft || !bounds.topRight) {
    console.error("Invalid bounds object:", bounds);
    return [];
  }

  try {
    const response = await axios.get(
      "https://app.ticketmaster.com/discovery/v2/events.json",
      {
        params: {
          apikey: import.meta.env.VITE_TICKETMASTER_API_KEY,
          geoPoint: `${bounds.bottomLeft.lat},${bounds.bottomLeft.lng}`,
          radius: "50",
          unit: "km",
          size: "5", // Fetch 5 events for testing
        },
      }
    );

    console.log("Ticketmaster API Response:", response.data); // Log the full response

    if (!response.data._embedded || !response.data._embedded.events) {
      console.error("No events data found:", response.data);
      return [];
    }

    return response.data._embedded.events.map((event) => ({
      name: event.name,
      date: event.dates?.start?.localDate || "",
      time: event.dates?.start?.localTime || "",
      venue: event._embedded?.venues?.[0]?.name || "N/A",
      address: event._embedded?.venues?.[0]?.address?.line1 || "N/A",
      city: event._embedded?.venues?.[0]?.city?.name || "N/A",
      country: event._embedded?.venues?.[0]?.country?.name || "N/A",
      position: {
        lat: event._embedded?.venues?.[0]?.location?.latitude || 0,
        lng: event._embedded?.venues?.[0]?.location?.longitude || 0,
      },
      url: event.url || "#",
      image: event.images?.find((img) => img.ratio === "16_9")?.url || "https://via.placeholder.com/150",
    }));
  } catch (error) {
    console.error("Error fetching Ticketmaster events:", error);
    return [];
  }
};