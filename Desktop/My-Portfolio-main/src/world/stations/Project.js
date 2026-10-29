import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { Station } from '../Station'
import { STYLES, COLORS } from '../text'
import { darkMetal } from '../materials'
import { smooth } from '../Panel'
import { createMockup } from '../mockups'

const SW = 3.3
const SH = 2.0625
const BEZEL = 0.16

const sheenMaterial = () =>
  new THREE.ShaderMaterial({
    uniforms: { uLook: { value: new THREE.Vector2() }, uOpacity: { value: 1 } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec2 uLook;
      uniform float uOpacity;
      varying vec2 vUv;
      void main() {
        float band = vUv.x * 0.8 + vUv.y * 0.6 + uLook.x * 0.3 - uLook.y * 0.12;
        float s = exp(-pow((band - 0.72) * 5.0, 2.0)) * 0.09 + exp(-pow((band - 1.08) * 14.0, 2.0)) * 0.05;
        gl_FragColor = vec4(vec3(1.0), s * uOpacity);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })

const glowMaterial = (hex) =>
  new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(hex).multiplyScalar(1.6) }, uOpacity: { value: 1 } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uOpacity;
      varying vec2 vUv;
      void main() {
        vec2 p = (vUv - 0.5) * vec2(2.0, 2.0);
        float a = exp(-dot(p, p) * 3.2) * uOpacity * 0.55;
        gl_FragColor = vec4(uColor * a, a);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })

// One project: a floating screen running an illustrative, animated version of the
// product, with the write-up beside it.
export class Project extends Station {
  constructor(world, opts) {
    super(world, opts)
    this.project = opts.project
    this.index = opts.index
    this.total = opts.total
    this.number = opts.number
    this.side = opts.side
  }

  async build() {
    const p = this.project
    this.monitor = new THREE.Group()
    this.group.add(this.monitor)

    const bezel = new THREE.Mesh(new RoundedBoxGeometry(SW + BEZEL, SH + BEZEL, 0.12, 4, 0.06), darkMetal('#121419', 0.3))
    this.mockup = createMockup(p.id, this.world.budget.mockup)
    this.screenMat = new THREE.MeshBasicMaterial({ map: this.mockup.texture })
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(SW, SH), this.screenMat)
    screen.position.z = 0.062
    this.sheen = new THREE.Mesh(new THREE.PlaneGeometry(SW, SH), sheenMaterial())
    this.sheen.position.z = 0.066
    this.glow = new THREE.Mesh(new THREE.PlaneGeometry(SW * 1.5, 1.8), glowMaterial(p.accent))
    this.glow.rotation.x = -Math.PI / 2
    this.glow.position.set(0, -SH / 2 - 0.42, 0.25)
    this.monitor.add(bezel, screen, this.sheen, this.glow)

    if (this.world.fine) {
      screen.userData = {
        cursor: 'open',
        onPress: () => window.open(p.links.demo, '_blank', 'noopener,noreferrer'),
      }
      this.interactive = [screen]
    }

    const tone = p.status.tone === 'done' ? '#3fe0a0' : '#ffb347'
    const P = this.panel
    P.text(`${String(this.number).padStart(2, '0')} — Selected work  ·  ${this.index + 1}/${this.total}`, STYLES.kicker)
    P.run(
      [
        [p.date, COLORS.dim],
        ['   ·   ', COLORS.dim],
        [p.status.label, tone],
      ],
      STYLES.label,
      { gap: 18 },
    )
    P.text(p.title, STYLES.title, { gap: 10 })
    P.text(p.tagline, { ...STYLES.lead, color: p.accent }, { gap: 14 })
    P.text(p.description, STYLES.body, { gap: 18 })
    P.list(p.features, { gap: 22 })
    P.run(
      p.stack.flatMap((name, i) => (i ? [['   ·   ', p.accent], [name, COLORS.body]] : [[name, COLORS.body]])),
      STYLES.label,
      { gap: 18 },
    )
  }

  async layout(v) {
    const unit = SW + BEZEL
    if (v.wide) {
      const w = Math.min(v.visW * 0.46, v.visH * 1.02)
      const s = w / unit
      const dir = this.side === 'right' ? 1 : -1
      this.monitor.scale.setScalar(s)
      this.baseY = 0
      this.monitor.position.set(dir * v.visW * 0.245, 0, -0.9)
      this.baseYaw = -dir * 0.26
      return this.placeColumn(v, dir > 0 ? 'left' : 'right', { maxPx: 560, share: 0.4 })
    }
    const s = (v.visW * 0.92) / unit
    const h = (SH + BEZEL) * s
    const top = v.visH / 2 - v.safeTop
    this.monitor.scale.setScalar(s)
    this.baseY = top - h / 2 - 0.05
    this.monitor.position.set(0, this.baseY, -0.3)
    this.baseYaw = 0
    return this.placeStack(v, top - h - 34 * v.upx)
  }

  update(f) {
    const { time, q, leaving, look } = f
    this.monitor.rotation.set(0.02 - look.y * 0.08, this.baseYaw + look.x * 0.12, 0)
    this.monitor.position.y = this.baseY + Math.sin(time * 0.8 + this.index) * 0.03
    const on = smooth(0.35, 0.85, q)
    this.screenMat.color.setScalar(0.06 + 0.94 * on)
    if (q > 0.05) this.mockup.draw(time)
    this.sheen.material.uniforms.uOpacity.value = on
    this.sheen.material.uniforms.uLook.value.set(look.x, look.y)
    this.glow.material.uniforms.uOpacity.value = on
    this.panel.reveal(q, leaving)
  }

  dispose() {
    this.mockup.dispose()
    super.dispose()
  }
}
