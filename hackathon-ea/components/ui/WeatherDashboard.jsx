// components/WeatherDashboard.js
"use client";
import { useEffect, useState } from "react";
import {
  getDailyForecast,
  //   getAirPollution,
  //   getFireIndex,
} from "@/app/services/weatherService";
import { WeatherCard } from "./weatherCard";
import "@/app/(dash)/dashboard/dashboard.css";

const WeatherDashboard = ({ userCoords }) => {
  const { lat, lon } = userCoords;
  const [forecast, setForecast] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setLoading(true);

        const forecastData = await getDailyForecast(lat, lon);
        setForecast(forecastData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, [lat, lon]);

  if (loading) {
    return <div className="p-4">Loading weather data...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }
  console.log(forecast);
  return (
    <div className="pt-2 pr-5 h-full">
      <div className="flex flex-row gap-2 h-full">
        {forecast?.map((day) => (
          <WeatherCard key={day.day} day={day} />
        ))}
      </div>
    </div>
  );
};

export default WeatherDashboard;
