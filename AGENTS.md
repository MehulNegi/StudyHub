<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# StudyHub repository rules

## Stack and existing behavior

- StudyHub uses Next.js 16 App Router, TypeScript, Supabase, and react-pdf.
- Inspect existing files before editing. Read the relevant installed Next.js guides above before changing framework code.
- Preserve the existing Figma-matched dark-mode design, tokens, typography, icons, and layouts.
- Do not introduce gradients, drop shadows, pill-shaped buttons, unnecessary animations, cursor effects, or excessive scroll effects.
- Do not use fabricated reviews, customer counters, metrics, generic AI imagery, vague promotional copy, emoji icons, or em dashes in new product copy.
- Preserve existing PDF document selection, pagination, zoom, search, highlighting, and Quick Notes search, filters, chapter context, and copying.
- Prefer small, independently testable changes. Avoid unrelated refactors or dependency upgrades.

## Approved access model

- Public visitors can access the dashboard and subject workspaces and view, search, and download published learning materials without authentication. Do not make the entire application login-protected.
- Students can optionally sign in to save their own chapter mastery and view their own progress. They cannot access another student's private data or modify shared learning materials.
- Only the administrator can create, edit, publish, upload, or delete shared subjects, chapters, PDFs, and Quick Notes. Administrator capabilities do not grant access to other students' private progress.
- Enforce authorization server-side and through Supabase RLS and Storage policies, never through UI visibility alone. Do not identify the administrator through a hardcoded client-side email or user-editable metadata.
- Never expose service-role keys or secrets in client-side code, logs, tool output, Git, or public responses. Use request-scoped authenticated server clients; never share mutable authenticated server clients between requests.
- Keep the PDF Storage bucket private. Anonymous access must be limited to explicitly published documents and visible parent content through reviewed policies and authorized access flows.

## Database and preview safety

- Never assume undocumented database schema details, ownership columns, publication fields, role mechanisms, or deployed policies. Distinguish repository facts from unverified live configuration.
- Never apply migrations or database changes without explicit approval. Never infer migration state from a file comment; verify live constraints and migration history. Do not automatically reapply the Quick Notes migrations.
- Do not weaken existing RLS or Storage policies without explicit review and approval. Review all effective policies and grants, not only a newly proposed policy.
- Keep preview data isolated from production, explicitly labelled, and enabled only by the existing development switch. Never substitute sample content when real requests fail or use sample metrics in production.

## Git, verification, and reporting

- Keep environment files, credentials, private PDFs, generated outputs, dependencies, and local agent state out of Git. Use explicit reviewed file paths for staging; never blanket-stage the repository.
- The ignored local /test-supabase route displays raw database rows. Do not deploy it. Git exclusion does not remove it from a local build or a deployment that uploads the working directory.
- Run checks appropriate to the change. Baseline checks are ESLint and TypeScript; TypeScript audit checks should disable incremental output when no generated files are wanted.
- Do not make commits, publish, or deploy without the user's authorization for that action.
- Report files changed, commands run, test results, and remaining limitations. Do not claim verification that was not performed.
- Launch requires a connected custom domain, a verified favicon, removal of any Made with AI tag, and published privacy policy and terms and conditions pages.
