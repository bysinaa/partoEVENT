import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";

import Navbar from "@/components/Navbar";
import Team from "@/components/Team";
import Footer from "@/components/Footer";
import { getSettings, getTeamMembers } from "@/lib/cms/data";
import { routing } from "@/i18n/routing";
import type { Locale } from "@/i18n/routing";

type Props = {
  params: Promise<{ locale: string }>;
};

/** Pre-generate a team page for each locale at build time. */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: Omit<Props, "children">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "teamPage" });
  return { title: t("title") };
}

export default async function TeamPage({ params }: Props) {
  const { locale } = await params;

  // Enable static rendering for this page.
  setRequestLocale(locale);

  const lang = locale as Locale;

  // Fetch the data this page needs from the custom CMS data layer.
  const [settings, team] = await Promise.all([
    getSettings(lang),
    getTeamMembers(lang),
  ]);

  return (
    <>
      <Navbar settings={settings} />
      <Team members={team} />
      <Footer settings={settings} />
    </>
  );
}
