/**
 * Quick-access Favorites Bar with Dynamic Empty State & Add Current City Pill
 */

export function renderFavoritesBar(container, { favorites, currentCity, onSelectCity, onRemoveFavorite, onAddFavorite }) {
  const isCurrentInFavorites =
    currentCity &&
    favorites &&
    favorites.some(
      (item) =>
        item.id === currentCity.id ||
        (Math.abs(item.latitude - currentCity.latitude) < 0.05 && Math.abs(item.longitude - currentCity.longitude) < 0.05)
    );

  // If no favorites are saved yet
  if (!favorites || favorites.length === 0) {
    container.innerHTML = `
      <div class="favorites-bar-scroll">
        <div class="favorites-label">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F43F5E" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
          <span>Favorites:</span>
        </div>
        <div class="favorites-track">
          <button class="fav-pill btn-add-current-pill" id="btn-add-current-favorite" title="Pin ${currentCity ? currentCity.name : 'this city'} to your favorites">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            <span>Add ${currentCity ? currentCity.name : 'Current City'}</span>
          </button>
        </div>
      </div>
    `;

    const addBtn = container.querySelector('#btn-add-current-favorite');
    if (addBtn && onAddFavorite && currentCity) {
      addBtn.addEventListener('click', () => {
        onAddFavorite(currentCity);
      });
    }
    return;
  }

  // When favorites exist
  const pillsHtml = favorites
    .map((city) => {
      const isCurrent =
        currentCity &&
        (currentCity.id === city.id ||
          (Math.abs(currentCity.latitude - city.latitude) < 0.05 && Math.abs(currentCity.longitude - city.longitude) < 0.05));

      return `
        <div class="fav-pill ${isCurrent ? 'is-active-fav' : ''}" data-id="${city.id || city.name}">
          <span class="fav-city-label">${city.name}</span>
          <button class="fav-btn-remove" aria-label="Remove ${city.name} from favorites" title="Remove">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      `;
    })
    .join('');

  // If the currently viewed city is not in favorites, offer a quick + Add button
  const addCurrentPillHtml =
    !isCurrentInFavorites && currentCity
      ? `<button class="fav-pill btn-add-current-pill" id="btn-add-current-favorite" title="Pin ${currentCity.name} to favorites">
           <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
           <span>Add ${currentCity.name}</span>
         </button>`
      : '';

  container.innerHTML = `
    <div class="favorites-bar-scroll">
      <div class="favorites-label">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#F43F5E" stroke="#F43F5E" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
        <span>Favorites:</span>
      </div>
      <div class="favorites-track">
        ${pillsHtml}
        ${addCurrentPillHtml}
      </div>
    </div>
  `;

  // Attach click listeners to favorite pills
  container.querySelectorAll('.fav-pill:not(.btn-add-current-pill)').forEach((pill) => {
    const id = pill.getAttribute('data-id');
    const city = favorites.find((f) => (f.id || f.name).toString() === id);
    if (!city) return;

    pill.addEventListener('click', (e) => {
      if (e.target.closest('.fav-btn-remove')) {
        e.stopPropagation();
        onRemoveFavorite(city);
        return;
      }
      onSelectCity(city);
    });
  });

  // Attach listener for + Add current city pill
  const addBtn = container.querySelector('#btn-add-current-favorite');
  if (addBtn && onAddFavorite && currentCity) {
    addBtn.addEventListener('click', () => {
      onAddFavorite(currentCity);
    });
  }
}
