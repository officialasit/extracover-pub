export const pageTitle = 'Extra Cover — Cricket 26 Mod Manager for Windows';
export const pageDescription = 'Install compatible Cricket 26 mod packs on Windows with Extra Cover. Browse community packs or create texture packs with the optional Pack Studio companion.';

// Production pages can be indexed. Set SITE_INDEXING=false for staging builds.
export const indexingEnabled = import.meta.env.PROD && import.meta.env.SITE_INDEXING !== 'false';

export function siteUrls(site: URL | undefined, base = import.meta.env.BASE_URL) {
  if (!site) throw new Error('Configure Astro site before generating SEO metadata.');
  const path = `/${base.replace(/^\/+|\/+$/g, '')}`.replace(/\/$/, '') + '/';
  const home = new URL(path, site).href;
  return {
    home,
    sitemap: new URL('sitemap.xml', home).href,
    socialImage: new URL('images/social-preview.jpg', home).href,
    logo: new URL('images/brand-icon.png', home).href,
  };
}

export function structuredData(urls: ReturnType<typeof siteUrls>, faqs: string[][]) {
  const software = `${urls.home}#software`;
  const studio = `${urls.home}#studio-software`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite', '@id': `${urls.home}#website`,
        name: 'Extra Cover', url: urls.home, inLanguage: 'en',
      },
      {
        '@type': ['WebPage', 'FAQPage'], '@id': `${urls.home}#webpage`,
        url: urls.home, name: pageTitle, description: pageDescription,
        inLanguage: 'en', isPartOf: { '@id': `${urls.home}#website` },
        about: [{ '@id': software }, { '@id': studio }],
        primaryImageOfPage: { '@type': 'ImageObject', url: urls.socialImage, width: 1200, height: 630 },
        mainEntity: faqs.map(([question, answer]) => ({
          '@type': 'Question', name: question,
          acceptedAnswer: { '@type': 'Answer', text: answer },
        })),
      },
      {
        '@type': 'SoftwareApplication', '@id': software,
        name: 'Extra Cover', url: `${urls.home}#extra-cover`, image: urls.logo,
        applicationCategory: 'UtilitiesApplication', operatingSystem: 'Windows',
        isAccessibleForFree: true,
        description: 'Extra Cover is an independent, free-to-use Windows mod manager for Cricket 26 on Steam. It installs compatible .c26pack files after initial setup. Public downloads are coming soon.',
        softwareRequirements: 'Cricket 26 installed through Steam on a Windows PC.',
      },
      {
        '@type': 'SoftwareApplication', '@id': studio,
        name: 'Pack Studio', url: `${urls.home}#pack-studio`,
        applicationCategory: 'DesignApplication', operatingSystem: 'Windows',
        isAccessibleForFree: true,
        description: 'Pack Studio is the free, optional Cricket 26 texture-pack creator. Export supported textures as PNGs, edit them in your own image editor, then build a .c26pack for Extra Cover. Public downloads are coming soon.',
        softwareRequirements: 'Cricket 26 installed through Steam on Windows and an image editor. Keep exported filenames, dimensions, and transparency.',
      },
    ],
  };
}

export function escapeXml(value: string) {
  return value.replace(/[<>&"']/g, char => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[char]!);
}
