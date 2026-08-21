---
name: Amber & Sage
colors:
  surface: '#fff9e9'
  surface-dim: '#e1dac2'
  surface-bright: '#fff9e9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fbf4db'
  surface-container: '#f5eed5'
  surface-container-high: '#efe8d0'
  surface-container-highest: '#e9e3ca'
  on-surface: '#1e1c0d'
  on-surface-variant: '#504537'
  inverse-surface: '#343120'
  inverse-on-surface: '#f8f1d8'
  outline: '#827565'
  outline-variant: '#d4c4b2'
  surface-tint: '#815500'
  primary: '#815500'
  on-primary: '#ffffff'
  primary-container: '#fec166'
  on-primary-container: '#764e00'
  inverse-primary: '#f8bc61'
  secondary: '#59623b'
  on-secondary: '#ffffff'
  secondary-container: '#dee8b5'
  on-secondary-container: '#5f6840'
  tertiary: '#59623e'
  on-tertiary: '#ffffff'
  tertiary-container: '#c7d1a4'
  on-tertiary-container: '#515a36'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffddb2'
  primary-fixed-dim: '#f8bc61'
  on-primary-fixed: '#291800'
  on-primary-fixed-variant: '#624000'
  secondary-fixed: '#dee8b5'
  secondary-fixed-dim: '#c2cb9b'
  on-secondary-fixed: '#171e01'
  on-secondary-fixed-variant: '#424a25'
  tertiary-fixed: '#dde7b9'
  tertiary-fixed-dim: '#c1cb9f'
  on-tertiary-fixed: '#171e03'
  on-tertiary-fixed-variant: '#424a28'
  background: '#fff9e9'
  on-background: '#1e1c0d'
  surface-variant: '#e9e3ca'
typography:
  headline-lg:
    fontFamily: Quicksand
    fontSize: 36px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Quicksand
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Quicksand
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Quicksand
    fontSize: 18px
    fontWeight: '500'
    lineHeight: '1.6'
  body-md:
    fontFamily: Quicksand
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-sm:
    fontFamily: Nunito Sans
    fontSize: 13px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: 0.05em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  unit: 8px
  container-padding: 2rem
  gutter: 1.5rem
  card-gap: 2rem
---

## Brand & Style

The design system is built to evoke the feeling of a sun-drenched morning in a quiet garden. It prioritizes emotional safety, warmth, and a gentle sense of organization, moving away from rigid digital structures toward a tactile, stationery-inspired aesthetic.

The visual style is **Soft Minimalist** with **Tactile** influences. It utilizes organic, oversized rounded corners and generous whitespace to reduce cognitive load. The personality is whimsical yet functional, incorporating hand-drawn decorative motifs (leaves, stars) to break the "perfect" digital grid and ground the experience in a human, personal touch.

## Colors

The palette is anchored by a warm, non-reflective cream background that mimics high-quality paper. The primary accent is a soft sunset orange used for calls to action, while secondary greens provide a calming, botanical rhythm.

- **Background**: Use `#fdf6dd` for the base canvas.
- **Text**: All typography should use `#716955` to maintain a soft contrast that is easier on the eyes than pure black.
- **Accent**: Use `#fec166` for interactive elements and highlights.
- **Muted Accents**: Use `#d9e3b1` and `#a9b388` for categorization, secondary buttons, or decorative background shapes.

## Typography

This design system uses **Quicksand** as the primary typeface for its rounded terminals and friendly, open geometry. For smaller utility labels, **Nunito Sans** provides slightly more structure while maintaining the soft aesthetic.

Maintain generous line heights (1.6 for body text) to ensure a relaxed reading pace. Headlines should have a slight negative letter spacing to feel more cohesive and "hand-lettered."

## Layout & Spacing

The layout follows a **Fluid Grid** model with extreme "safe zones" to emphasize the cozy, uncrowded atmosphere. 

- **Desktop**: A 12-column grid with wide 32px gutters. Content is often centered in a 1000px container to prevent eye strain.
- **Mobile**: Single column with 24px side margins.
- **Rhythm**: Use an 8px base unit. Spacing between major sections should be aggressive (48px to 64px) to allow the "whimsical motifs" to breathe between elements.

## Elevation & Depth

Depth is achieved through **Tonal Layering** and **Soft Diffusion** rather than harsh shadows.

- **Surface 1 (Base)**: `#fdf6dd` (Warm Cream).
- **Surface 2 (Cards)**: White (#FFFFFF) with a very soft, low-opacity shadow.
- **Shadows**: Use a "Cloud Shadow" style: `0px 10px 30px rgba(113, 105, 85, 0.08)`. The shadow color is a semi-transparent version of the Earthy Brown text color, keeping the elevation looking natural and "baked-in."
- **Interactive Depth**: When hovering over cards, the shadow should slightly expand and the element should lift by 2-4px.

## Shapes

The shape language is dominated by **Pill-shapes** and **Oversized Radii**.

- **Primary Containers**: Cards use a `2rem` (32px) corner radius.
- **Interactive Elements**: Buttons and input fields use full "pill" rounding (100vh).
- **Decorative**: Use slightly asymmetrical, organic "blob" shapes for background accents behind icons or date numbers to reinforce the hand-drawn feel.

## Components

- **Buttons**: Pill-shaped. Primary buttons use the Warm Yellow-Orange (`#fec166`) with white text. Secondary buttons use a soft outline of the Sage Green or a solid Light Yellow-Green background.
- **Cards**: Large white surfaces with 32px rounded corners and cloud shadows. Padding inside cards should be at least 24px.
- **Input Fields**: Soft cream backgrounds (a shade lighter or darker than the main BG) with no borders—only a subtle focus ring in the primary accent color.
- **Chips/Tags**: Small pill shapes using the secondary palette (`#d9e3b1`). Use for mood tags or categories.
- **Lists**: Items are separated by generous vertical space (16px) rather than thin lines. If a divider is needed, use a dashed line to mimic a notebook.
- **Decorative Motifs**: Scatter hand-drawn style SVG icons of leaves and stars at the corners of containers or as floating accents in the page margins.