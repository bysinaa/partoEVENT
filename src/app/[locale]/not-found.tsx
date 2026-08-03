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
      <p className="text-amber-500">{t("code")}</p>
      <h1 className="mt-4 text-4xl font-bold text-white">{t("title")}</h1>
      <p className="mt-4 max-w-md text-zinc-400">{t("description")}</p>
      <Link
        href="/"
        className="mt-8 rounded-xl bg-amber-500 px-6 py-3 font-medium text-black transition hover:bg-amber-400"
      >
        {t("backHome")}
      </Link>
    </main>
  );
}
