import Script from "next/script";

/**
 * Analytics — loads Google Analytics 4 (GA4) and/or Plausible when the
 * corresponding environment variables are set at build time.
 *
 *   NEXT_PUBLIC_GA_ID          e.g. "G-XXXXXXXXXX"
 *   NEXT_PUBLIC_PLAUSIBLE_DOMAIN  e.g. "hermidlife.org"
 *
 * If neither is set, this component renders nothing — safe to drop into the
 * root layout regardless of environment.
 */
export default function Analytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

  return (
    <>
      {gaId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}', { anonymize_ip: true });
            `}
          </Script>
        </>
      )}

      {plausibleDomain && (
        <Script
          defer
          data-domain={plausibleDomain}
          src="https://plausible.io/js/script.js"
          strategy="afterInteractive"
        />
      )}
    </>
  );
}
