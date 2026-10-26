import { expect, test } from "@playwright/test";

// Status-code checks against `next start`. These catch the destination 500
// (static route + uncached Convex read) and a missing 404 for unknown ids.

const OK_ROUTES = [
  "/",
  "/blog",
  "/sitemap.xml",
  "/destination/Tokyo%2C%20Japan",
  // Database-backed record. Must render, not 500.
  "/destination/Lisbon%2C%20Portugal",
];

for (const path of OK_ROUTES) {
  test(`GET ${path} returns 200`, async ({ request }) => {
    const response = await request.get(path);
    expect(response.status()).toBe(200);
  });
}

test("sitemap lists the canonical www host", async ({ request }) => {
  const response = await request.get("/sitemap.xml");
  expect(await response.text()).toContain("https://www.traveltods.world");
});

test("unknown destination returns 404", async ({ request }) => {
  const response = await request.get("/destination/Nowhere%2C%20Atlantis");
  expect(response.status()).toBe(404);
});

test("design system page is hidden in production", async ({ request }) => {
  const response = await request.get("/design-system");
  expect(response.status()).toBe(404);
});
