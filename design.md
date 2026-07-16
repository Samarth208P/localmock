# LocalMock Design System (Neutral Black Theme)

This document outlines the core aesthetics, color palette, and styling principles for the LocalMock frontend. This ensures a consistent, premium, and "cool" look across all pages and components.

## 🎨 1. Core Color Palette

Our aesthetic is built on a neutral, near-black background with a vibrant indigo accent. This provides a sleek, modern, and developer-focused "dark mode native" experience without tinting the neutrals.

### Backgrounds
- **Primary Background:** `#0a0a0b` - Used for the main body/app canvas.
- **Secondary Background:** `#141416` - Used for sidebars, panels, or elevated sections.
- **Tertiary Background:** `#1c1c1f` - Used for cards, modals, or active list items.

### Accents
- **Primary Accent (Indigo):** `#6366f1` - Used for primary buttons, active states, checkboxes, and the main logo/favicon.
- **Accent Hover:** `#818cf8` - A lighter, softer indigo used for hover states on primary elements.
- **Subtle Accent:** `rgba(99, 102, 241, 0.1)` - A highly transparent indigo used for subtle background highlights on list items or inactive button states.

### Text & Typography
- **Primary Text:** `#fafafa` - High-contrast white for primary headings and body text.
- **Secondary Text:** `#a1a1aa` - Neutral gray for subtitles and secondary information.
- **Muted Text:** `#71717a` - Used for placeholders, disabled states, and very subtle metadata.

### Borders
- **Subtle Border:** `#2a2a2e` - Used for standard dividers, card borders, and input outlines.
- **Active Border:** `#3a3a40` (or `#6366f1` accent when focused) - Used when an input is focused or a card is actively selected.

---

## 🔤 2. Typography

We use standard, highly legible fonts tailored for developer tools.

- **Primary UI Font:** `Outfit` (sans-serif). A sleek, modern, geometric font that fits the data-driven tech aesthetic perfectly. Used for all general UI, headings, buttons, and labels.
- **Monospace Font:** `JetBrains Mono`. Used for anything code-related (schema definitions, code editors, generated mock data output, terminal logs).

---

## ✨ 3. UI Effects & Micro-Animations

### The "Glow Effect"
To make the interface feel alive and premium, we use a custom indigo glow effect on interactive elements (primary buttons, active input fields, or focus states). 

**CSS Class:** `.glow-effect`
- Base State: `box-shadow: 0 0 15px rgba(99, 102, 241, 0.3);`
- Hover State: `box-shadow: 0 0 25px rgba(99, 102, 241, 0.6);`

### Transitions
- **Fade In:** Elements should smoothly fade in when appearing (`.animate-in`).
- **Scale In:** Modals and tooltips should slightly scale up (`.animate-scale-in`) to feel snappy.

---

## 🧱 4. Component Styling Guide

### Buttons
- **Primary Button:** Background `#6366f1`, Text `#fafafa`. On hover, background shifts to `#818cf8` or applies the `.glow-effect`.
- **Secondary/Outline Button:** Background transparent, Border `#2d1b40`, Text `#d8c3ed`. On hover, background becomes `var(--accent-subtle)` and border becomes `#6366f1`.

### Inputs & Textareas (The Editor)
- **Base State:** Background `#120a1a` (Secondary), Border `#2d1b40`, Text `#fafafa`.
- **Focus State:** Border changes to `#6366f1` and gains a subtle outer ring (glow).

### Cards & Panels
- **Base:** Background `#1e112a` (Tertiary), Border `#2d1b40`, subtle border radius (e.g., `rounded-xl`).
- **Hover (if interactive):** Border transitions to a slightly brighter indigo, or applies a subtle Y-axis translation (floating effect).

## 💡 5. General Aesthetic Rules
1. **No Pure Blacks or Whites:** Always tint the darks and lights slightly with purple to maintain color harmony.
2. **High Contrast:** Ensure text is always easily readable against the deep purple backgrounds (WCAG 2.1 AA compliant).
3. **Keep It Clean:** Use padding and margins generously. Let the dark space breathe.
