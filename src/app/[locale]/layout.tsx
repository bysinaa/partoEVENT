import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { getSettings } from "@/lib/cms/data";
import { getAppearance } from "@/lib/cms/appearance";
import { themeToCssVars } from "@/lib/theme/themes";
import { typographyToCssVars } from "@/lib/theme/typography";
import type { Locale } from "@/i18n/routing";
import "../globals.css";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: Omit<Props, "children">): Promise<Metadata> {
  const { locale } = await params;
  const lang = locale as Locale;
  const t = await getTranslations({ locale, namespace: "metadata" });
  const settings = await getSettings(lang);

  const siteName = settings?.siteName || t("title");
  const description = settings?.description || t("description");

  return {
    title: {
      default: siteName,
      template: `%s | ${siteName}`,
    },
    description,
    icons: { icon: "/brand/parto-monochrome.png?v=1" },
    keywords: t("keywords"),
    authors: [{ name: "Parto" }],
    openGraph: {
      title: siteName,
      description,
      type: "website",
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  // The active theme lives in the database. Resolving it on the server and
  // inlining the variables means the first paint is already correct: no theme
  // flash, no client-side fetch, and no hydration mismatch (the markup is
  // identical on server and client because nothing here reads browser state).
  const { theme, typography } = await getAppearance();

  const themeCss = `:root { ${themeToCssVars(theme)} ${typographyToCssVars(
    typography,
    locale
  )} }`;

  return (
    <html
      lang={locale}
      dir={locale === "fa" ? "rtl" : "ltr"}
      data-theme={theme.id}
      data-theme-mode={theme.mode}
      suppressHydrationWarning
    >
      <head>
        {/* Inlined rather than linked so it cannot arrive after first paint. */}
        <style
          id="parto-theme"
          dangerouslySetInnerHTML={{ __html: themeCss }}
        />
      </head>
      <body className="min-h-screen antialiased">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
