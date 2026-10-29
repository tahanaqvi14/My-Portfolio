import * as THREE from 'three'
import { Panel } from './Panel'
import { disposeTree } from './fx'

// A stop on the camera's flight. Its group sits at `origin`, turned by `yaw`; the camera
// rests in front of it (local +Z) looking at the local XY plane, where the copy lives.
export class Station {
  constructor(world, { id, origin = [0, 0, 0], yaw = 0 }) {
    this.world = world
    this.id = id
    this.group = new THREE.Group()
    this.group.position.fromArray(origin)
    this.group.rotation.y = yaw
    this.panel = new Panel()
    this.group.add(this.panel.group)
    this.interactive = []
  }

  async build() {}

  // Returns { pan, dwell?, exitVia? } for the current viewport `v`.
  async layout() {
    return { pan: 0 }
  }

  update() {}

  intro() {}

  // Copy column on wide screens: one side of the screen, vertically centred if it fits.
  async placeColumn(v, side, { maxPx = 560, share = 0.4 } = {}) {
    const pad = Math.max(v.vw * 0.06, 48)
    const colPx = Math.min(maxPx, v.vw * share)
    await this.panel.layout(colPx, v.upx)
    const left = side === 'left' ? pad : v.vw - pad - colPx
    const x = (left - v.vw / 2) * v.upx
    const top = v.visH / 2 - v.safeTop
    const bottom = -v.visH / 2 + v.safeBottom
    const h = this.panel.height
    const fits = h <= top - bottom
    const y = fits ? (top + bottom) / 2 + h / 2 : top
    this.panel.group.position.set(x, y, 0)
    return { pan: fits ? 0 : h - (top - bottom) }
  }

  // Copy under the shape on tall screens, starting at world height `top`.
  async placeStack(v, top) {
    const pad = v.vw >= 600 ? 40 : 22
    const colPx = Math.min(v.vw - pad * 2, 620)
    await this.panel.layout(colPx, v.upx)
    const x = -(colPx / 2) * v.upx
    this.panel.group.position.set(x, top, 0)
    const bottom = -v.visH / 2 + v.safeBottom
    return { pan: Math.max(0, this.panel.height - (top - bottom)) }
  }

  dispose() {
    disposeTree(this.group)
  }
}
