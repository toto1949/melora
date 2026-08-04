# Component hierarchy

```
RootLayout
├── MarketingLayout
│   ├── SiteHeader / MobileNav
│   ├── Landing sections
│   │   ├── Hero (+ AudioPlayer)
│   │   ├── TrustBar
│   │   ├── ReactionGallery (+ Modal)
│   │   ├── HowItWorks
│   │   ├── SampleSongsSection
│   │   ├── OccasionsSection
│   │   ├── ProductShowcase
│   │   ├── Testimonials
│   │   ├── PricingSection
│   │   ├── FaqSection (+ Accordion)
│   │   └── FinalCta
│   ├── SiteFooter
│   └── CookieConsent
├── StudioShell
│   └── Step forms (occasion → checkout)
├── DashboardShell
│   └── Customer pages
├── AdminShell
│   └── Staff pages
└── ListenExperience (+ AudioPlayer, gift reveal)
```

Shared primitives live in `src/components/ui`.
Business logic lives in `src/lib` (actions, jobs, providers, db).
