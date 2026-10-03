# 🌤️ Aether Weather • Living Atmospheric Dashboard

A next-generation, responsive atmospheric weather application featuring real-time global meteorological forecasts, living particle simulations, 24-hour interactive trendlines, a rich meteorological metrics suite, and an integrated satellite and precipitation radar map.

**Zero API keys required.** Built with vanilla modern JavaScript, high-performance HTML5 Canvas, and Leaflet.

---

## ✨ Features

- **Living Atmospheric Canvas Engine**:
  - Physically simulated particle effects responsive to active weather conditions: clear sunbeams, twinkling night stars with random shooting stars, gentle rain, heavy storms with realistic lightning flashes, winter snow, and rolling fog.
- **Global Forecasts (Open-Meteo)**:
  - Real-time weather observations, hourly forecasts, and 7-day outlooks powered by open meteorological models with zero API keys or rate-limit friction.
- **Interactive Satellite & Precipitation Radar**:
  - Multi-layer map engine featuring:
    - 🛰️ **Google Satellite Hybrid** (Google Earth satellite imagery with labeled roads and towns)
    - 🗺️ **Google Maps** (High-precision street roadmap)
    - 🌙 **Dark Night Map** (High-contrast glowing road network)
    - ⛰️ **Google Terrain** (Topography and elevation contours)
  - Live global precipitation radar overlay with localized scanning indicators.
  - Floating in-map glass controls and instant recenter button (`⌖`).
- **24-Hour Hourly Forecast with Canvas Curve**:
  - Interactive hourly forecast cards paired with an ultra-smooth, high-DPI HTML5 Canvas Bézier temperature trendline.
- **7-Day Extended Outlook**:
  - Proportional temperature range bars comparing weekly temperature extremes with current-temperature position dots.
- **Meteorological Metrics Suite**:
  - ☀️ **UV Index** with dynamic radial progress gauge and sun protection advice.
  - 🧭 **360° Wind Compass** with live animated rotating compass needle, speed, and gusts.
  - 🌅 **Daylight Arc Tracker** with SVG sun path, sunrise/sunset times, and remaining daylight.
  - 🍃 **Air Quality Index (AQI)** with European/US AQI ratings and PM2.5/PM10 pollutant breakdown.
  - 💧 **Humidity & Dew Point** with comfort categorization.
  - ⏱️ **Barometric Pressure** with real-time pressure tendency tags.
  - 👁️ **Atmospheric Visibility** with clarity assessments.
- **User-Managed Pinned Favorites**:
  - Clean local storage manager with instant city pinning, unpinning, and quick navigation.
- **Geolocation & Global Search**:
  - Debounced city search autocomplete across worldwide municipalities and one-tap GPS geolocation detection.
- **Unit Customization**:
  - Instant toggle between Metric (°C, km/h, mm, hPa) and Imperial (°F, mph, in, inHg) systems.

---

## 🛠️ Tech Stack

- **Core**: HTML5, Modern Vanilla JavaScript (ES Modules)
- **Styling**: Vanilla CSS3 (Custom Glassmorphism Design System, CSS Variables, Hardware-Accelerated Transforms)
- **Canvas Animations**: HTML5 2D Canvas Context (`requestAnimationFrame` particle engine)
- **Mapping**: Leaflet.js with Google Maps and OpenStreetMap tile layers
- **Build Tool**: Vite 8
- **APIs**:
  - [Open-Meteo Weather Forecast API](https://open-meteo.com/)
  - [Open-Meteo Air Quality API](https://open-meteo.com/en/docs/air-quality-api)
  - [BigDataCloud Client-side Reverse Geocoding](https://www.bigdatacloud.com/)
  - [RainViewer Free Radar API](https://www.rainviewer.com/api.html)
- **CI/CD**: GitHub Actions deploying to GitHub Pages

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- `npm`

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Prembans/Aether-Weather.git
   cd Aether-Weather
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch the development server:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173/`.

### Production Build

To build the static application bundle:
```bash
npm run build
```
The optimized bundle will be created in the `dist/` directory.

To preview the production bundle locally:
```bash
npm run preview
```

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
