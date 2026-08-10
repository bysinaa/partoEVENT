// Presentation metadata for the Settings panel.
//
// Only swatch colors and labels live here — the authoritative token values are
// in the frontend's src/lib/theme/themes.ts. These three swatches per theme are
// enough to recognize a theme in a picker; duplicating the full token set would
// create a second source of truth that silently drifts.

export type ThemeOption = {
  id: string;
  label: string;
  labelFa: string;
  description: string;
  descriptionFa: string;
  /** [background, surface, accent] — shown as a swatch trio. */
  swatches: [string, string, string];
  mode: "light" | "dark";
};

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: "solar-refined",
    label: "Solar Refined",
    labelFa: "خورشیدی ظریف",
    description: "Warm amber on ivory with charcoal text. The default.",
    descriptionFa: "کهربایی گرم روی عاج با متن ذغالی. حالت پیش‌فرض.",
    swatches: ["#FCFAF6", "#FFFFFF", "#C8862B"],
    mode: "light",
  },
  {
    id: "warm-light",
    label: "Warm Light",
    labelFa: "نور گرم",
    description: "2700K feel — soft, low-contrast warmth.",
    descriptionFa: "حس ۲۷۰۰ کلوین — گرمای نرم و کم‌کنتراست.",
    swatches: ["#FBF6EF", "#FFFDFA", "#B4722A"],
    mode: "light",
  },
  {
    id: "deep-night",
    label: "Deep Night",
    labelFa: "شب عمیق",
    description: "Deep blue-black with amber rays.",
    descriptionFa: "سیاه آبی عمیق با پرتوهای کهربایی.",
    swatches: ["#0E1116", "#161B22", "#E0A94A"],
    mode: "dark",
  },
  {
    id: "minimal-mono",
    label: "Minimal Mono",
    labelFa: "تک‌رنگ مینیمال",
    description: "Neutral greyscale with a single restrained accent.",
    descriptionFa: "خاکستری بی‌طرف با یک رنگ تأکیدی محدود.",
    swatches: ["#FAFAFA", "#FFFFFF", "#2E2E2E"],
    mode: "light",
  },
  {
    id: "aurora-green",
    label: "Aurora Green",
    labelFa: "سبز شفق",
    description: "Cool teal-green light on near-black.",
    descriptionFa: "نور سبز-فیروزه‌ای سرد روی تقریباً سیاه.",
    swatches: ["#0B1412", "#12201C", "#4FBF9A"],
    mode: "dark",
  },
  {
    id: "soft-lilac",
    label: "Soft Lilac",
    labelFa: "یاسی نرم",
    description: "Pale violet surfaces with muted plum accents.",
    descriptionFa: "سطوح بنفش روشن با تأکیدهای آلویی ملایم.",
    swatches: ["#FAF7FD", "#FFFFFF", "#7C5CA8"],
    mode: "light",
  },
  {
    id: "steel-blue",
    label: "Steel Blue",
    labelFa: "آبی فولادی",
    description: "6500K feel — clear, technical, cool.",
    descriptionFa: "حس ۶۵۰۰ کلوین — شفاف، فنی و سرد.",
    swatches: ["#F5F8FB", "#FFFFFF", "#2F6690"],
    mode: "light",
  },
  {
    id: "sand-dune",
    label: "Sand Dune",
    labelFa: "تپه شنی",
    description: "Desert sand and clay with terracotta light.",
    descriptionFa: "شن و رس کویری با نور آجری.",
    swatches: ["#F7F2E9", "#FFFCF6", "#A9663C"],
    mode: "light",
  },
];

export const TYPOGRAPHY_PRESET_OPTIONS = [
  { value: "editorial", label: "Editorial — generous, high-contrast headings", labelFa: "ادیتوریال — تیترهای پرکنتراست" },
  { value: "grotesk", label: "Grotesk — tight, neutral, modern", labelFa: "گروتسک — فشرده، بی‌طرف، مدرن" },
  { value: "humanist", label: "Humanist — open, friendly, readable", labelFa: "اومانیست — باز، خوانا و دوستانه" },
];

export const FA_FONT_OPTIONS = [
  { value: "peyda", label: "Peyda", labelFa: "پیدا" },
  { value: "peydaTight", label: "Peyda (tight tracking)", labelFa: "پیدا (فشرده)" },
  { value: "systemFa", label: "System Persian", labelFa: "فونت سیستم" },
];

export const EN_FONT_OPTIONS = [
  { value: "peydaLatin", label: "Peyda Latin", labelFa: "پیدا لاتین" },
  { value: "systemSans", label: "System Sans", labelFa: "سنس سیستم" },
  { value: "systemSerif", label: "System Serif", labelFa: "سریف سیستم" },
  { value: "systemMono", label: "System Mono", labelFa: "مونو سیستم" },
];

/** Theme-specific typography defaults, mirroring the frontend presets. */
export const THEME_DEFAULT_PRESET: Record<string, string> = {
  "solar-refined": "editorial",
  "warm-light": "humanist",
  "deep-night": "grotesk",
  "minimal-mono": "grotesk",
  "aurora-green": "grotesk",
  "soft-lilac": "humanist",
  "steel-blue": "grotesk",
  "sand-dune": "editorial",
};
