import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

const apiTarget = process.env.API_PROXY_TARGET || "http://127.0.0.1:8095";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: { "/api": apiTarget },
  },
  preview: { proxy: { "/api": apiTarget } },
  test: {
    environment: "jsdom",
    setupFiles: "./src/tests/setup.js",
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json-summary"],
      include: ["src/**/*.{js,jsx}"],
      exclude: ["src/tests/**", "src/main.jsx"],
    },
  },
});
