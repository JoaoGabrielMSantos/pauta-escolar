import { IBM_Plex_Mono, Instrument_Sans, Sora } from 'next/font/google'

/** Display: page titles, card titles, KPIs. */
export const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  display: 'swap',
})

/** Interface: body, labels, buttons, tables. */
export const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-instrument-sans',
  display: 'swap',
})

/**
 * Data: grades, registration numbers, dates, codes, counters.
 * Not preloaded: it has three static weights and is rarely above the fold, so preloading
 * it would compete with the display font that usually is the LCP element.
 */
export const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
  preload: false,
})

/** Class names that expose the three font CSS variables (see src/styles/tokens.css). */
export const fontVariables = [sora.variable, instrumentSans.variable, ibmPlexMono.variable].join(
  ' ',
)
