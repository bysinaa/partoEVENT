"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

import Container from "./Container";
import type { CMSClient, Settings } from "@/lib/cms/data";

type ClientsProps = {
  clients: CMSClient[];
  settings?: Settings | null;
};

export default function Clients({ clients, settings }: ClientsProps) {
  const t = useTranslations("clients");

  if (!clients.length) {
    return null;
  }

  return (
    <section id="clients" className="relative py-32">
      <Container>
        <div className="text-center">
          <h2 className="section-title">{t("title")}</h2>
          <p className="section-subtitle mt-4">
            {settings?.tagline || t("subtitle")}
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <Link
              key={client.id}
              href={`/clients/${client.slug}`}
              className="card group p-6"
            >
              <div className="surface-muted text-accent flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl text-2xl font-bold">
                {client.logo ? (
                  <img
                    src={client.logo.url}
                    alt={client.logo.altText || client.logo.altTextFa || client.name}
                    className="h-full w-full object-contain p-2"
                    loading="lazy"
                  />
                ) : (
                  client.name.slice(0, 2).toUpperCase()
                )}
              </div>

              <h3 className="mt-6 text-xl font-semibold">
                {client.name}
              </h3>

              {client.description ? (
                <p className="text-muted mt-3 line-clamp-3 text-sm leading-6">
                  {client.description}
                </p>
              ) : null}

              {client.location ? (
                <p className="text-accent mt-4 text-sm">{client.location}</p>
              ) : null}

              <div className="text-muted mt-6 text-sm">
                {t("viewClient")} <span aria-hidden="true">&larr;</span>
              </div>
            </Link>

          ))}
        </div>
      </Container>
    </section>
  );
}
