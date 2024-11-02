import { createContext, useContext, useState, useEffect } from "react";
import { UserAuth } from "./AuthContext";
import { getUserLocation } from "../services/userLocation";

const LocationContext = createContext();

export const LocationContextProvider = ({ children }) => {
  const [coords, setCoords] = useState({
    latitude: "44.439663",
    longitude: "26.096306",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = UserAuth();

  useEffect(() => {
    async function fetchLocation() {
      try {
        setIsLoading(true);
        setError(null);

        // Check if we're in a browser environment
        if (typeof window !== "undefined") {
          const position = await getUserLocation();
          if (position) {
            setCoords({
              latitude: position.latitude,
              longitude: position.longitude,
            });
          }
        }
      } catch (err) {
        setError(err.message);
        console.error("Error fetching location:", err);
      } finally {
        setIsLoading(false);
      }
    }

    if (user) {
      fetchLocation();
    }
  }, [user]);

  return (
    <LocationContext.Provider value={{ coords, isLoading, error }}>
      {children}
    </LocationContext.Provider>
  );
};

export const UserLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error(
      "useLocation must be used within a LocationContextProvider"
    );
  }
  return context;
};
