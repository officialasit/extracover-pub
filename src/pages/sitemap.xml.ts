import type { APIRoute } from 'astro';
import { escapeXml, homeModified, indexingEnabled, installGuide, siteUrls } from '../lib/seo';

export const GET: APIRoute = ({ site }) => {
  const urls = siteUrls(site);
  const entries = indexingEnabled
    ? [[urls.home, homeModified], [urls.installGuide, installGuide.modified]].map(([url, lastmod]) => `<url><loc>${escapeXml(url)}</loc><lastmod>${lastmod}</lastmod></url>`).join('')
    : '';
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}</urlset>\n`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
