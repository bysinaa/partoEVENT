import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";

import Navbar from "@/components/Navbar";
import ClientDetail from "@/components/ClientDetail";
import Footer from "@/components/Footer";
import { getSettings, getClientBySlug } from "@/lib/cms/data";
import type { Locale } from "@/i18n/routing";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

/**
 * Client pages are CMS-driven and their slugs change as content is published,
 * so they are rendered per-request instead of being prerendered at build time.
 * The previous `generateStaticParams` only emitted a "placeholder" slug, which
 * produced no useful prerendered pages anyway.
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({
  params,
}: Omit<Props, "children">): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "clientDetail" });
  const client = await getClientBySlug(locale as Locale, slug);

  // Prefer the real client name; fall back to the slug if the record is missing.
  return { title: `${t("clientPage")} | ${client?.name ?? slug}` };
}

export default async function ClientPage({ params }: Props) {
  const { locale, slug } = await params;

  // Make the locale available to next-intl for this request.
  setRequestLocale(locale);

  const lang = locale as Locale;

  // Fetch the data this page needs.
  const [settings, client] = await Promise.all([
    getSettings(lang),
    getClientBySlug(lang, slug),
  ]);

  if (!client) {
    notFound();
  }

  return (
    <>
      <Navbar settings={settings} />
      <ClientDetail client={client} />
      <Footer settings={settings} />
    </>
  );
}
