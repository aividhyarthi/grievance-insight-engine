"use client";

import { usePathname } from "next/navigation";

const links = [
  { href: "/perimenopause", label: "Overview" },
  { href: "/perimenopause/library", label: "Symptom Library" },
  { href: "/perimenopause/guides", label: "Topic Guides" },
  { href: "/perimenopause/faq", label: "FAQs" },
  { href: "/perimenopause/talk-to-gp", label: "Talk to Your GP" },
];

export default function PerimenopauseSubNav() {
  const pathname = usePathname();

  return (
    <div className="sticky top-[104px] sm:top-[112px] z-40 bg-warm-white/95 backdrop-blur-md border-b border-champagne shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-0" style={{ scrollbarWidth: "none" }}>
          <span className="font-display text-sm font-semibold text-rose-dark mr-3 shrink-0 hidden sm:block">
            Guide
          </span>
          <div className="flex items-center gap-1 py-2.5">
            {links.map((link) => {
              const isActive =
                link.href === "/perimenopause"
                  ? pathname === "/perimenopause"
                  : pathname.startsWith(link.href);
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-rose text-white shadow-sm"
                      : "text-foreground/60 hover:text-rose hover:bg-blush/60"
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
