"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useRouter, usePathname } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";

/**
 * Compact language switcher.
 *
 * Switches the locale while preserving the current pathname by leveraging the
 * locale-aware navigation helpers. Uses `useTransition` to mark the navigation
 * as a pending update so the UI can show a subtle loading state.
 */
export default function LocaleSwitcher() {
  const locale = useLocale() as Locale;
  const t = useTranslations("languageSwitcher");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const params = useParams();

  function onSwitch(next: Locale) {
    if (next === locale) return;

    startTransition(() => {
      // Reuse the current pathname for the new locale; the navigation API
      // resolves the correct locale-prefixed URL automatically.
      router.replace(
        // @ts-expect-error — pathname + params typing is intentionally loose
        { pathname, params },
        { locale: next }
      );
    });
  }

  return (
    <label
      className="relative inline-flex items-center"
      aria-label={t("label")}
    >
      <select
        defaultValue={locale}
        onChange={(e) => onSwitch(e.target.value as Locale)}
        disabled={isPending}
        className="nav-icon-button min-h-11 cursor-pointer appearance-none rounded-xl py-2 pe-8 ps-3 text-sm transition-all duration-300 disabled:opacity-50"
      >
        {routing.locales.map((loc) => (
          <option key={loc} value={loc}>
            {loc === "fa" ? "فارسی" : "English"}
          </option>
        ))}
      </select>
      <span className="text-muted pointer-events-none absolute end-3 text-xs">
        ▾
      </span>
    </label>
  );
}
