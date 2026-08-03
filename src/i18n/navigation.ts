import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * Locale-aware navigation helpers.
 *
 * Use these instead of `next/link` and `next/navigation` so that the
 * active locale is automatically applied to generated URLs.
 *
 * @example
 * import { Link, useRouter, usePathname } from "@/i18n/navigation";
 *
 * @see https://next-intl.dev/docs/routing/navigation
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
