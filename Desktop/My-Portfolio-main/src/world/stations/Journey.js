import * as THREE from 'three'
import { Station } from '../Station'
import { makeText, STYLES, COLORS } from '../text'
import { smooth } from '../Panel'
import { achievements, journey } from '../../data/content'

const gateMaterial = (phase) =>
  new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uPhase: { value: phase },
      uOpacity: { value: 1 },
      uColor: { value: new THREE.Color('#6f8bff') },
      uHot: { value: new THREE.Color('#ff7a3d').multiplyScalar(3.5) },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uPhase;
      uniform float uOpacity;
      uniform vec3 uColor;
      uniform vec3 uHot;
      varying vec2 vUv;
      void main() {
        float a = fract(vUv.x - uTime * 0.11 + uPhase);
        float head = exp(-pow((a - 0.5) * 7.0, 2.0));
        vec3 col = uColor * 0.6 + uHot * head;
        gl_FragColor = vec4(col * uOpacity, uOpacity);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })

// Three glowing gates receding into the dark, one per step of the journey.
export class Journey extends Station {
  async build() {
    this.gates = new THREE.Group()
    this.group.add(this.gates)
    const geometry = new THREE.TorusGeometry(1, 0.018, 12, 200)
    this.rings = journey.map((item, i) => {
      const ring = new THREE.Mesh(geometry, gateMaterial(i * 0.33))
      ring.position.set(i * 0.95, i * 0.2, -i * 2.9)
      ring.rotation.y = 0.55
      // Labels stay upright beside their gate (not parented, since the rings turn).
      const label = makeText(item.period, { ...STYLES.label, color: COLORS.fg })
      label.fontSize = 0.075
      label.position.set(ring.position.x + 0.1, ring.position.y + 1.16, ring.position.z)
      ring.userData.label = label
      this.gates.add(ring, label)
      return ring
    })

    const p = this.panel
    p.text('08 — Journey', STYLES.kicker)
    p.text('The path so far.', STYLES.headline, { gap: 18 })
    journey.forEach((item, i) => {
      p.text(item.period, STYLES.label, { gap: i === 0 ? 30 : 30 })
      p.text(item.org, STYLES.org, { gap: 8 })
      p.text(item.role, STYLES.body, { gap: 6 })
      p.bullets(item.points, { gap: 12, style: { ...STYLES.body, lineHeight: 1.55 } })
    })
    p.text('Recognition', STYLES.label, { gap: 34 })
    p.pairs(
      achievements.map((a) => [a.detail, a.title]),
      { gap: 12, labelPx: 190 },
    )
  }

  async layout(v) {
    if (v.wide) {
      const s = Math.min(v.visH * 0.27, v.visW * 0.13)
      this.gates.scale.setScalar(s)
      this.gates.position.set(-v.visW * 0.3, 0.05 * v.visH, -0.5)
      return this.placeColumn(v, 'right', { maxPx: 540, share: 0.4 })
    }
    const s = Math.min(v.visW * 0.26, v.visH * 0.12)
    const top = v.visH / 2 - v.safeTop
    this.gates.scale.setScalar(s)
    this.gates.position.set(-s * 1.1, top - s * 1.4, -0.5)
    return this.placeStack(v, top - s * 2.8 - 20 * v.upx)
  }

  update(f) {
    const { time, q, leaving, look } = f
    this.gates.rotation.set(look.y * 0.06, look.x * 0.12, 0)
    this.rings.forEach((ring, i) => {
      const a = leaving ? smooth(0.2, 0.8, q) : smooth(0.2 + i * 0.15, 0.6 + i * 0.15, q)
      ring.material.uniforms.uTime.value = time
      ring.material.uniforms.uOpacity.value = a
      ring.visible = a > 0.01
      ring.scale.setScalar(0.85 + 0.15 * a)
      ring.rotation.z = time * 0.05 * (i % 2 ? -1 : 1)
      const label = ring.userData.label
      label.fillOpacity = a
      label.visible = a > 0.01
    })
    this.panel.reveal(q, leaving)
  }
}
