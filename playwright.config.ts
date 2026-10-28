import { defineConfig } from "@playwright/test";

// Smoke tests run against the production build (`next start`), not `next dev`.
// Dev mode does not reproduce static/dynamic rendering errors.
const PORT = 3100;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL: BASE_URL,
  },
  webServer: {
    command: `pnpm build && PORT=${PORT} pnpm start`,
    url: BASE_URL,
    reuseExistingServer: false,
    timeout: 400_000,
  },
});
