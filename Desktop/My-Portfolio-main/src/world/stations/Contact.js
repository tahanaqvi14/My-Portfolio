import * as THREE from 'three'
import { gsap } from '../../lib/gsap'
import { Station } from '../Station'
import { STYLES } from '../text'
import { smooth } from '../Panel'

const TRAIL = 56

// A folded paper plane: two wings and a keel, nose along +X.
function planeGeometry() {
  const N = [1.6, 0, 0]
  const T = [-1.1, 0.06, 0]
  const WL = [-1.2, 0.32, 0.95]
  const WR = [-1.2, 0.32, -0.95]
  const K = [-0.95, -0.42, 0]
  const tris = [N, T, WL, N, WR, T, N, K, T]
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(tris.flat(), 3))
  geometry.computeVertexNormals()
  return geometry
}

export class Contact extends Station {
  async build() {
    this.rig = new THREE.Group()
    this.group.add(this.rig)
    this.plane = new THREE.Mesh(
      planeGeometry(),
      new THREE.MeshStandardMaterial({
        color: '#d9d1c5',
        roughness: 0.7,
        metalness: 0,
        side: THREE.DoubleSide,
        flatShading: true,
        emissive: '#3a2412',
        emissiveIntensity: 0.2,
      }),
    )
    this.rig.add(this.plane)
    this.light = new THREE.PointLight('#ff8a4c', 12, 20, 1.5)
    this.light.position.set(-2, 2, 3)
    this.rig.add(this.light)

    // Contrail drawn from the plane's recent positions while it flies.
    this.history = Array.from({ length: TRAIL }, () => new THREE.Vector3())
    const pos = new Float32Array(TRAIL * 3)
    const age = new Float32Array(TRAIL).map((_, i) => i / (TRAIL - 1))
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geometry.setAttribute('aAge', new THREE.BufferAttribute(age, 1))
    this.trailUniforms = { uOpacity: { value: 0 }, uColor: { value: new THREE.Color('#ff7a3d').multiplyScalar(2.5) } }
    this.trail = new THREE.Line(
      geometry,
      new THREE.ShaderMaterial({
        uniforms: this.trailUniforms,
        vertexShader: /* glsl */ `
          attribute float aAge;
          varying float vAge;
          void main() {
            vAge = aAge;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform float uOpacity;
          uniform vec3 uColor;
          varying float vAge;
          void main() {
            float a = (1.0 - vAge) * uOpacity;
            gl_FragColor = vec4(uColor * a, a);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    )
    this.trail.frustumCulled = false
    this.group.add(this.trail)

    this.flight = { t: 0, back: 0 }
    this.nose = new THREE.Vector3()

    const p = this.panel
    p.text('09 — Contact', STYLES.kicker)
    p.text('Got an idea? Send it flying.', STYLES.headline, { gap: 18 })
    p.text('Write a few lines and press send — the paper plane carries it straight to my inbox.', STYLES.body, { gap: 18 })
  }

  // The message form is regular HTML; place it under the 3D copy via CSS variables.
  async layout(v) {
    const root = document.documentElement.style
    const s = (v.wide ? v.visW * 0.3 : v.visW * 0.5) / 2.8
    this.rig.scale.setScalar(s)
    if (v.wide) {
      document.documentElement.dataset.contact = 'fixed'
      const pad = Math.max(v.vw * 0.06, 48)
      const colPx = Math.min(560, v.vw * 0.4)
      await this.panel.layout(colPx, v.upx)
      const top = v.visH / 2 - v.safeTop - 0.04 * v.visH
      this.panel.group.position.set((pad - v.vw / 2) * v.upx, top, 0)
      root.setProperty('--contact-width', `${colPx}px`)
      if (v.vh < 600) {
        // Short screens: copy and plane on the left, the form in the right-hand column.
        this.rig.scale.setScalar((v.visW * 0.16) / 2.8)
        this.rig.position.set(-v.visW * 0.28, -v.visH * 0.26, -0.6)
        root.setProperty('--contact-left', `${v.vw - pad - colPx}px`)
        root.setProperty('--contact-top', `${Math.round((v.safeTop / v.upx) * 0.8)}px`)
      } else {
        this.rig.position.set(v.visW * 0.22, v.visH * 0.06, -0.6)
        root.setProperty('--contact-left', `${pad}px`)
        root.setProperty('--contact-top', `${Math.round(v.vh / 2 - (top - this.panel.height) / v.upx + 30)}px`)
      }
      return { pan: 0, dolly: 0 }
    }
    const top = v.visH / 2 - v.safeTop
    const planeH = 0.9 * s
    this.rig.position.set(0, top - planeH * 0.8, -0.4)
    const pad = v.vw >= 600 ? 40 : 22
    const colPx = Math.min(v.vw - pad * 2, 620)
    await this.panel.layout(colPx, v.upx)
    const panelTop = top - planeH * 1.7
    this.panel.group.position.set(-(colPx / 2) * v.upx, panelTop, 0)
    root.setProperty('--contact-left', `${(v.vw - colPx) / 2}px`)
    root.setProperty('--contact-width', `${colPx}px`)
    const formTop = Math.round(v.vh / 2 - (panelTop - this.panel.height) / v.upx + 20)
    root.setProperty('--contact-top', `${formTop}px`)
    // The form sits in the page (see .contact-panel); pan the camera far enough to show it all.
    document.documentElement.dataset.contact = 'flow'
    const formHeight = document.querySelector('.contact-panel')?.offsetHeight ?? 380
    const visibleBottom = v.vh - v.safeBottom / v.upx
    const panPx = Math.max(0, formTop + formHeight + 16 - visibleBottom)
    // Keep panning 1:1 for the whole stop (no hold), so the copy and the form never drift apart.
    return { pan: (panPx + 0.5 * v.vh) * v.upx, dwell: 0, dolly: 0 }
  }

  fly() {
    if (this.flying || this.world.reduced) return
    this.flying = true
    gsap
      .timeline({ onComplete: () => (this.flying = false) })
      .to(this.flight, { t: 1, duration: 1.7, ease: 'power2.in' })
      .set(this.flight, { t: 0, back: 1 })
      .to(this.flight, { back: 0, duration: 1.6, ease: 'expo.out' })
  }

  update(f) {
    const { time, q, leaving, look } = f
    const { t, back } = this.flight
    const shown = smooth(0.2, 0.8, q)
    this.plane.visible = shown > 0.01
    this.plane.position.set(t * t * 9 - back * 7, Math.sin(time * 1.1) * 0.08 + t * 3.2 - back * 1.5, -t * 7)
    this.plane.rotation.set(
      Math.sin(time * 0.9) * 0.08 - look.y * 0.12 + t * 0.3,
      0.38 + look.x * 0.2 - t * 0.4,
      0.18 + Math.sin(time * 0.7) * 0.05 + t * 0.35,
    )
    this.plane.scale.setScalar((1 - back * 0.5) * (0.6 + 0.4 * shown))

    // Trail follows the nose while flying.
    const flying = t > 0 || back > 0
    this.nose.set(1.6, 0, 0)
    this.plane.localToWorld(this.nose)
    this.group.worldToLocal(this.nose)
    if (flying) {
      this.history.pop()
      this.history.unshift(this.nose.clone())
    } else this.history.forEach((h) => h.copy(this.nose))
    const arr = this.trail.geometry.attributes.position.array
    this.history.forEach((h, i) => arr.set([h.x, h.y, h.z], i * 3))
    this.trail.geometry.attributes.position.needsUpdate = true
    this.trailUniforms.uOpacity.value += ((flying ? 1 : 0) - this.trailUniforms.uOpacity.value) * 0.1

    this.panel.reveal(q, leaving)
  }
}
