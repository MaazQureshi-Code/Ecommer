import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    host: "localhost",
    port: 5174,
    strictPort: true,

    proxy: {
      "/api": {
        target: "https://localhost:7169",
        changeOrigin: true,
        secure: false,
      },

      "/hubs": {
        target: "https://localhost:7169",
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
});