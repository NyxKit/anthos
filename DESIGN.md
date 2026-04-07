# Design System Specification: Athos Digital Ecosystem

## 1. Overview & Creative North Star: "The Living Laboratory"
This design system is built to bridge the gap between raw botanical data and high-end technical instrumentation. Our Creative North Star is **The Living Laboratory**—an aesthetic that treats the dashboard not as a flat screen, but as a deep, illuminated glass console. 

We move away from the "SaaS template" look by embracing **Intentional Asymmetry**. Large-scale data visualizations should sit offset against compact control modules, creating a rhythmic tension that feels bespoke and engineered. The experience must feel "technical" through monospaced precision, but "premium" through luxurious negative space and tonal depth.

---

## 2. Color Theory & Tonal Depth
The palette utilizes the dark foundation of the brand to create a high-contrast, data-centric environment. We prioritize the "glow" of information against the "void" of the background.

### Surface Hierarchy & The "No-Line" Rule
Traditional 1px borders are strictly prohibited for sectioning. They create visual noise that distracts from the data. Instead, define boundaries through **Tonal Transitions**:
- **Baseline:** The application background uses `surface` (`#0f1419`).
- **Nesting:** Place a `surface_container_low` (`#171c22`) area to define a workspace.
- **Elevation:** Content cards or individual sensor modules should use `surface_container` (`#1b2026`) or `surface_container_high` (`#252a30`) to create a natural, "stepped" lift.

### The "Glass & Gradient" Rule
To elevate the UI beyond flat blocks, use **Glassmorphism** for floating elements (e.g., tooltips, popovers, or floating navigation):
- Apply `surface_variant` with a 60% opacity and a `24px` backdrop blur.
- **Signature Textures:** Use subtle linear gradients for primary actions. A transition from `primary` (`#dcb8ff`) to `primary_container` (`#b56eff`) at a 135-degree angle provides a tactile, "lit from within" quality.

---

## 3. Typography: The Technical Monolith
The system utilizes a dual-type approach to balance editorial authority with raw data legibility.

*   **Headlines & Display (Space Grotesk / Mona Sans VF):** Used for high-level plant names and critical metrics. These should feel architectural. Use `display-lg` for hero metrics (e.g., Temperature percentage) to create an "editorial" hierarchy.
*   **Data & Labels (Inter / ui-monospace):** All sensor readouts, timestamps, and technical logs must use the monospaced weight. This ensures that changing digits do not cause horizontal layout shifts and maintains the "technical laboratory" feel.

| Role | Token | Font | Size | Intent |
| :--- | :--- | :--- | :--- | :--- |
| **Hero Metric** | `display-lg` | Space Grotesk | 3.5rem | Primary Data Point (e.g., 72%) |
| **Section Header**| `headline-sm` | Space Grotesk | 1.5rem | Sensor Category (e.g., Soil Health) |
| **Readout** | `title-md` | Inter (Mono) | 1.125rem | Value Labeling |
| **Technical Log** | `label-sm` | Inter (Mono) | 0.6875rem | Metadata / Timestamps |

---

## 4. Elevation & Depth: Tonal Layering
We do not use shadows to represent light; we use color to represent proximity.

*   **The Layering Principle:** Stacking is the primary tool for hierarchy. A `surface_container_highest` element suggests it is physically closer to the user than a `surface_dim` background. 
*   **Ambient Shadows:** If a floating state is required (e.g., a modal), use an ultra-diffused shadow: `offset: 0 20px, blur: 40px, color: rgba(0, 0, 0, 0.4)`. 
*   **The Ghost Border:** If a boundary is required for accessibility (e.g., in a high-density data grid), use a `Ghost Border`: `outline_variant` at 15% opacity. It should be felt, not seen.

---

## 5. Component Logic

### Metrics & Sensor Cards
*   **Rule:** Forbid divider lines. Separate "Current Value" from "Historical Trend" using a shift from `surface_container` to `surface_container_low`.
*   **Status Indicators:** Use `tertiary` (`#60de87`) for "Optimal" and `error` (`#ffb4ab`) for "Critical." These should have a subtle outer glow (bloom) using their own color at 20% opacity.

### Buttons (Action Modules)
*   **Primary:** Gradient fill (`primary` to `primary_container`). `0.25rem` (sm) roundedness for a precision-tool feel.
*   **Secondary:** No fill. `Ghost Border` using `outline`. Text color `on_surface`.
*   **Tertiary:** Text only, `ui-monospace`, all caps, `0.75rem`.

### Input Fields & Controls
*   **Base:** `surface_container_lowest`. 
*   **Focus State:** Do not change the border color; instead, shift the background to `surface_bright` and add a `primary` "glow" line (2px) only at the bottom of the field.

### Selection Chips
*   For plant filtering or timeline toggles (24h, 7d, 30d). 
*   **Active:** `secondary_container` background with `on_secondary_container` text.
*   **Inactive:** `surface_container_high` background.

---

## 6. Do’s and Don’ts

### Do
*   **DO** use monochromatic icons with a single accent color for active states.
*   **DO** allow for "Breathing Room." Data-heavy dashboards need more whitespace than standard apps to prevent cognitive overload.
*   **DO** use the `tertiary` green (`#1FAA59`) strictly for healthy biological data.

### Don't
*   **DON'T** use 100% white (#FFFFFF) for body text. Use `on_surface` (`#dee3eb`) to reduce eye strain in dark environments.
*   **DON'T** use standard "Drop Shadows." Use tonal shifts (Surface Levels) to indicate elevation.
*   **DON'T** use rounded corners larger than `0.5rem` (lg) for functional data components; keep the "technical instrument" feel sharp and precise.