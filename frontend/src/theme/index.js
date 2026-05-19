import { defineConfig } from '@chakra-ui/react'

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        surface: { value: '#fff8f5' },
        'surface-dim': { value: '#edd5c9' },
        'surface-bright': { value: '#fff8f5' },
        'surface-container-lowest': { value: '#ffffff' },
        'surface-container-low': { value: '#fff1ea' },
        'surface-container': { value: '#ffeadf' },
        'surface-container-high': { value: '#fbe4d7' },
        'surface-container-highest': { value: '#f6ded1' },
        'on-surface': { value: '#251911' },
        'on-surface-variant': { value: '#594139' },
        outline: { value: '#8d7168' },
        'outline-variant': { value: '#e1bfb5' },
        primary: { value: '#ab3500' },
        'on-primary': { value: '#ffffff' },
        'primary-container': { value: '#ff6b35' },
        'on-primary-container': { value: '#5f1900' },
        secondary: { value: '#7e5700' },
        'on-secondary': { value: '#ffffff' },
        'secondary-container': { value: '#ffba33' },
        'on-secondary-container': { value: '#6e4c00' },
        tertiary: { value: '#a43a40' },
        'on-tertiary': { value: '#ffffff' },
        'tertiary-container': { value: '#ef7377' },
        'on-tertiary-container': { value: '#660a18' },
        error: { value: '#ba1a1a' },
        'on-error': { value: '#ffffff' },
        'error-container': { value: '#ffdad6' },
        'on-error-container': { value: '#93000a' },
        success: { value: '#10b981' },
        'success-container': { value: '#d1fae5' },
        'on-success-container': { value: '#065f46' },
      },
      fonts: {
        heading: { value: "'Montserrat', sans-serif" },
        body: { value: "'Plus Jakarta Sans', sans-serif" },
      },
      fontSizes: {
        'headline-xl': { value: '2.5rem' },
        'headline-lg': { value: '1.8rem' },
        'headline-md': { value: '1.5rem' },
        'body-lg': { value: '1.125rem' },
        'body-md': { value: '1rem' },
        'label-md': { value: '0.875rem' },
      },
      fontWeights: {
        medium: { value: '500' },
        semibold: { value: '600' },
        bold: { value: '700' },
      },
      lineHeights: {
        tight: { value: '1.2' },
        snug: { value: '1.3' },
        normal: { value: '1.4' },
        relaxed: { value: '1.5' },
        loose: { value: '1.6' },
      },
      letterSpacings: {
        wider: { value: '0.02em' },
      },
      radii: {
        sm: { value: '0.25rem' },
        md: { value: '0.5rem' },
        lg: { value: '0.75rem' },
        xl: { value: '1rem' },
        '2xl': { value: '1.5rem' },
        card: { value: '2rem' },
        full: { value: '9999px' },
      },
      shadows: {
        'warm-ambient': { value: '0 8px 20px rgba(74, 59, 50, 0.05)' },
        'warm-hover': { value: '0 12px 24px rgba(74, 59, 50, 0.08)' },
        'warm-glow': { value: '0 4px 12px rgba(255, 107, 53, 0.3)' },
      },
    },
    semanticTokens: {
      colors: {
        bg: { value: '{colors.surface}' },
        'bg.subtle': { value: '{colors.surface-container-low}' },
        'bg.card': { value: '{colors.surface-container-lowest}' },
        'bg.sidebar': { value: '{colors.surface-container-low}' },
        'fg': { value: '{colors.on-surface}' },
        'fg.muted': { value: '{colors.on-surface-variant}' },
        'border.default': { value: '{colors.outline-variant}' },
        'border.strong': { value: '{colors.outline}' },
      },
      shadows: {
        card: { value: '{shadows.warm-ambient}' },
        'card-hover': { value: '{shadows.warm-hover}' },
      },
      radii: {
        container: { value: '{radii.xl}' },
        pill: { value: '{radii.full}' },
      },
    },
    textStyles: {
      'heading-xl': {
        value: {
          fontFamily: '{fonts.heading}',
          fontSize: '{fontSizes.headline-xl}',
          fontWeight: '{fontWeights.bold}',
          lineHeight: '{lineHeights.tight}',
        },
      },
      'heading-lg': {
        value: {
          fontFamily: '{fonts.heading}',
          fontSize: '{fontSizes.headline-lg}',
          fontWeight: '{fontWeights.bold}',
          lineHeight: '{lineHeights.snug}',
        },
      },
      'heading-md': {
        value: {
          fontFamily: '{fonts.heading}',
          fontSize: '{fontSizes.headline-md}',
          fontWeight: '{fontWeights.semibold}',
          lineHeight: '{lineHeights.normal}',
        },
      },
      'body-lg': {
        value: {
          fontFamily: '{fonts.body}',
          fontSize: '{fontSizes.body-lg}',
          lineHeight: '{lineHeights.loose}',
        },
      },
      'body-md': {
        value: {
          fontFamily: '{fonts.body}',
          fontSize: '{fontSizes.body-md}',
          lineHeight: '{lineHeights.relaxed}',
        },
      },
      'label-md': {
        value: {
          fontFamily: '{fonts.body}',
          fontSize: '{fontSizes.label-md}',
          fontWeight: '{fontWeights.semibold}',
          lineHeight: '{lineHeights.tight}',
          letterSpacing: '{letterSpacings.wider}',
        },
      },
    },
    recipes: {
      sidebarItem: {
        base: {
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          px: 4,
          py: 3,
          borderRadius: 'full',
          color: 'on-surface',
          transition: 'all 0.2s ease-in-out',
          textStyle: 'body-md',
          cursor: 'pointer',
          _hover: {
            bg: 'surface-variant',
          },
        },
        variants: {
          active: {
            true: {
              bg: 'secondary-container',
              color: 'on-secondary-container',
              fontWeight: 'bold',
              boxShadow: 'inset 4px 0 0 {colors.primary}',
              transform: 'translateX(4px)',
            },
          },
        },
      },
      gradientButton: {
        base: {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          px: 6,
          py: 3,
          borderRadius: 'full',
          bg: 'linear-gradient(135deg, {colors.primary-container}, {colors.secondary-container})',
          color: 'white',
          fontWeight: 'semibold',
          transition: 'all 0.2s ease-in-out',
          _hover: {
            transform: 'scale(1.02)',
            boxShadow: 'warm-glow',
          },
          _active: {
            transform: 'scale(0.98)',
          },
        },
      },
    },
  },
})

export default config
