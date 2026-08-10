import { PortableText as PortableTextReact } from "@portabletext/react";
import type { PortableTextReactComponents } from "@portabletext/react";

import type { PortableTextBlock } from "@portabletext/types";

/**
 * Shared Portable Text renderer.
 *
 * Renders Portable Text rich-text blocks from the custom CMS.
 * This component maps default block/annotation types to semantic, Tailwind-styled
 * React elements so localized descriptions, biographies and case studies render
 * consistently across the site.
 */
const defaultComponents: Partial<PortableTextReactComponents> = {
  block: {
    h1: ({ children }) => (
      <h1 className="text-3xl font-bold md:text-4xl">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="mt-8 text-2xl font-bold md:text-3xl">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-6 text-xl font-semibold">{children}</h3>
    ),
    normal: ({ children }) => (
      <p className="text-muted leading-relaxed">{children}</p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-themed text-muted border-s-4 ps-4 italic">
        {children}
      </blockquote>
    ),
  },
  marks: {
    link: ({ children, value }) => {
      const href = (value as { href?: string })?.href ?? "#";
      const isExternal = href.startsWith("http");
      return (
        <a
          href={href}
          className="link-accent underline underline-offset-4"
          {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {children}
        </a>
      );
    },
  },
  list: {
    bullet: ({ children }) => (
      <ul className="text-muted list-disc space-y-2 ps-6">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="text-muted list-decimal space-y-2 ps-6">{children}</ol>
    ),
  },
};

type PortableTextProps = {
  /** Portable Text blocks from the custom CMS. */
  value: PortableTextBlock[] | null | undefined;
};

export default function PortableText({ value }: PortableTextProps) {
  if (!value || value.length === 0) {
    return null;
  }

  return <PortableTextReact value={value} components={defaultComponents} />;
}
