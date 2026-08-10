import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";

import Navbar from "@/components/Navbar";
import Team from "@/components/Team";
import Footer from "@/components/Footer";
import { getSettings, getTeamMembers } from "@/lib/cms/data";
import type { Locale } from "@/i18n/routing";

type Props = {
  params: Promise<{ locale: string }>;
};

/**
 * Team members are CMS-driven, so this page must reflect the latest published
 * state on every request. It is therefore rendered per-request rather than
 * prerendered at build time (which is also why there is no `generateStaticParams`).
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({
  params,
}: Omit<Props, "children">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "teamPage" });
  return { title: t("title") };
}

export default async function TeamPage({ params }: Props) {
  const { locale } = await params;

  // Make the locale available to next-intl for this request.
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
