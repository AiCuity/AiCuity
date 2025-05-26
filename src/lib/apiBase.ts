
// 1️⃣ try explicit env var
const envBase = import.meta.env.VITE_API_URL?.trim();

// 2️⃣ dev fallback
const isLocalhost =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1';

export const API_BASE =
  envBase && envBase !== ''           ? envBase
  : isLocalhost                       ? 'http://localhost:5050'
  : '/.netlify/functions/api';        // default for production on Netlify

// API_BASE will resolve to, in order of priority:
//   • the VITE_API_URL env var (if set)
//   • http://localhost:5050 when running `npm run dev`
//   • /.netlify/functions/api  in production
