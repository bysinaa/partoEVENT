import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";

import Navbar from "@/components/Navbar";
import ClientDetail from "@/components/ClientDetail";
import Footer from "@/components/Footer";
import { getSettings, getClientBySlug } from "@/lib/cms/data";
import { routing } from "@/i18n/routing";
import type { Locale } from "@/i18n/routing";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

/** Pre-generate a client page for each locale at build time. */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale, slug: "placeholder" }));
}

export async function generateMetadata({
  params,
}: Omit<Props, "children">): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "clientDetail" });
  return { title: `${t("clientPage")} | ${slug}` };
}

export default async function ClientPage({ params }: Props) {
  const { locale, slug } = await params;

  // Enable static rendering for this page.
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