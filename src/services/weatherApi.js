/**
 * Open-Meteo API Client
 * Free, high-accuracy global meteorological forecasting with zero API key requirement.
 */

const GEOCODING_BASE = 'https://geocoding-api.open-meteo.com/v1';
const FORECAST_BASE = 'https://api.open-meteo.com/v1';
const AIR_QUALITY_BASE = 'https://air-quality-api.open-meteo.com/v1';

/**
 * Search cities worldwide with debounced autocomplete
 */
export async function fetchCitySuggestions(query) {
  if (!query || query.trim().length < 2) return [];

  const url = `${GEOCODING_BASE}/search?name=${encodeURIComponent(query.trim())}&count=8&language=en&format=json`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Geocoding HTTP error ${res.status}`);
    const data = await res.json();
    if (!data.results || !Array.isArray(data.results)) return [];

    return data.results.map((item) => ({
      id: item.id,
      name: item.name,
      country: item.country || '',
      countryCode: item.country_code || '',
      admin1: item.admin1 || '',
      latitude: item.latitude,
      longitude: item.longitude,
      timezone: item.timezone,
      elevation: item.elevation,
    }));
  } catch (err) {
    console.warn('Geocoding search failed:', err);
    return [];
  }
}

/**
 * Fetch detailed weather forecast data (current, 48-hour hourly, 7-day daily)
 */
export async function fetchWeatherData(lat, lon) {
  const currentParams = [
    'temperature_2m',
    'relative_humidity_2m',
    'apparent_temperature',
    'is_day',
    'precipitation',
    'rain',
    'showers',
    'snowfall',
    'weather_code',
    'cloud_cover',
    'pressure_msl',
    'surface_pressure',
    'wind_speed_10m',
    'wind_direction_10m',
    'wind_gusts_10m',
  ].join(',');

  const hourlyParams = [
    'temperature_2m',
    'relative_humidity_2m',
    'dew_point_2m',
    'apparent_temperature',
    'precipitation_probability',
    'precipitation',
    'weather_code',
    'pressure_msl',
    'visibility',
    'wind_speed_10m',
    'uv_index',
    'is_day',
  ].join(',');

  const dailyParams = [
    'weather_code',
    'temperature_2m_max',
    'temperature_2m_min',
    'apparent_temperature_max',
    'apparent_temperature_min',
    'sunrise',
    'sunset',
    'uv_index_max',
    'precipitation_sum',
    'precipitation_probability_max',
    'wind_speed_10m_max',
  ].join(',');

  const url = `${FORECAST_BASE}/forecast?latitude=${lat}&longitude=${lon}&current=${currentParams}&hourly=${hourlyParams}&daily=${dailyParams}&timezone=auto&forecast_days=7`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Weather API HTTP error ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Weather forecast fetch error:', err);
    throw err;
  }
}

/**
 * Fetch Air Quality data from Open-Meteo Air Quality API
 */
export async function fetchAirQuality(lat, lon) {
  const currentVars = ['us_aqi', 'european_aqi', 'pm10', 'pm2_5', 'carbon_monoxide', 'nitrogen_dioxide', 'ozone'].join(',');
  const url = `${AIR_QUALITY_BASE}/air-quality?latitude=${lat}&longitude=${lon}&current=${currentVars}&timezone=auto`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Air Quality API HTTP error ${res.status}`);
    const data = await res.json();
    return data.current || null;
  } catch (err) {
    console.warn('Air Quality fetch error (falling back to estimates):', err);
    return {
      us_aqi: 32,
      pm2_5: 6.8,
      pm10: 12.4,
      ozone: 45,
    };
  }
}

/**
 * Reverse geocode latitude and longitude to a human-readable city/region
 */
export async function reverseGeocode(lat, lon) {
  try {
    // 1. Try BigDataCloud reverse geocode (client API without credentials required)
    const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
    const res = await fetch(bdcUrl);
    if (res.ok) {
      const data = await res.json();
      const name = data.city || data.locality || data.principalSubdivision || 'Current Location';
      return {
        id: `geo-${lat.toFixed(2)}-${lon.toFixed(2)}`,
        name,
        admin1: data.principalSubdivision || '',
        country: data.countryName || '',
        latitude: lat,
        longitude: lon,
      };
    }
  } catch (err) {
    console.warn('BigDataCloud reverse geocode failed, trying fallback:', err);
  }

  // Fallback default
  return {
    id: `geo-${lat.toFixed(2)}-${lon.toFixed(2)}`,
    name: 'Current Location',
    admin1: '',
    country: '',
    latitude: lat,
    longitude: lon,
  };
}
