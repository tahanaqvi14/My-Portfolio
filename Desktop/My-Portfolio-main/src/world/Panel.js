import * as THREE from 'three'
import { makeText, sizeText, textHeight, STYLES, COLORS } from './text'

const RULE = new THREE.PlaneGeometry(1, 1).translate(0.5, -0.5, 0)

export const smooth = (a, b, x) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1)
  return t * t * (3 - 2 * t)
}

function makeRule(opacity = 0.12) {
  const mesh = new THREE.Mesh(
    RULE,
    new THREE.MeshBasicMaterial({ color: COLORS.fg, transparent: true, opacity, depthWrite: false }),
  )
  mesh.userData.baseOpacity = opacity
  return mesh
}

function setNodeAlpha(node, a) {
  node.visible = a > 0.003
  if (typeof node.sync === 'function') node.fillOpacity = a
  else if (node.material) node.material.opacity = a * (node.userData.baseOpacity ?? 1)
}

// Stacks blocks of 3D text top to bottom, like a column of HTML. Sizes are CSS pixels,
// converted to world units for the current viewport so copy reads the same everywhere.
// Each node keeps a base position (userData.x / .y); reveal() slides and fades from it.
export class Panel {
  constructor() {
    this.group = new THREE.Group()
    this.items = []
    this.height = 0
    this.width = 0
    this.upx = 0.01
  }

  add(item) {
    item.nodes.forEach((n) => {
      n.userData.x ??= 0
      n.userData.y ??= 0
      this.group.add(n)
    })
    this.items.push(item)
    return item
  }

  text(str, style, { gap = 0, maxPx } = {}) {
    const t = makeText(str, style)
    const item = this.add({
      gap,
      nodes: [t],
      layout: async (w, upx) => {
        await sizeText(t, upx, maxPx ? Math.min(maxPx, w) : w)
        return textHeight(t)
      },
      place: (y) => (t.userData.y = y),
    })
    item.text = t
    return t
  }

  // Definition-list rows: small label on the left, value on the right, hairlines between.
  pairs(rows, { gap = 0, labelPx = 132, padPx = 12, valueStyle = STYLES.strong } = {}) {
    const top = makeRule()
    const parts = rows.map(([label, value]) => ({
      label: makeText(label, STYLES.label),
      value: makeText(value, valueStyle),
      rule: makeRule(),
    }))
    const nodes = [top, ...parts.flatMap((p) => [p.label, p.value, p.rule])]
    let heights = []
    let unit = 0.01
    return this.add({
      gap,
      nodes,
      layout: async (w, upx) => {
        unit = upx
        const labelW = Math.min(labelPx, w * 0.4)
        await Promise.all(
          parts.flatMap((p) => [sizeText(p.label, upx, labelW - 12), sizeText(p.value, upx, w - labelW)]),
        )
        heights = parts.map((p) => Math.max(textHeight(p.label) + 3 * upx, textHeight(p.value)) + 2 * padPx * upx)
        ;[top, ...parts.map((p) => p.rule)].forEach((r) => r.scale.set(w * upx, upx, 1))
        parts.forEach((p) => (p.value.userData.x = labelW * upx))
        return upx + heights.reduce((s, h) => s + h, 0)
      },
      place: (y) => {
        top.userData.y = y
        let yy = y - unit
        parts.forEach((p, i) => {
          p.label.userData.y = yy - padPx * unit - 3 * unit
          p.value.userData.y = yy - padPx * unit
          yy -= heights[i]
          p.rule.userData.y = yy
        })
      },
    })
  }

  // Numbered rows with hairlines, e.g. a feature list.
  list(lines, { gap = 0, padPx = 11, indentPx = 38, style = STYLES.item } = {}) {
    const top = makeRule()
    const parts = lines.map((line, i) => ({
      num: makeText(String(i + 1).padStart(2, '0'), STYLES.label),
      text: makeText(line, style),
      rule: makeRule(),
    }))
    const nodes = [top, ...parts.flatMap((p) => [p.num, p.text, p.rule])]
    let heights = []
    let unit = 0.01
    return this.add({
      gap,
      nodes,
      layout: async (w, upx) => {
        unit = upx
        await Promise.all(parts.flatMap((p) => [sizeText(p.num, upx, indentPx), sizeText(p.text, upx, w - indentPx)]))
        heights = parts.map((p) => textHeight(p.text) + 2 * padPx * upx)
        ;[top, ...parts.map((p) => p.rule)].forEach((r) => r.scale.set(w * upx, upx, 1))
        parts.forEach((p) => (p.text.userData.x = indentPx * upx))
        return upx + heights.reduce((s, h) => s + h, 0)
      },
      place: (y) => {
        top.userData.y = y
        let yy = y - unit
        parts.forEach((p, i) => {
          p.num.userData.y = yy - padPx * unit - 3 * unit
          p.text.userData.y = yy - padPx * unit
          yy -= heights[i]
          p.rule.userData.y = yy
        })
      },
    })
  }

  // Short dash-led lines without rules (e.g. what someone did in a role).
  bullets(lines, { gap = 0, spacePx = 8, indentPx = 20, style = STYLES.body } = {}) {
    const parts = lines.map((line) => ({ dash: makeText('—', { ...style, color: COLORS.dim }), text: makeText(line, style) }))
    const nodes = parts.flatMap((p) => [p.dash, p.text])
    let heights = []
    let unit = 0.01
    return this.add({
      gap,
      nodes,
      layout: async (w, upx) => {
        unit = upx
        await Promise.all(parts.flatMap((p) => [sizeText(p.dash, upx, indentPx), sizeText(p.text, upx, w - indentPx)]))
        heights = parts.map((p) => textHeight(p.text))
        parts.forEach((p) => (p.text.userData.x = indentPx * upx))
        return heights.reduce((s, h) => s + h, 0) + spacePx * upx * Math.max(parts.length - 1, 0)
      },
      place: (y) => {
        let yy = y
        parts.forEach((p, i) => {
          p.dash.userData.y = yy
          p.text.userData.y = yy
          yy -= heights[i] + spacePx * unit
        })
      },
    })
  }

  // One line of text where some characters are coloured (separators, a status).
  // `pieces` is [[text, color?], ...].
  run(pieces, style, { gap = 0 } = {}) {
    let str = ''
    const colorRanges = {}
    for (const [piece, color] of pieces) {
      colorRanges[str.length] = color ?? style.color
      str += style.upper ? piece.toUpperCase() : piece
    }
    const t = this.text(str, { ...style, upper: false }, { gap })
    t.colorRanges = colorRanges
    return t
  }

  space(px) {
    return this.add({ gap: px, nodes: [], layout: async () => 0, place: () => {} })
  }

  async layout(widthPx, upx) {
    this.upx = upx
    this.width = widthPx * upx
    const heights = await Promise.all(this.items.map((it) => it.layout(widthPx, upx)))
    let y = 0
    this.items.forEach((it, i) => {
      y -= it.gap * upx
      it.place(y)
      y -= heights[i]
    })
    this.height = -y
    this.reveal(1, false)
    return this.height
  }

  // q: 0 → 1 as the station arrives. Items cascade in from slightly below; when
  // leaving, everything fades together.
  reveal(q, leaving) {
    const n = this.items.length
    const shift = 26 * this.upx
    this.items.forEach((it, i) => {
      const d = n > 1 ? i / (n - 1) : 0
      const a = leaving ? smooth(0.3, 0.85, q) : smooth(0.4 + d * 0.3, 0.72 + d * 0.28, q)
      for (const node of it.nodes) {
        setNodeAlpha(node, a)
        node.position.set(node.userData.x, node.userData.y - (1 - a) * shift, 0)
      }
    })
  }
}
