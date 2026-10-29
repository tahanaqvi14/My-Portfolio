import * as THREE from 'three'
import { Station } from '../Station'
import { layoutLine, CAP_HEIGHT } from '../lettering'
import { STYLES } from '../text'
import { makeEclipse } from '../fx'
import { letterMaterials } from '../materials'
import { smooth } from '../Panel'

// The sign-off, in the same chrome as the name, under a dimmer echo of the opening ring.
export class Finale extends Station {
  async build() {
    const [face, side] = letterMaterials()
    this.lines = ['THANKS FOR', 'SCROLLING.'].map((text) => {
      const line = layoutLine(text, { depth: 0.3, bevel: 0.03 })
      const group = new THREE.Group()
      line.letters.forEach((l, i) => {
        const mesh = new THREE.Mesh(l.geometry, [face, side])
        mesh.userData = { bx: l.x, by: l.y - CAP_HEIGHT / 2, order: i / line.letters.length }
        group.add(mesh)
      })
      this.group.add(group)
      return { group, width: line.width }
    })
    this.eclipse = makeEclipse()
    this.group.add(this.eclipse)
    this.light = new THREE.PointLight('#ff7a3a', 60, 50, 1.4)
    this.cool = new THREE.PointLight('#6f8bff', 50, 50, 1.4)
    this.group.add(this.light, this.cool)

    const p = this.panel
    p.text('10 — Fin', { ...STYLES.kicker, anchorX: 'center', align: 'center' })
    p.text('If something here sparked an idea, I’d love to hear about it.', { ...STYLES.lead, anchorX: 'center', align: 'center' }, { gap: 16 })
  }

  async layout(v) {
    const maxW = Math.max(...this.lines.map((l) => l.width))
    const short = v.wide && v.vh < 560
    const em = v.wide ? Math.min((v.visW * 0.8) / maxW, (v.visH * (short ? 0.11 : 0.16)) / CAP_HEIGHT) : (v.visW * 0.88) / maxW
    const capH = CAP_HEIGHT * em
    const gap = capH * 0.3
    this.lines.forEach((l, i) => {
      l.group.scale.setScalar(em)
      l.group.position.set(0, (i === 0 ? 1 : -1) * (capH + gap) / 2 + v.visH * (short ? 0.14 : 0.06), 0)
    })
    // Narrow enough to stay inside the dark disc of the ring.
    const colPx = Math.min(420, v.vw - 48)
    await this.panel.layout(colPx, v.upx)
    // Panel texts are centred on their own x = 0.
    const lettersBottom = this.lines[1].group.position.y - capH / 2
    this.panel.group.position.set(0, lettersBottom - 40 * v.upx, 0)
    const ring = (v.wide ? 0.38 : 0.3) * v.visH
    this.eclipse.position.set(0, v.visH * (short ? 0.14 : 0.06), -7)
    this.eclipse.scale.setScalar((ring / 0.62) * (18 / 11))
    this.light.position.set(-v.visW * 0.4, v.visH * 0.35, 5)
    this.cool.position.set(v.visW * 0.4, -v.visH * 0.3, 4)
    return { pan: 0, dwell: 0.6 }
  }

  update(f) {
    const { time, q, leaving, look } = f
    for (const line of this.lines) {
      line.group.children.forEach((m, i) => {
        const d = m.userData
        const a = leaving ? 1 : smooth(0.3 + d.order * 0.4, 0.7 + d.order * 0.3, q)
        m.visible = a > 0.01
        m.position.set(d.bx, d.by - (1 - a) * 1.4 + Math.sin(time * 0.9 + i) * 0.015, -(1 - a) * 2)
        m.rotation.set(-look.y * 0.14 + (1 - a) * 1.2, look.x * 0.2, 0)
      })
    }
    const u = this.eclipse.userData.uniforms
    u.uTime.value = time
    u.uIntensity.value = 0.55 * smooth(0.2, 1, q)
    this.panel.reveal(q, leaving)
  }
}
