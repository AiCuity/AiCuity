
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  // Dynamically import lovable-tagger only in development mode
  let componentTagger;
  if (mode === 'development') {
    try {
      const { componentTagger: tagger } = await import("lovable-tagger");
      componentTagger = tagger;
    } catch (error) {
      console.warn("Failed to load lovable-tagger:", error);
      componentTagger = null;
    }
  }

  return {
    server: {
      host: "::",
      port: 8080,
      proxy: {
        '/.netlify/functions': {
          target: 'http://localhost:9999',
          changeOrigin: true,
          secure: false,
        }
      }
    },
    plugins: [
      react(),
      componentTagger && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
