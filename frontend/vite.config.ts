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
        outDir: "../backend/static",
        emptyOutDir: true,
        sourcemap: true
    },

  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
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
        "C:/Users/MahishaMudaliar/node_modules/",
      ],
    },
  },
});
