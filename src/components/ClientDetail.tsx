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
            <div className="flex items-center gap-5">
              {client.logo ? (
                <img
                  src={client.logo.url}
                  alt={client.logo.altText || client.logo.altTextFa || name}
                  className="surface-muted h-20 w-20 rounded-2xl object-contain p-2"
                />
              ) : null}
              <h1 className="section-title">{name}</h1>
            </div>

            {location && (
              <p className="text-muted mt-3 text-sm">{location}</p>
            )}

            {client.website && (
              <a
                href={client.website}
                target="_blank"
                rel="noopener noreferrer"
                className="link-accent mt-4 inline-flex items-center gap-2 text-sm"
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
              <h2 className="mb-4 text-lg font-semibold">
                {t("servicesProvided")}
              </h2>
              <div className="flex flex-wrap gap-3">
                {client.services.map((service) => (
                  <span
                    key={service.id}
                    className="chip-accent rounded-full px-4 py-2 text-sm"
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
              <p className="text-muted leading-relaxed">{description}</p>
            </motion.div>
          )}
        </div>
      </Container>
    </section>
  );
}
