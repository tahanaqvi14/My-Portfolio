import * as THREE from 'three'
import { Station } from '../Station'
import { STYLES, COLORS } from '../text'
import { makeAtmosphere } from '../fx'
import { smooth } from '../Panel'
import { facts, person } from '../../data/content'

const RAD = Math.PI / 180
const KARACHI = [24.86, 67.01]
// Where the arcs fly to: "building for everywhere".
const CITIES = [
  [51.51, -0.13],
  [40.71, -74.0],
  [37.77, -122.42],
  [25.2, 55.27],
  [1.35, 103.82],
  [35.68, 139.69],
  [52.52, 13.4],
  [-33.87, 151.21],
  [-23.55, -46.63],
]

const toVec = ([lat, lon], r = 1) =>
  new THREE.Vector3(Math.cos(lat * RAD) * Math.sin(lon * RAD), Math.sin(lat * RAD), Math.cos(lat * RAD) * Math.cos(lon * RAD)).multiplyScalar(r)

const timeFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: person.timeZone,
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

function hdr(hex, k) {
  return new THREE.Color(hex).multiplyScalar(k)
}

function makeDots(count) {
  const pos = new Float32Array(count * 3)
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2
    const r = Math.sqrt(1 - y * y)
    pos.set([Math.cos(i * golden) * r, y, Math.sin(i * golden) * r], i * 3)
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      color: '#9fb4ff',
      // Attenuated by distance only (not by the globe's scale): about 2px on screen.
      size: 0.05,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    }),
  )
}

function makeGraticule() {
  const pts = []
  const seg = 96
  for (let lat = -60; lat <= 60; lat += 30) {
    for (let i = 0; i < seg; i++) {
      pts.push(toVec([lat, (i / seg) * 360]), toVec([lat, ((i + 1) / seg) * 360]))
    }
  }
  for (let lon = 0; lon < 360; lon += 30) {
    for (let i = 0; i < seg; i++) {
      pts.push(toVec([-90 + (i / seg) * 180, lon]), toVec([-90 + ((i + 1) / seg) * 180, lon]))
    }
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(pts.map((p) => p.multiplyScalar(1.002)))
  return new THREE.LineSegments(
    geometry,
    new THREE.LineBasicMaterial({ color: '#6c86ff', transparent: true, opacity: 0.16, depthWrite: false }),
  )
}

// Great-circle arc lifted off the surface, with a light pulse travelling along it.
function makeArc(from, to, offset) {
  const a = toVec(from)
  const b = toVec(to)
  const angle = a.angleTo(b)
  const lift = 0.1 + (angle / Math.PI) * 0.45
  const n = 72
  const pos = new Float32Array((n + 1) * 3)
  const t = new Float32Array(n + 1)
  const q = new THREE.Quaternion()
  const axis = new THREE.Vector3().crossVectors(a, b).normalize()
  for (let i = 0; i <= n; i++) {
    const f = i / n
    q.setFromAxisAngle(axis, angle * f)
    const p = a.clone().applyQuaternion(q).multiplyScalar(1 + Math.sin(Math.PI * f) * lift)
    pos.set([p.x, p.y, p.z], i * 3)
    t[i] = f
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  geometry.setAttribute('aT', new THREE.BufferAttribute(t, 1))
  const uniforms = {
    uTime: { value: 0 },
    uOffset: { value: offset },
    uOpacity: { value: 1 },
    uColor: { value: hdr('#ff7a3d', 3) },
    uBase: { value: new THREE.Color('#5f7dff') },
  }
  const line = new THREE.Line(
    geometry,
    new THREE.ShaderMaterial({
      uniforms,
      vertexShader: /* glsl */ `
        attribute float aT;
        varying float vT;
        void main() {
          vT = aT;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uTime;
        uniform float uOffset;
        uniform float uOpacity;
        uniform vec3 uColor;
        uniform vec3 uBase;
        varying float vT;
        void main() {
          float head = fract(uTime * 0.22 + uOffset);
          float d = vT - head;
          float pulse = exp(-pow(d * 9.0, 2.0)) * step(d, 0.0) + exp(-pow(d * 30.0, 2.0));
          vec3 col = uBase * 0.35 + uColor * pulse;
          gl_FragColor = vec4(col, (0.22 + pulse) * uOpacity);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  )
  line.userData.uniforms = uniforms
  return line
}

export class About extends Station {
  async build() {
    this.globe = new THREE.Group()
    this.earth = new THREE.Group()
    // Turn Karachi to face the viewer: R = Rx(lat) · Ry(-lon).
    this.earth.rotation.set(KARACHI[0] * RAD, -KARACHI[1] * RAD, 0, 'XYZ')
    this.globe.add(this.earth)
    this.group.add(this.globe)

    const core = new THREE.Mesh(
      new THREE.SphereGeometry(0.985, 64, 48),
      new THREE.MeshStandardMaterial({ color: '#070a12', roughness: 0.75, metalness: 0.3 }),
    )
    this.earth.add(core, makeDots(this.world.budget.globeDots), makeGraticule())
    this.globe.add(makeAtmosphere(1.2, '#5f7dff', 1.8))

    const k = toVec(KARACHI)
    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.03, 24, 16), new THREE.MeshBasicMaterial({ color: hdr('#ff7a3d', 5) }))
    beacon.position.copy(k).multiplyScalar(1.01)
    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.006, 0.006, 0.7, 8, 1, true).translate(0, 0.35, 0),
      new THREE.MeshBasicMaterial({ color: hdr('#ff9a5c', 3), transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending }),
    )
    beam.position.copy(k)
    beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), k.clone().normalize())
    this.rings = [0, 0.5].map((delay) => {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.03, 0.038, 48),
        new THREE.MeshBasicMaterial({ color: hdr('#ff7a3d', 3), transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }),
      )
      ring.position.copy(k).multiplyScalar(1.004)
      ring.lookAt(k.clone().multiplyScalar(2))
      ring.userData.delay = delay
      return ring
    })
    this.arcs = CITIES.map((city, i) => makeArc(KARACHI, city, i / CITIES.length))
    this.cityDots = CITIES.map((city) => {
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.014, 12, 8), new THREE.MeshBasicMaterial({ color: hdr('#9fb4ff', 2.5) }))
      dot.position.copy(toVec(city, 1.005))
      return dot
    })
    this.earth.add(beacon, beam, ...this.rings, ...this.arcs, ...this.cityDots)

    const p = this.panel
    p.text('03 — About  ·  Karachi, PK', STYLES.kicker)
    p.text('Based in Karachi. Building for everywhere.', STYLES.headline, { gap: 18 })
    p.text(
      `I’m ${person.fullName}, a Computer & Information Systems engineering student at NED University and a part-time engineer at ACE Systems. I design and build full-stack products end to end: the interface, the API, the database and the AI in between.`,
      STYLES.body,
      { gap: 22 },
    )
    p.pairs(
      facts.filter((f) => f.label !== 'Name').map((f) => [f.label, f.value]),
      { gap: 26 },
    )
    this.clockText = p.run(this.clockPieces(), STYLES.label, { gap: 18 })
  }

  clockPieces() {
    return [
      [`${person.coordinates}   ·   Local time `, COLORS.dim],
      [timeFormat.format(Date.now()), COLORS.fg],
      [' GMT+5', COLORS.dim],
    ]
  }

  async layout(v) {
    if (v.wide) {
      const r = Math.min(v.visH * 0.3, v.visW * 0.19)
      this.globe.scale.setScalar(r)
      this.globe.position.set(v.visW * 0.24, 0, -0.6)
      return this.placeColumn(v, 'left')
    }
    const r = Math.min(v.visW * 0.34, v.visH * 0.16)
    const top = v.visH / 2 - v.safeTop
    this.globe.scale.setScalar(r)
    this.globe.position.set(0, top - r * 1.3, -0.4)
    return this.placeStack(v, top - r * 2.6 - 18 * v.upx)
  }

  update(f) {
    const { time, q } = f
    this.globe.rotation.set(0.18 + f.look.y * 0.08, Math.sin(time * 0.18) * 0.32 + f.look.x * 0.2, 0)
    const shown = smooth(0.1, 0.9, q)
    for (const arc of this.arcs) {
      arc.userData.uniforms.uTime.value = time
      arc.userData.uniforms.uOpacity.value = shown
    }
    for (const ring of this.rings) {
      const t = (time * 0.6 + ring.userData.delay) % 1
      ring.scale.setScalar(1 + t * 5)
      ring.material.opacity = (1 - t) * shown
    }
    // Refresh the clock about once a minute.
    if (time - (this.lastClock ?? -100) > 20) {
      this.lastClock = time
      const str = this.clockPieces()
        .map(([s]) => s)
        .join('')
      if (this.clockText.text !== str) {
        this.clockText.text = str
        this.clockText.sync()
      }
    }
    this.panel.reveal(q, f.leaving)
  }
}
