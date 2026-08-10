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

  const footerLinkClass = "footer-link";

  return (
    <footer
      id="contact"
      className="footer-shell section-glow-contact relative py-20"
    >
      {/* Ambient light, themed via --glow. */}
      <div className="glow-orb absolute bottom-0 left-1/2 h-[300px] w-[600px] max-w-full -translate-x-1/2 opacity-30" />

      <Container>
        <div className="relative z-10 grid gap-12 md:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <h3 className="footer-heading text-2xl font-bold">{brand}</h3>

            <p className="footer-text mt-4 leading-relaxed">{footerText}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            <h4 className="eyebrow mb-5">{t("pagesTitle")}</h4>

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
            <h4 className="eyebrow mb-5">{t("contactTitle")}</h4>

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
            <h4 className="eyebrow mb-5">{t("addressTitle")}</h4>

            <ul className="footer-text space-y-3 text-sm">
              {address ? <li>{address}</li> : null}
            </ul>
          </motion.div>
        </div>

        <div className="divider-glow mt-12" />

        <div className="footer-text mt-8 text-center text-sm">
          {t("rights", { brand })}
        </div>
      </Container>
    </footer>
  );
}
