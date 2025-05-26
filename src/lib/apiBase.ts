
// 1️⃣ try explicit env var
const envBase = import.meta.env.VITE_API_URL?.trim();

// 2️⃣ dev fallback - use Netlify functions even in development
const isLocalhost =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1';

export const API_BASE =
  envBase && envBase !== ''           ? envBase
  : '/.netlify/functions';        // use Netlify functions for both dev and prod

// API_BASE will resolve to, in order of priority:
//   • the VITE_API_URL env var (if set)
//   • /.netlify/functions for both development and production
