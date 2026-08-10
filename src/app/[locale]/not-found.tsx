"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

/**
 * Locale-scoped 404 page.
 *
 * This component renders content only — no `<html>`/`<body>` tags — so it
 * inherits the document shell from `app/[locale]/layout.tsx`. Rendering its own
 * `<html>` would cause Next.js to inject `DefaultLayout` as a wrapper, producing
 * nested `<html>` elements and a hydration error.
 *
 * It is a client component because `next-intl`'s `useTranslations` reads from the
 * `NextIntlClientProvider` established in the locale layout, and the locale-aware
 * `Link` relies on client routing.
 */
export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="text-accent">{t("code")}</p>
      <h1 className="section-title mt-4">{t("title")}</h1>
      <p className="section-subtitle mt-4">{t("description")}</p>
      <Link
        href="/"
        className="btn-primary mt-8"
      >
        {t("backHome")}
      </Link>
    </main>
  );
}
