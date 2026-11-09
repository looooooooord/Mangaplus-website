/**
 * Official site information. Values that are not publicly confirmed yet are left
 * empty on purpose: the UI renders a neutral state instead of inventing data.
 * Fill these in with the official values when they are published.
 */
export const site = {
  name: 'MangaPlus',
  arabicName: 'مانجا بلس',
  domainLabel: 'mangaplus',
  tagline: 'عالم المانجا والروايات في مكان واحد',
  description:
    'MangaPlus منصة عربية لقراءة المانجا والروايات، بواجهة مصممة للعربية من البداية، ومكتبة تحفظ ما تقرأه.',
  android: {
    /** Official store URL. Leave empty until the listing is confirmed. */
    downloadUrl: '',
    /** Android package name, used later for App Links verification. */
    packageName: '',
  },
  contacts: {
    support: '',
    privacy: '',
    partnerships: '',
  },
  social: [] as { label: string; url: string }[],
  /** Update when the legal pages change. */
  legalUpdatedAt: '2026-11-09',
} as const;

export const hasDownloadLink = site.android.downloadUrl.length > 0;
