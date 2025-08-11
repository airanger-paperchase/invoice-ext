import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  build: {
        outDir: "dist",
        emptyOutDir: true,
        sourcemap: true
    },

  server: {
    port: 5174,
    host: true, // Allow external connections
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
    // Adding the fs.allow option to serve the necessary font files
    fs: {
      allow: [
        // Allow serving files from the root directory
        "./",
        // Allow serving files from node_modules
        "./node_modules/",
      ],
    },
  },
});
