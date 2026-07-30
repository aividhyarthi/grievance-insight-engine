"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const SELECTOR = ".animate-on-scroll, .stagger-children";

/**
 * Reveals elements as they scroll into view.
 *
 * Two things matter here and both have bitten us before:
 *
 * 1. This must re-run on every route change. The header navigates with
 *    next/link, so the root layout does not remount between pages. An
 *    observer attached only on first mount would never see the next page's
 *    elements, leaving them stuck at opacity 0 — a blank page.
 *
 * 2. Content must never end up permanently invisible. The hiding styles are
 *    gated behind the `reveal-js` class (added by an inline script in the
 *    layout), and a failsafe timer reveals everything unconditionally in case
 *    the observer never fires — for example when an element is far taller
 *    than the viewport.
 */
export function useScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const revealAll = () => {
      document
        .querySelectorAll(SELECTOR)
        .forEach((el) => el.classList.add("is-visible"));
    };

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion || typeof IntersectionObserver === "undefined") {
      revealAll();
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            // Reveal is one-way; stop watching once shown.
            obs.unobserve(entry.target);
          }
        });
      },
      // threshold 0 so elements taller than the viewport still trigger.
      { threshold: 0, rootMargin: "0px 0px -40px 0px" }
    );

    const elements = Array.from(document.querySelectorAll(SELECTOR));
    elements.forEach((el) => observer.observe(el));

    // Failsafe: nothing on this site should stay hidden indefinitely.
    const failsafe = window.setTimeout(revealAll, 3000);

    return () => {
      window.clearTimeout(failsafe);
      observer.disconnect();
    };
  }, [pathname]);
}
