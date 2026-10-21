import { ChipColor, ChipConfig } from 'ui';

// Site palette for the logos
const PINK = '#ff168a';
const LAVENDER = '#5b4fc4';
const INK = '#101c35';

const shield = 'M12 2l9 3.2-1.4 11.9L12 22l-7.6-4.9L3 5.2z';
const label = (text: string, size = 10) =>
  `<text x="12" y="${size === 10 ? 16.5 : 17}" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="${size}" font-weight="800" fill="#fff">${text}</text>`;

/**
 * Hand-drawn logos in the site's colours, as inline SVG. Used on the home page's tech row
 * and in project / role chips, so they always match.
 */
const LOGOS = {
  angular: `<svg viewBox="0 0 24 24"><path d="${shield}" fill="${PINK}"/><path d="M12 5.5l-4.6 10.3h1.8l.9-2.3h3.8l.9 2.3h1.8zM10.8 12l1.2-3 1.2 3z" fill="#fff"/></svg>`,
  typescript: `<svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="3" fill="${LAVENDER}"/>${label('TS')}</svg>`,
  rxjs: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="none" stroke="${PINK}" stroke-width="4"/></svg>`,
  sass: `<svg viewBox="0 0 46 24"><text x="1" y="19" direction="ltr" font-family="Caveat, cursive" font-size="24" font-weight="700" fill="${PINK}">Sass</text></svg>`,
  html: `<svg viewBox="0 0 24 24"><path d="${shield}" fill="${INK}"/>${label('5', 11)}</svg>`,
  css: `<svg viewBox="0 0 24 24"><path d="${shield}" fill="${LAVENDER}"/>${label('3', 11)}</svg>`,
  javascript: `<svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="3" fill="${INK}"/>${label('JS')}</svg>`,
};

interface Tech {
  logo: string;
  color: ChipColor;
}

/**
 * Logo and chip colour for each technology, by name (case doesn't matter).
 * Unknown names still show, just without a logo.
 */
const TECH: Record<string, Tech> = {
  angular: { logo: LOGOS.angular, color: 'pink' },
  typescript: { logo: LOGOS.typescript, color: 'lavender' },
  rxjs: { logo: LOGOS.rxjs, color: 'pink' },
  scss: { logo: LOGOS.sass, color: 'neutral' },
  sass: { logo: LOGOS.sass, color: 'neutral' },
  html: { logo: LOGOS.html, color: 'neutral' },
  css: { logo: LOGOS.css, color: 'neutral' },
  js: { logo: LOGOS.javascript, color: 'neutral' },
  javascript: { logo: LOGOS.javascript, color: 'neutral' },
};

/** The logo for a technology, as SVG markup (or undefined). */
export function techLogo(name: string): string | undefined {
  return TECH[name.toLowerCase()]?.logo;
}

/** A tech chip with its logo, e.g. techChip('Angular'). */
export function techChip(name: string): ChipConfig {
  const tech = TECH[name.toLowerCase()];
  return { id: name, label: name, logoSvg: tech?.logo, color: tech?.color ?? 'neutral' };
}
