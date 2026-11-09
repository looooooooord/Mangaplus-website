import { copyFile, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const dist = 'dist';

// Static hosts that cannot rewrite every path (for example GitHub Pages) serve
// 404.html for unknown routes. Copying the SPA shell keeps deep links working.
await copyFile(join(dist, 'index.html'), join(dist, '404.html'));

const rawSiteUrl = process.env.SITE_URL ?? process.env.VITE_SITE_URL ?? '';
const siteUrl = rawSiteUrl.trim().replace(/\/$/, '');

if (!siteUrl) {
  console.log('[postbuild] SITE_URL not set — sitemap generation skipped.');
  process.exit(0);
}

// Absolute social URLs are required by crawlers, so rewrite the placeholders
// once the public address of the deployment is known at build time.
const shell = await readFile(join(dist, 'index.html'), 'utf8');
const withAbsoluteMeta = shell
  .replaceAll(/content="[^"]*\/og-image\.png"/g, `content="${siteUrl}/og-image.png"`)
  .replace('</head>', `  <meta property="og:url" content="${siteUrl}/" />\n  </head>`);
await writeFile(join(dist, 'index.html'), withAbsoluteMeta, 'utf8');
await writeFile(join(dist, '404.html'), withAbsoluteMeta, 'utf8');

const worksSource = await readFile('src/data/works.ts', 'utf8');
const workEntries = [
  ...worksSource.matchAll(/id:\s*'([^']+)',\s*\n\s*type:\s*'(manga|novel)'/g),
].map((match) => ({ id: match[1], type: match[2] }));

const routes = [
  '',
  '/explore',
  '/explore?type=manga',
  '/explore?type=novel',
  '/about',
  '/features',
  '/faq',
  '/privacy',
  '/terms',
  '/contact',
  '/download',
];

const workRoutes = workEntries.map((work) => `/${work.type}/${work.id}`);
const today = new Date().toISOString().slice(0, 10);

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...routes, ...workRoutes]
  .map(
    (route) => `  <url>
    <loc>${siteUrl}${route || '/'}</loc>
    <lastmod>${today}</lastmod>
  </url>`,
  )
  .join('\n')}
</urlset>
`;

const robots = `User-agent: *
Allow: /

Disallow: /account
Disallow: /library
Disallow: /auth-action
Disallow: /reader/
Disallow: /login
Disallow: /signup
Disallow: /forgot-password
Disallow: /search

Sitemap: ${siteUrl}/sitemap.xml
`;

await writeFile(join(dist, 'sitemap.xml'), sitemap, 'utf8');
await writeFile(join(dist, 'robots.txt'), robots, 'utf8');
console.log(`[postbuild] sitemap.xml generated for ${siteUrl} with ${workRoutes.length} works.`);
