import { useEffect } from 'react';

const defaultDescription =
  'MangaPlus منصة عربية لقراءة المانجا والروايات: اكتشف أعمالاً جديدة، تابع فصولك المفضلة، وأكمل القراءة من حيث توقفت.';

const defaultTitle = 'MangaPlus — منصة المانجا والروايات العربية';

interface PageMeta {
  title?: string;
  description?: string;
  type?: 'website' | 'article';
  noIndex?: boolean;
}

function upsertMeta(attribute: 'name' | 'property', key: string, content: string): void {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function upsertCanonical(href: string): void {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }
  link.href = href;
}

export function usePageMeta({ title, description, type = 'website', noIndex = false }: PageMeta): void {
  useEffect(() => {
    const fullTitle = title ? `${title} — MangaPlus` : defaultTitle;
    const summary = description?.trim() || defaultDescription;
    const url = window.location.origin + window.location.pathname + window.location.search;

    document.title = fullTitle;
    upsertMeta('name', 'description', summary);
    upsertMeta('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow');
    upsertMeta('property', 'og:title', fullTitle);
    upsertMeta('property', 'og:description', summary);
    upsertMeta('property', 'og:type', type);
    upsertMeta('property', 'og:url', url);
    upsertMeta('property', 'og:site_name', 'MangaPlus');
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', fullTitle);
    upsertMeta('name', 'twitter:description', summary);
    upsertCanonical(url);
  }, [title, description, type, noIndex]);
}
