import type { MDXComponents } from "mdx/types";

/** MDX renderers styled with the sheet idiom: mono body, ink headings, cobalt links. */
export const mdxComponents: MDXComponents = {
  h2: ({ children, id }) => (
    <h2
      id={id}
      className="jt-display jt-display--heading mt-9 mb-3 scroll-mt-6 text-[22px]"
    >
      {children}
    </h2>
  ),
  h3: ({ children, id }) => (
    <h3 id={id} className="jt-title mt-7 mb-2 scroll-mt-6">
      {children}
    </h3>
  ),
  p: ({ children }) => <p className="jt-body mb-3 text-[13px]">{children}</p>,
  a: ({ href, children }) => (
    <a
      href={href ?? "#"}
      className="text-(--jt-cobalt) underline underline-offset-2"
    >
      {children}
    </a>
  ),
  ul: ({ children }) => (
    <ul className="jt-body mb-4 ml-5 list-[square] text-[13px]">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="jt-body mb-4 ml-5 list-decimal text-[13px]">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="py-0.5 marker:text-(--jt-cobalt)">{children}</li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-5 border-l border-(--jt-cobalt) pl-4 text-(--jt-ink-3)">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="jt-rule my-7 border-0" />,
  pre: ({ children, ...props }) => (
    <pre
      {...props}
      className="my-5 overflow-x-auto border border-(--jt-border) bg-(--jt-ink) p-4 text-[12px] leading-relaxed"
    >
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="my-5 overflow-x-auto">
      <table className="jt-table">{children}</table>
    </div>
  ),
  th: ({ children }) => <th className="jt-label">{children}</th>,
};
