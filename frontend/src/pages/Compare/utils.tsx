/**
 * Helper: normalize values for comparison in diff highlighting.
 * Converts arrays to JSON, empty/null/undefined to '—', otherwise stringifies.
 */
export const norm = (v: unknown) => {
  if (Array.isArray(v)) return JSON.stringify(v);
  if (v === null || v === undefined || v === '') return '—';
  return String(v);
};

/**
 * Type for values that could represent a link.
 */
export type LinkLike =
  | string
  | {
      url?: string;
      label?: string;
      href?: string;
      text?: string;
      link?: string;
      name?: string;
      title?: string;
      path?: string;
      value?: string;
    };

/**
 * Returns true if the string looks like a URL or path.
 */
export const looksLikeUrl = (s: string) => /^(https?:\/\/|\/)/i.test(s);

/**
 * Extracts a { url, label } object from a LinkLike value, or null if not a link.
 */
export const extractOneLink = (v: LinkLike): { url: string; label: string } | null => {
  if (!v) return null;

  if (typeof v === 'string') {
    // If it's an <a ...>...</a> HTML string, pull href + inner text
    const a = v.match(/<a[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/i);
    if (a) return { url: a[1], label: a[2] || a[1] };
    if (looksLikeUrl(v)) return { url: v, label: v };
    return null; // plain string, not a link
  }

  // object-ish — try common keys
  const url =
    (v.url as string) ||
    (v.href as string) ||
    (v.link as string) ||
    (v.path as string) ||
    (v.value as string) ||
    '';

  if (!url) return null;

  const label =
    (v.label as string) || (v.text as string) || (v.name as string) || (v.title as string) || url;

  return { url, label };
};

/**
 * Normalize any input into an array of link objects, or [] if none.
 */
export const toLinkArray = (value: unknown): { url: string; label: string }[] => {
  const arr = Array.isArray(value) ? value : value != null ? [value] : [];
  const links: { url: string; label: string }[] = [];

  for (const v of arr as LinkLike[]) {
    const link = extractOneLink(v);
    if (link) links.push(link);
  }
  return links;
};

/**
 * Generic cell renderer for table values.
 * Renders links, arrays, or scalars with fallback for empty values.
 */
export const renderCellValue = (value: unknown): React.ReactNode => {
  // Try links first
  const links = toLinkArray(value);
  if (links.length > 0) {
    return (
      <>
        {links.map((l, i) => (
          <a
            key={`${l.url}-${i}`}
            href={l.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline mr-2 break-all"
          >
            {l.label}
          </a>
        ))}
      </>
    );
  }

  // Arrays of non-link values → comma-join
  if (Array.isArray(value)) {
    return value.length ? value.join(', ') : <span className="text-gray-400">—</span>;
  }

  // Scalars
  if (value === null || value === undefined || value === '') {
    return <span className="text-gray-400">—</span>;
  }
  return String(value);
};
