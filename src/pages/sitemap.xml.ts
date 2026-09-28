import type { APIRoute } from 'astro';
import { escapeXml, indexingEnabled, siteUrls } from '../lib/seo';

export const GET: APIRoute = ({ site }) => {
  const urls = siteUrls(site);
  const entry = indexingEnabled ? `<url><loc>${escapeXml(urls.home)}</loc></url>` : '';
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entry}</urlset>\n`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
