// Get traffic color
export const getCrowdFromCongestion = (congestionLevel) => {
    if (congestionLevel === 3) return "#F44336"; // 🔴 High
    if (congestionLevel === 2) return "#FFEB3B"; // 🟡 Moderate
    return "#4CAF50"; // 🟢 Low
  };
  
  // Get traffic label
  export const getTrafficLabel = (congestionLevel) => {
    if (congestionLevel === 3) return "High";
    if (congestionLevel === 2) return "Moderate";
    return "Low";
  };