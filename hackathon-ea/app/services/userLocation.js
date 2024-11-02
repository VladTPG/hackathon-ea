export function getLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator?.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      // Success callback
      (position) => {
        const coordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        };
        resolve(coordinates);
      },
      // Error callback
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error("User denied the request for geolocation"));
            break;
          case error.POSITION_UNAVAILABLE:
            reject(new Error("Location information is unavailable"));
            break;
          case error.TIMEOUT:
            reject(new Error("The request to get user location timed out"));
            break;
          default:
            reject(new Error("An unknown error occurred"));
        }
      },
      // Options
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  });
}

export async function getUserLocation() {
  try {
    const position = await getLocation();
    return position;
  } catch (error) {
    return null;
  }
}
