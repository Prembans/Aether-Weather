/**
 * LocalStorage wrapper for user settings, favorite cities, and history.
 */

const STORAGE_KEYS = {
  FAVORITES: 'weather_app_favorites_v2',
  SETTINGS: 'weather_app_settings_v1',
  LAST_LOCATION: 'weather_app_last_loc_v2',
  RECENT_SEARCHES: 'weather_app_recent_v1',
};

// Clean up legacy v1 pre-seeded favorites if present
try {
  if (localStorage.getItem('weather_app_favorites_v1')) {
    localStorage.removeItem('weather_app_favorites_v1');
  }
} catch {
  // ignore
}

// Neutral fallback city used only for initial load when no GPS is provided
export const DEFAULT_FALLBACK_CITY = {
  id: 2643743,
  name: 'London',
  country: 'United Kingdom',
  admin1: 'England',
  latitude: 51.5085,
  longitude: -0.1257,
};

// User starts with an empty favorites list by default
export const DEFAULT_CITIES = [];

export function getFavorites() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveFavorites(favorites) {
  try {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
  } catch (err) {
    console.error('Failed to save favorites to localStorage:', err);
  }
}

export function addFavorite(city) {
  if (!city) return getFavorites();
  const current = getFavorites();
  const exists = current.some(
    (item) =>
      item.id === city.id ||
      (Math.abs(item.latitude - city.latitude) < 0.05 && Math.abs(item.longitude - city.longitude) < 0.05)
  );
  if (!exists) {
    const updated = [city, ...current];
    saveFavorites(updated);
    return updated;
  }
  return current;
}

export function removeFavorite(city) {
  if (!city) return getFavorites();
  const current = getFavorites();
  const updated = current.filter(
    (item) =>
      !(
        item.id === city.id ||
        (Math.abs(item.latitude - city.latitude) < 0.05 && Math.abs(item.longitude - city.longitude) < 0.05)
      )
  );
  saveFavorites(updated);
  return updated;
}

export function clearAllFavorites() {
  saveFavorites([]);
  return [];
}

export function isFavorite(city) {
  if (!city) return false;
  const current = getFavorites();
  return current.some(
    (item) =>
      item.id === city.id ||
      (Math.abs(item.latitude - city.latitude) < 0.05 && Math.abs(item.longitude - city.longitude) < 0.05)
  );
}

export function getSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return { unit: 'metric', is24h: false };
    return { unit: 'metric', is24h: false, ...JSON.parse(raw) };
  } catch {
    return { unit: 'metric', is24h: false };
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}

export function getLastLocation() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LAST_LOCATION);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveLastLocation(location) {
  try {
    localStorage.setItem(STORAGE_KEYS.LAST_LOCATION, JSON.stringify(location));
  } catch (err) {
    console.error('Failed to save last location:', err);
  }
}

export function getRecentSearches() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECENT_SEARCHES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addRecentSearch(city) {
  try {
    const list = getRecentSearches().filter((c) => c.name !== city.name);
    const updated = [city, ...list].slice(0, 5);
    localStorage.setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to update recent searches:', err);
  }
}
