"use client";

import { useEffect, useState, useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";

import Container from "./Container";
import LocaleSwitcher from "./LocaleSwitcher";
import { Link, usePathname } from "@/i18n/navigation";
import type { Settings } from "@/lib/cms/data";

type NavbarProps = {
  settings: Settings | null;
};

type NavItem = {
  id: string;
  labelKey: string;
  href?: string;
};

const SECTIONS: NavItem[] = [
  { id: "home", labelKey: "home" },
  { id: "services", labelKey: "services" },
  { id: "projects", labelKey: "projects" },
  { id: "clients", labelKey: "clients" },
  { id: "team", labelKey: "team", href: "/team" },
  { id: "contact", labelKey: "contact" },
];

const getSectionHref = (id: string) => (id === "home" ? "/" : `/#${id}`);

export default function Navbar({ settings }: NavbarProps) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const locale = useLocale();
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("home");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const companyName = settings?.siteName || (locale === "fa" ? "پرتو" : settings?.siteNameEn || "Parto");
  const isTeamPage = pathname === "/team";

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 10);

    if (isTeamPage) {
      setActive("team");
      return;
    }

    for (const { id, href } of SECTIONS) {
      if (href) continue;

      const el = document.getElementById(id);
      if (!el) continue;

      const rect = el.getBoundingClientRect();
      if (rect.top <= 120 && rect.bottom >= 120) {
        setActive(id);
      }
    }
  }, [isTeamPage]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(handleScroll);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const logoUrl = settings?.logo;

  return (
    <>
      <header
        className={`fixed right-0 left-0 top-0 z-50 transition-all duration-500 ${
          scrolled
            ? "py-2"
            : "py-4"
        }`}
      >
        {/* Outer glow line on scroll */}
        <div
          className={`absolute bottom-0 left-0 h-px transition-all duration-700 ${
            scrolled
              ? "right-0 bg-gradient-to-r from-transparent via-[rgba(255,197,74,0.3)] to-transparent"
              : "right-1/2 left-1/2 bg-transparent"
          }`}
        />

        {/* Glass container */}
        <div
          className={`mx-4 rounded-2xl transition-all duration-500 md:mx-6 lg:mx-auto lg:max-w-7xl ${
            scrolled
              ? "border border-[rgba(255,255,255,0.06)] bg-[rgba(11,11,15,0.8)] shadow-[0_8px_32px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur-xl"
              : "bg-transparent border border-transparent"
          }`}
        >
          <Container>
            <nav className="flex h-16 items-center justify-between gap-4">
              {/* Logo */}
              <Link href="/" className="group flex items-center gap-3">
                {logoUrl ? (
                  <div className="relative">
                    <Image
                      src={logoUrl}
                      alt={companyName ?? ""}
                      width={36}
                      height={36}
                      className="h-9 w-auto transition-all duration-300 group-hover:scale-110"
                    />
                    {/* Subtle glow behind logo */}
                    <div className="absolute -inset-2 rounded-full bg-[rgba(255,197,74,0.15)] opacity-0 blur-lg transition-opacity duration-500 group-hover:opacity-100" />
                  </div>
                ) : (
                  <span className="text-gradient-gold text-xl font-bold">{companyName}</span>
                )}
              </Link>

              {/* Desktop navigation */}
              <ul className="relative hidden items-center gap-1 md:flex">
                {SECTIONS.map((item) => {
                  const isActive = active === item.id;
                  const isHovered = hoveredItem === item.id;

                  return (
                    <li key={item.id} className="relative">
                      {item.href ? (
                        <Link
                          href={item.href}
                          onMouseEnter={() => setHoveredItem(item.id)}
                          onMouseLeave={() => setHoveredItem(null)}
                          className={`relative z-10 block rounded-xl px-4 py-2 text-sm transition-all duration-300 ${
                            isActive
                              ? "text-white"
                              : "text-[#8B8D96] hover:text-[#DADADA]"
                          }`}
                        >
                          {t(item.labelKey)}
                        </Link>
                      ) : (
                        <Link
                          href={getSectionHref(item.id)}
                          onMouseEnter={() => setHoveredItem(item.id)}
                          onMouseLeave={() => setHoveredItem(null)}
                          className={`relative z-10 block rounded-xl px-4 py-2 text-sm transition-all duration-300 ${
                            isActive
                              ? "text-white"
                              : "text-[#8B8D96] hover:text-[#DADADA]"
                          }`}
                        >
                          {t(item.labelKey)}
                        </Link>
                      )}

                      {/* Active/hover indicator pill */}
                      {(isActive || isHovered) && (
                        <div
                          className={`absolute inset-0 rounded-xl transition-all duration-300 ${
                            isActive
                              ? "bg-[rgba(255,197,74,0.12)] shadow-[0_0_20px_rgba(255,197,74,0.08)]"
                              : "bg-[rgba(255,255,255,0.04)]"
                          }`}
                          style={{ zIndex: 0 }}
                        />
                      )}

                      {/* Active dot */}
                      {isActive && (
                        <div className="absolute -bottom-1 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#FFB300] to-[#FFD76A] shadow-[0_0_8px_rgba(255,197,74,0.5)]" />
                      )}
                    </li>
                  );
                })}
              </ul>

              {/* Right side */}
              <div className="flex items-center gap-2">
                <LocaleSwitcher />
                <Link
                  href="/#contact"
                  className="relative hidden overflow-hidden rounded-xl bg-gradient-to-r from-[#FFB300] to-[#FFD76A] px-5 py-2.5 text-sm font-semibold text-[#0B0B0F] shadow-[0_0_20px_rgba(255,179,0,0.3)] transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,179,0,0.5)] hover:brightness-110 md:block"
                >
                  {t("cta")}
                </Link>

                {/* Mobile menu button */}
                <button
                  onClick={() => setMobileOpen(!mobileOpen)}
                  className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] transition-all duration-300 hover:bg-[rgba(255,255,255,0.06)] md:hidden"
                  aria-label={mobileOpen ? "Close menu" : "Open menu"}
                >
                  <div className="flex flex-col gap-1.5">
                    <span
                      className={`block h-px w-5 bg-white transition-all duration-300 ${
                        mobileOpen ? "translate-y-[3.5px] rotate-45" : ""
                      }`}
                    />
                    <span
                      className={`block h-px w-5 bg-white transition-all duration-300 ${
                        mobileOpen ? "opacity-0" : ""
                      }`}
                    />
                    <span
                      className={`block h-px w-5 bg-white transition-all duration-300 ${
                        mobileOpen ? "-translate-y-[3.5px] -rotate-45" : ""
                      }`}
                    />
                  </div>
                </button>
              </div>
            </nav>
          </Container>
        </div>
      </header>

      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-500 md:hidden ${
          mobileOpen
            ? "bg-[rgba(11,11,15,0.9)] backdrop-blur-xl opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMobileOpen(false)}
      >
        <div
          className={`flex h-full flex-col items-center justify-center gap-6 transition-all duration-500 delay-100 ${
            mobileOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {SECTIONS.map((item, index) => {
            const isActive = active === item.id;
            return item.href ? (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`text-2xl font-medium transition-all duration-300 ${
                  isActive
                    ? "text-[#FFC54A] drop-shadow-[0_0_12px_rgba(255,197,74,0.4)]"
                    : "text-[#C6C8CE] hover:text-white"
                }`}
                style={{ transitionDelay: mobileOpen ? `${index * 50}ms` : "0ms" }}
              >
                {t(item.labelKey)}
              </Link>
            ) : (
              <Link
                key={item.id}
                href={getSectionHref(item.id)}
                onClick={() => setMobileOpen(false)}
                className={`text-2xl font-medium transition-all duration-300 ${
                  isActive
                    ? "text-[#FFC54A] drop-shadow-[0_0_12px_rgba(255,197,74,0.4)]"
                    : "text-[#C6C8CE] hover:text-white"
                }`}
                style={{ transitionDelay: mobileOpen ? `${index * 50}ms` : "0ms" }}
              >
                {t(item.labelKey)}
              </Link>
            );
          })}

          {/* Mobile CTA */}
          <Link
            href="/#contact"
            onClick={() => setMobileOpen(false)}
            className="mt-4 rounded-xl bg-gradient-to-r from-[#FFB300] to-[#FFD76A] px-8 py-3 text-base font-semibold text-[#0B0B0F] shadow-[0_0_30px_rgba(255,179,0,0.4)]"
            style={{ transitionDelay: mobileOpen ? `${SECTIONS.length * 50}ms` : "0ms" }}
          >
            {t("cta")}
          </Link>
        </div>
      </div>
    </>
  );
}