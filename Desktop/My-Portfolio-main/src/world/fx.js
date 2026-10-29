import * as THREE from 'three'

// Shared visual effects. Shader colours are linear (THREE.Color converts sRGB hex), and
// every fragment shader ends with the tone-mapping / colour-space chunks so it matches
// the rest of the scene whether it renders through the bloom composer or straight out.

const TAU = Math.PI * 2

export function rng(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const gauss = (r) => Math.sqrt(-2 * Math.log(Math.max(r(), 1e-6))) * Math.cos(TAU * r())

const OUTPUT = /* glsl */ `
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
`

const pointFragment = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = dot(c, c) * 4.0;
    if (d > 1.0) discard;
    gl_FragColor = vec4(vColor, exp(-d * 3.4) * vAlpha);
    ${OUTPUT}
  }
`

// Soft dust drifting through a corridor around the camera's flight path.
export function makeDust(pathPoints, { count = 4000, seed = 9 } = {}) {
  const r = rng(seed)
  const pos = new Float32Array(count * 3)
  const rand = new Float32Array(count * 4)
  const n = pathPoints.length
  for (let i = 0; i < count; i++) {
    const k = r() * (n - 1)
    const a = pathPoints[Math.floor(k)]
    const b = pathPoints[Math.min(Math.ceil(k), n - 1)]
    const f = k - Math.floor(k)
    const ang = r() * TAU
    const rad = 3 + Math.pow(r(), 0.6) * 22
    pos[i * 3] = a.x + (b.x - a.x) * f + Math.cos(ang) * rad
    pos[i * 3 + 1] = a.y + (b.y - a.y) * f + Math.sin(ang) * rad * 0.7
    pos[i * 3 + 2] = a.z + (b.z - a.z) * f + (r() - 0.5) * 8
    for (let j = 0; j < 4; j++) rand[i * 4 + j] = r()
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  geometry.setAttribute('aRand', new THREE.BufferAttribute(rand, 4))
  const uniforms = {
    uTime: { value: 0 },
    uPixelRatio: { value: 1 },
    uColA: { value: new THREE.Color('#9fb2ff') },
    uColB: { value: new THREE.Color('#ff8a4c') },
  }
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uPixelRatio;
      uniform vec3 uColA;
      uniform vec3 uColB;
      attribute vec4 aRand;
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        vec3 p = position;
        p.x += sin(uTime * 0.13 + aRand.x * 6.2831) * 0.4;
        p.y += cos(uTime * 0.11 + aRand.y * 6.2831) * 0.4;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        float d = -mv.z;
        gl_PointSize = min((1.5 + aRand.z * 3.0) * uPixelRatio * (12.0 / max(d, 0.5)), 22.0);
        float fade = smoothstep(0.8, 4.0, d) * (1.0 - smoothstep(40.0, 80.0, d));
        float twinkle = 0.55 + 0.45 * sin(uTime * (0.5 + aRand.x) + aRand.y * 40.0);
        vAlpha = (0.28 + 0.5 * aRand.w) * fade * twinkle;
        vColor = mix(uColA, uColB, step(0.88, aRand.x)) * 0.9;
      }
    `,
    fragmentShader: pointFragment,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
  const points = new THREE.Points(geometry, material)
  points.frustumCulled = false
  points.userData.uniforms = uniforms
  return points
}

// Light streaks lined up with the flight path. They only show while the camera is
// flying, and rushing past them is what makes a flight feel fast.
export function makeStreaks(curve, { count = 900, seed = 5 } = {}) {
  const r = rng(seed)
  const pos = new Float32Array(count * 6)
  const head = new Float32Array(count * 2)
  const tone = new Float32Array(count * 2)
  const p = new THREE.Vector3()
  const t = new THREE.Vector3()
  const side = new THREE.Vector3()
  const up = new THREE.Vector3()
  for (let i = 0; i < count; i++) {
    const u = r()
    curve.getPointAt(u, p)
    curve.getTangentAt(u, t)
    side.crossVectors(t, THREE.Object3D.DEFAULT_UP).normalize()
    up.crossVectors(side, t).normalize()
    const ang = r() * TAU
    const rad = 1.6 + Math.pow(r(), 0.8) * 9
    p.addScaledVector(side, Math.cos(ang) * rad).addScaledVector(up, Math.sin(ang) * rad * 0.75)
    const len = 1.5 + r() * 4
    pos.set([p.x - t.x * len, p.y - t.y * len, p.z - t.z * len, p.x, p.y, p.z], i * 6)
    head.set([0, 1], i * 2)
    const warm = r() < 0.18 ? 1 : 0
    tone.set([warm, warm], i * 2)
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  geometry.setAttribute('aHead', new THREE.BufferAttribute(head, 1))
  geometry.setAttribute('aWarm', new THREE.BufferAttribute(tone, 1))
  const uniforms = {
    uOpacity: { value: 0 },
    uCool: { value: new THREE.Color('#a9bcff').multiplyScalar(2.6) },
    uWarm: { value: new THREE.Color('#ff8a4c').multiplyScalar(3) },
  }
  const lines = new THREE.LineSegments(
    geometry,
    new THREE.ShaderMaterial({
      uniforms,
      vertexShader: /* glsl */ `
        attribute float aHead;
        attribute float aWarm;
        varying float vHead;
        varying float vWarm;
        varying float vFade;
        void main() {
          vHead = aHead;
          vWarm = aWarm;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          float d = -mv.z;
          vFade = smoothstep(0.5, 3.0, d) * (1.0 - smoothstep(26.0, 48.0, d));
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uOpacity;
        uniform vec3 uCool;
        uniform vec3 uWarm;
        varying float vHead;
        varying float vWarm;
        varying float vFade;
        void main() {
          float a = vHead * vFade * uOpacity;
          gl_FragColor = vec4(mix(uCool, uWarm, vWarm) * a, a);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  )
  lines.frustumCulled = false
  lines.userData.uniforms = uniforms
  return lines
}

// Scenery along the route between stops: wireframe crystals and thin glowing rings that
// rush past during flights. It fades out at rest (setDebrisOpacity), keeping each stop clean.
export function makeDebris(curve, avoid, { count = 120, seed = 13 } = {}) {
  const r = rng(seed)
  const group = new THREE.Group()
  const crystals = new THREE.InstancedMesh(
    new THREE.IcosahedronGeometry(1, 0),
    new THREE.MeshBasicMaterial({ color: new THREE.Color('#7f93ff').multiplyScalar(0.9), wireframe: true, transparent: true, opacity: 0.55, depthWrite: false }),
    count,
  )
  const rings = new THREE.InstancedMesh(
    new THREE.TorusGeometry(1, 0.015, 6, 64),
    new THREE.MeshBasicMaterial({ color: new THREE.Color('#ff7a3d').multiplyScalar(2), transparent: true, opacity: 0.8, depthWrite: false }),
    Math.floor(count / 3),
  )
  const m = new THREE.Matrix4()
  const q = new THREE.Quaternion()
  const e = new THREE.Euler()
  const p = new THREE.Vector3()
  const t = new THREE.Vector3()
  const side = new THREE.Vector3()
  const up = new THREE.Vector3()
  const s = new THREE.Vector3()
  const place = (mesh, n, scale) => {
    let placed = 0
    let guard = 0
    while (placed < n && guard++ < n * 20) {
      const u = r()
      curve.getPointAt(u, p)
      if (avoid.some((a) => a.distanceTo(p) < 17)) continue
      curve.getTangentAt(u, t)
      side.crossVectors(t, THREE.Object3D.DEFAULT_UP).normalize()
      up.crossVectors(side, t).normalize()
      const ang = r() * TAU
      const rad = 4.5 + r() * 11
      p.addScaledVector(side, Math.cos(ang) * rad).addScaledVector(up, Math.sin(ang) * rad * 0.7)
      q.setFromEuler(e.set(r() * TAU, r() * TAU, r() * TAU))
      s.setScalar(scale[0] + r() * (scale[1] - scale[0]))
      mesh.setMatrixAt(placed++, m.compose(p, q, s))
    }
    mesh.count = placed
    mesh.instanceMatrix.needsUpdate = true
  }
  place(crystals, count, [0.25, 1.1])
  place(rings, Math.floor(count / 3), [0.6, 2.2])
  crystals.frustumCulled = false
  rings.frustumCulled = false
  crystals.material.userData.base = crystals.material.opacity
  rings.material.userData.base = rings.material.opacity
  group.add(crystals, rings)
  return group
}

export function setDebrisOpacity(group, a) {
  group.visible = a > 0.01
  for (const mesh of group.children) mesh.material.opacity = mesh.material.userData.base * a
}

// Distant stars on a huge shell; the group follows the camera so they never get closer.
export function makeStars({ count = 2600, seed = 3 } = {}) {
  const r = rng(seed)
  const pos = new Float32Array(count * 3)
  const rand = new Float32Array(count * 4)
  for (let i = 0; i < count; i++) {
    const u = r() * 2 - 1
    const t = r() * TAU
    const s = Math.sqrt(1 - u * u)
    const rad = 180 + r() * 90
    pos[i * 3] = Math.cos(t) * s * rad
    pos[i * 3 + 1] = u * rad
    pos[i * 3 + 2] = Math.sin(t) * s * rad
    for (let j = 0; j < 4; j++) rand[i * 4 + j] = r()
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  geometry.setAttribute('aRand', new THREE.BufferAttribute(rand, 4))
  const uniforms = { uTime: { value: 0 }, uPixelRatio: { value: 1 } }
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uPixelRatio;
      attribute vec4 aRand;
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = (0.8 + aRand.z * aRand.z * 2.6) * uPixelRatio;
        vAlpha = (0.25 + 0.6 * aRand.w) * (0.7 + 0.3 * sin(uTime * (0.3 + aRand.x) + aRand.y * 30.0));
        vColor = mix(vec3(0.75, 0.82, 1.0), vec3(1.0, 0.78, 0.6), step(0.9, aRand.x));
      }
    `,
    fragmentShader: pointFragment,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false,
  })
  const points = new THREE.Points(geometry, material)
  points.frustumCulled = false
  points.userData.uniforms = uniforms
  return points
}

// Three-armed spiral galaxy in its own XZ plane, radius ~1.
export function makeGalaxy({ count = 22000, seed = 11 } = {}) {
  const r = rng(seed)
  const pos = new Float32Array(count * 3)
  const col = new Float32Array(count * 3)
  const size = new Float32Array(count)
  const core = new THREE.Color('#ffe2cc')
  const arm = new THREE.Color('#7d93ff')
  const hot = new THREE.Color('#ff7a3d')
  const c = new THREE.Color()
  const coreCount = Math.floor(count * 0.14)
  for (let i = 0; i < count; i++) {
    let x
    let y
    let z
    if (i < coreCount) {
      const rad = Math.abs(gauss(r)) * 0.1
      const t = r() * TAU
      const u = r() * 2 - 1
      const s = Math.sqrt(1 - u * u)
      x = Math.cos(t) * s * rad
      y = u * rad * 0.5
      z = Math.sin(t) * s * rad
      c.copy(core)
    } else {
      const d = Math.pow(r(), 0.75)
      const fall = 1 - d
      const angle = (i % 3) * (TAU / 3) + d * 4.2 + gauss(r) * 0.12 * (0.4 + fall)
      const spread = gauss(r) * 0.035 * (0.5 + fall)
      x = Math.cos(angle) * d + spread
      y = gauss(r) * 0.025 * (0.3 + fall)
      z = Math.sin(angle) * d + spread
      c.copy(core).lerp(arm, Math.min(1, d * 1.4))
      if (r() < 0.04) c.copy(hot)
    }
    pos.set([x, y, z], i * 3)
    col.set([c.r, c.g, c.b], i * 3)
    size[i] = 0.6 + r() * 1.4
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  geometry.setAttribute('aColor', new THREE.BufferAttribute(col, 3))
  geometry.setAttribute('aSize', new THREE.BufferAttribute(size, 1))
  const uniforms = { uTime: { value: 0 }, uPixelRatio: { value: 1 }, uScale: { value: 1 }, uOpacity: { value: 1 } }
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uPixelRatio;
      uniform float uScale;
      uniform float uOpacity;
      attribute vec3 aColor;
      attribute float aSize;
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = min(aSize * uScale * uPixelRatio * (12.0 / max(-mv.z, 0.5)), 20.0);
        vColor = aColor;
        vAlpha = 0.55 * uOpacity;
      }
    `,
    fragmentShader: pointFragment,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
  const points = new THREE.Points(geometry, material)
  points.userData.uniforms = uniforms
  return points
}

// A glowing ring with a dark disc inside: an eclipse.
export function makeEclipse() {
  const group = new THREE.Group()
  const uniforms = {
    uTime: { value: 0 },
    uIntensity: { value: 1 },
    uColor: { value: new THREE.Color('#ff6a2a') },
    uHot: { value: new THREE.Color('#ffd9b8') },
  }
  const ring = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({
      uniforms,
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uTime;
        uniform float uIntensity;
        uniform vec3 uColor;
        uniform vec3 uHot;
        varying vec2 vUv;
        void main() {
          vec2 p = vUv * 2.0 - 1.0;
          float r = length(p);
          float a = atan(p.y, p.x);
          float d = r - 0.62;
          float core = exp(-pow(d * 80.0, 2.0));
          float glow = exp(-pow(d * 12.0, 2.0)) * 0.4 + exp(-pow(max(d, 0.0) * 5.0, 2.0)) * 0.06;
          float flare = 0.8 + 0.2 * sin(a * 3.0 + uTime * 0.4);
          vec3 col = mix(uColor, uHot, core) * (core * 2.6 + glow * flare) * uIntensity;
          float alpha = clamp(core + glow, 0.0, 1.0) * smoothstep(1.0, 0.9, r);
          gl_FragColor = vec4(col, alpha);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  )
  const disc = new THREE.Mesh(
    new THREE.CircleGeometry(0.6, 96),
    new THREE.MeshBasicMaterial({ color: '#030407', transparent: true, opacity: 0.94, depthWrite: false }),
  )
  disc.position.z = 0.01
  group.add(ring, disc)
  group.userData.uniforms = uniforms
  group.userData.disc = disc
  return group
}

// Fresnel halo for spheres (render on a slightly larger back-facing sphere).
export function makeAtmosphere(radius, color = '#5f7dff', intensity = 1.4) {
  const uniforms = { uColor: { value: new THREE.Color(color) }, uIntensity: { value: intensity } }
  return new THREE.Mesh(
    new THREE.SphereGeometry(radius, 64, 48),
    new THREE.ShaderMaterial({
      uniforms,
      vertexShader: /* glsl */ `
        varying vec3 vNormal;
        varying vec3 vView;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vNormal = normalize(normalMatrix * normal);
          vView = normalize(-mv.xyz);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor;
        uniform float uIntensity;
        varying vec3 vNormal;
        varying vec3 vView;
        void main() {
          // Back faces: brightest just outside the planet's edge, fading to nothing outward.
          float f = pow(clamp(-dot(vNormal, vView), 0.0, 1.0), 1.5);
          gl_FragColor = vec4(uColor * f * uIntensity, f);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }
      `,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  )
}

export function disposeTree(root) {
  root.traverse((o) => {
    // troika Text meshes clean up their own geometry and derived material.
    if (typeof o.sync === 'function' && typeof o.dispose === 'function') {
      o.dispose()
      return
    }
    if (!o.geometry) return
    o.geometry.dispose()
    for (const m of [].concat(o.material)) {
      if (!m) continue
      for (const v of Object.values(m)) if (v?.isTexture) v.dispose()
      m.dispose()
    }
  })
}
