import axios from "axios";

export const getAddressFromCoords = async (lat, lon) => {
  try {
    const response = await axios.get("https://nominatim.openstreetmap.org/reverse", {
      params: {
        lat,
        lon,
        format: "json",
      },
    });
    return response.data.display_name || "📍 Unknown address";
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return "📍 Coordinates only";
  }
};
