// Lightweight inline SVG placeholders to avoid missing static asset files in CI builds
// Use these constants as fallbacks for avatar and generic images.

// 64x64 gray avatar circle SVG
export const DEFAULT_AVATAR =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#f3f4f6"/>
        <stop offset="100%" stop-color="#e5e7eb"/>
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="8" fill="url(#g)"/>
    <circle cx="32" cy="24" r="12" fill="#d1d5db"/>
    <rect x="12" y="40" width="40" height="14" rx="7" fill="#d1d5db"/>
  </svg>`);

// 300x200 generic gray rectangle SVG
export const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200">
    <defs>
      <linearGradient id="g2" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#f3f4f6"/>
        <stop offset="100%" stop-color="#e5e7eb"/>
      </linearGradient>
    </defs>
    <rect width="300" height="200" rx="12" fill="url(#g2)"/>
    <g fill="#cbd5e1">
      <circle cx="70" cy="130" r="26"/>
      <rect x="110" y="120" width="140" height="20" rx="10"/>
    </g>
  </svg>`);

// 96x96 avatar square SVG (slightly different)
export const PLACEHOLDER_USER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
    <rect width="96" height="96" rx="12" fill="#eef2f7"/>
    <circle cx="48" cy="36" r="18" fill="#cbd5e1"/>
    <rect x="16" y="60" width="64" height="20" rx="10" fill="#cbd5e1"/>
  </svg>`);
