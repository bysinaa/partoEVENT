"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import Image from "next/image";

import Container from "./Container";

type HeroData = {
  title: string;
  subtitle: string;
};

type HeroProps = {
  /** Hero data from custom CMS */
  data: HeroData | null;
};

/**
 * Hero section.
 *
 * Content is sourced from the custom CMS API. When data is missing,
 * it falls back to the corresponding `messages` translation key.
 */
export default function Hero({ data }: HeroProps) {
  const t = useTranslations("hero");

  const title = data?.title ?? t("titleLine1");
  const subtitle = data?.subtitle ?? t("description");

  return (
    <section
      id="home"
      className="section-glow-hero relative flex min-h-screen items-center overflow-hidden"
    >
      {/* Ambient light. The orbs use the theme's --glow, so in light
          themes they read as warm haze and in dark themes as rays,
          without the component knowing which theme is active. */}
      <div className="glow-orb animate-pulse-glow absolute -top-32 left-1/2 h-[500px] w-[800px] max-w-full -translate-x-1/2 opacity-60" />
      <div className="glow-orb absolute top-1/3 right-0 h-[300px] w-[400px] max-w-full opacity-30" />
      <div className="glow-orb absolute bottom-0 left-1/4 h-[250px] w-[350px] max-w-full opacity-20" />

      <Container>
        <div className="relative z-10 grid w-full items-center gap-8 lg:grid-cols-2">
          <div className="max-w-xl">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="chip-accent mb-8 inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium">
                <span className="dot-accent animate-pulse-glow inline-block h-1.5 w-1.5 rounded-full" />
                {t("badge")}
              </span>
            </motion.div>

            <h1 className="sr-only">{title}</h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="section-subtitle mt-8"
            >
              {subtitle}
            </motion.p>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="mt-12 flex flex-wrap gap-4"
            >
              <button className="btn-primary">
                {t("primaryCta")}
              </button>
              <button className="btn-secondary">
                {t("secondaryCta")}
              </button>
            </motion.div>
          </div>

          {/* Brand mark */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="flex justify-center"
          >
            <Image
              src="/brand/parto-orange.png"
              alt=""
              width={4500}
              height={4500}
              className="h-56 w-56 scale-[1.35] object-contain sm:h-72 sm:w-72 lg:h-80 lg:w-80"
              priority
            />
          </motion.div>
        </div>
      </Container>

      {/* Bottom fade into the page background, so the hero meets the next
          section without a hard edge in any theme. */}
      <div className="scrim-bottom pointer-events-none absolute bottom-0 left-0 right-0 h-32" />
    </section>
  );
}
