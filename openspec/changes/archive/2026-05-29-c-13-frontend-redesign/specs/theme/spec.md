# Spec: frontend-theme

## Overview
Design system tokens del rediseño Stitch adaptados a Chakra UI mediante `extendTheme`. Define colores, tipografía, radios, sombras, glassmorphism, tintes por rol y animaciones base.

## ADDED Requirements

### Requirement: Theme exports centralized colors
The system SHALL define all color tokens in `frontend/src/theme.js` using `extendTheme` with a `colors` object.

**Token mappings:**
| Stitch Token | Chakra Value | Uso |
|---|---|---|
| surface: #f9f9ff | colors.surface | Fondo general |
| surface-dim: #d6dae8 | colors.surfaceDim | Fondo secundario |
| surface-container-low: #f1f3ff | colors.containerLow | Cards base |
| surface-container: #e9edfc | colors.container | Cards elevadas |
| primary: #0052b1 | colors.primary | Botones, links, acentos principales |
| primary-container: #0069e0 | colors.primaryContainer | Hover primary |
| secondary: #7d38c7 | colors.secondary | Acentos secundarios |
| tertiary: #963700 | colors.tertiary | Alertas altas |
| vivid-amber: #f59e0b | colors.amber | Badges alerta media |
| vivid-orange: #ea580c | colors.orange | Badges alerta alta |
| vivid-terracotta: #7c2d12 | colors.terracotta | Textos warm |
| success-green: #22c55e | colors.success | Badge presente, aprobado |
| error-red: #ef4444 | colors.error | Badge ausente, rechazado |

#### Scenario: Colors are accessible via Chakra theme
- **WHEN** any component uses `colorScheme="primary"` or accesses `theme.colors.primary`
- **THEN** the value SHALL resolve to `#0052b1`

### Requirement: Role tints are available as semantic tokens
The system SHALL define `colors.roleBg` as an object with admin (`#f4f0ff`), preceptor (`#e6fcf5`), docente (`#fff4ed`), and padre (`#fff0f6`) tints.

#### Scenario: Dashboard background uses role tint
- **WHEN** an admin dashboard renders
- **THEN** the page background SHALL be `colors.roleBg.admin`

### Requirement: Typography uses Montserrat + Inter
The system SHALL set `fonts.heading` to Montserrat (700 weight) and `fonts.body` to Inter (400/500/600 weight) via `@fontsource/montserrat` and `@fontsource/inter`.

#### Scenario: Headings render in Montserrat
- **WHEN** a `<Heading>` component renders
- **THEN** its font-family SHALL be Montserrat

#### Scenario: Body text renders in Inter
- **WHEN** a `<Text>` component renders
- **THEN** its font-family SHALL be Inter

### Requirement: Border radius tokens match Stitch
The system SHALL set `radii.card` to `32px`, `radii.button` to `full` (pill style), and `radii.input` to `12px`.

#### Scenario: Cards have 32px border radius
- **WHEN** a card component renders with `borderRadius="card"`
- **THEN** the computed radius SHALL be `32px`

### Requirement: Shadow tokens use warm terracotta
The system SHALL define `shadows.warm` as `rgba(124, 45, 18, 0.08) 0px 14px 20px 4px` and `shadows.warmMd` as `rgba(124, 45, 18, 0.12) 0px 8px 16px 0px`.

#### Scenario: Cards cast warm shadow
- **WHEN** a card component renders with `shadow="warm"`
- **THEN** the shadow color SHALL use warm terracotta rgba

### Requirement: Glassmorphism panel class
The system SHALL define a `.glass-panel` style via Chakra `styles.global` with `backdrop-filter: blur(12px)`, `background: rgba(255,255,255,0.6)`, and `border: 1px solid rgba(255,255,255,0.3)`.

#### Scenario: Glass panel renders with blur
- **WHEN** a component uses `className="glass-panel"`
- **THEN** it SHALL have backdrop-filter blur(12px) and semi-transparent white background

### Requirement: Animated gradient for LoginPage
The system SHALL define a `@keyframes gradientShift` animation via Chakra keyframes that transitions 3 gradient stops over 8 seconds, and a `useToken`-compatible style for the LoginPage background.

#### Scenario: Login background animates
- **WHEN** the LoginPage renders
- **THEN** its background SHALL show a moving gradient animation
