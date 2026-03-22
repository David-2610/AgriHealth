
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, MapPin, Wind, Droplets, Search, Sparkles, Navigation } from "lucide-react";
import {
  getCurrentLocation,
  searchLocation,
  getCurrentWeather,
  getForecast,
  getWeatherIcon,
  type WeatherData,
  type ForecastDay,
  type LocationData,
} from "@/lib/weather";
import { getWeatherFarmingAdvice, isGeminiConfigured } from "@/lib/gemini";

const Weather = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [farmingAdvice, setFarmingAdvice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<LocationData[]>([]);
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    detectLocation();
  }, []);

  const detectLocation = async () => {
    setIsLoading(true);
    try {
      const loc = await getCurrentLocation();
      setLocation(loc);
      await fetchWeatherData(loc);
    } catch (error) {
      console.error("Location error:", error);
      toast({
        title: "Location Access",
        description: "Could not detect location. Please search for your city.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWeatherData = async (loc: LocationData) => {
    try {
      const [currentWeather, forecastData] = await Promise.all([
        getCurrentWeather(loc.latitude, loc.longitude),
        getForecast(loc.latitude, loc.longitude),
      ]);
      setWeather(currentWeather);
      setForecast(forecastData);

      // Get farming advice if Gemini is configured
      if (isGeminiConfigured()) {
        setIsLoadingAdvice(true);
        try {
          const advice = await getWeatherFarmingAdvice(
            currentWeather.weatherDescription,
            currentWeather.temperature,
            currentWeather.humidity,
            loc.name
          );
          setFarmingAdvice(advice);
        } catch {
          console.error("Failed to get farming advice");
        } finally {
          setIsLoadingAdvice(false);
        }
      }
    } catch (error) {
      console.error("Weather error:", error);
      toast({
        title: "Error",
        description: "Failed to fetch weather data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      const results = await searchLocation(searchQuery);
      setSearchResults(results);
      setShowResults(true);
      if (results.length === 0) {
        toast({
          title: "No results",
          description: "No locations found. Try a different search term.",
        });
      }
    } catch {
      toast({
        title: "Search error",
        description: "Failed to search locations.",
        variant: "destructive",
      });
    }
  };

  const selectLocation = async (loc: LocationData) => {
    setLocation(loc);
    setShowResults(false);
    setSearchQuery("");
    setIsLoading(true);
    setFarmingAdvice(null);
    try {
      await fetchWeatherData(loc);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const getDayName = (dateStr: string, index: number) => {
    if (index === 0) return "Today";
    if (index === 1) return "Tomorrow";
    return new Date(dateStr).toLocaleDateString("en-US", { weekday: "short" });
  };

  const renderAdviceMarkdown = (text: string) => {
    return text.split("\n").map((line, index) => {
      if (line.startsWith("## ") || line.startsWith("### ")) {
        return null; // skip headers, we show our own
      } else if (line.match(/^\d+\.\s\*\*/)) {
        const content = line.replace(/^\d+\.\s/, "");
        const parts = content.split(/(\*\*.*?\*\*)/g);
        return (
          <div key={index} className="my-2">
            {parts.map((part, i) =>
              part.startsWith("**") && part.endsWith("**") ? (
                <strong key={i} className="text-agrihealth-green">
                  {part.replace(/\*\*/g, "")}
                </strong>
              ) : (
                <span key={i}>{part}</span>
              )
            )}
          </div>
        );
      } else if (line.startsWith("- ") || line.startsWith("* ")) {
        return (
          <li key={index} className="ml-4 my-0.5 text-sm">
            {line.substring(2)}
          </li>
        );
      } else if (line === "") {
        return null;
      } else {
        const parts = line.split(/(\*\*.*?\*\*)/g);
        return (
          <p key={index} className="my-1 text-sm">
            {parts.map((part, i) =>
              part.startsWith("**") && part.endsWith("**") ? (
                <strong key={i}>{part.replace(/\*\*/g, "")}</strong>
              ) : (
                <span key={i}>{part}</span>
              )
            )}
          </p>
        );
      }
    });
  };

  return (
    <div className="container mx-auto py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-agrihealth-green">
          Farm Weather Station
        </h1>
        <p className="text-lg mb-8 text-gray-600">
          Real-time weather data and AI-powered farming recommendations for your location.
        </p>

        {/* Search Bar */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyPress}
                  placeholder="Search city or location..."
                  className="pr-10"
                />
                {showResults && searchResults.length > 0 && (
                  <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-auto">
                    {searchResults.map((result, index) => (
                      <button
                        key={index}
                        onClick={() => selectLocation(result)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm"
                      >
                        <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        {result.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Button onClick={handleSearch} variant="outline">
                <Search className="h-4 w-4" />
              </Button>
              <Button
                onClick={detectLocation}
                variant="outline"
                title="Use my location"
              >
                <Navigation className="h-4 w-4" />
              </Button>
            </div>
            {location && (
              <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> {location.name}
              </p>
            )}
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-agrihealth-green mb-4" />
            <p className="text-gray-500">Fetching weather data...</p>
          </div>
        ) : weather ? (
          <>
            {/* Current Weather */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card className="md:col-span-1">
                <CardContent className="pt-6 text-center">
                  <p className="text-6xl mb-2">{getWeatherIcon(weather.weatherCode)}</p>
                  <p className="text-5xl font-bold text-agrihealth-green">{weather.temperature}°C</p>
                  <p className="text-lg text-gray-600 mt-1">{weather.weatherDescription}</p>
                </CardContent>
              </Card>
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">Current Conditions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <Droplets className="h-6 w-6 text-blue-500" />
                      <div>
                        <p className="text-xs text-gray-500">Humidity</p>
                        <p className="text-lg font-semibold">{weather.humidity}%</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Wind className="h-6 w-6 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Wind Speed</p>
                        <p className="text-lg font-semibold">{weather.windSpeed} km/h</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                      <span className="text-2xl">{weather.isDay ? "☀️" : "🌙"}</span>
                      <div>
                        <p className="text-xs text-gray-500">Time of Day</p>
                        <p className="text-lg font-semibold">{weather.isDay ? "Daytime" : "Nighttime"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <span className="text-2xl">🌡️</span>
                      <div>
                        <p className="text-xs text-gray-500">Feels Like</p>
                        <p className="text-lg font-semibold">{weather.temperature}°C</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 7-Day Forecast */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>7-Day Forecast</CardTitle>
                <CardDescription>Plan your farming activities for the week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
                  {forecast.map((day, index) => (
                    <div
                      key={day.date}
                      className={`text-center p-3 rounded-lg ${
                        index === 0 ? "bg-agrihealth-green/10 border border-agrihealth-green/30" : "bg-gray-50"
                      }`}
                    >
                      <p className="text-xs font-medium text-gray-500">{getDayName(day.date, index)}</p>
                      <p className="text-2xl my-1">{getWeatherIcon(day.weatherCode)}</p>
                      <p className="text-sm font-bold">{day.maxTemp}°</p>
                      <p className="text-xs text-gray-400">{day.minTemp}°</p>
                      {day.precipitationProbability > 0 && (
                        <p className="text-xs text-blue-500 mt-1">
                          💧 {day.precipitationProbability}%
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Farming Advice */}
            {isGeminiConfigured() && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-agrihealth-green" />
                    AI Farming Recommendations
                  </CardTitle>
                  <CardDescription>
                    Based on current weather conditions at {location?.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingAdvice ? (
                    <div className="flex items-center gap-3 py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-agrihealth-green" />
                      <p className="text-gray-500 text-sm">
                        AI is generating farming recommendations...
                      </p>
                    </div>
                  ) : farmingAdvice ? (
                    <div className="prose max-w-none">{renderAdviceMarkdown(farmingAdvice)}</div>
                  ) : (
                    <p className="text-gray-500 text-sm">
                      Unable to generate recommendations at this time.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="text-center py-16">
              <span className="text-6xl mb-4 block">🌤️</span>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Weather Data</h3>
              <p className="text-gray-500 mb-6">
                Allow location access or search for your city to see weather data.
              </p>
              <Button onClick={detectLocation} className="bg-agrihealth-green hover:bg-agrihealth-green-light">
                <Navigation className="h-4 w-4 mr-2" /> Use My Location
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Weather;
