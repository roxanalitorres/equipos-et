# Design Brief: Equipos ET Inventory System

## Tone & Purpose
Utilitarian modernism for industrial B2B. Inventory management for heavy machinery spare parts (Caterpillar, Komatsu) across two Ecuadorian branches. Aesthetic: reliable, precise, authority-driven. No decorative flourish. Every pixel serves function.

## Palette (OKLCH)

| Token              | Light Mode      | Dark Mode       | Purpose                          |
|:------------------|:----------------|:----------------|:---------------------------------|
| Primary            | 0.52 0.13 252   | 0.65 0.15 252   | Steel blue — trustworthy, industrial |
| Secondary          | 0.38 0.04 258   | 0.18 0.03 258   | Dark slate — headers, navigation |
| Accent             | 0.68 0.19 43    | 0.72 0.18 43    | Signal orange — actions, warnings |
| Destructive        | 0.52 0.22 25    | 0.62 0.2 25     | Red-orange — critical, low stock |
| Success            | 0.63 0.12 150   | 0.68 0.14 150   | Sage green — confirmations, status |
| Foreground         | 0.15 0 0        | 0.94 0 0        | Body text, high contrast |
| Background         | 0.98 0 0        | 0.12 0 0        | Main canvas |
| Card               | 0.99 0 0        | 0.16 0 0        | Container, elevated |
| Muted              | 0.92 0 0        | 0.22 0 0        | Zebra striping, disabled states |
| Border             | 0.88 0 0        | 0.25 0 0        | Structural dividers |

## Typography

| Role      | Font                   | Size / Weight | Usage                          |
|:----------|:----------------------|:--------------|:-------------------------------|
| Display   | Bricolage Grotesque    | 28/600 – 48/700 | Headers, invoice titles, branch names |
| Body      | General Sans           | 14/400 – 16/500 | Body text, labels, form input |
| Mono      | Geist Mono             | 12/400 – 14/500 | Part numbers, serial codes, tables |

## Shape & Density
- Border-radius: 4px (industrial, not rounded)
- Spacing base: 12px / 16px grid
- Information density: tight; maximize content per screen
- Borders: solid, visible, low opacity (0.08–0.12)

## Structural Zones

| Zone           | Background     | Border         | Purpose                                |
|:--------------|:--------------|:--------------|:--------------------------------------|
| Header / Nav  | Secondary     | Secondary-dark | Fixed navigation, role indicator       |
| Sidebar       | Secondary     | Secondary-dark | Branch selector, active menu highlight |
| Main Content  | Background    | Border         | Product list, forms, documents        |
| Card / Panel  | Card          | Border-subtle  | Inventory tables, proforma preview    |
| Footer        | Muted/30      | Border-top     | Status bar, pagination                |
| Forms         | Input bg      | Input border   | Contrast minimum AA+, error states red |
| Invoices      | Background    | None / print   | White/near-white for print fidelity  |

## Component Patterns
- **Tables**: Monospace part numbers, zebra striping (muted/30), click-to-expand for details
- **Forms**: Vertical layout, required asterisk (red), inline validation
- **Buttons**: Primary (steel blue), secondary (slate), destructive (orange), text-only (minimal)
- **Status badges**: Success (sage), warning (orange), error (red), neutral (grey)
- **Inventory cards**: Part number (mono), description, location (branch + shelf/row), price, stock indicator

## Motion & Transitions
- All interactive: `transition-smooth` (0.3s ease-out)
- No entrance animations; fade-in on page load only
- Hover states: subtle background shift, cursor changes
- Loading: spinner overlay, no skeleton screens

## Accessibility & Legibility
- Contrast: AA+ for all text on backgrounds
- Focus indicators: 2px ring in primary color
- Mobile-first responsive (sm/md/lg breakpoints)
- Labels always paired with inputs (aria-label or <label>)

## Signature Detail
Monospace part numbers in inventory tables positioned flush-left with visible hierarchy. Invoice/document previews render with print-safe margins and font sizing for legibility at A4 scale.

## Dark Mode
Intentional, not inverted. Darker card backgrounds (0.16 vs light 0.99), brighter text (0.94 vs light 0.15), saturated accent colors maintain signal clarity in low-light environments.

## Print Fidelity
Invoices and proformas render on white/near-white backgrounds with system fonts (no web-font fallback needed for print). Margins: 1.5cm. Color mode: greyscale-friendly (blue/slate remain legible when printed in B&W).
