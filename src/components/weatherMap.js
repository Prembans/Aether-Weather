/**
 * Interactive Weather Map / Radar View Component with Leaflet & Google Maps
 * Features:
 * - Google Maps Satellite Hybrid (High-Res Google Earth imagery with roads & labels)
 * - Google Maps Roadmap (Familiar high-precision Google cartography)
 * - Dark Night Map (High-contrast glowing road network)
 * - Google Maps Terrain (Elevation and topography contours)
 * - Floating glassmorphic controls inside the map canvas to prevent container overflow
 * - Zero "Zoom level not supported" errors (supports up to zoom level 20)
 * - Live Precipitation Radar (RainViewer + Open-Meteo local precipitation fallback)
 * - Clean single-line header with live radar status badge
 */
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { formatTemp } from '../utils/formatters.js';
import { getWeatherMeta } from '../utils/weatherCodes.js';

let mapInstance = null;
let currentMarker = null;
let radarLayer = null;
let radarScanCircle = null;
let precipCircle = null;
let activeCoords = null;
let currentBasemap = 'google-sat'; // 'google-sat' | 'google-roads' | 'dark' | 'terrain'

// Tile Layer Instances
let googleSatLayer = null;
let googleRoadsLayer = null;
let googleTerrainLayer = null;
let osmDarkLayer = null;

export function renderWeatherMap(container, { city, weather, unit }) {
  if (!city || !city.latitude || !city.longitude) {
    container.innerHTML = `<div class="glass-card loading-skeleton">Loading weather radar map...</div>`;
    return;
  }

  activeCoords = { lat: city.latitude, lon: city.longitude };
  const currentPrecip = weather && weather.current ? weather.current.precipitation || 0 : 0;
  const isRaining = currentPrecip > 0;

  // Only create the card DOM structure once
  let mapElement = container.querySelector('#leaflet-map-element');
  if (!mapElement) {
    container.innerHTML = `
      <div class="glass-card weather-map-card">
        <!-- Clean Single-Line Header -->
        <div class="section-header-row map-header-clean">
          <div class="section-title-group">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
              <line x1="8" y1="2" x2="8" y2="18"/>
              <line x1="16" y1="6" x2="16" y2="22"/>
            </svg>
            <h2 class="section-title">Radar & Map</h2>
          </div>

          <!-- Radar Status Badge -->
          <div class="radar-live-badge ${isRaining ? 'is-rain' : 'is-clear'}" id="radar-live-badge">
            <span class="${isRaining ? 'radar-pulse-rain' : 'radar-pulse'}"></span>
            <span class="badge-text" id="radar-badge-text">
              ${isRaining ? `${currentPrecip.toFixed(1)} mm/h Rain` : 'Radar Active • Clear'}
            </span>
          </div>
        </div>

        <!-- Map Canvas with Floating Glass Controls -->
        <div class="map-container-frame">
          <div id="leaflet-map-element" class="leaflet-map-canvas map-style-satellite"></div>

          <!-- Floating Layer Switcher (Top Left) -->
          <div class="map-float-layer-bar" role="group" aria-label="Map style selection">
            <button class="layer-pill-btn active" data-style="google-sat" title="Google Satellite Hybrid">🛰️ Sat</button>
            <button class="layer-pill-btn" data-style="google-roads" title="Google Maps Streets">🗺️ Map</button>
            <button class="layer-pill-btn" data-style="dark" title="Dark Cyber Night">🌙 Dark</button>
            <button class="layer-pill-btn" data-style="terrain" title="Google Terrain">⛰️ Terrain</button>
          </div>

          <!-- Floating Recenter Button (Bottom Right) -->
          <button class="map-float-recenter-btn" id="btn-recenter-map" title="Center map on city" aria-label="Center on city">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 2v3m0 14v3M2 12h3m14 0h3"/>
            </svg>
          </button>

          <!-- Floating Rain Legend (Bottom Left) -->
          <div class="map-float-legend">
            <span class="legend-label">Precip</span>
            <div class="legend-bar" title="Light to Heavy Precipitation"></div>
            <span class="legend-scale">50mm</span>
          </div>
        </div>
      </div>
    `;

    // Recenter button listener
    const recenterBtn = container.querySelector('#btn-recenter-map');
    if (recenterBtn) {
      recenterBtn.addEventListener('click', () => {
        if (mapInstance && activeCoords) {
          mapInstance.flyTo([activeCoords.lat, activeCoords.lon], 9, { duration: 0.8 });
        }
      });
    }

    // Basemap switcher listeners
    const layerButtons = container.querySelectorAll('.layer-pill-btn');
    layerButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const style = e.currentTarget.getAttribute('data-style');
        if (style) {
          layerButtons.forEach((b) => b.classList.remove('active'));
          e.currentTarget.classList.add('active');
          switchBasemapStyle(style);
        }
      });
    });

    mapElement = container.querySelector('#leaflet-map-element');
  } else {
    // Update radar status badge on subsequent renders
    const badge = container.querySelector('#radar-live-badge');
    const badgeText = container.querySelector('#radar-badge-text');
    if (badge && badgeText) {
      badge.className = `radar-live-badge ${isRaining ? 'is-rain' : 'is-clear'}`;
      badgeText.textContent = isRaining ? `${currentPrecip.toFixed(1)} mm/h Rain` : 'Radar Active • Clear';
    }
  }

  // Initialize or update Leaflet map
  requestAnimationFrame(() => {
    initOrUpdateLeafletMap(city, weather, unit);
  });
}

function initOrUpdateLeafletMap(city, weather, unit) {
  const mapElement = document.getElementById('leaflet-map-element');
  if (!mapElement) return;

  const lat = city.latitude;
  const lon = city.longitude;

  if (!mapInstance) {
    mapInstance = L.map(mapElement, {
      center: [lat, lon],
      zoom: 9,
      minZoom: 3,
      maxZoom: 20,
      zoomControl: false,
      attributionControl: false,
    });

    // Custom positioned zoom control at Top Right
    L.control.zoom({ position: 'topright' }).addTo(mapInstance);

    // 1. Google Maps Hybrid Satellite (Photorealistic Google Earth satellite with road labels)
    googleSatLayer = L.tileLayer('https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      maxNativeZoom: 18,
      subdomains: ['0', '1', '2', '3'],
      attribution: '&copy; Google Maps',
    });

    // 2. Google Maps Standard Roadmap
    googleRoadsLayer = L.tileLayer('https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      maxNativeZoom: 20,
      subdomains: ['0', '1', '2', '3'],
      attribution: '&copy; Google Maps',
    });

    // 3. Google Maps Terrain
    googleTerrainLayer = L.tileLayer('https://mt{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      maxNativeZoom: 16,
      subdomains: ['0', '1', '2', '3'],
      attribution: '&copy; Google Maps',
    });

    // 4. Dark Night Map (OpenStreetMap with high-contrast cyber dark filter)
    osmDarkLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 20,
      maxNativeZoom: 19,
      subdomains: ['a', 'b', 'c'],
      attribution: '&copy; OpenStreetMap',
    });

    // Default to Google Satellite Hybrid
    googleSatLayer.addTo(mapInstance);
    mapElement.className = 'leaflet-map-canvas map-style-satellite';

    // Load Live RainViewer Radar
    loadLiveRadarLayer();

    window.addEventListener('resize', () => {
      if (mapInstance) mapInstance.invalidateSize();
    });
  } else {
    mapInstance.setView([lat, lon], mapInstance.getZoom() || 9, { animate: true });
  }

  // Ensure tile sizes are refreshed properly
  setTimeout(() => {
    if (mapInstance) mapInstance.invalidateSize();
  }, 100);

  // Update or create City Marker
  updateCityMarker(lat, lon, city, weather, unit);

  // Update Radar Circles (Radar scan area + precipitation cell)
  updateRadarOverlays(lat, lon, weather);
}

function removeAllTileLayers() {
  if (!mapInstance) return;
  if (googleSatLayer && mapInstance.hasLayer(googleSatLayer)) mapInstance.removeLayer(googleSatLayer);
  if (googleRoadsLayer && mapInstance.hasLayer(googleRoadsLayer)) mapInstance.removeLayer(googleRoadsLayer);
  if (googleTerrainLayer && mapInstance.hasLayer(googleTerrainLayer)) mapInstance.removeLayer(googleTerrainLayer);
  if (osmDarkLayer && mapInstance.hasLayer(osmDarkLayer)) mapInstance.removeLayer(osmDarkLayer);
}

function switchBasemapStyle(style) {
  if (!mapInstance) return;
  currentBasemap = style;
  const mapElement = document.getElementById('leaflet-map-element');
  removeAllTileLayers();

  if (style === 'google-sat') {
    googleSatLayer.addTo(mapInstance);
    if (mapElement) mapElement.className = 'leaflet-map-canvas map-style-satellite';
  } else if (style === 'google-roads') {
    googleRoadsLayer.addTo(mapInstance);
    if (mapElement) mapElement.className = 'leaflet-map-canvas map-style-streets';
  } else if (style === 'terrain') {
    googleTerrainLayer.addTo(mapInstance);
    if (mapElement) mapElement.className = 'leaflet-map-canvas map-style-streets';
  } else {
    // dark
    osmDarkLayer.addTo(mapInstance);
    if (mapElement) mapElement.className = 'leaflet-map-canvas map-style-dark';
  }

  // Keep radar layer on top if it exists
  if (radarLayer && mapInstance.hasLayer(radarLayer)) {
    radarLayer.bringToFront();
  }
}

function updateCityMarker(lat, lon, city, weather, unit) {
  if (currentMarker && mapInstance) {
    mapInstance.removeLayer(currentMarker);
  }

  const currentTemp = weather && weather.current ? formatTemp(weather.current.temperature_2m, unit) : '';
  const currentCode = weather && weather.current ? weather.current.weather_code : 0;
  const isDay = weather && weather.current ? weather.current.is_day : 1;
  const meta = getWeatherMeta(currentCode, isDay);

  const customIconHtml = `
    <div class="map-custom-marker">
      <div class="marker-pulse-glow"></div>
      <div class="marker-pill">
        <span class="marker-temp">${currentTemp}</span>
        <span class="marker-city">${city.name}</span>
      </div>
    </div>
  `;

  const customIcon = L.divIcon({
    html: customIconHtml,
    className: 'leaflet-div-marker-wrapper',
    iconSize: [110, 42],
    iconAnchor: [55, 21],
  });

  currentMarker = L.marker([lat, lon], { icon: customIcon }).addTo(mapInstance);

  currentMarker.bindPopup(`
    <div class="marker-popup-content">
      <strong>${city.name}, ${city.country || ''}</strong>
      <div>${meta.label} • ${currentTemp}</div>
      <div style="margin-top: 4px; font-size: 0.75rem; color: #64748b;">
        Coords: ${lat.toFixed(2)}°, ${lon.toFixed(2)}°
      </div>
    </div>
  `);
}

function updateRadarOverlays(lat, lon, weather) {
  if (!mapInstance) return;

  // Clean previous overlay circles
  if (radarScanCircle) {
    mapInstance.removeLayer(radarScanCircle);
    radarScanCircle = null;
  }
  if (precipCircle) {
    mapInstance.removeLayer(precipCircle);
    precipCircle = null;
  }

  const precip = weather && weather.current ? weather.current.precipitation || 0 : 0;

  // Subtle 40km radar range indicator ring
  radarScanCircle = L.circle([lat, lon], {
    radius: 40000,
    color: '#38bdf8',
    weight: 1,
    dashArray: '4, 8',
    opacity: 0.35,
    fillColor: '#38bdf8',
    fillOpacity: 0.03,
  }).addTo(mapInstance);

  // If there is active rain, render active precipitation echo area
  if (precip > 0) {
    precipCircle = L.circle([lat, lon], {
      radius: Math.min(30000, 10000 + precip * 5000),
      color: '#06b6d4',
      weight: 2,
      opacity: 0.7,
      fillColor: '#0284c7',
      fillOpacity: Math.min(0.45, 0.15 + precip * 0.05),
    }).addTo(mapInstance);
  }
}

async function loadLiveRadarLayer() {
  try {
    const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
    if (!res.ok) return;
    const data = await res.json();
    if (data.radar && data.radar.past && data.radar.past.length > 0) {
      const latest = data.radar.past[data.radar.past.length - 1];
      const radarUrl = `${data.host}${latest.path}/256/{z}/{x}/{y}/2/1_1.png`;

      if (radarLayer && mapInstance) {
        mapInstance.removeLayer(radarLayer);
      }

      if (mapInstance) {
        radarLayer = L.tileLayer(radarUrl, {
          opacity: 0.65,
          zIndex: 10,
          maxNativeZoom: 7,
          maxZoom: 20,
        }).addTo(mapInstance);
      }
    }
  } catch (err) {
    console.info('RainViewer radar API unavailable, using localized weather sensor data:', err?.message || err);
  }
}

export function destroyWeatherMap() {
  if (mapInstance) {
    mapInstance.remove();
    mapInstance = null;
    currentMarker = null;
    radarLayer = null;
    radarScanCircle = null;
    precipCircle = null;
    activeCoords = null;
    googleSatLayer = null;
    googleRoadsLayer = null;
    googleTerrainLayer = null;
    osmDarkLayer = null;
  }
}
