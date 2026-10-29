import { Text, preloadFont } from 'troika-three-text'
import display from '@fontsource/archivo/files/archivo-latin-800-normal.woff?url'
import medium from '@fontsource/archivo/files/archivo-latin-600-normal.woff?url'
import body from '@fontsource/archivo/files/archivo-latin-400-normal.woff?url'
import mono from '@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff?url'
import serif from '@fontsource/fraunces/files/fraunces-latin-400-italic.woff?url'

// Self-hosted fonts for text that lives in the 3D scene (crisp signed-distance-field text).
export const FONTS = { display, medium, body, mono, serif }

export const COLORS = {
  fg: '#eef1f7',
  body: '#a9b0bf',
  dim: '#7c8496',
  accent: '#ff6a2a',
}

// Every character used in 3D text must exist in these font files: troika would otherwise
// fetch a fallback font from a CDN. (None of them has arrows such as ↗ or →.)
const CHARSET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,;:!?\'"’‘“”-–—/&@#+()[]%°·•×éÉ'
const ALLOWED = new Set(CHARSET + '\n')

const safe = (str) => {
  const out = [...str].filter((ch) => ALLOWED.has(ch)).join('')
  if (import.meta.env.DEV && out !== str) console.warn('3D text: dropped characters outside the font set in', str)
  return out
}

export function preloadFonts() {
  return Promise.all(
    Object.values(FONTS).map((font) => new Promise((resolve) => preloadFont({ font, characters: CHARSET }, resolve))),
  )
}

// Text styles are given in CSS pixels; Panel converts them to world units for the
// current viewport so text keeps a steady on-screen size. A size can also be a function
// of the column width (px), so headings scale down in narrow columns.
const fluid = (min, ratio, max) => (w) => Math.min(max, Math.max(min, w * ratio))

export const STYLES = {
  kicker: { font: 'mono', size: 12, color: COLORS.dim, letterSpacing: 0.08, upper: true, lineHeight: 1.4 },
  label: { font: 'mono', size: 11.5, color: COLORS.dim, letterSpacing: 0.08, upper: true, lineHeight: 1.45 },
  headline: { font: 'display', size: fluid(30, 0.09, 50), color: COLORS.fg, letterSpacing: -0.03, lineHeight: 1.02 },
  title: { font: 'display', size: 60, color: COLORS.fg, letterSpacing: -0.02, lineHeight: 0.95, upper: true, fit: true },
  statement: { font: 'medium', size: fluid(21, 0.057, 34), color: COLORS.fg, letterSpacing: -0.02, lineHeight: 1.18 },
  lead: { font: 'serif', size: fluid(18, 0.04, 22), color: COLORS.fg, lineHeight: 1.3 },
  body: { font: 'body', size: fluid(15.5, 0.045, 17), color: COLORS.body, lineHeight: 1.6 },
  strong: { font: 'medium', size: 17, color: COLORS.fg, lineHeight: 1.45 },
  item: { font: 'medium', size: 16, color: COLORS.fg, lineHeight: 1.45 },
  org: { font: 'display', size: 24, color: COLORS.fg, letterSpacing: -0.015, lineHeight: 1.15 },
}

export function makeText(str, style) {
  const t = new Text()
  t.text = safe(style.upper ? str.toUpperCase() : str)
  t.font = FONTS[style.font]
  t.color = style.color
  t.anchorX = style.anchorX ?? 'left'
  t.anchorY = 'top'
  t.textAlign = style.align ?? 'left'
  t.lineHeight = style.lineHeight ?? 1.3
  t.letterSpacing = style.letterSpacing ?? 0
  t.overflowWrap = 'normal'
  t.userData.style = style
  return t
}

// Resolves once the text's layout is current. troika's sync() skips its callback when
// nothing has changed, so also settle when the text is idle, or when a sync already
// in flight completes.
const sync = (t) =>
  new Promise((resolve) => {
    let done = false
    const finish = () => {
      if (done) return
      done = true
      t.removeEventListener('synccomplete', finish)
      resolve()
    }
    t.sync(finish)
    if (t._isSyncing) t.addEventListener('synccomplete', finish)
    else if (t.textRenderInfo) finish()
  })

// Apply pixel-based sizing for the current viewport, then wait for the layout.
// Styles with `fit` stay on one line, shrinking if the line is wider than the column.
export async function sizeText(t, upx, widthPx) {
  const s = t.userData.style
  const px = typeof s.size === 'function' ? s.size(widthPx ?? 600) : s.size
  t.fontSize = px * upx
  if (s.fit && widthPx != null) {
    t.maxWidth = Infinity
    t.whiteSpace = 'nowrap'
    await sync(t)
    const w = textWidth(t)
    const max = widthPx * upx
    if (w > max) {
      t.fontSize *= max / w
      await sync(t)
    }
    return
  }
  t.maxWidth = widthPx == null ? Infinity : widthPx * upx
  await sync(t)
}

export function textHeight(t) {
  const b = t.textRenderInfo?.blockBounds
  return b ? b[3] - b[1] : 0
}

export function textWidth(t) {
  const b = t.textRenderInfo?.blockBounds
  return b ? b[2] - b[0] : 0
}
