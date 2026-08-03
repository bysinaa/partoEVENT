"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

import Container from "./Container";
import type { CMSClient } from "@/lib/cms/data";

type ClientDetailProps = {
  client: CMSClient;
};

export default function ClientDetail({ client }: ClientDetailProps) {
  const t = useTranslations("clientDetail");

  const name = client.name;
  const description = client.description;
  const location = client.location;

  return (
    <section className="section-glow-contact relative py-32">
      <Container>
        <div className="relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="mb-12"
          >
            <h1 className="text-4xl font-bold text-white md:text-5xl">{name}</h1>

            {location && (
              <p className="mt-3 text-sm text-[#6B6E78]">{location}</p>
            )}

            {client.website && (
              <a
                href={client.website}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm text-[#FFC54A] transition-colors duration-300 hover:text-[#FFD976]"
              >
                {client.website}
                <span>&rarr;</span>
              </a>
            )}
          </motion.div>

          {/* Services */}
          {client.services && client.services.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="mb-12"
            >
              <h2 className="mb-4 text-lg font-semibold text-[#C6C8CE]">
                {t("servicesProvided")}
              </h2>
              <div className="flex flex-wrap gap-3">
                {client.services.map((service) => (
                  <span
                    key={service.id}
                    className="rounded-full border border-[rgba(0,217,255,0.2)] bg-[rgba(0,217,255,0.06)] px-4 py-2 text-sm text-[#00D9FF]"
                  >
                    {service.title}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          {/* Description */}
          {description && description.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="mb-16 max-w-3xl"
            >
              <p className="text-[#8B8D96] leading-relaxed">{description}</p>
            </motion.div>
          )}
        </div>
      </Container>
    </section>
  );
}