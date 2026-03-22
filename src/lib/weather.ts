/**
 * Weather service using Open-Meteo API (free, no API key required)
 */

export type WeatherData = {
  temperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  weatherDescription: string;
  isDay: boolean;
};

export type ForecastDay = {
  date: string;
  maxTemp: number;
  minTemp: number;
  weatherCode: number;
  weatherDescription: string;
  precipitationProbability: number;
};

export type LocationData = {
  latitude: number;
  longitude: number;
  name: string;
};

const weatherCodeMap: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Foggy",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  56: "Light freezing drizzle",
  57: "Dense freezing drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  66: "Light freezing rain",
  67: "Heavy freezing rain",
  71: "Slight snow fall",
  73: "Moderate snow fall",
  75: "Heavy snow fall",
  77: "Snow grains",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail",
};

const weatherIconMap: Record<number, string> = {
  0: "☀️",
  1: "🌤️",
  2: "⛅",
  3: "☁️",
  45: "🌫️",
  48: "🌫️",
  51: "🌦️",
  53: "🌧️",
  55: "🌧️",
  61: "🌧️",
  63: "🌧️",
  65: "🌧️",
  71: "🌨️",
  73: "❄️",
  75: "❄️",
  80: "🌦️",
  81: "🌧️",
  82: "⛈️",
  95: "⛈️",
  96: "⛈️",
  99: "⛈️",
};

export function getWeatherDescription(code: number): string {
  return weatherCodeMap[code] || "Unknown";
}

export function getWeatherIcon(code: number): string {
  return weatherIconMap[code] || "🌡️";
}

/**
 * Get current location using browser geolocation API
 */
export function getCurrentLocation(): Promise<LocationData> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Reverse geocode to get city name
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const data = await response.json();
          resolve({
            latitude,
            longitude,
            name: data.city || data.locality || `${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E`,
          });
        } catch {
          resolve({
            latitude,
            longitude,
            name: `${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E`,
          });
        }
      },
      (error) => {
        reject(new Error(`Location access denied: ${error.message}`));
      }
    );
  });
}

/**
 * Search for a location by name using Open-Meteo geocoding
 */
export async function searchLocation(query: string): Promise<LocationData[]> {
  const response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en`
  );
  const data = await response.json();

  if (!data.results) return [];

  return data.results.map((r: { latitude: number; longitude: number; name: string; admin1?: string; country?: string }) => ({
    latitude: r.latitude,
    longitude: r.longitude,
    name: `${r.name}${r.admin1 ? `, ${r.admin1}` : ""}${r.country ? `, ${r.country}` : ""}`,
  }));
}

/**
 * Fetch current weather from Open-Meteo
 */
export async function getCurrentWeather(lat: number, lon: number): Promise<WeatherData> {
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,is_day`
  );
  const data = await response.json();

  const current = data.current;
  return {
    temperature: Math.round(current.temperature_2m),
    humidity: current.relative_humidity_2m,
    windSpeed: Math.round(current.wind_speed_10m),
    weatherCode: current.weather_code,
    weatherDescription: getWeatherDescription(current.weather_code),
    isDay: current.is_day === 1,
  };
}

/**
 * Fetch 7-day forecast from Open-Meteo
 */
export async function getForecast(lat: number, lon: number): Promise<ForecastDay[]> {
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`
  );
  const data = await response.json();

  const daily = data.daily;
  return daily.time.map((date: string, i: number) => ({
    date,
    maxTemp: Math.round(daily.temperature_2m_max[i]),
    minTemp: Math.round(daily.temperature_2m_min[i]),
    weatherCode: daily.weather_code[i],
    weatherDescription: getWeatherDescription(daily.weather_code[i]),
    precipitationProbability: daily.precipitation_probability_max[i],
  }));
}
