/**
 * Search Bar Component with Debounced Autocomplete and GPS Geolocation
 */
import { fetchCitySuggestions, reverseGeocode } from '../services/weatherApi.js';

export function setupSearchBar(container, { onSelectCity, onLocateMe, showToast }) {
  container.innerHTML = `
    <div class="search-container">
      <div class="search-input-wrapper">
        <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input
          type="text"
          id="city-search-input"
          class="city-search-input"
          placeholder="Search global cities (e.g. Paris, Tokyo, New York)..."
          autocomplete="off"
          spellcheck="false"
        />
        <button id="btn-search-clear" class="btn-search-clear hidden" aria-label="Clear search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
        <button id="btn-locate-me" class="btn-locate-me" aria-label="Use current location" title="Use current GPS location">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
        </button>
      </div>

      <div id="search-dropdown" class="search-dropdown hidden">
        <div id="search-results-list" class="search-results-list"></div>
      </div>
    </div>
  `;

  const input = container.querySelector('#city-search-input');
  const clearBtn = container.querySelector('#btn-search-clear');
  const locateBtn = container.querySelector('#btn-locate-me');
  const dropdown = container.querySelector('#search-dropdown');
  const resultsList = container.querySelector('#search-results-list');

  let debounceTimer = null;
  let currentResults = [];
  let selectedIndex = -1;

  const showDropdown = () => dropdown.classList.remove('hidden');
  const hideDropdown = () => {
    dropdown.classList.add('hidden');
    selectedIndex = -1;
  };

  const renderResults = (items) => {
    currentResults = items;
    selectedIndex = -1;

    if (!items || items.length === 0) {
      resultsList.innerHTML = `<div class="search-no-results">No cities found matching your search.</div>`;
      showDropdown();
      return;
    }

    resultsList.innerHTML = items
      .map((item, idx) => {
        const adminPart = item.admin1 ? `${item.admin1}, ` : '';
        return `
          <div class="search-item" data-index="${idx}">
            <div class="item-name-group">
              <strong class="item-city">${item.name}</strong>
              <span class="item-country">${adminPart}${item.country}</span>
            </div>
            <span class="item-badge">${item.countryCode || 'LOC'}</span>
          </div>
        `;
      })
      .join('');

    showDropdown();

    // Click handler for items
    resultsList.querySelectorAll('.search-item').forEach((elem) => {
      elem.addEventListener('click', () => {
        const idx = parseInt(elem.getAttribute('data-index'), 10);
        const selected = currentResults[idx];
        if (selected) {
          input.value = `${selected.name}, ${selected.country}`;
          hideDropdown();
          clearBtn.classList.remove('hidden');
          onSelectCity(selected);
        }
      });
    });
  };

  // Debounced input typing
  input.addEventListener('input', (e) => {
    const val = e.target.value;
    if (val.length > 0) {
      clearBtn.classList.remove('hidden');
    } else {
      clearBtn.classList.add('hidden');
      hideDropdown();
      return;
    }

    clearTimeout(debounceTimer);
    if (val.trim().length < 2) {
      hideDropdown();
      return;
    }

    debounceTimer = setTimeout(async () => {
      resultsList.innerHTML = `<div class="search-loading"><span class="search-spinner"></span> Searching cities...</div>`;
      showDropdown();
      try {
        const results = await fetchCitySuggestions(val);
        renderResults(results);
      } catch (err) {
        resultsList.innerHTML = `<div class="search-no-results">Error searching cities.</div>`;
      }
    }, 280);
  });

  // Clear button
  clearBtn.addEventListener('click', () => {
    input.value = '';
    clearBtn.classList.add('hidden');
    hideDropdown();
    input.focus();
  });

  // Keyboard navigation
  input.addEventListener('keydown', (e) => {
    if (dropdown.classList.contains('hidden') || currentResults.length === 0) return;

    const items = resultsList.querySelectorAll('.search-item');

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = (selectedIndex + 1) % items.length;
      updateActiveItem(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = (selectedIndex - 1 + items.length) % items.length;
      updateActiveItem(items);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < currentResults.length) {
        const selected = currentResults[selectedIndex];
        input.value = `${selected.name}, ${selected.country}`;
        hideDropdown();
        onSelectCity(selected);
      }
    } else if (e.key === 'Escape') {
      hideDropdown();
    }
  });

  function updateActiveItem(items) {
    items.forEach((it, idx) => {
      if (idx === selectedIndex) {
        it.classList.add('is-active');
        it.scrollIntoView({ block: 'nearest' });
      } else {
        it.classList.remove('is-active');
      }
    });
  }

  // Close dropdown on outside click
  document.addEventListener('click', (e) => {
    if (!container.contains(e.target)) {
      hideDropdown();
    }
  });

  // GPS Geolocation handler
  locateBtn.addEventListener('click', () => {
    if (!navigator.geolocation) {
      if (showToast) showToast('Geolocation is not supported by your browser', 'error');
      return;
    }

    locateBtn.classList.add('is-locating');
    if (showToast) showToast('Detecting your GPS location...', 'info');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        locateBtn.classList.remove('is-locating');
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        try {
          const loc = await reverseGeocode(lat, lon);
          input.value = loc.name;
          clearBtn.classList.remove('hidden');
          if (showToast) showToast(`Located: ${loc.name}`, 'success');
          onSelectCity(loc);
        } catch {
          if (showToast) showToast('Could not resolve location name', 'error');
        }
      },
      (err) => {
        locateBtn.classList.remove('is-locating');
        console.warn('Geolocation error:', err);
        if (showToast) showToast('Location permission denied or unavailable', 'error');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  });
}
