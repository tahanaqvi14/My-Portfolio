// Extracts the outlines of Archivo Black (A–Z, 0–9 and a little punctuation) into a
// small JSON file, so the 3D lettering can be extruded without shipping a font parser.
// Run with: node scripts/build-glyphs.mjs
import { readFileSync, writeFileSync } from 'node:fs'
import opentype from 'opentype.js'

const SOURCE = 'node_modules/@fontsource/archivo/files/archivo-latin-900-normal.woff'
const OUT = 'src/world/glyphs.json'
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .,!?-&@#+'

const buffer = readFileSync(SOURCE)
const font = opentype.parse(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength))
const round = (n) => Math.round(n)

const glyphs = {}
for (const ch of CHARS) {
  const glyph = font.charToGlyph(ch)
  const path = []
  for (const c of glyph.path.commands) {
    if (c.type === 'M' || c.type === 'L') path.push([c.type, round(c.x), round(c.y)])
    else if (c.type === 'Q') path.push(['Q', round(c.x1), round(c.y1), round(c.x), round(c.y)])
    else if (c.type === 'C') path.push(['C', round(c.x1), round(c.y1), round(c.x2), round(c.y2), round(c.x), round(c.y)])
    else if (c.type === 'Z') path.push(['Z'])
  }
  glyphs[ch] = { a: round(glyph.advanceWidth), p: path }
}

const kerning = {}
for (const l of CHARS) {
  for (const r of CHARS) {
    const k = font.getKerningValue(font.charToGlyph(l), font.charToGlyph(r))
    if (k) kerning[l + r] = round(k)
  }
}

const data = { unitsPerEm: font.unitsPerEm, ascender: font.ascender, descender: font.descender, capHeight: font.tables.os2?.sCapHeight ?? null, glyphs, kerning }
writeFileSync(OUT, JSON.stringify(data))
console.log(`${OUT}: ${Object.keys(glyphs).length} glyphs, ${Object.keys(kerning).length} kerning pairs, ${JSON.stringify(data).length} bytes, upm ${font.unitsPerEm}, cap ${data.capHeight}`)
