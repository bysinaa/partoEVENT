"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

import Container from "./Container";
import type { CMSService } from "@/lib/cms/data";

type ServicesProps = {
  services: CMSService[];
};

export default function Services({ services }: ServicesProps) {
  const t = useTranslations("services");

  return (
    <section id="services" className="section-glow-services relative py-32">
      {/* Ambient cyan glow orb */}
      <div className="glow-orb glow-orb-cyan absolute top-0 right-1/4 h-[400px] w-[500px] opacity-40" />

      <Container>
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="section- title text-center">{t("title")}</h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="section-subtitle mb-16">
              {t("subtitle")}
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => {
              const title = service.title;
              const description = service.description;

              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  className="card-service group p-8"
                >
                  {service.iconId ? (
                    <div className="mb-5 inline-flex items-center justify-center rounded-xl bg-[rgba(0,217,255,0.06)] p-3 transition-all duration-300 group-hover:bg-[rgba(0,217,255,0.1)]">
                      <span className="text-3xl text-[#00D9FF]">◆</span>
                    </div>
                  ) : null}

                  <h3 className="mb-4 text-xl font-semibold text-white transition-colors duration-300">
                    {title ?? t("untitled")}
                  </h3>

                  <p className="leading-relaxed text-[#6B6E78] transition-colors duration-300 group-hover:text-[#C6C8CE]">
                    {description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}