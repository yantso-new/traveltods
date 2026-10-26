// Canonical host is fixed to www. An env override could point canonicals and
// the sitemap at the bare domain, which the site doesn't serve.
const SITE_URL = "https://www.traveltods.world";

export function getSiteUrl() {
  return SITE_URL;
}

export function absoluteUrl(path: string) {
  return new URL(path, `${getSiteUrl()}/`).toString();
}
