import * as THREE from 'three'
import { gsap } from '../../lib/gsap'
import { Station } from '../Station'
import { layoutLine, CAP_HEIGHT } from '../lettering'
import { makeText, sizeText, textHeight, STYLES } from '../text'
import { makeEclipse, rng } from '../fx'
import { letterMaterials } from '../materials'
import { smooth } from '../Panel'

const ease = (t) => t * t * (3 - 2 * t)

// The name in solid chrome letters, an eclipse behind it, light that follows the pointer.
// Leaving, the two words part like doors and the camera flies through the ring.
export class Hero extends Station {
  async build() {
    const [face, side] = letterMaterials()
    const r = rng(7)
    this.words = ['TAHA', 'NAQVI'].map((word, w) => {
      const line = layoutLine(word, { depth: 0.32, bevel: 0.03 })
      const group = new THREE.Group()
      const letters = line.letters.map((l) => {
        const mesh = new THREE.Mesh(l.geometry, [face, side])
        mesh.userData = {
          bx: l.x,
          by: l.y - CAP_HEIGHT / 2,
          phase: r() * Math.PI * 2,
          from: new THREE.Vector3((r() - 0.5) * 14, (r() - 0.5) * 9, -16 - r() * 10),
          spin: new THREE.Vector3((r() - 0.5) * 5, (r() - 0.5) * 6, (r() - 0.5) * 3),
          word: w,
        }
        group.add(mesh)
        return mesh
      })
      this.group.add(group)
      return { group, letters, width: line.width }
    })
    this.letters = this.words.flatMap((w) => w.letters)
    this.introState = this.letters.map(() => ({ p: 0 }))
    this.ui = { a: 0 }
    this.ignite = { v: 0 }

    this.eclipse = makeEclipse()
    this.group.add(this.eclipse)

    this.tagline = makeText('Full-stack software engineer building reliable systems, AI products and real-time apps.', {
      ...STYLES.lead,
      anchorX: 'center',
      align: 'center',
    })
    this.meta = makeText('Karachi, Pakistan  ·  24.86° N, 67.01° E', { ...STYLES.kicker, anchorX: 'center', align: 'center' })
    this.group.add(this.tagline, this.meta)

    this.warm = new THREE.PointLight('#ff7a3a', 40, 70, 1.4)
    this.cool = new THREE.PointLight('#6f8bff', 36, 70, 1.4)
    this.cursorLight = new THREE.PointLight('#ffd6b8', 0, 18, 1.5)
    this.group.add(this.warm, this.cool, this.cursorLight)
    this.lightPos = new THREE.Vector3(0, 0, 3)
  }

  async layout(v) {
    const [a, b] = this.words
    const cap = CAP_HEIGHT
    let em
    if (v.wide) {
      const gapEm = 0.55
      em = Math.min((v.visW * 0.82) / (a.width + gapEm + b.width), (v.visH * (v.vh < 560 ? 0.18 : 0.25)) / cap)
      const total = (a.width + gapEm + b.width) * em
      a.group.position.set(-total / 2 + (a.width * em) / 2, 0, 0)
      b.group.position.set(total / 2 - (b.width * em) / 2, 0, 0)
    } else {
      em = Math.min((v.visW * 0.84) / Math.max(a.width, b.width), (v.visH * 0.15) / cap)
      const gap = cap * em * 0.34
      a.group.position.set(0, (cap * em + gap) / 2, 0)
      b.group.position.set(0, -(cap * em + gap) / 2, 0)
    }
    a.group.scale.setScalar(em)
    b.group.scale.setScalar(em)
    this.em = em
    this.wide = v.wide
    const lettersTop = a.group.position.y + (cap * em) / 2
    const lettersBottom = b.group.position.y - (cap * em) / 2

    await Promise.all([
      sizeText(this.tagline, v.upx, Math.min(520, v.vw - 48)),
      sizeText(this.meta, v.upx, v.vw - 48),
    ])
    const tagTop = lettersBottom - (v.wide ? 46 : 36) * v.upx
    const metaTop = tagTop - textHeight(this.tagline) - 18 * v.upx
    const blockBottom = metaTop - textHeight(this.meta)
    // Centre the composition a touch above the middle of the screen.
    const shift = -(lettersTop + blockBottom) / 2 + 12 * v.upx
    for (const w of this.words) w.group.position.y += shift
    this.tagY = tagTop + shift
    this.metaY = metaTop + shift
    const centerY = (a.group.position.y + b.group.position.y) / 2

    // The ring sits behind the name; the camera's exit path flies through its centre.
    const ringRadius = (v.wide ? 0.34 : 0.33) * v.visH
    const depth = 6
    const scale = (ringRadius / 0.62) * ((11 + depth) / 11)
    this.eclipse.position.set(0, centerY, -depth)
    this.eclipse.scale.setScalar(scale)
    this.warm.position.set(-v.visW * 0.55, v.visH * 0.6, 11)
    this.cool.position.set(v.visW * 0.55, -v.visH * 0.55, 10)
    this.v = v
    return { pan: 0, dwell: 0.35, exitVia: [[0, centerY, -1.2], [0, centerY, -depth]] }
  }

  intro(reduced) {
    if (reduced) {
      this.introState.forEach((s) => (s.p = 1))
      this.ui.a = 1
      this.ignite.v = 1
      return
    }
    gsap.to(this.introState, { p: 1, duration: 2.2, ease: 'expo.out', stagger: { each: 0.08, from: 'center' } })
    gsap.to(this.ignite, { v: 1, duration: 2.6, ease: 'power2.inOut', delay: 0.5 })
    gsap.to(this.ui, { a: 1, duration: 1.4, ease: 'power2.out', delay: 1.6 })
  }

  update(f) {
    const { time, pointer, q, leaving } = f
    // 0 while resting, rising to 1 as the camera leaves through the ring.
    const open = leaving ? ease(1 - q) : 0
    const look = f.look
    this.letters.forEach((m, i) => {
      const d = m.userData
      const p = this.introState[i].p
      const dir = d.word === 0 ? -1 : 1
      const bob = Math.sin(time * 0.9 + d.phase) * 0.02
      let x = d.bx
      let y = d.by + bob
      let z = 0
      if (this.wide) {
        x += dir * open * 3.2
        z += open * 1.2
      } else {
        y += -dir * open * 2.2
        z += open * 1.2
      }
      m.position.set(d.from.x + (x - d.from.x) * p, d.from.y + (y - d.from.y) * p, d.from.z + (z - d.from.z) * p)
      const settle = 1 - p
      m.rotation.set(
        -look.y * 0.16 + d.spin.x * settle + Math.sin(time * 0.7 + d.phase) * 0.02,
        look.x * 0.24 + d.spin.y * settle + dir * open * 0.9,
        d.spin.z * settle,
      )
    })

    const v = this.v
    // Lights: the cursor light hovers just in front of the letters.
    this.lightPos.set(pointer.x * v.visW * 0.5, pointer.y * v.visH * 0.5, 2.6)
    this.cursorLight.position.lerp(this.lightPos, 0.2)
    this.cursorLight.intensity += ((f.pointerActive ? 38 : 0) - this.cursorLight.intensity) * 0.08
    this.warm.intensity = 40 * (0.85 + 0.15 * Math.sin(time * 0.6))

    const u = this.eclipse.userData.uniforms
    u.uTime.value = time
    u.uIntensity.value = 0.55 * this.ignite.v * (1 - open * 0.3)
    // The camera flies through the ring: clear the dark disc out of its way first.
    const disc = this.eclipse.userData.disc
    disc.material.opacity = 0.94 * (1 - smooth(0, 0.35, open))
    disc.visible = disc.material.opacity > 0.01

    const a = this.ui.a * smooth(0.5, 1, q)
    for (const t of [this.tagline, this.meta]) {
      t.visible = a > 0.003
      t.fillOpacity = a
    }
    this.tagline.position.set(0, this.tagY - (1 - this.ui.a) * 20 * v.upx, 0)
    this.meta.position.set(0, this.metaY - (1 - this.ui.a) * 20 * v.upx, 0)
  }
}
