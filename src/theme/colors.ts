/**
 * Modern Pastel-Accented Financial Application Design System Tokens
 *
 * Core Palette:
 * - Background (App Background): #F7F8FA (Very light, cool off-white)
 * - Surfaces/Cards: #FFFFFF (Pure white for elevated cards and modals)
 * - Primary Text & Dark Accents: #121214 (Deep slate / almost black for maximum contrast and high-level typography)
 * - Secondary Text: #8E8E93 (Muted gray for subtitles and placeholder text)
 *
 * Accent Colors:
 * - Mint Green: #AEE1D3 (Success states, positive balances, subtle circular icon backgrounds)
 * - Lavender/Lilac: #E6E0F2 (Secondary icon backgrounds, categorized list items)
 * - Soft Holographic Pink/Purple: #F2E6F5 (Gradients, premium highlights, decorative geometric shapes)
 */

export const Palette = {
  // Core Surfaces & Backgrounds
  background: '#F7F8FA', // Very light, cool off-white
  surface: '#FFFFFF', // Pure white elevated cards & modals
  surfaceElevated: '#FFFFFF',

  // High-Contrast Typography
  textPrimary: '#121214', // Deep slate / almost black for headings & primary text
  textSecondary: '#8E8E93', // Muted gray for subtitles, secondary & placeholder text
  textMuted: '#A1A1A6',

  // Borders & Dividers
  border: '#E8EAED', // Subtle border for cards & dividers
  borderSubtle: '#F1F2F4', // Hairline borders
  borderStrong: '#D1D5DB',

  // Primary Actions (Modern Fintech Minimal Dark Button)
  primary: '#121214',
  primaryHover: '#232326',
  primaryText: '#FFFFFF',

  // Pastel Accents
  // 1. Mint Green
  mint: '#AEE1D3', // Success states, positive balances, circular icon backgrounds
  mintDark: '#0D5645', // High-contrast readable typography on mint
  mintLight: '#EAF7F3', // Very soft mint surface tint

  // 2. Lavender / Lilac
  lilac: '#E6E0F2', // Secondary icon backgrounds, categorized list items
  lilacDark: '#4A3B69', // High-contrast readable typography on lilac
  lilacLight: '#F5F2F9',

  // 3. Soft Holographic Pink / Purple
  holoPink: '#F2E6F5', // Premium highlights, delicate borders, badges
  holoPinkDark: '#5E3867', // High-contrast readable typography on holo pink
  holoPinkLight: '#FAF5FB',

  // Alert & Danger States
  danger: '#FF3B30',
  dangerDark: '#991B1B',
  dangerLight: '#FFEBEA',

  // Warning & Caution States
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  warningDark: '#92400E',
};

// Soft Drop Shadows matching 0 4px 20px rgba(0, 0, 0, 0.04)
export const SoftShadow = {
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 2,
  },
  cardHover: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 3,
  },
  modal: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 8,
  },
};
