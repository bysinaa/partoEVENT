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
      <p className="leading-relaxed text-[#6B6E78]">{children}</p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-s-4 border-[rgba(255,197,74,0.3)] ps-4 italic text-[#C6C8CE]">
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
          className="text-[#FFC54A] underline underline-offset-4 transition-colors duration-300 hover:text-[#FFD976]"
          {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {children}
        </a>
      );
    },
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc space-y-2 ps-6 text-[#6B6E78]">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal space-y-2 ps-6 text-[#6B6E78]">{children}</ol>
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
