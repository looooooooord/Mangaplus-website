/**
 * Files in public/ are served from the deployment base path. When the site is
 * hosted under a sub-path (for example GitHub Pages project pages), raw <img>
 * sources must include that prefix as well.
 */
const base = import.meta.env.BASE_URL;

export function assetPath(path: string): string {
  return `${base}${path.replace(/^\//, '')}`;
}

export const logoMarkUrl = assetPath('assets/logo-mark.svg');
