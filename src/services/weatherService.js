// Weather Service using OpenWeatherMap API
// Free tier: 1000 calls/day, 60 calls/minute

const API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY || 'demo';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

/**
 * Get weather by city name
 * @param {string} city - City name (e.g., "Los Angeles" or "Los Angeles,US")
 * @returns {Promise<Object>} Weather data
 */
export const getWeatherByCity = async (city) => {
  if (!city) {
    throw new Error('City name is required');
  }

  console.log('🌤️ Weather Service: Fetching weather for:', city);
  console.log('🌤️ Weather Service: API Key exists?', API_KEY && API_KEY !== 'demo' ? 'YES' : 'NO (using demo)');

  try {
    const url = `${BASE_URL}/weather?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`;
    console.log('🌤️ Weather Service: Calling API...');
    
    const response = await fetch(url);

    console.log('🌤️ Weather Service: Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('🌤️ Weather Service: API Error:', errorData);
      
      if (response.status === 404) {
        throw new Error('City not found');
      }
      if (response.status === 401) {
        throw new Error('Invalid API key - check your .env.local file');
      }
      throw new Error(`Weather API error: ${errorData.message || 'Failed to fetch weather data'}`);
    }

    const data = await response.json();
    console.log('🌤️ Weather Service: Success! Temperature:', data.main.temp + '°C');
    return formatWeatherData(data);
  } catch (error) {
    console.error('🌤️ Weather Service: Error fetching weather:', error.message);
    throw error;
  }
};

/**
 * Get weather by coordinates
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Object>} Weather data
 */
export const getWeatherByCoords = async (lat, lon) => {
  try {
    const response = await fetch(
      `${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }

    const data = await response.json();
    return formatWeatherData(data);
  } catch (error) {
    console.error('Error fetching weather:', error);
    throw error;
  }
};

/**
 * Format raw API data into a cleaner structure
 */
const formatWeatherData = (data) => {
  const temp = Math.round(data.main.temp);
  const feelsLike = Math.round(data.main.feels_like);
  const condition = data.weather[0].main;
  const description = data.weather[0].description;
  const icon = data.weather[0].icon;
  const windSpeed = Math.round(data.wind.speed);
  const humidity = data.main.humidity;
  const city = data.name;

  // Determine if it's good golf weather (Celsius temperatures)
  const isGoodGolfWeather = 
    temp >= 15 && temp <= 29 && 
    !['Rain', 'Thunderstorm', 'Snow'].includes(condition) &&
    windSpeed < 15;

  // Get appropriate emoji
  const emoji = getWeatherEmoji(condition, icon);

  // Get golf-specific message
  const golfMessage = getGolfMessage(temp, condition, windSpeed);

  return {
    temp,
    feelsLike,
    condition,
    description,
    icon,
    windSpeed,
    humidity,
    city,
    isGoodGolfWeather,
    emoji,
    golfMessage,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Get appropriate emoji for weather condition
 */
const getWeatherEmoji = (condition, icon) => {
  const iconMap = {
    'Clear': icon.includes('n') ? '🌙' : '☀️',
    'Clouds': '☁️',
    'Rain': '🌧️',
    'Drizzle': '🌦️',
    'Thunderstorm': '⛈️',
    'Snow': '❄️',
    'Mist': '🌫️',
    'Fog': '🌫️',
    'Haze': '🌫️',
  };
  return iconMap[condition] || '☀️';
};

/**
 * Get golf-specific weather message (Celsius temperatures)
 */
const getGolfMessage = (temp, condition, windSpeed) => {
  if (['Rain', 'Thunderstorm', 'Snow'].includes(condition)) {
    return 'Better stay indoors today ☔';
  }
  
  if (temp < 10) {
    return 'A bit chilly for golf 🥶';
  }
  
  if (temp > 35) {
    return 'Too hot! Stay hydrated 🔥';
  }
  
  if (windSpeed > 20) {
    return 'Very windy today 💨';
  }
  
  if (windSpeed > 10) {
    return 'Breezy conditions 🌬️';
  }
  
  if (temp >= 15 && temp <= 29) {
    return 'Perfect golf weather! ⛳';
  }
  
  return 'Good day for golf! 🏌️‍♂️';
};

/**
 * Get cached weather data (to avoid excessive API calls)
 */
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
const weatherCache = new Map();

export const getCachedWeather = async (city) => {
  const cacheKey = city.toLowerCase();
  const cached = weatherCache.get(cacheKey);
  
  if (cached && Date.now() - new Date(cached.timestamp).getTime() < CACHE_DURATION) {
    return cached;
  }
  
  try {
    const weather = await getWeatherByCity(city);
    weatherCache.set(cacheKey, weather);
    return weather;
  } catch (error) {
    // Return cached data even if expired if API fails
    if (cached) {
      return { ...cached, stale: true };
    }
    throw error;
  }
};

/**
 * Get default/fallback weather (Celsius)
 */
export const getDefaultWeather = () => ({
  temp: 22,
  feelsLike: 22,
  condition: 'Clear',
  description: 'sunny',
  windSpeed: 5,
  humidity: 50,
  city: 'Your Area',
  isGoodGolfWeather: true,
  emoji: '☀️',
  golfMessage: 'Great day for golf! 🏌️‍♂️',
  isDefault: true,
});

/**
 * Main weather service object that combines all weather functions
 */
export const weatherService = {
  getWeather: getCachedWeather,
  getWeatherByCity,
  getWeatherByCoords,
  getDefaultWeather,
};
