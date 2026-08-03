"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

import Container from "./Container";
import type { CMSStats } from "@/lib/cms/data";

type StatsProps = {
  stats: CMSStats | null;
};

export default function Stats({ stats }: StatsProps) {
  const t = useTranslations("stats");

  // Convert CMSStats to display items
  const items = stats
    ? [
        { value: stats.clients, label: t("clients") },
        { value: stats.projects, label: t("projects") },
        { value: stats.teamMembers, label: t("team") },
        { value: stats.posts, label: t("posts") },
      ]
    : [];

  return (
    <section id="stats" className="section-glow-about relative py-32">
      <Container>
        <div className="relative z-10 grid gap-6 md:grid-cols-4">
          {items.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="card-stats group relative overflow-hidden rounded-2xl p-8 text-center"
            >
              <div className="absolute top-0 left-1/2 h-px w-3/5 -translate-x-1/2 bg-gradient-to-r from-transparent via-[rgba(255,197,74,0.3)] to-transparent" />

              <div className="text-5xl font-bold tracking-tight text-[#FFC54A] transition-colors duration-300 group-hover:text-[#FFD976]">
                {item.value}
              </div>

              <p className="mt-3 text-[#C6C8CE]">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}