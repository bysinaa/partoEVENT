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
            {settings?.tagline || settings?.taglineEn || t("subtitle")}
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <Link
              key={client.id}
              href={`/clients/${client.slug}`}
              className="group rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-[#FF4FD8]/40 hover:bg-white/[0.06]"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF4FD8]/20 to-[#FFC54A]/20 text-2xl font-bold text-white">
                {client.name.slice(0, 2).toUpperCase()}
              </div>

              <h3 className="mt-6 text-xl font-semibold text-white">
                {client.name}
              </h3>

              {client.description ? (
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#8A8D97]">
                  {client.description}
                </p>
              ) : null}

              {client.location ? (
                <p className="mt-4 text-sm text-[#FFC54A]">{client.location}</p>
              ) : null}

              <div className="mt-6 text-sm text-[#6B6E78] transition group-hover:text-white">
                {t("viewClient")} &larr;
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}