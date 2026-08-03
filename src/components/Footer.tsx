"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

import Container from "./Container";
import type { Settings } from "@/lib/cms/data";

type FooterProps = {
  /** Site settings; nullable when CMS is unreachable/unconfigured. */
  settings: Settings | null;
};

export default function Footer({ settings }: FooterProps) {
  const t = useTranslations("footer");

  const companyName = settings?.siteName;
  const brand = companyName ?? t("brand");
  const footerText = settings?.description ?? t("tagline");
  const phone = settings?.phone;
  const email = settings?.email;
  const instagram = settings?.socialLinks?.instagram;
  const address = settings?.address;

  const footerLinkClass =
    "text-[#6B6E78] transition-colors duration-300 hover:text-[#FFC54A]";

  return (
    <footer id="contact" className="section-glow-contact relative border-t border-[rgba(255,255,255,0.03)] py-20">
      {/* Ambient emerald glow orb */}
      <div className="glow-orb glow-orb-emerald absolute bottom-0 left-1/2 h-[300px] w-[600px] -translate-x-1/2 opacity-30" />

      <Container>
        <div className="relative z-10 grid gap-12 md:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <h3 className="text-2xl font-bold text-white">{brand}</h3>

            <p className="mt-4 leading-relaxed text-[#6B6E78]">{footerText}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            <h4 className="mb-5 text-sm font-semibold uppercase tracking-wider text-[#C6C8CE]">{t("pagesTitle")}</h4>

            <ul className="space-y-3 text-sm">
              <li>
                <a href="#home" className={footerLinkClass}>
                  {t("pages.home")}
                </a>
              </li>
              <li>
                <a href="#services" className={footerLinkClass}>
                  {t("pages.services")}
                </a>
              </li>
              <li>
                <a href="#projects" className={footerLinkClass}>
                  {t("pages.projects")}
                </a>
              </li>
              <li>
                <a href="#team" className={footerLinkClass}>
                  {t("pages.about")}
                </a>
              </li>
              <li>
                <a href="#contact" className={footerLinkClass}>
                  {t("pages.contact")}
                </a>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
          >
            <h4 className="mb-5 text-sm font-semibold uppercase tracking-wider text-[#C6C8CE]">{t("contactTitle")}</h4>

            <ul className="space-y-3 text-sm">
              {phone ? (
                <li>
                  <a href={`tel:${phone}`} className={footerLinkClass}>
                    {phone}
                  </a>
                </li>
              ) : null}
              {email ? (
                <li>
                  <a href={`mailto:${email}`} className={footerLinkClass}>
                    {email}
                  </a>
                </li>
              ) : null}
              {instagram ? (
                <li>
                  <a
                    href={instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={footerLinkClass}
                  >
                    Instagram
                  </a>
                </li>
              ) : null}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
          >
            <h4 className="mb-5 text-sm font-semibold uppercase tracking-wider text-[#C6C8CE]">{t("addressTitle")}</h4>

            <ul className="space-y-3 text-sm text-[#6B6E78]">
              {address ? <li>{address}</li> : null}
            </ul>
          </motion.div>
        </div>

        <div className="divider-glow mt-12" />

        <div className="mt-8 text-center text-sm text-[#6B6E78]">
          {t("rights", { brand })}
        </div>
      </Container>
    </footer>
  );
}
