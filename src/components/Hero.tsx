"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

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
      {/* Cinematic dark overlay for depth */}
      <div className="absolute inset-0 -z-[5] bg-gradient-to-b from-[#0B0B0F]/40 via-[#0B0B0F]/60 to-[#0B0B0F]" />

      {/* Ambient gold glow orbs */}
      <div className="glow-orb glow-orb-gold animate-pulse-glow absolute -top-32 left-1/2 h-[500px] w-[800px] -translate-x-1/2 opacity-60" />
      <div className="glow-orb glow-orb-gold absolute top-1/3 right-0 h-[300px] w-[400px] opacity-30" />
      <div className="glow-orb glow-orb-gold absolute bottom-0 left-1/4 h-[250px] w-[350px] opacity-20" />

      <Container>
        <div className="relative z-10 max-w-4xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="mb-8 inline-flex items-center gap-2 rounded-full border border-[rgba(255,197,74,0.15)] bg-[rgba(255,197,74,0.06)] px-5 py-2 text-sm font-medium text-[#FFC54A] backdrop-blur-px">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#FFC54A] animate-pulse-glow" />
              {t("badge")}
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 text-5xl font-bold leading-[1.05] tracking--tight md:text-7xl lg:text-8xl"
          >
            <span className="text-gradient-white">{title}</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 max-w-2xl text-lg leading-7 text-[#C6C8CE]"
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
      </Container>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0B0B0F] to-transparent" />
    </section>
  );
}