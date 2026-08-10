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
      {/* Ambient light, themed via --glow. */}
      <div className="glow-orb absolute top-0 right-1/4 h-[400px] w-[500px] max-w-full opacity-40" />

      <Container>
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="section-title text-center">{t("title")}</h2>
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
                    <div className="surface-muted mb-5 inline-flex items-center justify-center rounded-xl p-3 transition-all duration-300">
                      <span className="text-accent text-3xl">◆</span>
                    </div>
                  ) : null}

                  <h3 className="mb-4 text-xl font-semibold">
                    {title ?? t("untitled")}
                  </h3>

                  <p className="text-muted leading-relaxed">
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