/**
 * Formatting and conversion utilities for temperatures, speed, pressure, time, and indexes.
 */

export function cToF(celsius) {
  return (celsius * 9) / 5 + 32;
}

export function fToC(fahrenheit) {
  return ((fahrenheit - 32) * 5) / 9;
}

export function kmhToMph(kmh) {
  return kmh * 0.621371;
}

export function mmToInches(mm) {
  return mm * 0.0393701;
}

export function hpaToInhg(hpa) {
  return hpa * 0.0295299830714;
}

/**
 * Format temperature with unit
 */
export function formatTemp(celsius, unit = 'metric') {
  if (celsius === undefined || celsius === null || isNaN(celsius)) return '--°';
  const val = unit === 'imperial' ? cToF(celsius) : celsius;
  return `${Math.round(val)}°`;
}

export function formatTempNumber(celsius, unit = 'metric') {
  if (celsius === undefined || celsius === null || isNaN(celsius)) return 0;
  const val = unit === 'imperial' ? cToF(celsius) : celsius;
  return Math.round(val);
}

/**
 * Format wind speed
 */
export function formatWindSpeed(kmh, unit = 'metric') {
  if (kmh === undefined || kmh === null || isNaN(kmh)) return '--';
  if (unit === 'imperial') {
    return `${Math.round(kmhToMph(kmh))} mph`;
  }
  return `${Math.round(kmh)} km/h`;
}

/**
 * Format pressure
 */
export function formatPressure(hpa, unit = 'metric') {
  if (hpa === undefined || hpa === null || isNaN(hpa)) return '--';
  if (unit === 'imperial') {
    return `${hpaToInhg(hpa).toFixed(2)} inHg`;
  }
  return `${Math.round(hpa)} hPa`;
}

/**
 * Format visibility
 */
export function formatVisibility(meters, unit = 'metric') {
  if (meters === undefined || meters === null || isNaN(meters)) return '--';
  if (unit === 'imperial') {
    const miles = (meters / 1000) * 0.621371;
    return `${miles >= 10 ? Math.round(miles) : miles.toFixed(1)} mi`;
  }
  const km = meters / 1000;
  return `${km >= 10 ? Math.round(km) : km.toFixed(1)} km`;
}

/**
 * Format precipitation
 */
export function formatPrecip(mm, unit = 'metric') {
  if (mm === undefined || mm === null || isNaN(mm)) return '--';
  if (unit === 'imperial') {
    return `${mmToInches(mm).toFixed(2)} in`;
  }
  return `${mm.toFixed(1)} mm`;
}

/**
 * Convert wind direction angle to cardinal compass direction
 */
export function getWindDirection(deg) {
  if (deg === undefined || deg === null || isNaN(deg)) return 'N';
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round((deg % 360) / 22.5) % 16;
  return directions[index];
}

/**
 * UV Index category, description, and color
 */
export function getUVInfo(uv) {
  if (uv === undefined || uv === null || isNaN(uv)) {
    return { level: 'Unknown', color: '#94a3b8', percentage: 0 };
  }
  const rounded = Math.round(uv * 10) / 10;
  const percentage = Math.min(100, Math.round((rounded / 11) * 100));

  if (rounded <= 2) {
    return { level: 'Low', description: 'No protection needed', color: '#10b981', percentage };
  }
  if (rounded <= 5) {
    return { level: 'Moderate', description: 'Wear sunglasses & sunscreen', color: '#f59e0b', percentage };
  }
  if (rounded <= 7) {
    return { level: 'High', description: 'Protection required', color: '#f97316', percentage };
  }
  if (rounded <= 10) {
    return { level: 'Very High', description: 'Extra protection essential', color: '#ef4444', percentage };
  }
  return { level: 'Extreme', description: 'Avoid outdoor exposure', color: '#a855f7', percentage };
}

/**
 * Air Quality Index (US AQI) category, qualitative status, and color
 */
export function getAQIInfo(aqi) {
  if (aqi === undefined || aqi === null || isNaN(aqi)) {
    return { label: 'Good', description: 'Air quality is satisfactory', color: '#10b981', category: 'good', score: 25 };
  }
  const score = Math.round(aqi);
  if (score <= 50) {
    return { label: 'Good', description: 'Air quality is satisfactory and clean', color: '#10b981', category: 'good', score };
  }
  if (score <= 100) {
    return { label: 'Moderate', description: 'Acceptable; sensitive individuals take note', color: '#eab308', category: 'moderate', score };
  }
  if (score <= 150) {
    return { label: 'Unhealthy for Sensitive Groups', description: 'General public not likely affected', color: '#f97316', category: 'sensitive', score };
  }
  if (score <= 200) {
    return { label: 'Unhealthy', description: 'Everyone may begin to experience health effects', color: '#ef4444', category: 'unhealthy', score };
  }
  if (score <= 300) {
    return { label: 'Very Unhealthy', description: 'Health alert: risk of health effects increased', color: '#a855f7', category: 'very-unhealthy', score };
  }
  return { label: 'Hazardous', description: 'Health warning of emergency conditions', color: '#881337', category: 'hazardous', score };
}

/**
 * Format time (HH:MM AM/PM or 24h)
 */
export function formatTime(isoString, timezone = undefined, is24h = false) {
  if (!isoString) return '--:--';
  try {
    const date = new Date(isoString);
    const options = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: !is24h,
    };
    if (timezone) options.timeZone = timezone;
    return new Intl.DateTimeFormat('en-US', options).format(date);
  } catch {
    return isoString.slice(11, 16);
  }
}

/**
 * Format Day of week
 */
export function formatDay(isoString, timezone = undefined, isFirst = false) {
  if (isFirst) return 'Today';
  try {
    const date = new Date(isoString);
    const options = { weekday: 'short' };
    if (timezone) options.timeZone = timezone;
    return new Intl.DateTimeFormat('en-US', options).format(date);
  } catch {
    return 'Day';
  }
}

/**
 * Format Date (e.g. "Sat, Oct 3")
 */
export function formatDate(isoString, timezone = undefined) {
  try {
    const date = isoString ? new Date(isoString) : new Date();
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    if (timezone) options.timeZone = timezone;
    return new Intl.DateTimeFormat('en-US', options).format(date);
  } catch {
    return '';
  }
}
