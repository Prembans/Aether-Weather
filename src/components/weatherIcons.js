/**
 * Scalable, high-aesthetic animated SVG icons for every weather condition.
 */

export function getWeatherIconSVG(iconName, size = 64) {
  switch (iconName) {
    case 'clear-day':
      return `
        <svg class="weather-icon icon-clear-day" width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="sunGrad" cx="32" cy="32" r="16" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#FFDE43" />
              <stop offset="100%" stop-color="#FF7A00" />
            </radialGradient>
            <filter id="sunGlow" x="0" y="0" width="64" height="64" filterUnits="userSpaceOnUse">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <g class="sun-rays" stroke="url(#sunGrad)" stroke-width="3" stroke-linecap="round">
            <line x1="32" y1="6" x2="32" y2="12" />
            <line x1="32" y1="52" x2="32" y2="58" />
            <line x1="6" y1="32" x2="12" y2="32" />
            <line x1="52" y1="32" x2="58" y2="32" />
            <line x1="13.6" y1="13.6" x2="17.8" y2="17.8" />
            <line x1="46.2" y1="46.2" x2="50.4" y2="50.4" />
            <line x1="13.6" y1="50.4" x2="17.8" y2="46.2" />
            <line x1="46.2" y1="17.8" x2="50.4" y2="13.6" />
          </g>
          <circle class="sun-core" cx="32" cy="32" r="14" fill="url(#sunGrad)" filter="url(#sunGlow)" />
        </svg>
      `;

    case 'clear-night':
      return `
        <svg class="weather-icon icon-clear-night" width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="moonGrad" x1="16" y1="12" x2="48" y2="52" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#FFFFFF" />
              <stop offset="50%" stop-color="#C5D3E8" />
              <stop offset="100%" stop-color="#8EA7E9" />
            </linearGradient>
            <filter id="moonGlow">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <path class="moon-body" d="M37.5 12C24.5 12.5 14 23.2 14 36.5C14 50 25 61 38.5 61C45 61 50.8 58.4 55 54.2C38 52.8 28.5 37 34 21.5C35.2 18.2 36.8 15 37.5 12Z" fill="url(#moonGrad)" filter="url(#moonGlow)" />
          <circle class="star-twinkle s1" cx="48" cy="18" r="1.5" fill="#F8FAFC" />
          <circle class="star-twinkle s2" cx="18" cy="18" r="1.2" fill="#F8FAFC" />
          <circle class="star-twinkle s3" cx="52" cy="34" r="1.8" fill="#FDE047" />
        </svg>
      `;

    case 'partly-cloudy-day':
      return `
        <svg class="weather-icon icon-partly-cloudy-day" width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="sunMini" x1="16" y1="16" x2="34" y2="34" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#FDE047" />
              <stop offset="100%" stop-color="#FB923C" />
            </linearGradient>
            <linearGradient id="cloudFront" x1="18" y1="28" x2="52" y2="54" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#FFFFFF" />
              <stop offset="100%" stop-color="#CBD5E1" />
            </linearGradient>
          </defs>
          <g class="sun-behind">
            <circle cx="24" cy="24" r="11" fill="url(#sunMini)" />
            <path stroke="#F59E0B" stroke-width="2" stroke-linecap="round" d="M24 8V12M13 13L16 16M8 24H12M35 13L32 16M40 24H36" />
          </g>
          <path class="cloud-anim" d="M48 46H20C15.6 46 12 42.4 12 38C12 34 15 30.7 18.9 30.1C20.6 24.3 26 20 32.5 20C39.8 20 45.8 25.4 46.8 32.5C49.8 33.2 52 35.8 52 39C52 42.9 48.9 46 48 46Z" fill="url(#cloudFront)" />
        </svg>
      `;

    case 'partly-cloudy-night':
      return `
        <svg class="weather-icon icon-partly-cloudy-night" width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="moonMini" x1="18" y1="14" x2="34" y2="30" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#F1F5F9" />
              <stop offset="100%" stop-color="#94A3B8" />
            </linearGradient>
            <linearGradient id="cloudDark" x1="18" y1="28" x2="52" y2="54" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#E2E8F0" />
              <stop offset="100%" stop-color="#64748B" />
            </linearGradient>
          </defs>
          <path class="moon-behind" d="M28 12C20.5 12.3 14 18.5 14 26C14 34 20.5 40 28 40C31.5 40 34.8 38.6 37 36.2C26.5 35 22 24.5 26.5 16C27.2 14.5 27.8 13.2 28 12Z" fill="url(#moonMini)" />
          <path class="cloud-anim" d="M48 46H20C15.6 46 12 42.4 12 38C12 34 15 30.7 18.9 30.1C20.6 24.3 26 20 32.5 20C39.8 20 45.8 25.4 46.8 32.5C49.8 33.2 52 35.8 52 39C52 42.9 48.9 46 48 46Z" fill="url(#cloudDark)" />
        </svg>
      `;

    case 'overcast':
      return `
        <svg class="weather-icon icon-overcast" width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="cloudBack" x1="14" y1="16" x2="48" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#94A3B8" />
              <stop offset="100%" stop-color="#64748B" />
            </linearGradient>
            <linearGradient id="cloudOver" x1="18" y1="26" x2="52" y2="52" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#E2E8F0" />
              <stop offset="100%" stop-color="#94A3B8" />
            </linearGradient>
          </defs>
          <path class="cloud-layer-back" d="M42 36H18C14.7 36 12 33.3 12 30C12 27 14.2 24.5 17.2 24.1C18.5 19.7 22.5 16.5 27.5 16.5C33 16.5 37.5 20.6 38.3 26C40.5 26.5 42 28.5 42 30.9C42 33.7 39.7 36 42 36Z" fill="url(#cloudBack)" opacity="0.8" />
          <path class="cloud-layer-front" d="M50 48H20C15.6 48 12 44.4 12 40C12 36 15 32.7 18.9 32.1C20.6 26.3 26 22 32.5 22C39.8 22 45.8 27.4 46.8 34.5C49.8 35.2 52 37.8 52 41C52 44.9 48.9 48 50 48Z" fill="url(#cloudOver)" />
        </svg>
      `;

    case 'fog':
      return `
        <svg class="weather-icon icon-fog" width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="fogGrad" x1="10" y1="32" x2="54" y2="32" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="rgba(255,255,255,0.2)" />
              <stop offset="50%" stop-color="#CBD5E1" />
              <stop offset="100%" stop-color="rgba(255,255,255,0.2)" />
            </linearGradient>
          </defs>
          <line class="fog-line f1" x1="12" y1="22" x2="52" y2="22" stroke="url(#fogGrad)" stroke-width="4" stroke-linecap="round" />
          <line class="fog-line f2" x1="8" y1="32" x2="56" y2="32" stroke="url(#fogGrad)" stroke-width="4.5" stroke-linecap="round" />
          <line class="fog-line f3" x1="14" y1="42" x2="50" y2="42" stroke="url(#fogGrad)" stroke-width="4" stroke-linecap="round" />
          <line class="fog-line f4" x1="20" y1="52" x2="44" y2="52" stroke="url(#fogGrad)" stroke-width="3.5" stroke-linecap="round" />
        </svg>
      `;

    case 'drizzle':
    case 'rain':
    case 'showers':
      return `
        <svg class="weather-icon icon-rain" width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="rainCloud" x1="18" y1="16" x2="52" y2="44" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#E2E8F0" />
              <stop offset="100%" stop-color="#64748B" />
            </linearGradient>
            <linearGradient id="dropGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#38BDF8" />
              <stop offset="100%" stop-color="#0284C7" />
            </linearGradient>
          </defs>
          <path d="M48 38H20C15.6 38 12 34.4 12 30C12 26 15 22.7 18.9 22.1C20.6 16.3 26 12 32.5 12C39.8 12 45.8 17.4 46.8 24.5C49.8 25.2 52 27.8 52 31C52 34.9 48.9 38 48 38Z" fill="url(#rainCloud)" />
          <line class="raindrop r1" x1="22" y1="44" x2="19" y2="54" stroke="url(#dropGrad)" stroke-width="2.5" stroke-linecap="round" />
          <line class="raindrop r2" x1="32" y1="44" x2="29" y2="56" stroke="url(#dropGrad)" stroke-width="2.5" stroke-linecap="round" />
          <line class="raindrop r3" x1="42" y1="44" x2="39" y2="54" stroke="url(#dropGrad)" stroke-width="2.5" stroke-linecap="round" />
        </svg>
      `;

    case 'heavy-rain':
      return `
        <svg class="weather-icon icon-heavy-rain" width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="stormCloud" x1="18" y1="14" x2="52" y2="42" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#94A3B8" />
              <stop offset="100%" stop-color="#334155" />
            </linearGradient>
            <linearGradient id="heavyDrop" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#38BDF8" />
              <stop offset="100%" stop-color="#2563EB" />
            </linearGradient>
          </defs>
          <path d="M48 36H20C15.6 36 12 32.4 12 28C12 24 15 20.7 18.9 20.1C20.6 14.3 26 10 32.5 10C39.8 10 45.8 15.4 46.8 22.5C49.8 23.2 52 25.8 52 29C52 32.9 48.9 36 48 36Z" fill="url(#stormCloud)" />
          <line class="raindrop-fast r1" x1="20" y1="42" x2="16" y2="56" stroke="url(#heavyDrop)" stroke-width="3" stroke-linecap="round" />
          <line class="raindrop-fast r2" x1="28" y1="44" x2="24" y2="58" stroke="url(#heavyDrop)" stroke-width="3" stroke-linecap="round" />
          <line class="raindrop-fast r3" x1="36" y1="42" x2="32" y2="56" stroke="url(#heavyDrop)" stroke-width="3" stroke-linecap="round" />
          <line class="raindrop-fast r4" x1="44" y1="44" x2="40" y2="58" stroke="url(#heavyDrop)" stroke-width="3" stroke-linecap="round" />
        </svg>
      `;

    case 'thunderstorm':
      return `
        <svg class="weather-icon icon-thunderstorm" width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="darkStorm" x1="18" y1="12" x2="52" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#64748B" />
              <stop offset="100%" stop-color="#1E293B" />
            </linearGradient>
            <linearGradient id="boltGrad" x1="34" y1="28" x2="24" y2="58" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#FEF08A" />
              <stop offset="100%" stop-color="#EAB308" />
            </linearGradient>
            <filter id="boltGlow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <path d="M48 34H20C15.6 34 12 30.4 12 26C12 22 15 18.7 18.9 18.1C20.6 12.3 26 8 32.5 8C39.8 8 45.8 13.4 46.8 20.5C49.8 21.2 52 23.8 52 27C52 30.9 48.9 34 48 34Z" fill="url(#darkStorm)" />
          <polygon class="lightning-bolt" points="33,26 23,38 31,38 27,56 41,36 33,36" fill="url(#boltGrad)" filter="url(#boltGlow)" />
          <line class="raindrop r1" x1="18" y1="42" x2="15" y2="52" stroke="#38BDF8" stroke-width="2" stroke-linecap="round" />
          <line class="raindrop r2" x1="46" y1="42" x2="43" y2="52" stroke="#38BDF8" stroke-width="2" stroke-linecap="round" />
        </svg>
      `;

    case 'snow':
    case 'heavy-snow':
    case 'freezing-rain':
      return `
        <svg class="weather-icon icon-snow" width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="snowCloud" x1="18" y1="16" x2="52" y2="44" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#FFFFFF" />
              <stop offset="100%" stop-color="#94A3B8" />
            </linearGradient>
          </defs>
          <path d="M48 36H20C15.6 36 12 32.4 12 28C12 24 15 20.7 18.9 20.1C20.6 14.3 26 10 32.5 10C39.8 10 45.8 15.4 46.8 22.5C49.8 23.2 52 25.8 52 29C52 32.9 48.9 36 48 36Z" fill="url(#snowCloud)" />
          <g class="snowflake-rot sf1" stroke="#BAE6FD" stroke-width="2" stroke-linecap="round">
            <line x1="22" y1="44" x2="22" y2="54" />
            <line x1="17" y1="49" x2="27" y2="49" />
            <line x1="18.5" y1="45.5" x2="25.5" y2="52.5" />
            <line x1="18.5" y1="52.5" x2="25.5" y2="45.5" />
          </g>
          <g class="snowflake-rot sf2" stroke="#BAE6FD" stroke-width="2" stroke-linecap="round">
            <line x1="38" y1="46" x2="38" y2="56" />
            <line x1="33" y1="51" x2="43" y2="51" />
            <line x1="34.5" y1="47.5" x2="41.5" y2="54.5" />
            <line x1="34.5" y1="54.5" x2="41.5" y2="47.5" />
          </g>
        </svg>
      `;

    default:
      return getWeatherIconSVG('clear-day', size);
  }
}
