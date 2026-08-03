"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

import Container from "./Container";
import type { CMSTeamMember } from "@/lib/cms/data";

type TeamProps = {
  members: CMSTeamMember[];
};

export default function Team({ members }: TeamProps) {
  const t = useTranslations("team");

  return (
    <section id="team" className="section-glow-team relative py-32">
      {/* Ambient purple glow orb */}
      <div className="glow-orb glow-orb-purple absolute top-0 left-0 h-[400px] w-[500px] opacity-30" />

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

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((member, index) => {
              const name = member.name;
              const position = member.position;
              const biography = member.biography;

              return (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  className="card-team group"
                >
                  {/* Portrait photo placeholder */}
                  <div className="relative mx-auto mt-8 aspect-[3/4] w-40 shrink-0 overflow-hidden rounded-2xl bg-[#1E1F27]">
                    {member.photoId ? (
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="text-4xl text-[#7E5BFF]">👤</span>
                      </div>
                    ) : null}
                  </div>

                  <div className="p-6 text-center">
                    <h3 className="text-xl font-semibold text-white">{name}</h3>

                    <p className="mt-1 text-sm font-medium text-[#7E5BFF]">{position}</p>

                    {biography ? (
                      <p className="mt-4 text-sm leading-relaxed text-[#6B6E78]">
                        {biography}
                      </p>
                    ) : null}

                    {(member.instagram || member.linkedin) && (
                      <div className="mt-5 flex justify-center gap-4 text-sm">
                        {member.instagram ? (
                          <a
                            href={member.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#6B6E78] transition-colors duration-300 hover:text-[#7E5BFF]"
                          >
                            Instagram
                          </a>
                        ) : null}
                        {member.linkedin ? (
                          <a
                            href={member.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#6B6E78] transition-colors duration-300 hover:text-[#7E5BFF]"
                          >
                            LinkedIn
                          </a>
                        ) : null}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}