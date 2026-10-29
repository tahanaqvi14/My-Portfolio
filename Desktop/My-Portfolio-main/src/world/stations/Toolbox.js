import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { Station } from '../Station'
import { makeText, STYLES, COLORS } from '../text'
import { darkMetal } from '../materials'
import { smooth } from '../Panel'
import { mern, tags } from '../../data/content'

const GAP = 0.1
const DEPTH = 0.92
const HEIGHT = 0.42
const PITCH = DEPTH + GAP

// A floating keyboard: MERN on the top row in the accent colour, the rest of the
// toolbox below. Keys press under the pointer and "type" by themselves when idle.
export class Toolbox extends Station {
  async build() {
    const rows = [mern.map((m) => m.letter), tags.slice(0, 4), tags.slice(4, 8), tags.slice(8, 12), tags.slice(12)]
    const raw = rows.map((row) => row.map((label) => (label.length === 1 ? 1.4 : 0.55 + 0.118 * label.length)))
    const width = Math.max(...raw.map((r) => r.reduce((s, w) => s + w, 0) + GAP * (r.length - 1)))

    this.board = new THREE.Group()
    this.board.rotation.order = 'YXZ'
    this.group.add(this.board)
    const keys = new THREE.Group()
    this.board.add(keys)

    this.keys = []
    rows.forEach((row, r) => {
      // Justify every row to the same width, like a real keyboard.
      const sum = raw[r].reduce((s, w) => s + w, 0)
      const k = (width - GAP * (row.length - 1)) / sum
      let x = -width / 2
      row.forEach((label, c) => {
        const w = raw[r][c] * k
        const isMern = r === 0
        const mat = isMern
          ? new THREE.MeshPhysicalMaterial({ color: '#ff6a2a', roughness: 0.38, metalness: 0.05, clearcoat: 0.6, emissive: '#ff4d10', emissiveIntensity: 0.12 })
          : new THREE.MeshPhysicalMaterial({ color: '#1d2129', roughness: 0.45, metalness: 0.12, clearcoat: 0.55, clearcoatRoughness: 0.3, emissive: '#ff6a2a', emissiveIntensity: 0 })
        const cap = new THREE.Mesh(new RoundedBoxGeometry(w, HEIGHT, DEPTH, 3, 0.1), mat)
        const z = (r - (rows.length - 1) / 2) * PITCH
        cap.position.set(x + w / 2, 0, z)
        const legend = makeText(label, {
          ...(isMern ? { ...STYLES.headline, size: 50 } : STYLES.label),
          color: isMern ? '#1a0b04' : COLORS.fg,
          anchorX: 'center',
          align: 'center',
          upper: false,
          letterSpacing: isMern ? 0 : 0.02,
        })
        legend.anchorY = 'middle'
        legend.fontSize = isMern ? 0.46 : 0.17
        legend.rotation.x = -Math.PI / 2
        legend.position.set(0, HEIGHT / 2 + 0.004, isMern ? -0.08 : 0)
        cap.add(legend)
        if (isMern) {
          const sub = makeText(mern[c].name, { ...STYLES.label, color: '#3a1606', anchorX: 'center', align: 'center' })
          sub.anchorY = 'middle'
          sub.fontSize = 0.1
          sub.rotation.x = -Math.PI / 2
          sub.position.set(0, HEIGHT / 2 + 0.004, 0.3)
          cap.add(sub)
        }
        cap.userData = {
          label,
          isMern,
          baseY: 0,
          press: 0,
          hover: false,
          auto: 0,
          order: (r * 5 + c) / 25,
          legend,
          onEnter: () => (cap.userData.hover = true),
          onLeave: () => (cap.userData.hover = false),
          onPress: () => (cap.userData.auto = 0.28),
          cursor: 'press',
        }
        keys.add(cap)
        this.keys.push(cap)
        x += w + GAP
      })
    })
    this.interactive = this.keys

    const plateDepth = rows.length * PITCH + 0.5
    this.plateWidth = width + 0.6
    const plate = new THREE.Mesh(new RoundedBoxGeometry(this.plateWidth, 0.34, plateDepth, 4, 0.16), darkMetal('#13151b', 0.34))
    plate.position.set(0, -HEIGHT / 2 - 0.1, 0)
    const glow = new THREE.Mesh(
      new THREE.BoxGeometry(this.plateWidth - 0.4, 0.02, 0.02),
      new THREE.MeshBasicMaterial({ color: new THREE.Color('#ff6a2a').multiplyScalar(4) }),
    )
    glow.position.set(0, -HEIGHT / 2 - 0.2, plateDepth / 2 - 0.02)
    this.board.add(plate, glow)
    this.boardDepth = plateDepth

    const p = this.panel
    p.text('04 — Toolbox', STYLES.kicker)
    p.text('MERN at the core. The right tool around it.', STYLES.headline, { gap: 18 })
    p.text(
      this.world.fine ? 'Everything I build with, on one keyboard. Hover the keys.' : 'Everything I build with, on one keyboard. Tap the keys.',
      STYLES.body,
      { gap: 20 },
    )
    this.nextAuto = 0
  }

  async layout(v) {
    this.wide = v.wide
    if (v.wide) {
      // The front row tilts towards the camera and grows in perspective: leave it room.
      const w = Math.min(v.visW * 0.42, v.visH * 1.15)
      this.board.scale.setScalar(w / this.plateWidth)
      this.board.position.set(-v.visW * 0.2, -0.1, 0)
      return this.placeColumn(v, 'right', { maxPx: 520, share: 0.36 })
    }
    const w = v.visW * 0.84
    const s = w / this.plateWidth
    this.board.scale.setScalar(s)
    const top = v.visH / 2 - v.safeTop
    const h = this.boardDepth * s * 0.85
    this.board.position.set(0, top - h * 0.55, 0)
    return this.placeStack(v, top - h - 30 * v.upx)
  }

  update(f) {
    const { time, dt, q, leaving } = f
    this.board.rotation.set(0.72 - f.look.y * 0.1, (this.wide ? -0.16 : -0.05) + f.look.x * 0.18, 0.03)

    // Idle typing while the station is on screen.
    if (q > 0.9 && !this.world.reduced && time > this.nextAuto) {
      const key = this.keys[Math.floor(Math.random() * this.keys.length)]
      key.userData.auto = 0.16
      this.nextAuto = time + 0.25 + Math.random() * 0.5
    }

    for (const key of this.keys) {
      const d = key.userData
      d.auto = Math.max(0, d.auto - dt)
      const target = d.hover || d.auto > 0 ? 1 : 0
      d.press += (target - d.press) * Math.min(1, dt * 18)
      // Keys drop in as the station arrives and lift off as it leaves.
      const a = leaving ? smooth(0.3, 0.9, q) : smooth(0.25 + d.order * 0.45, 0.6 + d.order * 0.4, q)
      key.position.y = d.baseY - d.press * 0.17 + (1 - a) * 3.2
      key.visible = a > 0.01
      if (d.isMern) key.material.emissiveIntensity = 0.12 + d.press * 0.9
      else {
        key.material.emissiveIntensity = d.press * 0.35
        d.legend.color = d.press > 0.5 ? COLORS.accent : COLORS.fg
      }
    }
    this.panel.reveal(q, leaving)
  }
}
