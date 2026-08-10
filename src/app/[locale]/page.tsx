import { setRequestLocale } from "next-intl/server";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import FeaturedProjects from "@/components/FeaturedProjects";
import Clients from "@/components/Clients";
import Stats from "@/components/Stats";
import Footer from "@/components/Footer";
import {
  getClients,
  getFeaturedProjects,
  getHomePageData,
  getServices,
  getSettings,
} from "@/lib/cms/data";
import type { Locale } from "@/i18n/routing";

type Props = {
  params: Promise<{ locale: string }>;
};

/**
 * CMS-driven content must reflect the latest published state on every request,
 * so this route is never prerendered or served from the full route cache.
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage({ params }: Props) {
  const { locale } = await params;

  // Make the locale available to next-intl for this request.
  setRequestLocale(locale);


  const lang = locale as Locale;

  // Fetch all homepage content in parallel from custom CMS.
  const [homePageData, settings, services, projects, clients] = await Promise.all([
    getHomePageData(lang),
    getSettings(lang),
    getServices(lang),
    getFeaturedProjects(lang),
    getClients(lang),
  ]);

  return (
    <>
      <Navbar settings={settings} />
      <Hero data={homePageData.hero} />
      <Services services={services} />
      <FeaturedProjects projects={projects} />
      <Clients clients={clients} settings={settings} />
      <Stats stats={homePageData.stats} />
      <Footer settings={settings} />
    </>
  );
}