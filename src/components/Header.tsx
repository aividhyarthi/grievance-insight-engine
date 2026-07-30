"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const navLinks = [
  { href: "/how-it-works", label: "How It Works" },
  { href: "/what-we-treat", label: "What We Treat" },
  { href: "/perimenopause", label: "Perimenopause" },
  { href: "/for-employers", label: "For Employers" },
  { href: "/team", label: "Team" },
  { href: "/careers", label: "Careers", isNew: true },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Main nav */}
      <div className={`transition-all duration-300 ${scrolled ? "bg-warm-white/95 backdrop-blur-md shadow-sm" : "bg-warm-white/60 backdrop-blur-sm"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-display font-bold text-rose-dark">
                Her<span className="text-sage-dark">Midlife</span>
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative text-sm font-medium text-foreground/60 hover:text-rose transition-colors inline-flex items-center gap-1.5"
                >
                  {link.label}
                  {link.isNew && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-rose text-white shadow-sm">
                      New
                    </span>
                  )}
                </Link>
              ))}
              <Link
                href="/contact"
                className="inline-flex items-center px-6 py-2.5 rounded-full text-sm font-semibold text-white gradient-cta hover:opacity-90 transition-opacity shadow-md"
              >
                Join the Waiting List
              </Link>
            </nav>

            <button
              className="lg:hidden p-2 text-foreground/70"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {mobileOpen && (
            <nav className="lg:hidden pb-6 space-y-1 bg-warm-white/95 backdrop-blur-md rounded-b-2xl">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-foreground/70 hover:text-rose hover:bg-blush/30 rounded-xl transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                  {link.isNew && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-rose text-white">
                      New
                    </span>
                  )}
                </Link>
              ))}
              <div className="px-4 pt-2">
                <Link
                  href="/contact"
                  className="block text-center px-6 py-3 rounded-full text-sm font-semibold text-white gradient-cta"
                  onClick={() => setMobileOpen(false)}
                >
                  Join the Waiting List
                </Link>
              </div>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}
