# TravelTods Design System

This document outlines the core design language, tokens, and components for the TravelTods application. It serves as the single source of truth for maintainable and consistent UI development.

## 🎨 Color Palette

The TravelTods palette is designed to feel calm, family-friendly, and premium. It uses soft coastal greens and warm sand accents, with darker accessible variants where text or icons need WCAG AA contrast.

### Primary Colors
Used for main actions, high-priority UI elements, and branding.
- **Primary:** `#3F7C79` (`--color-primary`) - Accessible coastal teal
- **Primary Dark:** `#2F625F` (`--color-primary-dark`)
- **Primary Foreground:** `#FFFFFF` (`--color-primary-foreground`)

### Secondary Colors
Used for success states, secondary highlights, and nature-related themes.
- **Secondary:** `#4D7467` (`--color-secondary`) - Muted sage
- **Secondary Foreground:** `#FFFFFF` (`--color-secondary-foreground`)

### Accent Colors
Used for gentle emphasis, badges, ratings, and warm moments.
- **Accent:** `#F4D58D` (`--color-accent`) - Warm pastel sand
- **Accent Strong:** `#8A6425` (`--color-accent-strong`) - Accessible text/icon accent
- **Accent Foreground:** `#263735` (`--color-accent-foreground`)

### Neutral & Surface Colors
| Token | Light Mode (`#FBFAF4`) | Dark Mode (`#13221f`) | Description |
|-------|------------------------|-----------------------|-------------|
| **Background** | `#FBFAF4` | `#13221f` | Root background color |
| **Surface** | `#FFFFFF` | `#1c2c28` | Cards, modals, and pops |
| **Text Main** | `#263735` | `#edf4ef` | Primary reading content |
| **Text Sub** | `#526460` | `#a9b8b3` | Supporting text/captions |

---

## 🔤 Typography

We utilize clean, modern sans-serif typefaces to ensure readability and a professional feel.

- **Primary Font (Display):** `Plus Jakarta Sans`
- **Secondary Font:** `Nunito`
- **Base Body Font:** `Plus Jakarta Sans` (configured via `--font-display`)

### Type Scale
| Level | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| **Display / 5XL** | `3rem` (48px) | 800 (Extrabold) | 1.1 | Main Hero Headings |
| **Display / 4XL** | `2.25rem` (36px) | 700 (Bold) | 1.2 | Page Title Sections |
| **Display / 3XL** | `1.875rem` (30px) | 700 (Bold) | 1.2 | Section Headings |
| **Body / XL** | `1.25rem` (20px) | 400 (Regular) | 1.5 | Subheadings / Intro text |
| **Body / Base** | `1rem` (16px) | 400 (Regular) | 1.6 | General paragraph text |
| **Small / Mono** | `0.875rem` (14px) | 500 (Medium) | 1.4 | Labels, Metadata, Code |

---

## 📐 Spacing & Layout

We use a standard 4px or 8px grid system for spacing.

- **Sections:** `py-16` to `py-24` (64px - 96px)
- **Component Gaps:** `gap-4` to `gap-8` (16px - 32px)
- **Container Max-Width:** `max-w-7xl` (1280px)
- **Border Radius:** `rounded-2xl` (1rem) for cards/buttons, `rounded-3xl` for larger sections.

---

## 🏗️ Core Components

### 🔘 Buttons
- **Primary:** Filled with `--color-primary`. Used for call-to-actions. No shadow. Active state: subtle `scale-[0.985]`.
- **Secondary:** Filled with `--color-secondary`.
- **Outline:** Transparent background with border.
- **Ghost:** No background or border. Background fades in on focus/hover via `transition-colors` only.

### 💳 Cards
- **Standard:** White/Surface-Dark background with a `border border-slate-200/60` for definition. No shadow, no hover lift. Purely flat layout with rounded corners.
- **Highlighted:** A tinted border (`border-primary/30`) or a soft accent background for featured items. No elevation tricks.

### 🏷️ Badges & Tags
Used for metadata, categories, and status indicators. **High visibility is critical** - badges must be readable against any background.

#### Variants
- **Solid Primary:** `bg-primary text-primary-foreground backdrop-blur-md border border-white/20`
- **Solid Secondary:** `bg-secondary text-secondary-foreground backdrop-blur-md border border-white/20`
- **Solid Accent:** `bg-accent text-accent-foreground backdrop-blur-md border border-white/30`
- **Soft Primary:** `bg-primary text-primary-foreground border border-primary-dark/20`
- **Soft Secondary:** `bg-secondary text-secondary-foreground border border-secondary/20`
- **Soft Accent:** `bg-accent text-accent-foreground border border-accent-strong/20`

#### Typography
- **Font Weight:** `font-extrabold` (800) for maximum readability
- **Font Size:** `text-xs` (12px)
- **Letter Spacing:** Default or `tracking-wide` for all-caps text

#### Effects
- **Backdrop Blur:** `backdrop-blur-md` for glassmorphism depth
- **Border:** `border border-white/20` for definition against images
- **Border Radius:** `rounded-lg` (0.5rem)
- **No Shadows:** All `shadow-*` classes are forbidden. Depth is communicated through borders and background contrast alone.

#### Usage Rules
1. Use **solid backgrounds** for critical information (categories, status)
2. Use soft solid fills instead of bright gradients for featured or premium items
3. Always include `backdrop-blur-md` when overlaying images
4. Ensure text contrast ratio ≥ 4.5:1 (WCAG AA)
5. Use `text-accent-strong` for accent text or icons on light backgrounds
6. Never use `shadow-*`, `hover:shadow-*`, or `hover:-translate-y-*` — these are banned

### ⌨️ Form Elements
- **Inputs & Textareas:** Clean borders (`#e2e8f0`), rounded-xl, focal focus rings using `--color-primary`. No shadows on focus. Transition border-color only.
- **Checkboxes:** Themed with secondary colors.

---

## ✨ Philosophy: "Quiet Confidence"
The design follows a **Quiet Confidence** approach:
1. **Clarity over Complexity:** Use whitespace and hierarchy to guide the user.
2. **Restrained Motion:** No hover-driven lifts, scales, or shadow pops. Transitions are limited to essential state changes (color shifts on focus/press, opacity fades). Active states use subtle `scale-[0.985]` press feedback only.
3. **Flat & Clean:** No box-shadows of any kind. Depth is communicated through border contrast, background tinting, and spacing alone.
4. **Optimistic Tone:** Vibrant colors and rounded corners to feel welcoming for families.
5. **Resilience:** Mobile-first responsive layouts that degrade gracefully.

## 🔗 Sync Status
This document is synced with `app/design-system/page.tsx`. Any changes to the UI tokens in `globals.css` should be reflected here.
