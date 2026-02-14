import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const backendUrl = process.env.VITE_BACKEND_URL || "http://localhost:8000";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        founder: "founder.html",
        registration: "registration.html",
        register: "register.html",
        renew: "renew.html",
        rules: "rules.html",
        admin: "admin.html"
      }
    }
  },
  server: {
    port: 5173,
    proxy: {
      "/api": backendUrl
    }
  }
});
