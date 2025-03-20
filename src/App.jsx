import React, { useState, useEffect } from "react";
import Header from "./Header";
import HereMap from "./HereMap";
import { fetchRestaurants, fetchAttractions, fetchHotels, fetchEvents } from "./api";
import EventCard from "./EventCard"; // Import the EventCard component
import "./app.css";

function App() {
  const [searchFunctions, setSearchFunctions] = useState({
    fetchSuggestions: () => {},
    searchLocation: () => {},
    suggestions: [],
    setSuggestions: () => {},
  });

  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [bounds, setBounds] = useState(null);
  const [category, setCategory] = useState("Restaurants");
  const [rating, setRating] = useState("");

  // Function to update bounds when the map moves
  const handleBoundsChange = (newBounds) => {
    setBounds(newBounds);
  };

  // Fetch data when bounds or category change
  useEffect(() => {
    if (bounds && bounds.bottomLeft && bounds.topRight) {
      let fetchData;

      // Determine which API function to call based on category
      if (category === "Restaurants") {
        fetchData = fetchRestaurants;
      } else if (category === "Hotels") {
        fetchData = fetchHotels;
      } else if (category === "Events") {
        fetchData = fetchEvents;
      } else {
        fetchData = fetchAttractions;
      }

      fetchData(bounds).then((data) => {
        if (Array.isArray(data)) {
          setItems(data);
          setFilteredItems(data);
        } else {
          setItems([]);
          setFilteredItems([]);
        }
      });
    }
  }, [bounds, category]);

  // Filter items based on rating
  useEffect(() => {
    if (rating && category !== "Events") {
      const filtered = items.filter((item) => Number(item.rating) >= Number(rating));
      setFilteredItems(filtered);
    } else {
      setFilteredItems(items);
    }
  }, [rating, items, category]);

  return (
    <div>
      <Header
        fetchSuggestions={searchFunctions.fetchSuggestions}
        searchLocation={searchFunctions.searchLocation}
        suggestions={searchFunctions.suggestions}
        setSuggestions={searchFunctions.setSuggestions}
      />
      <div className="main-container">
        <div className="map-container">
          <HereMap
            setSearchFunctions={setSearchFunctions}
            onBoundsChange={handleBoundsChange}
            places={filteredItems}
            category={category}
          />
        </div>
        <div className="restaurant-list">
          <div className="filters-container">
            {/* Category Dropdown */}
            <div className="category-selector">
              <label htmlFor="category">Show: </label>
              <select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="Restaurants">Restaurants</option>
                {/* <option value="Hotels">Hotels</option> */}
                <option value="Events">Events</option>
                <option value="Attraction Spots">Attraction Spots</option>
              </select>
            </div>

            {/* Rating Dropdown */}
            <div className="rating-selector">
              <label htmlFor="rating">Min Rating: </label>
              <select id="rating" value={rating} onChange={(e) => setRating(e.target.value)}>
                <option value="">All</option>
                <option value="3">3+ ⭐</option>
                <option value="4">4+ ⭐</option>
                <option value="4.5">4.5+ ⭐</option>
              </select>
            </div>
          </div>

          {filteredItems.length > 0 ? (
            filteredItems.map((item, index) =>
              category === "Events" ? (
                <EventCard key={index} event={item} /> // Use EventCard for Events
              ) : (
                <div className="restaurant-card" key={index}>
                  <img
                    src={item.photo?.images?.large?.url || "https://via.placeholder.com/150"}
                    alt={item.name}
                    onError={(e) => (e.target.src = "https://via.placeholder.com/150")}
                  />
                  <div className="restaurant-details">
                    <h3>{item.name}</h3>
                    <p>{item.address}</p>
                    {item.rating && <p>⭐ {item.rating}</p>}
                    <p>📍 {item.distance_string} away</p>
                    <p>💰 {item.price_level || "N/A"}</p>
                    <a href={item.web_url} target="_blank" rel="noopener noreferrer">
                      More Details
                    </a>
                  </div>
                </div>
              )
            )
          ) : (
            <p>No {category.toLowerCase()} found in this area.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;