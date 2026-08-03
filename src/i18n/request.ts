import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

/**
 * Request-scoped i18n configuration.
 *
 * In next-intl v4 the `locale` parameter is no longer passed directly —
 * instead a `requestLocale` getter is provided (set by the middleware and
 * by `setRequestLocale`). We await it, validate it against the known
 * locales and fall back to the default locale.
 *
 * Narrowing the locale with `hasLocale` gives it the `"fa" | "en"` union
 * type, which allows the bundler to statically resolve the dynamic
 * message import.
 *
 * @see https://next-intl.dev/docs/usage/configuration#i18n-request
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
