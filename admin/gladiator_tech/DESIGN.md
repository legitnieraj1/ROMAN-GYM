# Design System Specification: Premium Roman Fitness Identity

## 1. Overview & Creative North Star
**Creative North Star: "The Digital Colosseum"**

This design system is a synthesis of ancient Roman architectural dominance and hyper-modern athletic technology. We are not building a standard gym app; we are building a high-performance terminal for modern warriors. The aesthetic is defined by **aggressive precision**. 

Unlike generic fitness platforms that rely on soft curves and friendly palettes, this system utilizes **intentional asymmetry**, **zero-radius corners**, and a **monolith-inspired hierarchy**. We break the "template" look by treating every screen as a tactical heads-up display (HUD). Expect sharp edges that suggest surgical accuracy and high-contrast typography that commands authority.

---

## 2. Colors
Our palette is forged from the charcoal of the forge and the electric energy of the arena.

### The Foundation
*   **Background (`#131314`):** The absolute base. Deep, immersive, and void-like.
*   **Primary (`#b6c4ff` / `#0059ff`):** Our "Electric Blue." Use this sparingly for high-impact CTAs and critical data points.
*   **Secondary/Metallic (`#bec8d3`):** This silver tone mimics brushed steel. Use it for secondary information and iconography to ground the electric blue.

### Visual Rules
*   **The "No-Line" Rule:** 1px solid borders are strictly prohibited for sectioning. Structural definition must be achieved through background shifts. For example, a `surface-container-low` section should sit directly on a `background` surface. Let the tonal shift define the edge.
*   **Signature Textures:** For primary CTAs and hero backgrounds, use a linear gradient transitioning from `primary` (`#b6c4ff`) to `primary_container` (`#0059ff`) at a 135-degree angle. This adds "soul" and mimics the sheen of high-tech gear.
*   **Glassmorphism:** For floating HUD elements or top navigation bars, use `surface_variant` at 60% opacity with a `20px` backdrop blur. This creates a "frosted tech" layer that integrates with the dark background.

---

## 3. Typography
We use a high-contrast pairing to balance aggression with readability.

*   **Display & Headlines (Space Grotesk):** This is our "Armor" font. It is wide, geometric, and aggressive. Use `display-lg` (3.5rem) for hero statements and workout titles. Bold weights only. 
*   **Body & Labels (Manrope):** Our "Tactical" font. Modern, highly legible, and clean. It provides the technical counterpoint to the display type. Use `body-lg` (1rem) for descriptions and `label-sm` (0.6875rem) for data metrics.

**Hierarchy Note:** Always lead with high-contrast sizing. A `display-lg` headline should feel massive compared to `body-md` text to create an editorial, high-end feel.

---

## 4. Elevation & Depth
In this system, depth is not "fluff"—it is structural hierarchy.

*   **The Layering Principle:** Stacking determines importance.
    *   **Level 0:** `surface_container_lowest` (Background elements)
    *   **Level 1:** `surface_container_low` (Standard sections)
    *   **Level 2:** `surface_container_high` (Interactive cards)
*   **Ambient Shadows:** If an element must float (like a floating action button), use an extra-diffused shadow: `box-shadow: 0 20px 40px rgba(0, 89, 255, 0.08)`. Note the subtle blue tint to match our light source.
*   **The Ghost Border:** For accessibility on interactive inputs, use `outline_variant` at **15% opacity**. It should be a "whisper" of a line, never a hard boundary.

---

## 5. Components

### Buttons
*   **Primary:** Sharp 0px corners. Gradient fill (`primary` to `primary_container`). Typography: `label-md` all-caps, 1.5px letter spacing.
*   **Secondary:** Sharp 0px corners. Solid `secondary_container` fill. Metallic silver text (`on_secondary_container`).
*   **Tertiary:** No background. `primary` text with a subtle underline offset by 4px.

### Sleek Data Cards (Dashboard)
*   **Styling:** Sharp edges (`0px` radius). Background: `surface_container_high`. 
*   **Layout:** No dividers. Use Spacing Scale `4` (1.4rem) to separate metrics. 
*   **Visual Interest:** Use a 2px vertical "accent bar" of `tertiary` (`#00daf3`) on the left edge of the card to indicate active status.

### Hero Sections
*   **Composition:** Large-scale imagery of athletes or Roman-inspired iconography. Overlay with a `surface_dim` gradient from the bottom to ensure text legibility.
*   **Typography:** `display-lg` text, left-aligned, overlapping the image boundary to break the grid.

### Input Fields
*   **Style:** `surface_container_lowest` background. No border, only a bottom-weighted `primary` line (2px) that activates on focus.
*   **Text:** `body-md` for user input, `label-sm` for floating labels.

---

## 6. Do's and Don'ts

### Do:
*   **Do** use extreme white space (Spacing `16` and `20`) between major sections to let the high-end imagery breathe.
*   **Do** keep all corners at `0px`. Roundness weakens the "Roman Warrior" aesthetic.
*   **Do** use `tertiary` (`#00daf3`) exclusively for "Success" states and vital health data (like Heart Rate).

### Don't:
*   **Don't** use standard grey shadows. Shadows should be invisible or subtly tinted with the primary blue.
*   **Don't** use dividers or horizontal rules. Separate content using tonal shifts between `surface_container` tiers.
*   **Don't** use center-alignment for long-form text. Keep it left-aligned to maintain a sharp, architectural edge.
*   **Don't** use generic icons. Use high-stroke-weight, geometric icons that match the `spaceGrotesk` aesthetic.