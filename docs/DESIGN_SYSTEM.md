# Melora Design System

## Visual direction

Premium emotional gift experience — warm, editorial, cinematic. Not a SaaS dashboard.

## Palette

| Token | Hex | Use |
|-------|-----|-----|
| `--navy` | `#0B1426` | Primary text, hero overlays |
| `--navy-soft` | `#1A2740` | Secondary surfaces |
| `--cream` | `#F7F0E6` | Page atmospheres |
| `--cream-deep` | `#EDE3D4` | Soft bands |
| `--rose` | `#C4848A` | Emotional accent |
| `--rose-soft` | `#E8C4C7` | Highlights |
| `--gold` | `#C9A96E` | CTA / premium accent |
| `--gold-soft` | `#E8D5A8` | Soft glow |
| `--surface` | `#FFFCFA` | Content cards |
| `--muted` | `#6B645A` | Secondary copy |
| `--border` | `#E5D9C8` | Hairlines |

## Typography

- Display: **Fraunces** (soft optical sizing, editorial)
- Body / UI: **Manrope** (modern, readable)
- Avoid Inter, Roboto, Arial, system stacks as primary fonts

## Elevation

- Cards: soft warm shadow `0 18px 50px rgba(11,20,38,0.08)`
- Radius: `1rem` default, `1.5rem` feature cards, `999px` only for play controls
- Grain overlay at 4–6% opacity on hero atmospheres

## Motion

- Hero waveform subtle pulse
- Studio step cross-fades
- Reveal mode scale + fade
- Respect `prefers-reduced-motion`

## Component hierarchy

```
AppShell
├── SiteHeader / MobileNav
├── Page sections (Hero, TrustBar, …)
├── StudioShell (progress, autosave)
├── DashboardShell / AdminShell
└── Shared: AudioPlayer, Waveform, Modal, Form fields
```
