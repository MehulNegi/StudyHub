"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { SUBJECTS } from "@/lib/subjects";

type NavItem = { label: string; href: string; isActive: (path: string) => boolean } | { label: string; href: null };

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/", isActive: (path) => path === "/" },
  { label: "Subjects", href: "/subjects", isActive: (path) => path.startsWith("/subjects") },
  { label: "Progress", href: "/#progress", isActive: () => false },
  // No search screen exists yet — rendered as unavailable rather than as a dead link.
  { label: "Search", href: null },
];

/** Sections within one subject: the study workspace and its Quick Notes library. */
function subjectSections(slug: string, pathname: string) {
  const workspace = `/subjects/${slug}`;
  const quickNotes = `${workspace}/quick-notes`;
  return [
    { label: "Workspace", href: workspace, active: pathname === workspace },
    { label: "Quick Notes", href: quickNotes, active: pathname.startsWith(quickNotes) },
  ];
}

function ProfileStatus() {
  return (
    <div
      className="flex items-center gap-2 rounded-[6px] border border-line px-2.5 py-1.5"
      title="Sign-in is not available yet"
    >
      <span className="flex size-6 items-center justify-center rounded-[4px] bg-raised font-mono text-[10px] font-semibold text-subtle">
        —
      </span>
      <span className="text-[12px] text-muted">Not signed in</span>
    </div>
  );
}

export default function AppHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const subject = SUBJECTS.find((item) => pathname.startsWith(`/subjects/${item.slug}`));

  return (
    <header className="sticky top-0 z-30 shrink-0 border-b border-line bg-surface">
      <div className="flex h-16 items-center justify-between gap-6 px-4 sm:px-6 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:px-12">
        <div className="flex min-w-0 items-center gap-6">
          <Link href="/" className="text-[18px] font-bold text-fg-strong" onClick={() => setMenuOpen(false)}>
            StudyHub
          </Link>
          {subject && (
            <span className="flex items-center gap-2">
              <span aria-hidden className="text-[16px] text-line-strong">
                /
              </span>
              <span className="font-mono text-[13px] font-medium text-muted">{subject.code}</span>
            </span>
          )}
          {subject && (
            <nav aria-label={`${subject.code} sections`} className="hidden xl:block">
              <ul className="flex items-center rounded-[6px] border border-line p-0.5">
                {subjectSections(subject.slug, pathname).map((section) => (
                  <li key={section.href}>
                    <Link
                      href={section.href}
                      aria-current={section.active ? "page" : undefined}
                      className={`flex h-7 items-center rounded-[4px] px-2.5 text-[12px] ${
                        section.active ? "bg-raised font-semibold text-fg" : "text-subtle hover:text-muted"
                      }`}
                    >
                      {section.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-8">
            {NAV_ITEMS.map((item) => (
              <li key={item.label}>
                <NavLink item={item} pathname={pathname} />
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden justify-end lg:flex">
          <ProfileStatus />
        </div>

        <button
          type="button"
          className="rounded-[6px] border border-line px-3 py-1.5 font-mono text-[11px] text-muted hover:border-line-strong hover:text-fg lg:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? "Close" : "Menu"}
        </button>
      </div>

      {menuOpen && (
        <nav id="mobile-navigation" aria-label="Primary" className="border-t border-line px-4 pb-4 sm:px-6 lg:hidden">
          <ul className="flex flex-col py-2">
            {NAV_ITEMS.map((item) => (
              <li key={item.label}>
                {item.href ? (
                  <Link
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    aria-current={item.isActive(pathname) ? "page" : undefined}
                    className={`flex h-11 items-center border-l-2 pl-3 text-[13px] ${
                      item.isActive(pathname)
                        ? "border-primary font-semibold text-fg"
                        : "border-transparent text-muted hover:text-fg"
                    }`}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    aria-disabled="true"
                    className="flex h-11 items-center justify-between border-l-2 border-transparent pl-3 text-[13px] text-line-strong"
                  >
                    {item.label}
                    <span className="font-mono text-[10px] uppercase">Not available yet</span>
                  </span>
                )}
              </li>
            ))}
          </ul>
          {subject && (
            <div className="flex flex-col border-t border-line py-2">
              <p className="pt-2 pb-1 pl-3.5 font-mono text-[10px] text-subtle uppercase">{subject.code}</p>
              <ul>
                {subjectSections(subject.slug, pathname).map((section) => (
                  <li key={section.href}>
                    <Link
                      href={section.href}
                      onClick={() => setMenuOpen(false)}
                      aria-current={section.active ? "page" : undefined}
                      className={`flex h-11 items-center border-l-2 pl-3 text-[13px] ${
                        section.active
                          ? "border-primary font-semibold text-fg"
                          : "border-transparent text-muted hover:text-fg"
                      }`}
                    >
                      {section.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <ProfileStatus />
        </nav>
      )}
    </header>
  );
}

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const base = "flex h-16 min-w-6 flex-col items-center justify-between pt-[23px] text-[13px]";

  if (!item.href) {
    return (
      <span aria-disabled="true" title={`${item.label} is not available yet`} className={`${base} cursor-not-allowed text-line-strong`}>
        {item.label}
        <span className="h-px w-full" />
      </span>
    );
  }

  const active = item.isActive(pathname);
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={`${base} ${active ? "font-semibold text-fg" : "text-subtle hover:text-muted"}`}
    >
      {item.label}
      <span className={`h-px w-full ${active ? "bg-primary" : "bg-transparent"}`} />
    </Link>
  );
}
