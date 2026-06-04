import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@shared/exercise-image-catalog": path.resolve(
        __dirname,
        "../src/services/exercise-image-catalog.ts",
      ),
      "@shared/exercise-photo-urls": path.resolve(
        __dirname,
        "../src/services/exercise-photo-urls.ts",
      ),
      "@shared/exercise-visual-catalog": path.resolve(
        __dirname,
        "../src/services/exercise-visual-catalog.ts",
      ),
      "@shared/rep-targets": path.resolve(__dirname, "../src/utils/rep-targets.ts"),
    },
  },
  build: {
    target: "es2020",
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/react-dom") || id.includes("node_modules/react/")) {
            return "vendor-react";
          }
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
      },
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
