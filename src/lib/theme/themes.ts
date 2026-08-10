/**
 * Parto — Semantic Theme Token System
 *
 * Single source of truth for the eight selectable website themes.
 *
 * Design rules encoded here:
 *  - Every theme exposes the *same* semantic token names, so components never
 *    branch on the theme id. They only consume `var(--tokenName)`.
 *  - The Parto amber/orange identity stays present in every theme, but as a
 *    *light* accent (rays, glow, focus, hairlines) rather than large flat fills.
 *  - Deliberately no "saturated orange on pure black" button treatment: primary
 *    buttons use an ink/surface pair so the site never reads as the
 *    black-and-yellow adult-content cliché.
 *  - Body/heading text pairs are checked against their own page background at
 *    >= 4.5:1 (normal text) and >= 3:1 (large text / UI borders).
 */

export const THEME_IDS = [
  "solar-refined",
  "warm-light",
  "deep-night",
  "minimal-mono",
  "aurora-green",
  "soft-lilac",
  "steel-blue",
  "sand-dune",
] as const;

export type ThemeId = (typeof THEME_IDS)[number];

/** Used whenever the database value is missing, stale or invalid. */
export const FALLBACK_THEME_ID: ThemeId = "solar-refined";

/** Whether a theme's base surface is light or dark — drives artwork variant + color-scheme. */
export type ThemeMode = "light" | "dark";

export interface ThemeTokens {
  /** Page background. */
  bg: string;
  /** Elevated surface (cards, popovers). */
  surface: string;
  /** Secondary/sunken surface (wells, alternating bands). */
  surfaceMuted: string;
  /** Primary body + heading text. */
  textPrimary: string;
  /** Secondary/supporting text. */
  textSecondary: string;
  /** Hairlines and dividers. */
  border: string;
  /** Primary accent — the Parto light. */
  accentPrimary: string;
  /** Secondary accent — cooler counterpart. */
  accentSecondary: string;
  /** Primary button fill. */
  buttonBg: string;
  /** Primary button label. */
  buttonText: string;
  /** Visible focus ring. */
  focus: string;
  /** Ray / glow color, always translucent. */
  glow: string;
  /** Hero atmosphere gradient. */
  gradientHero: string;
  /** Accent sweep used on rules, underlines and connectors. */
  gradientAccent: string;
  /** Header background (usually translucent; pairs with backdrop blur). */
  headerBg: string;
  /** Header bottom hairline. */
  headerBorder: string;
  /** Footer background. */
  footerBg: string;
  /** Footer top hairline. */
  footerBorder: string;
}

export interface ThemeDefinition {
  id: ThemeId;
  /** English label shown in CMS. */
  labelEn: string;
  /** Persian label shown in CMS. */
  labelFa: string;
  mode: ThemeMode;
  /** Default typography preset key for this theme (see typography.ts). */
  typography: string;
  tokens: ThemeTokens;
}

export const THEMES: Record<ThemeId, ThemeDefinition> = {
  // ── 1. Solar Refined ──────────────────────────────────────────────────────
  // Warm amber + ivory + charcoal + champagne. The flagship default.
  "solar-refined": {
    id: "solar-refined",
    labelEn: "Solar Refined",
    labelFa: "خورشیدی ظریف",
    mode: "light",
    typography: "editorial",
    tokens: {
      bg: "#FCFAF6",
      surface: "#FFFFFF",
      surfaceMuted: "#F3EEE4",
      textPrimary: "#1E1A15",
      textSecondary: "#5B5348",
      border: "#E4DCCC",
      // Deep amber rather than a bright orange: this accent carries link and
      // metadata text, so it must clear AA (4.5:1) on the ivory page, not just
      // the 3:1 decorative floor. See themes.test.ts.
      accentPrimary: "#8F5709",
      accentSecondary: "#7A6A50",
      buttonBg: "#1E1A15",
      buttonText: "#FCFAF6",
      focus: "#8F5709",
      glow: "rgba(232, 164, 58, 0.28)",
      gradientHero:
        "radial-gradient(120% 80% at 50% -10%, rgba(232,164,58,0.20) 0%, rgba(232,164,58,0.06) 38%, rgba(252,250,246,0) 72%)",
      gradientAccent:
        "linear-gradient(90deg, rgba(169,103,12,0) 0%, rgba(232,164,58,0.65) 50%, rgba(169,103,12,0) 100%)",
      headerBg: "rgba(252, 250, 246, 0.78)",
      headerBorder: "rgba(30, 26, 21, 0.08)",
      footerBg: "#F3EEE4",
      footerBorder: "rgba(30, 26, 21, 0.10)",
    },
  },

  // ── 2. Warm Light ─────────────────────────────────────────────────────────
  // 2700K. Softer, sunnier, slightly pink-amber paper.
  "warm-light": {
    id: "warm-light",
    labelEn: "Warm Light",
    labelFa: "نور گرم",
    mode: "light",
    typography: "humanist",
    tokens: {
      bg: "#FEF8F1",
      surface: "#FFFFFF",
      surfaceMuted: "#F8EADB",
      textPrimary: "#261D14",
      textSecondary: "#6B5745",
      border: "#EBD9C4",
      // Same reasoning as Solar Refined: deepened until it clears AA on the
      // warm paper background rather than sitting just under it.
      accentPrimary: "#9C5107",
      accentSecondary: "#8C5A2B",
      buttonBg: "#261D14",
      buttonText: "#FEF8F1",
      focus: "#9C5107",
      glow: "rgba(247, 168, 76, 0.32)",
      gradientHero:
        "radial-gradient(120% 80% at 50% -10%, rgba(247,168,76,0.24) 0%, rgba(247,168,76,0.07) 40%, rgba(254,248,241,0) 74%)",
      gradientAccent:
        "linear-gradient(90deg, rgba(178,94,9,0) 0%, rgba(247,168,76,0.7) 50%, rgba(178,94,9,0) 100%)",
      headerBg: "rgba(254, 248, 241, 0.80)",
      headerBorder: "rgba(38, 29, 20, 0.08)",
      footerBg: "#F8EADB",
      footerBorder: "rgba(38, 29, 20, 0.10)",
    },
  },

  // ── 3. Deep Night ─────────────────────────────────────────────────────────
  // Dark, but a blue-leaning ink rather than pure #000 — keeps amber premium.
  "deep-night": {
    id: "deep-night",
    labelEn: "Deep Night",
    labelFa: "شب عمیق",
    mode: "dark",
    typography: "editorial",
    tokens: {
      bg: "#0E1014",
      surface: "#171A20",
      surfaceMuted: "#1F232B",
      textPrimary: "#F4F5F7",
      textSecondary: "#A9AFBA",
      border: "rgba(255, 255, 255, 0.10)",
      accentPrimary: "#F5B44A",
      accentSecondary: "#7FB6D6",
      buttonBg: "#F4F5F7",
      buttonText: "#0E1014",
      focus: "#F5B44A",
      glow: "rgba(245, 180, 74, 0.26)",
      gradientHero:
        "radial-gradient(120% 80% at 50% -10%, rgba(245,180,74,0.16) 0%, rgba(127,182,214,0.06) 42%, rgba(14,16,20,0) 74%)",
      gradientAccent:
        "linear-gradient(90deg, rgba(245,180,74,0) 0%, rgba(245,180,74,0.55) 50%, rgba(245,180,74,0) 100%)",
      headerBg: "rgba(14, 16, 20, 0.72)",
      headerBorder: "rgba(255, 255, 255, 0.08)",
      footerBg: "#0A0C0F",
      footerBorder: "rgba(255, 255, 255, 0.08)",
    },
  },

  // ── 4. Minimal Mono ───────────────────────────────────────────────────────
  // Near-greyscale. Amber survives only in the ray/focus layer.
  "minimal-mono": {
    id: "minimal-mono",
    labelEn: "Minimal Mono",
    labelFa: "تک‌رنگ مینیمال",
    mode: "light",
    typography: "grotesk",
    tokens: {
      bg: "#FAFAFA",
      surface: "#FFFFFF",
      surfaceMuted: "#F0F0F0",
      textPrimary: "#141414",
      textSecondary: "#5A5A5A",
      border: "#DEDEDE",
      accentPrimary: "#8A5A10",
      accentSecondary: "#3D3D3D",
      buttonBg: "#141414",
      buttonText: "#FAFAFA",
      focus: "#8A5A10",
      glow: "rgba(214, 160, 74, 0.20)",
      gradientHero:
        "radial-gradient(120% 80% at 50% -10%, rgba(214,160,74,0.14) 0%, rgba(20,20,20,0.04) 40%, rgba(250,250,250,0) 72%)",
      gradientAccent:
        "linear-gradient(90deg, rgba(20,20,20,0) 0%, rgba(20,20,20,0.35) 50%, rgba(20,20,20,0) 100%)",
      headerBg: "rgba(250, 250, 250, 0.80)",
      headerBorder: "rgba(20, 20, 20, 0.10)",
      footerBg: "#F0F0F0",
      footerBorder: "rgba(20, 20, 20, 0.10)",
    },
  },

  // ── 5. Aurora Green ───────────────────────────────────────────────────────
  // Cool dark green-teal night with a warm amber ray cutting through.
  "aurora-green": {
    id: "aurora-green",
    labelEn: "Aurora Green",
    labelFa: "سبز شفق",
    mode: "dark",
    typography: "grotesk",
    tokens: {
      bg: "#0B1512",
      surface: "#132019",
      surfaceMuted: "#1A2B22",
      textPrimary: "#EEF6F1",
      textSecondary: "#A2BCAF",
      border: "rgba(233, 255, 243, 0.10)",
      accentPrimary: "#F0B860",
      accentSecondary: "#5FD3A3",
      buttonBg: "#EEF6F1",
      buttonText: "#0B1512",
      focus: "#5FD3A3",
      glow: "rgba(95, 211, 163, 0.22)",
      gradientHero:
        "radial-gradient(120% 80% at 50% -10%, rgba(95,211,163,0.16) 0%, rgba(240,184,96,0.08) 42%, rgba(11,21,18,0) 74%)",
      gradientAccent:
        "linear-gradient(90deg, rgba(95,211,163,0) 0%, rgba(95,211,163,0.5) 50%, rgba(95,211,163,0) 100%)",
      headerBg: "rgba(11, 21, 18, 0.74)",
      headerBorder: "rgba(233, 255, 243, 0.08)",
      footerBg: "#08110E",
      footerBorder: "rgba(233, 255, 243, 0.08)",
    },
  },

  // ── 6. Soft Lilac ─────────────────────────────────────────────────────────
  // Pale violet paper, ink plum text, amber kept as the warm counterweight.
  "soft-lilac": {
    id: "soft-lilac",
    labelEn: "Soft Lilac",
    labelFa: "یاسی ملایم",
    mode: "light",
    typography: "humanist",
    tokens: {
      bg: "#FAF8FD",
      surface: "#FFFFFF",
      surfaceMuted: "#F1ECF9",
      textPrimary: "#1F1830",
      textSecondary: "#5D5478",
      border: "#E3DAF2",
      accentPrimary: "#6B4BC4",
      accentSecondary: "#A9700F",
      buttonBg: "#1F1830",
      buttonText: "#FAF8FD",
      focus: "#6B4BC4",
      glow: "rgba(150, 118, 224, 0.24)",
      gradientHero:
        "radial-gradient(120% 80% at 50% -10%, rgba(150,118,224,0.18) 0%, rgba(232,164,58,0.07) 42%, rgba(250,248,253,0) 74%)",
      gradientAccent:
        "linear-gradient(90deg, rgba(107,75,196,0) 0%, rgba(150,118,224,0.6) 50%, rgba(107,75,196,0) 100%)",
      headerBg: "rgba(250, 248, 253, 0.80)",
      headerBorder: "rgba(31, 24, 48, 0.08)",
      footerBg: "#F1ECF9",
      footerBorder: "rgba(31, 24, 48, 0.10)",
    },
  },

  // ── 7. Steel Blue ─────────────────────────────────────────────────────────
  // 6500K corporate daylight. Cool slate paper, deep navy ink.
  "steel-blue": {
    id: "steel-blue",
    labelEn: "Steel Blue",
    labelFa: "آبی فولادی",
    mode: "light",
    typography: "grotesk",
    tokens: {
      bg: "#F7F9FC",
      surface: "#FFFFFF",
      surfaceMuted: "#EAEFF6",
      textPrimary: "#141C28",
      textSecondary: "#4F5D70",
      border: "#D8E1EC",
      accentPrimary: "#1D5FA8",
      accentSecondary: "#A9670C",
      buttonBg: "#141C28",
      buttonText: "#F7F9FC",
      focus: "#1D5FA8",
      glow: "rgba(72, 140, 214, 0.24)",
      gradientHero:
        "radial-gradient(120% 80% at 50% -10%, rgba(72,140,214,0.18) 0%, rgba(232,164,58,0.07) 42%, rgba(247,249,252,0) 74%)",
      gradientAccent:
        "linear-gradient(90deg, rgba(29,95,168,0) 0%, rgba(72,140,214,0.6) 50%, rgba(29,95,168,0) 100%)",
      headerBg: "rgba(247, 249, 252, 0.80)",
      headerBorder: "rgba(20, 28, 40, 0.08)",
      footerBg: "#EAEFF6",
      footerBorder: "rgba(20, 28, 40, 0.10)",
    },
  },

  // ── 8. Sand Dune ──────────────────────────────────────────────────────────
  // Desert paper: taupe, clay and burnt sienna. Warm but low-chroma.
  "sand-dune": {
    id: "sand-dune",
    labelEn: "Sand Dune",
    labelFa: "تپه شنی",
    mode: "light",
    typography: "editorial",
    tokens: {
      bg: "#F8F4ED",
      surface: "#FFFDF9",
      surfaceMuted: "#EDE4D6",
      textPrimary: "#241E16",
      textSecondary: "#635849",
      border: "#DED2BF",
      accentPrimary: "#9B551B",
      accentSecondary: "#6F7355",
      buttonBg: "#241E16",
      buttonText: "#F8F4ED",
      focus: "#9B551B",
      glow: "rgba(199, 138, 74, 0.26)",
      gradientHero:
        "radial-gradient(120% 80% at 50% -10%, rgba(199,138,74,0.20) 0%, rgba(111,115,85,0.06) 42%, rgba(248,244,237,0) 74%)",
      gradientAccent:
        "linear-gradient(90deg, rgba(155,85,27,0) 0%, rgba(199,138,74,0.62) 50%, rgba(155,85,27,0) 100%)",
      headerBg: "rgba(248, 244, 237, 0.80)",
      headerBorder: "rgba(36, 30, 22, 0.08)",
      footerBg: "#EDE4D6",
      footerBorder: "rgba(36, 30, 22, 0.10)",
    },
  },
};

/** Ordered list for CMS selectors. */
export const THEME_LIST: ThemeDefinition[] = THEME_IDS.map((id) => THEMES[id]);

/** Narrow an untrusted value (DB row, query param, cookie) to a real theme id. */
export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === "string" && (THEME_IDS as readonly string[]).includes(value);
}

/**
 * Resolve any untrusted value to a usable theme definition.
 * Never throws — a bad/missing DB value silently degrades to Solar Refined.
 */
export function resolveTheme(value: unknown): ThemeDefinition {
  return isThemeId(value) ? THEMES[value] : THEMES[FALLBACK_THEME_ID];
}

/** Map semantic token keys to their CSS custom property names. */
const CSS_VAR_NAMES: Record<keyof ThemeTokens, string> = {
  bg: "--bg",
  surface: "--surface",
  surfaceMuted: "--surface-muted",
  textPrimary: "--text-primary",
  textSecondary: "--text-secondary",
  border: "--border",
  accentPrimary: "--accent-primary",
  accentSecondary: "--accent-secondary",
  buttonBg: "--button-bg",
  buttonText: "--button-text",
  focus: "--focus",
  glow: "--glow",
  gradientHero: "--gradient-hero",
  gradientAccent: "--gradient-accent",
  headerBg: "--header-bg",
  headerBorder: "--header-border",
  footerBg: "--footer-bg",
  footerBorder: "--footer-border",
};

/**
 * Serialize a theme to a CSS declaration body.
 *
 * Rendered inline in the document head on the server so the very first paint
 * already uses the CMS theme — no flash, no hydration mismatch, no client fetch.
 */
export function themeToCssVars(theme: ThemeDefinition): string {
  const lines = (Object.keys(CSS_VAR_NAMES) as (keyof ThemeTokens)[]).map(
    (key) => `${CSS_VAR_NAMES[key]}: ${theme.tokens[key]};`
  );
  lines.push(`color-scheme: ${theme.mode};`);
  return lines.join(" ");
}
