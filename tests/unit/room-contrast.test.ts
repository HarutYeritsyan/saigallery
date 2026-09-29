import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// The velvet room's contrast guard (spec FR-007, constitution "Content & Accessibility Standards").
// It reads the real stylesheet, so a token change or a new colour that breaks AA fails here, with
// no browser needed. Token names and values are documented in specs/002-velvet-room-design/data-model.md.

const CSS = readFileSync('src/styles/gallery.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

type Rgba = [number, number, number, number];

function rootTokens(css: string): Map<string, string> {
  const tokens = new Map<string, string>();
  for (const block of css.matchAll(/:root\s*\{([^}]*)\}/g)) {
    for (const decl of block[1].matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) tokens.set(decl[1], decl[2].trim());
  }
  return tokens;
}

function parseColour(value: string): Rgba {
  const hex = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    const h = hex[1].length === 3 ? [...hex[1]].map((c) => c + c).join('') : hex[1];
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)).concat(1) as Rgba;
  }
  const fn = value.match(/^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)(?:[\s,/]+([\d.]+))?\s*\)$/i);
  if (fn) return [Number(fn[1]), Number(fn[2]), Number(fn[3]), fn[4] === undefined ? 1 : Number(fn[4])];
  throw new Error(`Cannot parse colour "${value}"`);
}

function blend(top: Rgba, base: Rgba): Rgba {
  const a = top[3];
  return [0, 1, 2].map((i) => top[i] * a + base[i] * (1 - a)).concat(1) as Rgba;
}

function luminance([r, g, b]: Rgba): number {
  const [R, G, B] = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function contrast(fg: Rgba, bg: Rgba): number {
  const [hi, lo] = [luminance(fg), luminance(bg)].sort((a, b) => b - a);
  return (hi + 0.05) / (lo + 0.05);
}

const tokens = rootTokens(CSS);
const colour = (name: string): Rgba => {
  const raw = tokens.get(name);
  if (raw === undefined) throw new Error(`Token --${name} is not defined in :root of src/styles/gallery.css`);
  return parseColour(raw);
};

describe('velvet room contrast (FR-007)', () => {
  // [text token, surface token, minimum ratio]. 4.5 for text, 3 for the non-text focus ring.
  const pairs: [string, string, number][] = [
    ['cream', 'wall', 4.5],
    ['cream-dim', 'wall', 4.5],
    ['gold', 'wall', 4.5],
    ['gold-hi', 'wall', 4.5],
    ['brass-ink', 'gold', 4.5],
    ['plaque-ink', 'plaque', 4.5],
    ['cream', 'matting', 4.5],
    ['gold-hi', 'wall', 3],
  ];

  for (const [fg, bg, min] of pairs) {
    it(`--${fg} on --${bg} is at least ${min}:1`, () => {
      expect(contrast(colour(fg), colour(bg))).toBeGreaterThanOrEqual(min);
    });
  }

  // Only cream text may sit over a spotlight (research R2): gold on the brightest point of the
  // exhibit spotlight is 4.41:1 and would fail, so gold is deliberately not tested here.
  for (const spotlight of ['spotlight-index', 'spotlight-exhibit']) {
    for (const text of ['cream', 'cream-dim']) {
      it(`--${text} on the peak of --${spotlight} is at least 4.5:1`, () => {
        const peak = blend(colour(spotlight), colour('wall'));
        expect(contrast(colour(text), peak)).toBeGreaterThanOrEqual(4.5);
      });
    }
  }
});

describe('velvet room stylesheet uses tokens only', () => {
  // Everything outside :root is checked as it stands when the test runs, so this passes once the
  // legacy rules are gone and then guards every later rule.
  const outside = CSS.replace(/:root\s*\{[^}]*\}/g, '');
  const COLOUR_PROPS = /^(color|background|background-color|background-image|border|border-(top|right|bottom|left)(-color)?|border-color|outline|outline-color|box-shadow|text-shadow|fill|stroke|stop-color)$/;
  const ALLOWED_WORDS = new Set(['transparent', 'currentcolor', 'none', 'inherit', 'initial', 'unset']);
  const SYSTEM_COLOURS = /^(canvas|canvastext|linktext|visitedtext|activetext|buttonface|buttontext|buttonborder|field|fieldtext|highlight|highlighttext|graytext|mark|marktext)$/i;
  const NAMED = new Set(['black', 'white', 'red', 'green', 'blue', 'gray', 'grey', 'silver', 'gold', 'yellow', 'orange', 'brown', 'maroon', 'crimson', 'navy', 'purple', 'pink', 'tan', 'ivory', 'beige', 'teal', 'olive']);

  const declarations = [...outside.matchAll(/([a-z-]+)\s*:\s*([^;{}]+)[;}]/g)]
    .map((m) => ({ prop: m[1], value: m[2].trim() }))
    .filter((d) => COLOUR_PROPS.test(d.prop));

  it('finds no colour literals outside :root', () => {
    const literals: string[] = [];
    for (const { prop, value } of declarations) {
      const bare = value.replace(/var\(--[\w-]+\)/g, '');
      if (/#[0-9a-f]{3,8}\b|\b(rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch|color-mix)\(/i.test(bare)) literals.push(`${prop}: ${value}`);
      for (const word of bare.match(/[a-z]+/gi) ?? []) {
        const lower = word.toLowerCase();
        if (NAMED.has(lower) && !ALLOWED_WORDS.has(lower) && !SYSTEM_COLOURS.test(lower)) literals.push(`${prop}: ${value}`);
      }
    }
    expect(literals).toEqual([]);
  });

  it('only refers to custom properties that the stylesheet defines', () => {
    // :root tokens plus layout variables declared on elements (such as --piece and --ring).
    const defined = new Set([...CSS.matchAll(/(?:^|[;{\s])--([\w-]+)\s*:/g)].map((m) => m[1]));
    const undefinedTokens = new Set<string>();
    for (const m of outside.matchAll(/var\(--([\w-]+)/g)) if (!defined.has(m[1])) undefinedTokens.add(m[1]);
    expect([...undefinedTokens]).toEqual([]);
  });

  it('takes every colour from a token defined in :root', () => {
    // Colour declarations may only use var() with a :root token or one of the allowed keywords.
    const notRoot = new Set<string>();
    for (const { value } of declarations) {
      for (const m of value.matchAll(/var\(--([\w-]+)/g)) if (!tokens.has(m[1])) notRoot.add(m[1]);
    }
    expect([...notRoot]).toEqual([]);
  });
});
