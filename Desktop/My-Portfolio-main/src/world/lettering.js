import * as THREE from 'three'
import font from './glyphs.json'

// Solid, bevelled letters extruded from Archivo Black outlines (see scripts/build-glyphs.mjs).
// Sizes are in "em" world units: 1 em = the font's full em square.

const geometryCache = new Map()

function glyphGeometry(ch, { depth, bevel }) {
  const key = `${ch}|${depth}|${bevel}`
  if (geometryCache.has(key)) return geometryCache.get(key)
  const glyph = font.glyphs[ch]
  if (!glyph || !glyph.p.length) return null
  const s = 1 / font.unitsPerEm
  const path = new THREE.ShapePath()
  for (const c of glyph.p) {
    if (c[0] === 'M') path.moveTo(c[1] * s, c[2] * s)
    else if (c[0] === 'L') path.lineTo(c[1] * s, c[2] * s)
    else if (c[0] === 'Q') path.quadraticCurveTo(c[1] * s, c[2] * s, c[3] * s, c[4] * s)
    else if (c[0] === 'C') path.bezierCurveTo(c[1] * s, c[2] * s, c[3] * s, c[4] * s, c[5] * s, c[6] * s)
  }
  const geometry = new THREE.ExtrudeGeometry(path.toShapes(), {
    depth,
    curveSegments: 8,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel * 0.7,
    bevelSegments: 4,
  })
  // Centre each letter on itself so it can turn in place.
  geometry.computeBoundingBox()
  const box = geometry.boundingBox
  const cx = (box.min.x + box.max.x) / 2
  const cy = (box.min.y + box.max.y) / 2
  const cz = (box.min.z + box.max.z) / 2
  geometry.translate(-cx, -cy, -cz)
  geometry.computeVertexNormals()
  const entry = { geometry, cx, cy, width: box.max.x - box.min.x, height: box.max.y - box.min.y }
  geometryCache.set(key, entry)
  return entry
}

// Lays out a single line of capitals. Returns letters with x/y (em units, line centred
// on x = 0, baseline at y = 0) plus the line's total width.
export function layoutLine(text, { depth = 0.22, bevel = 0.02, tracking = 0 } = {}) {
  const s = 1 / font.unitsPerEm
  const letters = []
  let pen = 0
  const chars = [...text.toUpperCase()]
  chars.forEach((ch, i) => {
    const glyph = font.glyphs[ch]
    if (!glyph) return
    const g = glyphGeometry(ch, { depth, bevel })
    if (g) letters.push({ ch, geometry: g.geometry, x: pen + g.cx, y: g.cy, width: g.width, height: g.height })
    const kern = i < chars.length - 1 ? (font.kerning[ch + chars[i + 1]] ?? 0) : 0
    pen += (glyph.a + kern) * s + tracking
  })
  const width = pen - tracking
  letters.forEach((l) => (l.x -= width / 2))
  return { letters, width }
}

export const CAP_HEIGHT = (font.capHeight ?? 700) / font.unitsPerEm
