---
name: Vibrant Scholastic
colors:
  surface: '#fff8f5'
  surface-dim: '#edd5c9'
  surface-bright: '#fff8f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fff1ea'
  surface-container: '#ffeadf'
  surface-container-high: '#fbe4d7'
  surface-container-highest: '#f6ded1'
  on-surface: '#251911'
  on-surface-variant: '#594139'
  inverse-surface: '#3b2d25'
  inverse-on-surface: '#ffede4'
  outline: '#8d7168'
  outline-variant: '#e1bfb5'
  surface-tint: '#ab3500'
  primary: '#ab3500'
  on-primary: '#ffffff'
  primary-container: '#ff6b35'
  on-primary-container: '#5f1900'
  inverse-primary: '#ffb59d'
  secondary: '#7e5700'
  on-secondary: '#ffffff'
  secondary-container: '#ffba33'
  on-secondary-container: '#6e4c00'
  tertiary: '#a43a40'
  on-tertiary: '#ffffff'
  tertiary-container: '#ef7377'
  on-tertiary-container: '#660a18'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbd0'
  primary-fixed-dim: '#ffb59d'
  on-primary-fixed: '#390c00'
  on-primary-fixed-variant: '#832600'
  secondary-fixed: '#ffdeab'
  secondary-fixed-dim: '#ffba33'
  on-secondary-fixed: '#281900'
  on-secondary-fixed-variant: '#5f4100'
  tertiary-fixed: '#ffdad9'
  tertiary-fixed-dim: '#ffb3b3'
  on-tertiary-fixed: '#410009'
  on-tertiary-fixed-variant: '#84222b'
  background: '#fff8f5'
  on-background: '#251911'
  surface-variant: '#f6ded1'
typography:
  headline-xl:
    fontFamily: Montserrat
    fontSize: 2.5rem
    fontWeight: '700'
    lineHeight: '1.2'
  headline-lg:
    fontFamily: Montserrat
    fontSize: 1.8rem
    fontWeight: '700'
    lineHeight: '1.3'
  headline-md:
    fontFamily: Montserrat
    fontSize: 1.5rem
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.125rem
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.875rem
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.02em
  headline-xl-mobile:
    fontFamily: Montserrat
    fontSize: 2rem
    fontWeight: '700'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
  container-max: 1280px
---

## Brand & Style

This design system is built to transform the administrative experience of school management into an energetic, welcoming, and intuitive journey. It targets educators, students, and parents, evoking a sense of optimism and reliability without the coldness of traditional enterprise software.

The aesthetic blends **Modernism** with **Tactile** warmth. By intentionally avoiding "Corporate Blues" and leaning into a sunset-inspired palette, the UI feels more like a supportive community tool than a rigid database. The style prioritizes high legibility, large touch targets, and soft, approachable surfaces that reduce the stress often associated with academic tracking.

## Colors

The palette is anchored in a "Vibrant Orange" primary hue that signals energy and action. This is balanced by "Mustard Yellow" for accents and "Soft Terracotta" for secondary categorization. 

Unlike traditional monochrome backgrounds, this design system utilizes "Warm Beige" and "Cream" for page surfaces to reduce eye strain and create a cozy, paper-like feel. Text is rendered in "Dark Brown" rather than pure black to maintain a softer contrast ratio that remains highly accessible while feeling organic.

## Typography

The typography strategy uses **Montserrat** for headlines to project confidence and modernity. Its geometric nature ensures that large titles remain impactful even in busy academic dashboards.

For body text and interface labels, **Plus Jakarta Sans** is employed for its friendly, rounded terminals and exceptional readability. This font choice reinforces the approachable personality of the design system. All body text should maintain a generous line height (1.5 - 1.6) to ensure long-form educational content is easy to digest for users of all ages.

## Layout & Spacing

The layout follows a **Fluid Grid** model with an emphasis on "Comfortable" density. A 12-column system is used for desktop, collapsing to 4 columns on mobile devices. 

Spacing is based on an 8px base unit. To maintain the "Vibrant" and "Modern" feel, the system uses generous padding within cards and containers (typically 24px or 32px) to prevent the UI from feeling cramped. Elements should reflow vertically on mobile, with margins decreasing to 16px to maximize the available screen real estate for data tables and lists.

## Elevation & Depth

Hierarchy is established through **Ambient Shadows** and tonal layering. Surfaces do not use harsh black shadows; instead, they utilize a soft, warm-tinted shadow (0 8px 20px rgba(74, 59, 50, 0.05)) that makes cards appear to float gently above the warm beige background.

Interactive elements use "Tonal Layers"—when an item is hovered, its shadow deepens slightly and the surface color may shift to the "Off-white warm" tone to provide immediate tactile feedback. There is a strict avoidance of heavy borders; where separation is needed, low-contrast 1px strokes in a light brown tint are preferred over solid lines.

## Shapes

The shape language is defined by **Large Rounded Corners**, reinforcing the friendly and safe nature of the school environment. 

While the system-wide standard is 0.5rem (Level 2), specific components scale this up for emphasis:
- **Cards & Containers:** Fixed at 1rem (16px) to create a soft frame for content.
- **Buttons & Inputs:** Use a 2rem (32px) radius, creating a full pill-shape that invites clicking.
- **Selection Indicators:** Use a 0.25rem radius to distinguish smaller functional icons from structural containers.

## Components

### Buttons
Primary buttons feature a subtle linear gradient from Primary Orange (#FF6B35) to Secondary Yellow (#F7B32B) at a 135-degree angle. They use a 0.2s ease-in-out transition for all hover states. Secondary buttons should use a ghost style with a Primary Orange border and text.

### Cards
Cards are the primary layout vehicle. They must use the "Off-white warm" (#FFFAF5) surface color to stand out against the background. They feature the signature 1rem corner radius and the soft warm ambient shadow.

### Input Fields
Inputs are styled with a 2rem pill-shape, a light tan background, and a subtle 1px border. On focus, the border transitions to Primary Orange with a soft outer glow.

### Chips & Badges
Used for student status or grade levels. These use the Tertiary "Soft Terracotta" or "Success Emerald" with high transparency (10-15% opacity) and full-color text to ensure they remain vibrant but not distracting.

### Lists & Navigation
Sidebar navigation uses "Dark Brown" text for high contrast. Active states are indicated by a "Mustard Yellow" vertical pill-shaped indicator and a slight weight change in the font.