/**
 * Development preview switch.
 *
 * Until authentication exists, Row Level Security returns no rows to anonymous requests.
 * Set `STUDYHUB_PREVIEW=1` (e.g. `STUDYHUB_PREVIEW=1 npm run dev`) to render the clearly
 * labelled sample content in `lib/preview/` instead of querying Supabase.
 * It is ignored in production builds and is never used as a fallback for failed requests.
 */
export function isPreviewMode(): boolean {
  return process.env.NODE_ENV !== "production" && process.env.STUDYHUB_PREVIEW === "1";
}
