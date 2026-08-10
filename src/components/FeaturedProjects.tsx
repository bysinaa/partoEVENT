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
      <div className="glow-orb absolute top-1/4 right-0 h-[350px] w-[450px] max-w-full opacity-30" />

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
                  <div className="media-placeholder media-16x9 relative flex items-center justify-center overflow-hidden">
                    <div className="scrim-bottom pointer-events-none absolute inset-0 opacity-60" />
                    <div className="relative z-10 px-6 text-center text-5xl font-black opacity-20">
                      {title.slice(0, 2).toUpperCase()}
                    </div>
                  </div>

                  <div className="p-6">
                    <p className="text-accent text-sm font-medium">
                      {categoryTitle}
                    </p>

                    <h3 className="mt-2 text-xl font-semibold">
                      {title}
                    </h3>

                    {project.description ? (
                      <p className="text-muted mt-3 line-clamp-2 text-sm">
                        {project.description}
                      </p>
                    ) : null}

                    <div className="text-muted mt-6 inline-flex items-center gap-2 text-sm">
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