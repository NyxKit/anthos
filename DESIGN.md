---
name: Anthos
description: Local-first home monitoring and provisioning dashboard for Anthos nodes.
colors:
  surface-dim: "#0f1419"
  surface-container-lowest: "#0a0f14"
  surface-container-low: "#171c22"
  surface-container: "#1b2026"
  surface-container-high: "#252a30"
  surface-container-highest: "#30353b"
  surface-bright: "#353a40"
  surface-variant: "#30353b"
  divider: "#47474d33"
  divider-light: "#47474d1f"
  outline: "#988d9f"
  outline-variant: "#4c4354"
  text-1: "#dee3eb"
  text-2: "#cfc2d6"
  text-3: "#abaab18c"
  text-4: "#abaab140"
  primary: "#dcb8ff"
  primary-light: "#efdbff"
  primary-dark: "#6700b5"
  primary-highlight: "#b56eff"
  primary-container: "#b56eff"
  primary-fixed: "#efdbff"
  primary-fixed-dim: "#dcb8ff"
  on-primary: "#480082"
  on-primary-container: "#3f0072"
  secondary: "#9acbfb"
  secondary-light: "#cee5ff"
  secondary-dark: "#003353"
  secondary-highlight: "#0b4a73"
  secondary-container: "#0b4a73"
  on-secondary: "#003353"
  on-secondary-container: "#89bae9"
  tertiary: "#60de87"
  tertiary-light: "#7dfca0"
  tertiary-dark: "#003918"
  tertiary-highlight: "#17a656"
  tertiary-container: "#17a656"
  on-tertiary: "#003918"
  on-tertiary-container: "#003114"
  error: "#ffb4ab"
  error-light: "#ffdad6"
  error-dark: "#690005"
  error-container: "#93000a"
  on-error: "#690005"
  on-error-container: "#ffdad6"
typography:
  display:
    fontFamily: "Space Grotesk, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "42px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Space Grotesk, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Space Grotesk, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0"
  label:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
    fontSize: "0.625rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.1em"
rounded:
  xs: "0.125rem"
  sm: "0.25rem"
  md: "0.375rem"
  lg: "0.5rem"
  xl: "0.75rem"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  2xl: "32px"
  3xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.sm}"
    padding: "14px 20px"
  button-secondary:
    backgroundColor: "{colors.surface-container}"
    textColor: "{colors.text-2}"
    rounded: "{rounded.md}"
    padding: "14px 20px"
  nav-item-active:
    backgroundColor: "{colors.surface-container}"
    textColor: "{colors.primary}"
    rounded: "{rounded.sm}"
    padding: "12px 16px"
  metric-card:
    backgroundColor: "{colors.surface-container}"
    textColor: "{colors.text-1}"
    rounded: "{rounded.lg}"
    padding: "16px"
  sensor-tile:
    backgroundColor: "{colors.surface-container-low}"
    textColor: "{colors.text-1}"
    rounded: "{rounded.md}"
    padding: "16px"
  filters-panel:
    backgroundColor: "{colors.surface-container}"
    textColor: "{colors.text-1}"
    rounded: "{rounded.xl}"
    padding: "16px"
  status-dot:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.on-tertiary}"
    rounded: "{rounded.full}"
    padding: "4px 8px"
---

# Design System: Anthos

## 1. Overview

**Creative North Star: "The Living Laboratory"**

Anthos is a dark, local-first control surface for a home operator looking at live node health in a dim room, often at a desk or near a NAS rack. The UI leans into technical calm, with compact data surfaces, restrained glow, and deliberate asymmetry instead of generic SaaS symmetry.

The current system reads as an instrument panel more than a marketing site. It favors clear state, readable telemetry, and a confident purple accent over decorative noise. It rejects generic SaaS dashboards, overly playful consumer polish, and loud neon maker aesthetics.

Key characteristics:
- Dark, low-glare environment tuned for home and utility-room use.
- Technical typography with strong contrast between headline and label roles.
- Surface depth through tonal shifts, light borders, and occasional shadow.
- Clear distinction between live, inactive, warning, and critical states.

## 2. Colors

Anthos uses a dark purple-led palette with blue secondary support, green success states, and red critical states.

### Primary
- **Primary Purple** (`#dcb8ff`): the main accent for brand moments, active navigation, and emphasis.
- **Primary Container Purple** (`#b56eff`): used for stronger fills and highlighted action states.
- **Deep Primary** (`#6700b5`): reserved for pressed, inverse, or high-contrast text treatments.

### Secondary
- **Secondary Blue** (`#9acbfb`): informational support color for neutral status and utility actions.
- **Secondary Container Blue** (`#0b4a73`): deeper UI fills and selected background states.

### Tertiary
- **Success Green** (`#60de87`): connected, healthy, and active node states.
- **Tertiary Container Green** (`#17a656`): stronger success fills and confirmation states.

### Error
- **Error Rose** (`#ffb4ab`): critical alerts and degraded sensor state.
- **Error Container Red** (`#93000a`): severe alert fill and destructive emphasis.

### Neutral
- **Surface Dim** (`#0f1419`): app background.
- **Surface Container Low** (`#171c22`): shell and grouped panel backgrounds.
- **Surface Container** (`#1b2026`): primary content panels.
- **Surface Container High** (`#252a30`): elevated or hover states.
- **Surface Container Highest** (`#30353b`): strongest layer in the current system.
- **Outline Variant** (`#4c4354`): thin separators and subtle borders.
- **Text 1** (`#dee3eb`): primary body text.
- **Text 2** (`#cfc2d6`): secondary labels and navigation text.
- **Text 3** (`#abaab18c`): muted metadata and low-priority labels.

### Named Rules
**The Night Console Rule.** Dark surfaces are the default because the product is used in low-light home environments and should minimize glare.

**The Purple Is Rare Rule.** Purple carries identity and active state, not decoration for its own sake.

## 3. Typography

**Display Font:** Space Grotesk, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
**Body Font:** Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
**Label/Mono Font:** ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace

**Character:** The pairing feels technical without turning sterile. Headlines are compact and architectural, while labels and telemetry keep a fixed-width, operational tone.

### Hierarchy
- **Display** (700, 42px, 1): used for landing titles and highest-level views.
- **Headline** (700, 2rem, 1.1): used for page and section titles.
- **Title** (500, 1.5rem, 1.2): used for card headings and major node values.
- **Body** (400, 0.875rem, 1.5, 65 to 75ch): used for general interface copy.
- **Label** (700, 0.625rem, 0.1em, uppercase): used for sensor labels, timestamps, and meta.

### Named Rules
**The Monospace Label Rule.** Low-level UI labels, log metadata, and sensor tags stay fixed-width so technical data remains scannable.

## 4. Elevation

The system uses tonal layering first, then thin borders and soft glow. Most depth comes from shifting between `surface-dim`, `surface-container-low`, `surface-container`, and `surface-container-high`, with a small set of low-opacity shadows for float and emphasis. It is not a pure flat system, but it also avoids heavy material-style elevation.

### Shadow Vocabulary
- **xs** (`0 0 24px -4px rgba(230, 228, 236, 0.04)`): subtle bloom on quiet surfaces.
- **sm** (`0 0 24px -4px rgba(230, 228, 236, 0.06)`): low emphasis hover and support depth.
- **md** (`0 0 32px -4px rgba(230, 228, 236, 0.08)`): stronger floating utility surfaces.
- **lg** (`0 0 40px -4px rgba(230, 228, 236, 0.10)`): prominent overlays.
- **xl** (`0 0 48px -4px rgba(230, 228, 236, 0.12)`): rare high-focus lift.

### Named Rules
**The Thin Boundary Rule.** Borders stay subtle and structural, not decorative.

## 5. Components

### Buttons
Buttons are compact, square-leaning controls with a precision-tool feel.
- **Shape:** small radii, typically `0.25rem` to `0.375rem`.
- **Primary:** purple fill with dark text, used for the strongest action.
- **Secondary:** muted surface fill with lighter text, used for navigation and alternate actions.
- **Hover / Focus:** background brightens or deepens, rather than adding heavy motion.

### Navigation
The sidebar is fixed, narrow, and text-forward.
- **Style:** uppercase labels, icon plus text, fixed left rail.
- **Active state:** purple text with a deeper surface background.
- **Mobile treatment:** hidden below tablet widths.

### Metric Cards
Metric surfaces are compact data tiles.
- **Corner Style:** `0.5rem`.
- **Background:** `surface-container`.
- **Border:** subtle outline or accent edge in some variants.
- **Internal Padding:** 16px.

### Sensor Tiles
Sensor tiles are dense and grid-based, with stronger focus on value than decoration.
- **Style:** low surface, square grid seams, small label text.
- **State:** inactive values fade, critical moisture state turns red and gets a stronger tint.

### Filters Panel
The logs filter bar is a dense utility surface.
- **Style:** grouped controls on a surface container with a light border.
- **State:** responsive grid collapses from five columns to two, then one.

### Status Dot
The status pill is small but explicit.
- **Style:** rounded success or info marker with uppercase text.
- **State:** online uses green, offline falls back to info tone.

## 6. Do's and Don'ts

### Do:
- **Do** keep surfaces dark and low-glare for home and late-night use.
- **Do** use `#dcb8ff` and `#b56eff` for active state and identity, not everywhere.
- **Do** preserve small radii, tight spacing, and fixed-width labels for technical readability.
- **Do** make live, warning, and critical states obvious at a glance.

### Don't:
- **Don't** turn the app into a generic SaaS dashboard with interchangeable cards and enterprise polish.
- **Don't** make it feel like an overly playful consumer app that hides the technical details.
- **Don't** push it into loud neon maker aesthetics or decorative glow for its own sake.
- **Don't** use 1px borders as the main visual system when tonal depth can carry the structure.
