import type { ReaderPage, Work } from '@/types';
import { getWorkById } from '@/services/catalog';

/**
 * Sample page art for the manga reader. Every page is a generated SVG that keeps
 * the real image pipeline (lazy <img> loading, aspect ratio, zoom) exercised.
 * A real page provider can replace `getMangaChapterPages` without UI changes.
 */

const WIDTH = 1000;
const HEIGHT = 1500;

type Rect = [x: number, y: number, w: number, h: number];

const layouts: Rect[][] = [
  [
    [36, 36, 928, 690],
    [36, 742, 452, 722],
    [504, 742, 460, 722],
  ],
  [
    [36, 36, 928, 470],
    [36, 522, 928, 470],
    [36, 1008, 928, 456],
  ],
  [
    [36, 36, 552, 1428],
    [604, 36, 360, 686],
    [604, 738, 360, 726],
  ],
  [
    [36, 36, 452, 700],
    [504, 36, 460, 700],
    [36, 752, 452, 712],
    [504, 752, 460, 712],
  ],
  [
    [36, 36, 928, 900],
    [36, 952, 286, 512],
    [336, 952, 286, 512],
    [636, 952, 328, 512],
  ],
];

function hashString(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function makeRandom(seed: number): () => number {
  let state = seed || 1;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

function panelContent(
  rect: Rect,
  index: number,
  rand: () => number,
  work: Work,
): string {
  const [x, y, w, h] = rect;
  const clipId = `clip-${index}`;
  const parts: string[] = [];

  parts.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#panel-${index % 3})"/>`);

  const horizon = y + h * (0.55 + rand() * 0.2);
  const motif = Math.floor(rand() * 6);

  if (motif === 0 || motif === 4) {
    const cx = x + w * (0.3 + rand() * 0.45);
    const cy = y + h * (0.2 + rand() * 0.2);
    const radius = Math.min(w, h) * (0.14 + rand() * 0.12);
    parts.push(
      `<circle cx="${round(cx)}" cy="${round(cy)}" r="${round(radius)}" fill="${work.cover.accent}" opacity="0.85"/>`,
      `<circle cx="${round(cx)}" cy="${round(cy)}" r="${round(radius * 1.35)}" fill="none" stroke="${work.cover.accent}" stroke-width="2" opacity="0.3"/>`,
      `<rect x="${x}" y="${round(horizon)}" width="${w}" height="${round(y + h - horizon)}" fill="#0B1530" opacity="0.18"/>`,
    );
    const buildingWidth = w / 9;
    for (let i = 0; i < 8; i += 1) {
      const bh = h * (0.08 + rand() * 0.2);
      parts.push(
        `<rect x="${round(x + i * buildingWidth + 4)}" y="${round(horizon - bh)}" width="${round(buildingWidth - 8)}" height="${round(bh)}" fill="#0B1530" opacity="0.5"/>`,
      );
    }
  }

  if (motif === 1) {
    let line = '';
    const focusX = x + w * (0.35 + rand() * 0.3);
    const focusY = y + h * (0.3 + rand() * 0.4);
    for (let i = 0; i < 28; i += 1) {
      const angle = (Math.PI * 2 * i) / 28 + rand() * 0.08;
      const inner = Math.min(w, h) * 0.16;
      const outer = Math.max(w, h);
      line += `M${round(focusX + Math.cos(angle) * inner)} ${round(focusY + Math.sin(angle) * inner)}L${round(focusX + Math.cos(angle) * outer)} ${round(focusY + Math.sin(angle) * outer)}`;
    }
    parts.push(
      `<path d="${line}" stroke="${work.cover.accent}" stroke-width="2.5" opacity="0.35"/>`,
      `<circle cx="${round(focusX)}" cy="${round(focusY)}" r="${round(Math.min(w, h) * 0.12)}" fill="${work.cover.accent}" opacity="0.9"/>`,
    );
  }

  if (motif === 2) {
    const baseY = y + h * 0.78;
    parts.push(
      `<path d="M${x} ${baseY} L${round(x + w * 0.22)} ${round(baseY - h * 0.3)} L${round(x + w * 0.45)} ${round(baseY - h * 0.08)} L${round(x + w * 0.62)} ${round(baseY - h * 0.36)} L${x + w} ${round(baseY - h * 0.12)} L${x + w} ${y + h} L${x} ${y + h} Z" fill="#081228" opacity="0.62"/>`,
      `<rect x="${x}" y="${round(horizon)}" width="${w}" height="${round(y + h - horizon)}" fill="#081228" opacity="0.25"/>`,
    );
    const rain = [];
    for (let i = 0; i < 26; i += 1) {
      const rx = x + rand() * w;
      const ry = y + rand() * h;
      rain.push(`M${round(rx)} ${round(ry)}l-12 34`);
    }
    parts.push(`<path d="${rain.join('')}" stroke="#FFFFFF" stroke-width="1.4" opacity="0.28"/>`);
  }

  if (motif === 3) {
    const headX = x + w * (0.3 + rand() * 0.4);
    const headY = y + h * (0.42 + rand() * 0.12);
    const headR = Math.min(w, h) * 0.09;
    parts.push(
      `<circle cx="${round(headX)}" cy="${round(headY)}" r="${round(headR)}" fill="#07101F" opacity="0.85"/>`,
      `<path d="M${round(headX - headR * 2.1)} ${round(headY + h * 0.42)} Q${round(headX)} ${round(headY + headR * 0.6)} ${round(headX + headR * 2.1)} ${round(headY + h * 0.42)} L${round(headX + headR * 2.1)} ${y + h} L${round(headX - headR * 2.1)} ${y + h} Z" fill="#07101F" opacity="0.82"/>`,
      `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#halftone)" opacity="0.3"/>`,
    );
  }

  if (motif === 5) {
    parts.push(
      `<rect x="${round(x + w * 0.08)}" y="${round(y + h * 0.1)}" width="${round(w * 0.55)}" height="${round(h * 0.5)}" fill="#07101F" opacity="0.2" stroke="#FFFFFF" stroke-width="2"/>`,
      `<path d="M${round(x + w * 0.2)} ${round(y + h * 0.72)} L${round(x + w * 0.82)} ${round(y + h * 0.24)}" stroke="${work.cover.accent}" stroke-width="8" opacity="0.7"/>`,
      `<path d="M${round(x + w * 0.2)} ${round(y + h * 0.84)} L${round(x + w * 0.7)} ${round(y + h * 0.46)}" stroke="#FFFFFF" stroke-width="3" opacity="0.5"/>`,
    );
  }

  if (rand() > 0.45 && w > 240) {
    const bubbleX = x + w * (0.55 + rand() * 0.18);
    const bubbleY = y + h * (0.16 + rand() * 0.12);
    const bw = w * 0.26;
    const bh = h * 0.1;
    parts.push(
      `<g opacity="0.95"><ellipse cx="${round(bubbleX)}" cy="${round(bubbleY)}" rx="${round(bw / 2)}" ry="${round(bh / 2)}" fill="#F8FAFF"/><path d="M${round(bubbleX - bw * 0.08)} ${round(bubbleY + bh * 0.4)} l${round(-bw * 0.12)} ${round(bh * 0.34)} l${round(bw * 0.26)} ${round(-bh * 0.18)} Z" fill="#F8FAFF"/><path d="M${round(bubbleX - bw * 0.28)} ${round(bubbleY - bh * 0.1)}h${round(bw * 0.55)}M${round(bubbleX - bw * 0.28)} ${round(bubbleY + bh * 0.08)}h${round(bw * 0.38)}" stroke="#3A465C" stroke-width="3" stroke-linecap="round" opacity="0.5"/></g>`,
    );
  }

  return `<g clip-path="url(#${clipId})">${parts.join('')}</g><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#0A1220" stroke-width="3"/>`;
}

function buildPage(work: Work, chapterNumber: number, pageNumber: number, pageCount: number): ReaderPage {
  const seed = hashString(`${work.id}:${chapterNumber}:${pageNumber}`);
  const rand = makeRandom(seed);
  const layout = pageNumber === 1 ? layouts[0] : layouts[seed % layouts.length];
  const safeLayout = layout ?? layouts[0];

  const clipDefs = safeLayout
    .map(([x, y, w, h], index) => `<clipPath id="clip-${index}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath>`)
    .join('');

  const panels = safeLayout
    .map((rect, index) => panelContent(rect, index, rand, work))
    .join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
<defs>
<linearGradient id="panel-0" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${work.cover.from}"/><stop offset="1" stop-color="${work.cover.to}"/></linearGradient>
<linearGradient id="panel-1" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="${work.cover.to}"/><stop offset="1" stop-color="${work.cover.accent}"/></linearGradient>
<linearGradient id="panel-2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${work.cover.from}"/><stop offset="1" stop-color="${work.cover.accent}"/></linearGradient>
<pattern id="halftone" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="2.1" fill="#07101F"/></pattern>
${clipDefs}
</defs>
<rect width="${WIDTH}" height="${HEIGHT}" fill="#F4F2ED"/>
${panels}
<text x="960" y="1478" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="22" fill="#39445A" opacity="0.75">${pageNumber} / ${pageCount}</text>
<text x="40" y="1478" font-family="Arial, Helvetica, sans-serif" font-size="18" letter-spacing="2" fill="#39445A" opacity="0.55">${work.latinTitle.toUpperCase()}</text>
<rect width="${WIDTH}" height="${HEIGHT}" fill="none" stroke="#D8D3C8" stroke-width="2"/>
</svg>`;

  return {
    id: `p-${pageNumber}`,
    uri: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
    width: WIDTH,
    height: HEIGHT,
  };
}

export function getMangaChapterPages(workId: string, chapterNumber: number): ReaderPage[] {
  const work = getWorkById(workId, 'manga');
  if (!work) return [];
  const pageCount = 8 + ((chapterNumber + work.id.length) % 3);
  return Array.from({ length: pageCount }, (_, index) =>
    buildPage(work, chapterNumber, index + 1, pageCount),
  );
}

export function estimateReadingMinutes(paragraphs: string[]): number {
  const words = paragraphs.join(' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 180));
}
