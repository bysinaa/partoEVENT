"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

import Container from "./Container";
import type { CMSProject } from "@/lib/cms/data";

type FeaturedProjectsProps = {
  projects: CMSProject[];
};

export default function FeaturedProjects({ projects }: FeaturedProjectsProps) {
  const t = useTranslations("projects");

  return (
    <section id="projects" className="section-glow-projects relative py-32">
      <div className="glow-orb glow-orb-magenta absolute top-1/4 right-0 h-[350px] w-[450px] opacity-30" />

      <Container>
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="section-title text-center">{t("title")}</h2>

            <p className="section-subtitle mt-4">{t("subtitle")}</p>
          </motion.div>

          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, index) => {
              const title = project.title || t("untitled");
              const categoryTitle =
                project.clients[0]?.name || project.clientName || project.year || "";

              return (
                <motion.article
                  key={project.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.7,
                    delay: index * 0.08,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="card-project group"
                >
                  <div className="relative flex h-56 items-center justify-center overflow-hidden bg-gradient-to-br from-[#1E1F27] via-[#252733] to-[#17181E]">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#17181E] via-transparent to-transparent opacity-60" />
                    <div className="relative z-10 px-6 text-center text-5xl font-black text-white/10">
                      {title.slice(0, 2).toUpperCase()}
                    </div>
                  </div>

                  <div className="p-6">
                    <p className="text-sm font-medium text-[#FF4FD8]">
                      {categoryTitle}
                    </p>

                    <h3 className="mt-2 text-xl font-semibold text-white transition-colors duration-300">
                      {title}
                    </h3>

                    {project.description ? (
                      <p className="mt-3 line-clamp-2 text-sm text-[#8A8D97]">
                        {project.description}
                      </p>
                    ) : null}

                    <div className="mt-6 inline-flex items-center gap-2 text-sm text-[#6B6E78] transition-colors duration-300 group-hover:text-[#C6C8CE]">
                      {t("viewProject")}
                      <span className="transition-transform duration-300 group-hover:translate-x-1">
                        &larr;
                      </span>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}