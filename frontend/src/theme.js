import { extendTheme } from '@chakra-ui/react';
import '@fontsource/montserrat/700.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';

const colors = {
  // Background & Surfaces — creamy warm
  background: '#FFF8F2',         // Soft warm cream (main page background)
  surface: '#FFFDFB',            // Vanilla surface (cards, containers)
  surfaceDim: '#F5E6D8',         // Warm dimmed tone for subtle backgrounds
  surfaceBright: '#FFF8F2',      // Same as background
  containerLowest: '#ffffff',    // Pure white for elevated surfaces
  containerLow: '#FFFDFB',       // Vanilla
  container: '#FFF9F4',          // Slightly warmer cream
  containerHigh: '#FFF5ED',      // Warmer still
  containerHighest: '#FFF0E5',   // Warmest surface

  // On-colors — text on surfaces
  onSurface: '#463021',          // Base body text (slate-700)
  onSurfaceVariant: '#7D5A44',   // Soft cocoa text for secondary info (slate-500)
  inverseSurface: '#2D1B08',     // Dark chocolate (for dark backgrounds)
  inverseOnSurface: '#FFFDFB',   // Light text on dark backgrounds

  // Outlines
  outline: '#E8D5C4',            // Cream border (slate-100)
  outlineVariant: '#D8C3B1',     // Medium cream border (slate-200)

  // Brand colors
  primary: '#FF6B35',            // Brand Orange / Warm Amber
  secondary: '#F7C59F',          // Light Peach accent
  tertiary: '#2D1B08',           // Cozy Dark Chocolate (sidebar)
  tertiaryContainer: '#3D2511',  // Rich Warm Brown container

  // Status colors
  success: '#10B981',            // Emerald green
  error: '#EF4444',              // Red

  // REMOVE roleBg entirely — no more per-role color tints

  // Slate scale for text and elements (mapped from spec)
  slate: {
    50: '#FFFDFB',
    100: '#E8D5C4',
    200: '#D8C3B1',
    300: '#C0A997',
    400: '#9C8370',
    500: '#7D5A44',
    600: '#634532',
    700: '#463021',
    800: '#2D1B08',
    900: '#1B0F04',
  },

  // Brand scale derived from primary (#FF6B35)
  brand: {
    50: '#FFF0EB',
    100: '#FFD1BF',
    200: '#FFB394',
    300: '#FF9468',
    400: '#FF7A4D',
    500: '#FF6B35',
    600: '#E85A28',
    700: '#C4461D',
    800: '#9E3514',
    900: '#7A260C',
  },
};

const fonts = {
  heading: `'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`,
  body: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`,
};

const radii = {
  card: '32px',
  pill: '9999px',
  input: '12px',
};

const shadows = {
  warm: 'rgba(45, 27, 8, 0.08) 0px 14px 20px 4px',
  warmMd: 'rgba(45, 27, 8, 0.12) 0px 8px 16px 0px',
  warmSm: 'rgba(45, 27, 8, 0.06) 0px 4px 8px 0px',
  outline: '0 0 0 3px rgba(255, 107, 53, 0.25)',
};

const styles = {
  global: {
    'html, body': {
      bg: 'surface',
      color: 'onSurface',
      fontFamily: 'body',
      scrollBehavior: 'smooth',
    },
    '.glass-panel': {
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      background: 'rgba(255, 255, 255, 0.6)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      borderRadius: 'card',
      boxShadow: 'warm',
    },
    '@keyframes gradientShift': {
      '0%': { backgroundPosition: '0% 50%' },
      '50%': { backgroundPosition: '100% 50%' },
      '100%': { backgroundPosition: '0% 50%' },
    },
    '.animated-gradient': {
      animation: 'gradientShift 8s ease infinite',
      bgGradient: 'linear(-45deg, primary, secondary, brand.300, primary)',
      backgroundSize: '400% 400%',
    },
    '@keyframes fadeSlideIn': {
      '0%': { opacity: '0', transform: 'translateY(6px)' },
      '100%': { opacity: '1', transform: 'translateY(0)' },
    },
  },
};

const components = {
  Button: {
    baseStyle: {
      fontWeight: 600,
      borderRadius: 'pill',
      transition: 'transform 160ms ease-out, box-shadow 200ms ease-out',
      _active: {
        transform: 'scale(0.97)',
      },
    },
    sizes: {
      md: { px: 6, py: 3, fontSize: 'md' },
      lg: { px: 8, py: 4, fontSize: 'lg' },
    },
    variants: {
      solid: {
        bg: 'primary',
        color: 'white',
        _hover: {
          bg: 'brand.600',
          transform: 'translateY(-1px)',
          boxShadow: 'warmMd',
        },
        _active: {
          bg: 'primary',
          transform: 'scale(0.97)',
        },
      },
      ghost: {
        _hover: { bg: 'containerLow' },
      },
      outline: {
        borderColor: 'primary',
        color: 'primary',
        _hover: { bg: 'primary', color: 'white' },
      },
      danger: {
        bg: 'error',
        color: 'white',
        _hover: { bg: '#dc2626' },
        _active: { transform: 'scale(0.97)' },
      },
      success: {
        bg: 'success',
        color: 'white',
        _hover: { bg: '#16a34a' },
      },
    },
    defaultProps: { size: 'md', variant: 'solid' },
  },
  Card: {
    baseStyle: {
      container: {
        borderRadius: 'card',
        boxShadow: 'warm',
        bg: 'white',
        p: 6,
      },
    },
  },
  Input: {
    baseStyle: {
      field: {
        borderRadius: 'input',
        bg: 'white',
        borderColor: 'outlineVariant',
        _focus: {
          borderColor: 'primary',
          boxShadow: 'outline',
        },
        _invalid: {
          borderColor: 'error',
          boxShadow: '0 0 0 1px #ef4444',
        },
      },
    },
  },
  Select: {
    baseStyle: {
      field: {
        borderRadius: 'input',
        bg: 'white',
        borderColor: 'outlineVariant',
        _focus: {
          borderColor: 'primary',
          boxShadow: 'outline',
        },
      },
    },
  },
  Modal: {
    baseStyle: {
      dialog: {
        borderRadius: 'card',
        boxShadow: 'warm',
      },
    },
  },
  Badge: {
    variants: {
      solid: {
        px: 3,
        py: 1,
        borderRadius: 'pill',
        fontWeight: 500,
        textTransform: 'capitalize',
      },
      subtle: {
        px: 2,
        py: 0.5,
        borderRadius: 'pill',
        fontWeight: 500,
      },
    },
    defaultProps: { variant: 'subtle' },
  },
  Skeleton: {
    baseStyle: {
      borderRadius: 'input',
    },
  },
  Table: {
    baseStyle: {
      th: {
        fontWeight: 600,
        fontSize: 'sm',
        color: 'onSurfaceVariant',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      },
      td: {
        fontSize: 'sm',
      },
    },
  },
};

const theme = extendTheme({
  colors,
  fonts,
  radii,
  shadows,
  styles,
  components,
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
});

export default theme;
