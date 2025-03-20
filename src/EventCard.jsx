import React from "react";

const EventCard = ({ event }) => {
  return (
    <div className="event-card">
      <img
        src={event.image || "https://via.placeholder.com/150"}
        alt={event.name}
        onError={(e) => (e.target.src = "https://via.placeholder.com/150")}
      />
      <div className="event-details">
        <h3>{event.name}</h3>
        <p>
          <strong>📅 Date:</strong> {event.date || "N/A"} {event.time && `| ⏰ ${event.time}`}
        </p>
        <p>
          <strong>📍 Venue:</strong> {event.venue || "N/A"}
        </p>
        <p>
          <strong>🏙️ Location:</strong> {event.address || "N/A"}, {event.city || "N/A"}, {event.country || "N/A"}
        </p>
        <a href={event.url || "#"} target="_blank" rel="noopener noreferrer" className="event-link">
          🎟️ Get Tickets
        </a>
      </div>
    </div>
  );
};

export default EventCard;