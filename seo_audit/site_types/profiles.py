"""
profiles.py — Site type profiles with category weights and custom checklists.

Each profile defines:
  - category_weights : dict[category_name -> 0.0–2.0] (1.0 = normal weight)
  - priority_categories : ordered list of most important categories for this type
  - skip_categories : categories rarely relevant for this type
  - custom_checks : extra checklist items specific to this site type
  - traffic_strategy_notes : traffic growth advice specific to this type
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum


class SiteType(str, Enum):
    NEWS = "news"
    PRODUCT = "product"
    NEWS_PRODUCT = "news_product"   # hybrid editorial + product (e.g. Wirecutter)
    ECOMMERCE = "ecommerce"
    SAAS = "saas"
    EVENTS = "events"
    GENERIC = "generic"


@dataclass
class SiteProfile:
    site_type: SiteType
    label: str
    description: str

    # Weight modifiers per category (default 1.0 = normal)
    category_weights: dict[str, float] = field(default_factory=dict)

    # Ordered by priority for this site type
    priority_categories: list[str] = field(default_factory=list)

    # Categories to de-emphasise or skip
    skip_categories: list[str] = field(default_factory=list)

    # Extra site-type-specific checklist items (name → recommendation)
    custom_checks: list[tuple[str, str]] = field(default_factory=list)

    # Traffic strategy guidance specific to this type
    traffic_strategy_notes: list[str] = field(default_factory=list)


_PROFILES: dict[SiteType, SiteProfile] = {

    SiteType.NEWS: SiteProfile(
        site_type=SiteType.NEWS,
        label="News / Media",
        description="Editorial content sites, online newspapers, blogs with frequent publishing.",
        category_weights={
            "SEO On-Page": 1.5,
            "SEO Content": 2.0,
            "AEO — Answer Engine Optimization": 2.0,
            "GEO — Generative Engine Optimization": 1.5,
            "Technical SEO": 1.5,
            "Pagespeed": 1.5,
            "SEO Backlinking": 1.2,
            "Product SEO": 0.2,
        },
        priority_categories=[
            "SEO Content", "Technical SEO", "AEO — Answer Engine Optimization",
            "GEO — Generative Engine Optimization", "SEO On-Page", "Pagespeed",
        ],
        skip_categories=["Product SEO"],
        custom_checks=[
            ("NewsArticle / Article schema", "Add NewsArticle JSON-LD with datePublished, dateModified, author, image."),
            ("AMP pages", "Consider AMP for mobile news if traffic is majority mobile."),
            ("News Sitemap", "Submit a Google News Sitemap — required for Google News inclusion."),
            ("Publish frequency signals", "Consistent publishing schedule signals freshness to Google News."),
            ("Paywalled content schema", "If content is paywalled, use isAccessibleForFree schema to avoid cloaking flags."),
            ("Author bios with expertise", "Each author should have a dedicated bio page with credentials and social links."),
            ("Article freshness / date display", "Display published and updated dates prominently — affects CTR in news results."),
            ("Image licensing & attribution", "Use properly licensed images; add ImageObject schema with creditText."),
            ("Evergreen vs trending content ratio", "Balance trending articles (short shelf-life) with evergreen pillar content."),
            ("Comment section spam", "Moderate comments to prevent UGC keyword stuffing flagged by Google."),
        ],
        traffic_strategy_notes=[
            "Prioritise Google Discover optimisation — large image (>1200px wide), engaging headline, no clickbait.",
            "Target featured snippets for how/what/why questions relevant to your beat.",
            "Build a Google News publisher account and submit news sitemap.",
            "Invest in original reporting and exclusive data — primary sources earn natural backlinks.",
            "Optimise for 'Top Stories' carousel: fast load (<2s), AMP or well-structured HTML.",
            "Repurpose articles as threads on X/LinkedIn to drive referral traffic.",
            "Email newsletter list is essential — own your audience against algorithm changes.",
            "Cover trending topics early ('newsjacking') combined with deep analysis for longevity.",
        ],
    ),

    SiteType.PRODUCT: SiteProfile(
        site_type=SiteType.PRODUCT,
        label="Product / B2B / B2C",
        description="Product landing pages, SaaS product pages, brand product showcases.",
        category_weights={
            "SEO On-Page": 1.5,
            "Product SEO": 2.0,
            "UX / UI": 1.8,
            "SEO Content": 1.5,
            "Keyword Research & Usage": 1.5,
            "AEO — Answer Engine Optimization": 1.3,
            "SEO Backlinking": 1.2,
        },
        priority_categories=[
            "Product SEO", "SEO On-Page", "UX / UI",
            "Keyword Research & Usage", "SEO Content", "Technical SEO",
        ],
        custom_checks=[
            ("Product schema with price", "Include price, currency, availability, and SKU in Product schema."),
            ("Review / rating schema", "Collect and display customer reviews; add AggregateRating schema."),
            ("Comparison tables", "Add feature comparison tables vs competitors — drives transactional searches."),
            ("Video product demo", "Embed product demo video with VideoObject schema — boosts dwell time."),
            ("Trust badges / certifications", "Display SSL, payment badges, certification logos above the fold."),
            ("Social proof / customer count", "Show customer count, case study logos, or testimonials."),
            ("Clear unique value proposition", "H1 should state the product USP + primary keyword."),
            ("Pricing page optimisation", "Pricing page needs clear tiers, FAQ schema, and comparison table."),
        ],
        traffic_strategy_notes=[
            "Target commercial-intent keywords: 'best X for Y', 'X vs Y', 'X review', 'buy X'.",
            "Build comparison landing pages (Your Product vs Competitor) — high buyer-intent traffic.",
            "Create case studies and success stories — earns backlinks and ranks for [industry] + results queries.",
            "Optimise for Google Shopping if selling physical products.",
            "Run co-marketing content with adjacent non-competing brands to expand reach.",
            "Launch an affiliate/referral programme to generate backlinks and word-of-mouth.",
        ],
    ),

    SiteType.ECOMMERCE: SiteProfile(
        site_type=SiteType.ECOMMERCE,
        label="E-Commerce",
        description="Online retail stores, marketplaces, and DTC brands.",
        category_weights={
            "Product SEO": 2.0,
            "Technical SEO": 1.8,
            "SEO On-Page": 1.5,
            "Pagespeed": 2.0,
            "SEO Interlinking": 1.5,
            "Keyword Research & Usage": 1.5,
            "UX / UI": 1.8,
        },
        priority_categories=[
            "Product SEO", "Pagespeed", "Technical SEO",
            "UX / UI", "SEO On-Page", "SEO Interlinking",
        ],
        custom_checks=[
            ("Category page optimisation", "Category pages need unique H1, meta desc, intro paragraph, and faceted nav handling."),
            ("Faceted navigation & canonicals", "Set canonical on filtered URLs to avoid duplicate content (size=M, color=blue etc.)."),
            ("Out-of-stock product pages", "Keep out-of-stock pages live with related products; use availability schema."),
            ("Product pagination", "Use rel=next/prev or canonical on paginated category pages."),
            ("Google Shopping / Merchant Center", "Submit product feed to Google Merchant Center for Shopping ads eligibility."),
            ("Review schema at category level", "AggregateRating on category pages can show stars in SERPs."),
            ("Breadcrumb on all pages", "Every product/category page needs breadcrumbs with BreadcrumbList schema."),
            ("Site search indexability", "Ensure /search? result URLs are noindexed to avoid thin content."),
            ("Checkout page indexability", "Cart, checkout, and account pages must be noindexed."),
            ("Image CDN & WebP", "Use a CDN and serve WebP images — critical for Pagespeed on product listing pages."),
            ("Rich results: price drops, promotions", "Use PriceSpecification and eligibleQuantity for promotional rich results."),
        ],
        traffic_strategy_notes=[
            "Own 'best [product category]' and '[product] review' keywords with long-form buying guides.",
            "Create seasonal landing pages (e.g. Diwali Sale, Monsoon Collection) 4–6 weeks before the event.",
            "Optimise product titles to match how people search on Google Shopping.",
            "User-generated content (reviews, photos) adds fresh keyword-rich content automatically.",
            "Retargeting via Google Display + email sequences for abandoned cart recovery.",
            "Pinterest and Instagram shopping integration for visual product discovery.",
            "Build a blog/content hub targeting informational queries that feed product pages via interlinking.",
        ],
    ),

    SiteType.SAAS: SiteProfile(
        site_type=SiteType.SAAS,
        label="SaaS Company",
        description="Software-as-a-Service websites, tech startups, developer tools.",
        category_weights={
            "SEO On-Page": 1.5,
            "SEO Content": 1.8,
            "AEO — Answer Engine Optimization": 2.0,
            "GEO — Generative Engine Optimization": 2.0,
            "Technical SEO": 1.5,
            "SEO Backlinking": 1.5,
            "Keyword Research & Usage": 1.5,
        },
        priority_categories=[
            "AEO — Answer Engine Optimization", "GEO — Generative Engine Optimization",
            "SEO Content", "SEO On-Page", "Technical SEO", "SEO Backlinking",
        ],
        custom_checks=[
            ("SoftwareApplication schema", "Add SoftwareApplication schema with applicationCategory, operatingSystem, offers."),
            ("Integration / use-case pages", "Create landing pages for each integration (e.g. 'Slack + Your Tool') — high-intent traffic."),
            ("G2/Capterra profile linked", "Link to G2, Capterra, ProductHunt — review platforms earn backlinks and trust."),
            ("Documentation SEO", "Docs site should be indexed; use Algolia or Google site search for UX."),
            ("Changelog/release notes", "Publish a changelog — earns brand searches and shows product activity."),
            ("Pricing page FAQ schema", "Pricing objections answered via FAQPage schema boost conversion + AEO."),
            ("Developer / API docs", "Developer-focused content ranks for niche queries; add code snippet schema."),
            ("Free tool / calculator", "Free tools (e.g. 'ROI calculator') earn backlinks and top-of-funnel traffic."),
            ("Comparison pages vs competitors", "'/vs-competitor' pages convert well and rank for high-intent queries."),
            ("Case studies with data", "Publish case studies with specific metrics — earns links and builds GEO authority."),
        ],
        traffic_strategy_notes=[
            "Content moat strategy: publish comprehensive 'ultimate guides' for your core use case keywords.",
            "Target 'best [tool category]' listicle keywords — often SaaS sites rank #1 for competitor comparisons.",
            "Build a free tools strategy — free tools generate 10–100× more backlinks than blog posts.",
            "Optimise for AI assistants: when users ask ChatGPT/Perplexity 'what is the best X tool?', your GEO signals determine citation.",
            "Programmer/developer communities (Dev.to, Hacker News) can drive viral organic traffic spikes.",
            "Product-led SEO: make your core product features indexable (e.g. Notion templates, Figma frames).",
            "Build partnerships for co-marketing content and mutual backlinks with complementary SaaS tools.",
        ],
    ),

    SiteType.NEWS_PRODUCT: SiteProfile(
        site_type=SiteType.NEWS_PRODUCT,
        label="News + Product (Hybrid)",
        description="Editorial sites with product/affiliate elements (e.g. Wirecutter, Which?, review sites).",
        category_weights={
            "SEO Content": 2.0,
            "Product SEO": 1.5,
            "AEO — Answer Engine Optimization": 1.8,
            "GEO — Generative Engine Optimization": 1.5,
            "SEO On-Page": 1.5,
            "SEO Backlinking": 1.3,
        },
        priority_categories=[
            "SEO Content", "AEO — Answer Engine Optimization", "Product SEO",
            "SEO On-Page", "GEO — Generative Engine Optimization",
        ],
        custom_checks=[
            ("Review schema on all product reviews", "Every product review needs Product + AggregateRating + Review schema."),
            ("Affiliate disclosure", "FTC/ASA requires clear affiliate disclosure — also a Google YMYL trust signal."),
            ("Sponsored content labelling", "Label sponsored posts with rel=sponsored and clear editorial disclosure."),
            ("'Best of' roundup schema", "Roundup articles can use ItemList schema with ListItem for each product."),
            ("Author expertise for review content", "Reviewers need visible credentials relevant to the product category."),
            ("Update freshness on reviews", "Old review dates reduce click-through. Update and re-date annually."),
            ("Buy button / affiliate link tracking", "Use UTM parameters and canonical to manage affiliate URL crawlability."),
        ],
        traffic_strategy_notes=[
            "Target 'best [product] for [use case]' and '[product] review [year]' keywords.",
            "Regular content updates signal freshness — prioritise updating top-10 performing pages.",
            "Expand to comparison content: 'X vs Y' articles have high commercial intent and earn links.",
            "Build an email newsletter with weekly product picks — recurring traffic independent of search.",
            "YouTube product video reviews drive referral traffic and improve brand entity for GEO.",
        ],
    ),

    SiteType.EVENTS: SiteProfile(
        site_type=SiteType.EVENTS,
        label="Events Website",
        description="Conference, concert, festival, local event, or ticketing sites.",
        category_weights={
            "Technical SEO": 1.8,
            "SEO On-Page": 1.5,
            "Product SEO": 1.5,    # Event schema is under product SEO
            "Pagespeed": 1.8,
            "UX / UI": 1.8,
            "SEO Content": 1.2,
        },
        priority_categories=[
            "Technical SEO", "Product SEO", "UX / UI",
            "Pagespeed", "SEO On-Page",
        ],
        custom_checks=[
            ("Event schema (Schema.org/Event)", "Add Event JSON-LD: name, startDate, endDate, location, organizer, offers."),
            ("VirtualEvent / MixedEvent schema", "For hybrid events add VirtualLocation + eventAttendanceMode."),
            ("Event date in title/H1", "Include event date in title and H1 — critical for 'event near me' queries."),
            ("Location + LocalBusiness schema", "Add venue address with LocalBusiness/Place schema for local SEO."),
            ("FAQ schema for event", "Add FAQPage for common event questions (parking, tickets, schedule)."),
            ("Ticket availability schema", "Use offers.availability with InStock/SoldOut — shows in SERPs."),
            ("Expired event redirects", "Past event pages should 301-redirect to next edition or archive, not 404."),
            ("Google Events rich result test", "Test with Google's Rich Results Test to verify Event markup."),
            ("Social sharing image (OG:image)", "Use a high-quality event banner image for social sharing."),
            ("Countdown timer", "A countdown timer improves UX urgency and dwell time."),
        ],
        traffic_strategy_notes=[
            "Optimise for 'event name + year/city' queries — highest intent traffic for events.",
            "Publish speaker/performer pages — each speaker's audience becomes a traffic source.",
            "List the event on Eventbrite, Meetup, Facebook Events for additional backlinks and discovery.",
            "Create a 'what to expect' or 'past highlights' page to capture non-branded organic traffic.",
            "Target local SEO: 'conferences in [city] [year]', 'events near me [topic]'.",
            "Partner with industry publications to co-promote and earn editorial backlinks.",
            "Repurpose session recordings and slides as indexed content after the event for long-tail traffic.",
        ],
    ),

    SiteType.GENERIC: SiteProfile(
        site_type=SiteType.GENERIC,
        label="Generic / Unknown",
        description="General website — all categories weighted equally.",
        priority_categories=[
            "SEO On-Page", "Technical SEO", "SEO Content",
            "Pagespeed", "UX / UI", "Keyword Research & Usage",
        ],
        traffic_strategy_notes=[
            "Start with technical SEO fixes — a crawlable site is the foundation for all other gains.",
            "Identify your highest-traffic pages and optimise them first for maximum impact.",
            "Build a content plan targeting informational keywords that lead into your product/service.",
            "Invest in at least 3–5 high-quality backlinks per month from relevant sites.",
        ],
    ),
}


def get_profile(site_type: SiteType | str) -> SiteProfile:
    if isinstance(site_type, str):
        try:
            site_type = SiteType(site_type.lower())
        except ValueError:
            site_type = SiteType.GENERIC
    return _PROFILES.get(site_type, _PROFILES[SiteType.GENERIC])
