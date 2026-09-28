import type { APIRoute } from 'astro';
import { indexingEnabled, siteUrls } from '../lib/seo';

export const GET: APIRoute = ({ site }) => {
  const urls = siteUrls(site);
  // Crawling stays allowed so bots can read noindex on staging and the style lab.
  const sitemap = indexingEnabled ? `Sitemap: ${urls.sitemap}\n` : '';
  return new Response(`User-agent: *\nAllow: /\n${sitemap}`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
