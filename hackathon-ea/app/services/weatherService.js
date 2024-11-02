const WEATHER_API_KEY = "dfa8640305cf6917d620672745a36d81";
const BASE_URL = "https://api.openweathermap.org/data/2.5";

export async function getDailyForecast(lat, lon, units = "metric") {
  try {
    const response = await fetch(
      `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=${units}&appid=${WEATHER_API_KEY}`
    );

    if (!response.ok) {
      throw new Error("Weather data fetch failed");
    }

    const data = await response.json();

    // Group forecasts by day
    const dailyForecasts = {};

    // Get today's date at midnight for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Process only first 3 days of forecast data
    data.list.forEach((forecast) => {
      const date = new Date(forecast.dt * 1000);
      const dateString = date.toISOString().split("T")[0];

      // Calculate days difference
      const forecastDate = new Date(dateString);
      const daysDifference = Math.floor(
        (forecastDate - today) / (1000 * 60 * 60 * 24)
      );

      // Only process first 3 days
      if (daysDifference >= 0 && daysDifference < 3) {
        if (!dailyForecasts[dateString]) {
          dailyForecasts[dateString] = {
            date: dateString,
            timestamp: forecast.dt,
            day: date.toLocaleDateString("en-US", { weekday: "short" }),
            temp_max: -Infinity,
            temp_min: Infinity,
            humidity: 0,
            windSpeed: 0,
            weatherMain: "",
            weatherDescription: "",
            weatherIcon: "",
            hourlyForecasts: [],
          };
        }

        // Update min/max temperatures
        dailyForecasts[dateString].temp_max = Math.max(
          dailyForecasts[dateString].temp_max,
          forecast.main.temp_max
        );
        dailyForecasts[dateString].temp_min = Math.min(
          dailyForecasts[dateString].temp_min,
          forecast.main.temp_min
        );

        // Update other daily values (using the noon forecast if available)
        const hour = date.getHours();
        if (hour === 12 || !dailyForecasts[dateString].weatherMain) {
          dailyForecasts[dateString].humidity = forecast.main.humidity;
          dailyForecasts[dateString].windSpeed = forecast.wind.speed;
          dailyForecasts[dateString].weatherMain = forecast.weather[0].main;
          dailyForecasts[dateString].weatherDescription =
            forecast.weather[0].description;
          dailyForecasts[dateString].weatherIcon = forecast.weather[0].icon;
        }

        // Add hourly forecast data
        dailyForecasts[dateString].hourlyForecasts.push({
          time: date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            hour12: true,
          }),
          temp: forecast.main.temp,
          weather: forecast.weather[0].main,
          icon: forecast.weather[0].icon,
        });
      }
    });

    // Convert to array and sort by date
    const threeDayForecast = Object.values(dailyForecasts).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    return threeDayForecast;
  } catch (error) {
    console.error("Error fetching weather forecast:", error);
    throw error;
  }
}

// export async function getAirPollution(lat, lon) {
//   try {
//     const response = await fetch(
//       `${BASE_URL}/air_pollution?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}`
//     );

//     if (!response.ok) {
//       throw new Error("Failed to fetch air pollution data");
//     }

//     const data = await response.json();

//     const aqiDescriptions = {
//       1: "Good",
//       2: "Fair",
//       3: "Moderate",
//       4: "Poor",
//       5: "Very Poor",
//     };

//     return {
//       aqi: data.list[0].main.aqi,
//       aqiDescription: aqiDescriptions[data.list[0].main.aqi],
//       components: {
//         co: data.list[0].components.co,
//         no: data.list[0].components.no,
//         no2: data.list[0].components.no2,
//         o3: data.list[0].components.o3,
//         so2: data.list[0].components.so2,
//         pm2_5: data.list[0].components.pm2_5,
//         pm10: data.list[0].components.pm10,
//         nh3: data.list[0].components.nh3,
//       },
//       timestamp: new Date(data.list[0].dt * 1000),
//     };
//   } catch (error) {
//     console.error("Error fetching air pollution data:", error);
//     throw error;
//   }
// }

// export async function getFireIndex(lat, lon) {
//   try {
//     const response = await fetch(
//       `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`
//     );

//     if (!response.ok) {
//       throw new Error("Failed to fetch fire index data");
//     }

//     const data = await response.json();

//     return {
//       current: {
//         fireIndex: data.current?.fire_weather_index || null,
//         timestamp: new Date(data.current.dt * 1000),
//       },
//       daily:
//         data.daily?.map((day) => ({
//           date: new Date(day.dt * 1000),
//           fireIndex: day.fire_weather_index,
//           temperature: {
//             min: day.temp.min,
//             max: day.temp.max,
//           },
//           humidity: day.humidity,
//           windSpeed: day.wind_speed,
//         })) || [],
//     };
//   } catch (error) {
//     console.error("Error fetching fire index data:", error);
//     throw error;
//   }
// }
