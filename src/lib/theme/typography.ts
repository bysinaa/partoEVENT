/**
 * Parto — Typography System
 *
 * Font strategy:
 *  - The only webfont shipped with this project is **Peyda** (`public/fonts/peyda`),
 *    which covers both Persian and Latin glyphs. No external/CDN fonts are loaded.
 *  - Latin-first stacks fall back to the platform UI serif/sans, so English text
 *    can have a distinct personality per theme without any extra network cost.
 *  - Every stack ends in a generic family so text never renders in a fallback
 *    that lacks Persian coverage.
 *
 * A "preset" bundles the four CMS-selectable slots (Persian heading, Persian body,
 * English heading, English body) plus the metric adjustments that make each
 * personality read correctly. Editors may override any individual slot in CMS.
 */

/** Concrete font stacks an editor can pick per slot. */
export const FONT_STACKS = {
  // ── Persian / Arabic script ──────────────────────────────────────────────
  peyda: `"Peyda", "Segoe UI", Tahoma, sans-serif`,
  peydaTight: `"Peyda", "Segoe UI", Tahoma, sans-serif`,
  systemFa: `"Segoe UI", Tahoma, "Iranian Sans", sans-serif`,

  // ── Latin script ─────────────────────────────────────────────────────────
  peydaLatin: `"Peyda", system-ui, -apple-system, "Segoe UI", sans-serif`,
  systemSans: `system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`,
  systemSerif: `"Iowan Old Style", "Palatino Linotype", Palatino, "Book Antiqua", Georgia, serif`,
  systemMono: `ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace`,
} as const;

export type FontStackKey = keyof typeof FONT_STACKS;

export const FONT_STACK_KEYS = Object.keys(FONT_STACKS) as FontStackKey[];

/** Human labels for the CMS dropdowns. */
export const FONT_STACK_LABELS: Record<FontStackKey, { en: string; fa: string }> = {
  peyda: { en: "Peyda", fa: "پیدا" },
  peydaTight: { en: "Peyda (Tight)", fa: "پیدا (فشرده)" },
  systemFa: { en: "System Persian", fa: "پیش‌فرض سیستم" },
  peydaLatin: { en: "Peyda Latin", fa: "پیدا لاتین" },
  systemSans: { en: "System Sans", fa: "سنس سیستم" },
  systemSerif: { en: "System Serif", fa: "سریف سیستم" },
  systemMono: { en: "System Mono", fa: "مونو سیستم" },
};

/** Which slots accept which stacks — prevents picking a Latin-only face for Persian. */
export const FA_FONT_KEYS: FontStackKey[] = ["peyda", "peydaTight", "systemFa"];
export const EN_FONT_KEYS: FontStackKey[] = [
  "peydaLatin",
  "systemSans",
  "systemSerif",
  "systemMono",
];

export interface TypographyMetrics {
  /** Heading letter-spacing, e.g. "-0.02em". */
  headingTracking: string;
  /** Heading line-height (unitless). */
  headingLeading: string;
  /** Heading weight. */
  headingWeight: string;
  /** Body line-height (unitless). */
  bodyLeading: string;
  /** Body weight. */
  bodyWeight: string;
  /** Uppercase eyebrow/label tracking. */
  eyebrowTracking: string;
}

export interface TypographyPreset {
  key: string;
  labelEn: string;
  labelFa: string;
  faHeading: FontStackKey;
  faBody: FontStackKey;
  enHeading: FontStackKey;
  enBody: FontStackKey;
  metrics: TypographyMetrics;
}

export const TYPOGRAPHY_PRESETS: Record<string, TypographyPreset> = {
  /** Editorial: serif English headings over Peyda body. Warm, magazine-like. */
  editorial: {
    key: "editorial",
    labelEn: "Editorial",
    labelFa: "تحریریه",
    faHeading: "peyda",
    faBody: "peyda",
    enHeading: "systemSerif",
    enBody: "systemSans",
    metrics: {
      headingTracking: "-0.02em",
      headingLeading: "1.08",
      headingWeight: "700",
      bodyLeading: "1.75",
      bodyWeight: "400",
      eyebrowTracking: "0.12em",
    },
  },

  /** Grotesk: tight neutral sans throughout. Technical, Swiss, minimal. */
  grotesk: {
    key: "grotesk",
    labelEn: "Grotesk",
    labelFa: "گروتسک",
    faHeading: "peydaTight",
    faBody: "peyda",
    enHeading: "systemSans",
    enBody: "systemSans",
    metrics: {
      headingTracking: "-0.035em",
      headingLeading: "1.02",
      headingWeight: "700",
      bodyLeading: "1.65",
      bodyWeight: "400",
      eyebrowTracking: "0.16em",
    },
  },

  /** Humanist: softer, more open. Friendlier corporate voice. */
  humanist: {
    key: "humanist",
    labelEn: "Humanist",
    labelFa: "اومانیست",
    faHeading: "peyda",
    faBody: "peyda",
    enHeading: "peydaLatin",
    enBody: "systemSans",
    metrics: {
      headingTracking: "-0.012em",
      headingLeading: "1.14",
      headingWeight: "600",
      bodyLeading: "1.8",
      bodyWeight: "400",
      eyebrowTracking: "0.1em",
    },
  },
};

export const TYPOGRAPHY_PRESET_KEYS = Object.keys(TYPOGRAPHY_PRESETS);

export const FALLBACK_TYPOGRAPHY_PRESET = "editorial";

export function isFontStackKey(value: unknown): value is FontStackKey {
  return typeof value === "string" && value in FONT_STACKS;
}

export function resolveTypographyPreset(value: unknown): TypographyPreset {
  return typeof value === "string" && value in TYPOGRAPHY_PRESETS
    ? TYPOGRAPHY_PRESETS[value]
    : TYPOGRAPHY_PRESETS[FALLBACK_TYPOGRAPHY_PRESET];
}

/** CMS-overridable font slots. Any invalid/missing entry falls back to the preset. */
export interface FontOverrides {
  faHeading?: unknown;
  faBody?: unknown;
  enHeading?: unknown;
  enBody?: unknown;
}

export interface ResolvedTypography {
  preset: TypographyPreset;
  faHeading: string;
  faBody: string;
  enHeading: string;
  enBody: string;
  metrics: TypographyMetrics;
}

/**
 * Merge a theme's default preset with per-slot CMS overrides.
 * Overrides are validated against the *allowed keys for that script*, so an
 * editor can never assign a Latin-only serif to the Persian heading slot.
 */
export function resolveTypography(
  presetKey: unknown,
  overrides: FontOverrides = {}
): ResolvedTypography {
  const preset = resolveTypographyPreset(presetKey);

  const pick = (
    value: unknown,
    allowed: FontStackKey[],
    fallback: FontStackKey
  ): string => {
    const key = isFontStackKey(value) && allowed.includes(value) ? value : fallback;
    return FONT_STACKS[key];
  };

  return {
    preset,
    faHeading: pick(overrides.faHeading, FA_FONT_KEYS, preset.faHeading),
    faBody: pick(overrides.faBody, FA_FONT_KEYS, preset.faBody),
    enHeading: pick(overrides.enHeading, EN_FONT_KEYS, preset.enHeading),
    enBody: pick(overrides.enBody, EN_FONT_KEYS, preset.enBody),
    metrics: preset.metrics,
  };
}

/**
 * Serialize typography to CSS custom properties for one locale.
 *
 * Only the active locale's stacks are bound to `--font-heading` / `--font-body`,
 * so components stay locale-agnostic and RTL/LTR is handled purely by `dir`.
 */
export function typographyToCssVars(
  typography: ResolvedTypography,
  locale: string
): string {
  const isFa = locale === "fa";
  const { metrics } = typography;

  return [
    `--font-heading: ${isFa ? typography.faHeading : typography.enHeading};`,
    `--font-body: ${isFa ? typography.faBody : typography.enBody};`,
    `--font-heading-fa: ${typography.faHeading};`,
    `--font-body-fa: ${typography.faBody};`,
    `--font-heading-en: ${typography.enHeading};`,
    `--font-body-en: ${typography.enBody};`,
    `--heading-tracking: ${metrics.headingTracking};`,
    `--heading-leading: ${metrics.headingLeading};`,
    `--heading-weight: ${metrics.headingWeight};`,
    `--body-leading: ${metrics.bodyLeading};`,
    `--body-weight: ${metrics.bodyWeight};`,
    `--eyebrow-tracking: ${metrics.eyebrowTracking};`,
  ].join(" ");
}
