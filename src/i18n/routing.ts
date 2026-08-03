import { defineRouting } from "next-intl/routing";

/**
 * Central i18n routing configuration.
 *
 * This is the single source of truth for locales and is shared between
 * the middleware, the request config and the navigation APIs so that
 * nothing can drift out of sync.
 *
 * @see https://next-intl.dev/docs/routing
 */
export const routing = defineRouting({
  locales: ["fa", "en"],
  defaultLocale: "fa",
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];
