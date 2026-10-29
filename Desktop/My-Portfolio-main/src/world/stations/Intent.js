import { Station } from '../Station'
import { STYLES } from '../text'
import { makeGalaxy } from '../fx'
import { smooth } from '../Panel'
import { aboutStatement } from '../../data/content'

// Through the ring: a spiral galaxy, and the statement beside it.
export class Intent extends Station {
  async build() {
    this.galaxy = makeGalaxy({ count: this.world.budget.galaxy })
    // Spin about its own axis first, then tilt towards the viewer.
    this.galaxy.rotation.order = 'ZXY'
    this.group.add(this.galaxy)
    this.panel.text('02 — Intent', STYLES.kicker)
    this.panel.text(aboutStatement, STYLES.statement, { gap: 22 })
  }

  async layout(v) {
    if (v.wide) {
      const radius = Math.min(v.visW * 0.3, v.visH * 0.62)
      this.galaxy.position.set(-v.visW * 0.2, 0, -2.5)
      this.galaxy.scale.setScalar(radius)
      this.galaxy.userData.uniforms.uScale.value = 1
      return this.placeColumn(v, 'right', { maxPx: 600, share: 0.44 })
    }
    const radius = Math.min(v.visW * 0.62, v.visH * 0.3)
    const top = v.visH / 2 - v.safeTop
    this.galaxy.position.set(0, top - radius * 0.62, -1.5)
    this.galaxy.scale.setScalar(radius)
    return this.placeStack(v, top - radius * 1.25 - 24 * v.upx)
  }

  update(f) {
    const u = this.galaxy.userData.uniforms
    u.uTime.value = f.time
    u.uPixelRatio.value = this.world.dpr
    u.uOpacity.value = smooth(0, 0.8, f.q)
    this.galaxy.rotation.set(0.95 + f.look.y * 0.05, f.time * 0.05, 0.28 + f.look.x * 0.04)
    this.panel.reveal(f.q, f.leaving)
  }
}
