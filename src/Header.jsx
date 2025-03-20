import { useRef, useEffect } from "react";

const Header = ({ fetchSuggestions, searchLocation, suggestions,setSuggestions }) => {
  const searchRef = useRef(null);

  useEffect(() => {
    console.log("Suggestions updated:", suggestions); // Debugging
  }, [suggestions]);

  const handleSuggestionClick = (title) => {
    searchRef.current.value = title; // ✅ Update search bar first
    searchLocation(title); // ✅ Then recenter the map
    setSuggestions([]); // ✅ Clear suggestions immediately after selection
  };
  

  return (
    <header className="header">
      <h1 className="title">Travel Advisor</h1>
      <div className="search-container">
        <input
          type="text"
          ref={searchRef}
          placeholder="Search for a location..."
          className="search-input"
          onChange={(e) => fetchSuggestions(e.target.value)}
        />
        <button onClick={() => searchLocation(searchRef.current.value)} className="search-button">
          Search
        </button>
        {suggestions.length > 0 && (
          <ul className="suggestions-list">
            {suggestions.map((item, index) => (
              <li key={index} onClick={() => handleSuggestionClick(item.title)}>
                {item.title}
              </li>
            ))}
          </ul>
        )}
      </div>
    </header>
  );
};

export default Header;