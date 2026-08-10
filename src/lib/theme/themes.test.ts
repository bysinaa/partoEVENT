/**
 * Theme system tests.
 *
 * Run with: `npm test` (Node's built-in runner, no extra dependencies).
 *
 * These cover the two things most likely to break silently in production:
 * a bad database value taking the site down, and a theme shipping text that
 * nobody can read.
 */

import test from "node:test";
import assert from "node:assert/strict";

import {
  FALLBACK_THEME_ID,
  THEMES,
  THEME_IDS,
  THEME_LIST,
  isThemeId,
  resolveTheme,
  themeToCssVars,
  type ThemeTokens,
} from "./themes.ts";

// ─── Registry shape ──────────────────────────────────────────────────────────

test("all eight themes required by the brief are registered", () => {
  assert.deepEqual(
    [...THEME_IDS].sort(),
    [
      "aurora-green",
      "deep-night",
      "minimal-mono",
      "sand-dune",
      "soft-lilac",
      "solar-refined",
      "steel-blue",
      "warm-light",
    ]
  );
});

test("every theme defines every semantic token as a non-empty string", () => {
  // Guards against a half-filled theme rendering transparent text.
  const required: (keyof ThemeTokens)[] = [
    "bg",
    "surface",
    "surfaceMuted",
    "textPrimary",
    "textSecondary",
    "border",
    "accentPrimary",
    "accentSecondary",
    "buttonBg",
    "buttonText",
    "focus",
    "glow",
    "gradientHero",
    "gradientAccent",
    "headerBg",
    "headerBorder",
    "footerBg",
    "footerBorder",
  ];

  for (const theme of THEME_LIST) {
    for (const token of required) {
      const value = theme.tokens[token];
      assert.equal(
        typeof value === "string" && value.trim().length > 0,
        true,
        `theme "${theme.id}" is missing token "${token}"`
      );
    }
    assert.ok(theme.labelEn, `theme "${theme.id}" has no English label`);
    assert.ok(theme.labelFa, `theme "${theme.id}" has no Persian label`);
    assert.ok(
      theme.mode === "light" || theme.mode === "dark",
      `theme "${theme.id}" has an invalid mode`
    );
  }
});

test("theme ids are self-consistent and the list is complete", () => {
  for (const id of THEME_IDS) {
    assert.equal(THEMES[id].id, id);
  }
  assert.equal(THEME_LIST.length, THEME_IDS.length);
});

// ─── Fallback behaviour ──────────────────────────────────────────────────────

test("resolveTheme falls back safely for missing or invalid database values", () => {
  // The whole point: a bad `websiteTheme` row must never break the render.
  const bad = [undefined, null, "", "sanity-theme", 42, {}, [], true, "SOLAR-REFINED"];

  for (const value of bad) {
    assert.equal(
      resolveTheme(value).id,
      FALLBACK_THEME_ID,
      `expected fallback for ${JSON.stringify(value)}`
    );
  }
});

test("resolveTheme returns the requested theme for every valid id", () => {
  for (const id of THEME_IDS) {
    assert.equal(resolveTheme(id).id, id);
  }
});

test("isThemeId narrows only genuine ids", () => {
  assert.equal(isThemeId("deep-night"), true);
  assert.equal(isThemeId("deep night"), false);
  assert.equal(isThemeId(null), false);
});

test("the fallback theme is itself a registered theme", () => {
  assert.equal(isThemeId(FALLBACK_THEME_ID), true);
});

// ─── CSS variable emission ───────────────────────────────────────────────────

test("themeToCssVars emits one custom property per token, plus color-scheme", () => {
  const css = themeToCssVars(THEMES["solar-refined"]);

  assert.match(css, /--bg:/);
  assert.match(css, /--text-primary:/);
  assert.match(css, /--accent-primary:/);
  assert.match(css, /--gradient-hero:/);
  assert.match(css, /--footer-border:/);

  // One `--custom-property` per semantic token…
  const customProps = css.match(/--[a-z-]+:/g) ?? [];
  assert.equal(
    customProps.length,
    Object.keys(THEMES["solar-refined"].tokens).length
  );

  // …and `color-scheme`, which tells the browser how to paint native UI
  // (scrollbars, form controls) so they match the active theme.
  assert.match(css, /color-scheme: light;/);
  assert.match(themeToCssVars(THEMES["deep-night"]), /color-scheme: dark;/);
});

test("no theme leaks a CSS injection through its token values", () => {
  // Token values land inside a <style> block, so a stray brace would let a
  // malformed theme escape its selector.
  for (const theme of THEME_LIST) {
    for (const value of Object.values(theme.tokens)) {
      assert.equal(
        /[{}<>]/.test(value),
        false,
        `theme "${theme.id}" has an unsafe token value: ${value}`
      );
    }
  }
});

// ─── Contrast ────────────────────────────────────────────────────────────────

/** Parse `#rgb` / `#rrggbb` into sRGB channels. Returns null for other formats. */
function parseHex(color: string): [number, number, number] | null {
  const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(color.trim());
  if (!match) return null;

  let hex = match[1];
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");
  }

  return [
    parseInt(hex.slice(0, 2), 16),
    parseInt(hex.slice(2, 4), 16),
    parseInt(hex.slice(4, 6), 16),
  ];
}

/** WCAG 2.1 relative luminance. */
function luminance([r, g, b]: [number, number, number]): number {
  const channel = (value: number) => {
    const v = value / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** WCAG 2.1 contrast ratio, 1:1 (identical) … 21:1 (black on white). */
function contrastRatio(fg: string, bg: string): number | null {
  const a = parseHex(fg);
  const b = parseHex(bg);
  if (!a || !b) return null;

  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

test("contrast helper matches known WCAG reference values", () => {
  // Sanity-check the checker itself, so a broken helper can't hide a real failure.
  assert.equal(Math.round(contrastRatio("#000000", "#ffffff")!), 21);
  assert.equal(Math.round(contrastRatio("#ffffff", "#ffffff")!), 1);
  assert.equal(parseHex("rgba(0,0,0,0.5)"), null);
});

test("primary text meets WCAG AA (4.5:1) on both page and card surfaces", () => {
  for (const theme of THEME_LIST) {
    for (const surface of ["bg", "surface", "surfaceMuted"] as const) {
      const ratio = contrastRatio(theme.tokens.textPrimary, theme.tokens[surface]);
      assert.notEqual(
        ratio,
        null,
        `theme "${theme.id}": ${surface}/textPrimary must be a hex pair to be checkable`
      );
      assert.ok(
        ratio! >= 4.5,
        `theme "${theme.id}": textPrimary on ${surface} is ${ratio!.toFixed(2)}:1, below AA 4.5:1`
      );
    }
  }
});

test("secondary text meets WCAG AA (4.5:1) on the page background", () => {
  for (const theme of THEME_LIST) {
    const ratio = contrastRatio(theme.tokens.textSecondary, theme.tokens.bg);
    assert.notEqual(ratio, null, `theme "${theme.id}": textSecondary/bg not hex`);
    assert.ok(
      ratio! >= 4.5,
      `theme "${theme.id}": textSecondary is ${ratio!.toFixed(2)}:1, below AA 4.5:1`
    );
  }
});

test("primary button label meets WCAG AA against its own fill", () => {
  for (const theme of THEME_LIST) {
    const ratio = contrastRatio(theme.tokens.buttonText, theme.tokens.buttonBg);
    assert.notEqual(ratio, null, `theme "${theme.id}": button pair not hex`);
    assert.ok(
      ratio! >= 4.5,
      `theme "${theme.id}": button label is ${ratio!.toFixed(2)}:1, below AA 4.5:1`
    );
  }
});

test("accent text meets AA on the page background", () => {
  // Accents are used for links and metadata, not just decoration, so they
  // carry the same burden as body text.
  for (const theme of THEME_LIST) {
    const ratio = contrastRatio(theme.tokens.accentPrimary, theme.tokens.bg);
    assert.notEqual(ratio, null, `theme "${theme.id}": accentPrimary/bg not hex`);
    assert.ok(
      ratio! >= 4.5,
      `theme "${theme.id}": accentPrimary is ${ratio!.toFixed(2)}:1, below AA 4.5:1`
    );
  }
});

test("focus ring meets the 3:1 non-text contrast minimum", () => {
  for (const theme of THEME_LIST) {
    const ratio = contrastRatio(theme.tokens.focus, theme.tokens.bg);
    assert.notEqual(ratio, null, `theme "${theme.id}": focus/bg not hex`);
    assert.ok(
      ratio! >= 3,
      `theme "${theme.id}": focus ring is ${ratio!.toFixed(2)}:1, below 3:1`
    );
  }
});

test("Solar Refined avoids saturated-orange-on-pure-black branding", () => {
  // Explicit requirement from the brief: warm and refined, not adult-content.
  const solar = THEMES["solar-refined"];

  assert.equal(solar.mode, "light");
  assert.notEqual(solar.tokens.bg.toLowerCase(), "#000000");
  assert.notEqual(solar.tokens.bg.toLowerCase(), "#000");

  // An ivory page, not a black one.
  const bg = parseHex(solar.tokens.bg);
  assert.notEqual(bg, null);
  assert.ok(
    luminance(bg!) > 0.7,
    "Solar Refined should sit on a light ivory background"
  );
});

test("glow and ray colors are translucent so they never obscure text", () => {
  for (const theme of THEME_LIST) {
    assert.match(
      theme.tokens.glow,
      /^rgba\(/,
      `theme "${theme.id}": glow must be an rgba() value`
    );
  }
});
