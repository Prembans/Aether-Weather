/**
 * Aether Weather - Application Entry Point & State Orchestrator
 */
import './style.css';
import { AtmosphereEngine } from './components/atmosphere.js';
import { setupSearchBar } from './components/searchBar.js';
import { renderFavoritesBar } from './components/favoritesBar.js';
import { renderCurrentWeather } from './components/currentWeather.js';
import { renderHourlyForecast } from './components/hourlyForecast.js';
import { renderDailyForecast } from './components/dailyForecast.js';
import { renderMetricsGrid } from './components/metricsGrid.js';
import { renderWeatherMap } from './components/weatherMap.js';
import { showToast } from './components/toast.js';
import { fetchWeatherData, fetchAirQuality, reverseGeocode } from './services/weatherApi.js';
import {
  getFavorites,
  addFavorite,
  removeFavorite,
  clearAllFavorites,
  isFavorite,
  getSettings,
  saveSettings,
  getLastLocation,
  saveLastLocation,
  DEFAULT_FALLBACK_CITY,
} from './services/storage.js';
import { getWeatherMeta } from './utils/weatherCodes.js';

class WeatherApp {
  constructor() {
    this.settings = getSettings();
    this.currentCity = getLastLocation();
    this.currentWeatherData = null;
    this.currentAirQuality = null;
    this.favorites = getFavorites();
    this.isLoading = false;

    // DOM Elements
    this.canvasElement = document.getElementById('atmosphere-canvas');
    this.currentWeatherContainer = document.getElementById('current-weather-container');
    this.hourlyForecastContainer = document.getElementById('hourly-forecast-container');
    this.dailyForecastContainer = document.getElementById('daily-forecast-container');
    this.metricsGridContainer = document.getElementById('metrics-grid-container');
    this.weatherMapContainer = document.getElementById('weather-map-container');
    this.favoritesContainer = document.getElementById('favorites-container');
    this.searchBarContainer = document.getElementById('search-bar-container');

    this.btnUnitC = document.getElementById('btn-unit-c');
    this.btnUnitF = document.getElementById('btn-unit-f');
    this.btnRefresh = document.getElementById('btn-refresh-weather');

    // Initialize Atmosphere Particle Engine
    this.atmosphere = new AtmosphereEngine(this.canvasElement);

    this.init();
  }

  async init() {
    this.setupEventListeners();
    this.updateUnitButtons();

    // Setup Search Bar
    setupSearchBar(this.searchBarContainer, {
      onSelectCity: (city) => this.selectCity(city),
      showToast,
    });

    // Render Favorites
    this.updateFavorites();

    // Determine initial city to load
    const initialCity = await this.resolveInitialLocation();
    this.currentCity = initialCity;
    saveLastLocation(initialCity);

    // Load initial weather
    await this.loadWeatherForCity(this.currentCity);

    // Auto-refresh interval (every 15 minutes)
    setInterval(() => {
      this.refreshCurrentWeather(false);
    }, 15 * 60 * 1000);
  }

  async resolveInitialLocation() {
    // 1. If previously visited city was saved in localStorage, use that
    const saved = getLastLocation();
    if (saved && saved.latitude && saved.longitude) {
      return saved;
    }

    // 2. Attempt browser geolocation first
    if (navigator.geolocation) {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 5000,
            maximumAge: 60000,
          });
        });
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const resolved = await reverseGeocode(lat, lon);
        return resolved;
      } catch (err) {
        console.info('Geolocation not granted or timed out, using fallback city:', err);
      }
    }

    // 3. Neutral fallback city (London)
    return DEFAULT_FALLBACK_CITY;
  }

  setupEventListeners() {
    // Unit Switcher
    this.btnUnitC.addEventListener('click', () => this.setUnit('metric'));
    this.btnUnitF.addEventListener('click', () => this.setUnit('imperial'));

    // Manual Refresh
    this.btnRefresh.addEventListener('click', () => {
      this.refreshCurrentWeather(true);
    });
  }

  setUnit(unit) {
    if (this.settings.unit === unit) return;
    this.settings.unit = unit;
    saveSettings(this.settings);
    this.updateUnitButtons();
    showToast(`Unit changed to °${unit === 'metric' ? 'C' : 'F'}`, 'info');
    this.renderAllViews();
  }

  updateUnitButtons() {
    if (this.settings.unit === 'metric') {
      this.btnUnitC.classList.add('active');
      this.btnUnitF.classList.remove('active');
    } else {
      this.btnUnitF.classList.add('active');
      this.btnUnitC.classList.remove('active');
    }
  }

  async selectCity(city) {
    if (!city || !city.latitude || !city.longitude) return;
    this.currentCity = city;
    saveLastLocation(city);
    await this.loadWeatherForCity(city);
    this.updateFavorites();
  }

  async refreshCurrentWeather(manual = false) {
    if (this.isLoading) return;
    if (manual) {
      this.btnRefresh.classList.add('is-spinning');
      showToast('Refreshing real-time data...', 'info');
    }

    try {
      await this.loadWeatherForCity(this.currentCity, false);
      if (manual) {
        showToast('Weather updated to latest observation', 'success');
      }
    } catch {
      if (manual) {
        showToast('Failed to update weather', 'error');
      }
    } finally {
      if (manual) {
        setTimeout(() => {
          this.btnRefresh.classList.remove('is-spinning');
        }, 600);
      }
    }
  }

  async loadWeatherForCity(city, updateTheme = true) {
    this.isLoading = true;
    try {
      // Parallel fetch weather & air quality
      const [weather, airQuality] = await Promise.all([
        fetchWeatherData(city.latitude, city.longitude),
        fetchAirQuality(city.latitude, city.longitude),
      ]);

      this.currentWeatherData = weather;
      this.currentAirQuality = airQuality;

      // Update atmospheric theme and particles
      if (updateTheme && weather.current) {
        this.applyAtmosphereTheme(weather.current.weather_code, weather.current.is_day);
      }

      this.renderAllViews();
    } catch (err) {
      console.error('Error loading weather data:', err);
      showToast(`Unable to fetch weather for ${city.name}. Retrying...`, 'error');
    } finally {
      this.isLoading = false;
    }
  }

  applyAtmosphereTheme(code, isDay) {
    const meta = getWeatherMeta(code, isDay);

    // Remove existing theme classes
    document.body.className = '';
    document.body.classList.add(meta.theme);

    // Update particle mode
    this.atmosphere.setMode(meta.particle);
  }

  addFavoriteCity(city) {
    if (!city) return;
    this.favorites = addFavorite(city);
    showToast(`${city.name} added to favorites!`, 'success');
    this.updateFavorites();
    this.renderCurrentHero();
  }

  removeFavoriteCity(city) {
    if (!city) return;
    this.favorites = removeFavorite(city);
    showToast(`${city.name} removed from favorites`, 'info');
    this.updateFavorites();
    this.renderCurrentHero();
  }

  toggleFavorite(city) {
    if (!city) return;
    if (isFavorite(city)) {
      this.removeFavoriteCity(city);
    } else {
      this.addFavoriteCity(city);
    }
  }

  clearAllFavorites() {
    this.favorites = clearAllFavorites();
    showToast('All saved favorites cleared', 'info');
    this.updateFavorites();
    this.renderCurrentHero();
  }

  updateFavorites() {
    this.favorites = getFavorites();
    renderFavoritesBar(this.favoritesContainer, {
      favorites: this.favorites,
      currentCity: this.currentCity,
      onSelectCity: (city) => this.selectCity(city),
      onRemoveFavorite: (city) => this.removeFavoriteCity(city),
      onAddFavorite: (city) => this.addFavoriteCity(city),
    });
  }

  renderCurrentHero() {
    if (!this.currentWeatherData) return;
    renderCurrentWeather(this.currentWeatherContainer, {
      city: this.currentCity,
      weather: this.currentWeatherData,
      unit: this.settings.unit,
      is24h: this.settings.is24h,
      isFav: isFavorite(this.currentCity),
      favorites: this.favorites,
      onToggleFav: (city) => this.toggleFavorite(city),
      onSelectCity: (city) => this.selectCity(city),
      onRemoveFav: (city) => this.removeFavoriteCity(city),
      onClearAllFavs: () => this.clearAllFavorites(),
    });
  }

  renderAllViews() {
    if (!this.currentWeatherData) return;

    this.renderCurrentHero();

    renderHourlyForecast(this.hourlyForecastContainer, {
      weather: this.currentWeatherData,
      unit: this.settings.unit,
      is24h: this.settings.is24h,
    });

    renderDailyForecast(this.dailyForecastContainer, {
      weather: this.currentWeatherData,
      unit: this.settings.unit,
    });

    renderMetricsGrid(this.metricsGridContainer, {
      weather: this.currentWeatherData,
      airQuality: this.currentAirQuality,
      unit: this.settings.unit,
      is24h: this.settings.is24h,
    });

    renderWeatherMap(this.weatherMapContainer, {
      city: this.currentCity,
      weather: this.currentWeatherData,
      unit: this.settings.unit,
    });
  }
}

// Bootstrap application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  new WeatherApp();
});
