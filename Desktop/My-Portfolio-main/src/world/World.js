import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { gsap } from '../lib/gsap'
import { WIDE_QUERY } from '../lib/stage'
import { preloadFonts } from './text'
import { makeDebris, makeDust, makeStars, makeStreaks, setDebrisOpacity } from './fx'
import { createStations } from './stations'

export const FOV = 40
// Distance from the camera to a station's copy plane while resting there.
export const REST = 11
const BG = '#05060a'
// Scroll length of each flight between stations, in viewport heights.
const FLIGHT = 1.15
const INTERACTIVE_DOM = 'a, button, input, textarea, select, label, summary, [role="button"]'

const smootherstep = (t) => {
  const x = Math.min(Math.max(t, 0), 1)
  return x * x * x * (x * (x * 6 - 15) + 10)
}

// The whole site as one 3D scene: scrolling flies the camera from station to station.
export class World {
  constructor(canvas, { reduced = false, onStation = () => {}, onCursor = () => {} } = {}) {
    this.canvas = canvas
    this.reduced = reduced
    this.onStation = onStation
    this.onCursor = onCursor
    this.fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    this.coarse = window.matchMedia('(pointer: coarse)').matches
    const small = this.coarse || Math.min(window.innerWidth, window.innerHeight) < 640
    this.budget = small
      ? { galaxy: 12000, globeDots: 1800, dust: 4000, streaks: 700, debris: 70, stars: 1600, mockup: 0.75 }
      : { galaxy: 24000, globeDots: 2800, dust: 8000, streaks: 1400, debris: 130, stars: 2600, mockup: 1 }

    // Throws without WebGL2; the caller falls back to the plain page.
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: false,
      stencil: false,
      powerPreference: 'high-performance',
    })
    this.renderer.toneMapping = THREE.NeutralToneMapping
    this.renderer.setClearColor(BG, 1)
    // Shader diagnostics in development only: they slow compiling, and some GPU drivers
    // report harmless precision notes that would otherwise land in the console.
    this.renderer.debug.checkShaderErrors = import.meta.env.DEV
    this.maxDpr = this.coarse ? 1.6 : 1.75
    this.dpr = Math.min(window.devicePixelRatio || 1, this.maxDpr)
    this.quality = 2
    this.useComposer = true

    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(BG)
    // Far enough that the next stop looms out of the dark during a flight.
    this.scene.fog = new THREE.Fog(BG, 24, 82)
    this.camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 600)
    this.camera.position.set(0, 0, REST)

    this.time = 0
    this.s = 0
    this.station = -1
    this.interactives = []
    this.hovered = null
    this.samples = []
    this.layoutQueue = Promise.resolve()
    this.pointer = { x: 0, y: 0, active: false }
    this.smoothPointer = { x: 0, y: 0 }
    this.look = { x: 0, y: 0 }
    this.ndc = new THREE.Vector2()
    this.raycaster = new THREE.Raycaster()
    this.camPos = new THREE.Vector3()
    this.camTarget = new THREE.Vector3()
    this.tangent = new THREE.Vector3()
    this.tmp = new THREE.Vector3()
    this.right = new THREE.Vector3()
    this.upv = new THREE.Vector3()
    this.frame = { time: 0, dt: 0, q: 0, leaving: false, local: 0, look: this.look, pointer: this.smoothPointer, pointerActive: false }

    this.tick = this.tick.bind(this)
    this.onPointerMove = this.onPointerMove.bind(this)
    this.onPointerOut = this.onPointerOut.bind(this)
    this.onClick = this.onClick.bind(this)
    this.onResize = this.onResize.bind(this)
    this.onLost = (e) => {
      e.preventDefault()
      this.lost = true
    }
    this.onRestored = () => {
      this.lost = false
    }
  }

  async init(sections, onProgress = () => {}) {
    const mark = (name) => performance.mark(`world:${name}`)
    mark('start')
    this.sections = sections
    const pmrem = new THREE.PMREMGenerator(this.renderer)
    this.envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    pmrem.dispose()
    this.scene.environment = this.envTexture
    this.scene.environmentIntensity = 0.7
    const key = new THREE.DirectionalLight('#fff1e6', 1.4)
    key.position.set(4, 7, 9)
    const rim = new THREE.DirectionalLight('#6f8bff', 1.1)
    rim.position.set(-6, 3, -6)
    this.scene.add(new THREE.AmbientLight('#8a96b8', 0.35), key, rim)
    mark('environment')
    onProgress(0.1)

    const quiet = (p) => Promise.resolve(p).catch(() => {})
    await Promise.all([
      quiet(preloadFonts()),
      quiet(document.fonts?.load(`600 20px 'Archivo'`)),
      quiet(document.fonts?.load(`500 14px 'IBM Plex Mono'`)),
    ])
    if (this.disposed) return
    mark('fonts')
    onProgress(0.4)

    this.stations = createStations(this)
    for (let i = 0; i < this.stations.length; i++) {
      await this.stations[i].build()
      if (this.disposed) return
      this.scene.add(this.stations[i].group)
      this.interactives.push(...this.stations[i].interactive)
      onProgress(0.4 + (0.35 * (i + 1)) / this.stations.length)
    }

    mark('stations')
    this.setupComposer()
    this.resize()
    if (!(await this.layout())) return
    mark('layout')
    onProgress(0.85)

    this.stars = makeStars({ count: this.budget.stars })
    this.scene.add(this.stars)
    this.buildPathEffects()

    // Compile every shader now so the first flight doesn't stutter.
    this.stations.forEach((s) => (s.group.visible = true))
    await this.renderer.compileAsync(this.scene, this.camera)
    if (this.disposed) return
    mark('compiled')

    this.ro = new ResizeObserver(this.onResize)
    this.ro.observe(this.canvas)
    this.canvas.addEventListener('webglcontextlost', this.onLost)
    this.canvas.addEventListener('webglcontextrestored', this.onRestored)
    if (!this.reduced) {
      window.addEventListener('pointermove', this.onPointerMove, { passive: true })
      document.addEventListener('pointerout', this.onPointerOut, { passive: true })
    }
    document.addEventListener('click', this.onClick)
    gsap.ticker.add(this.tick)
    this.ready = true
    onProgress(1)
  }

  setupComposer() {
    const r = this.renderer
    const float = r.extensions.has('EXT_color_buffer_float')
    this.rt = new THREE.WebGLRenderTarget(1, 1, {
      type: float ? THREE.HalfFloatType : THREE.UnsignedByteType,
      samples: this.coarse ? 2 : 4,
    })
    this.composer = new EffectComposer(r, this.rt)
    this.composer.addPass(new RenderPass(this.scene, this.camera))
    // Threshold above white (1.0): only deliberate HDR accents glow, never the copy.
    // A tight radius keeps glows close to their source instead of hazing the whole frame.
    this.bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.65, 0.22, 1.0)
    this.composer.addPass(this.bloom)
    this.composer.addPass(new OutputPass())
  }

  resize() {
    const w = this.canvas.clientWidth || window.innerWidth
    const h = this.canvas.clientHeight || window.innerHeight
    this.size = { w, h }
    this.renderer.setPixelRatio(this.dpr)
    this.renderer.setSize(w, h, false)
    this.composer?.setPixelRatio(this.dpr)
    this.composer?.setSize(w, h)
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    this.dirtyFrame = true
  }

  onResize() {
    clearTimeout(this.resizeTimer)
    this.resizeTimer = setTimeout(() => {
      const { w, h } = this.size
      if (this.canvas.clientWidth === w && this.canvas.clientHeight === h) return
      this.resize()
      this.layout()
    }, 120)
  }

  // Mobile toolbars can cover the bottom of the large-viewport canvas: measure how much.
  hiddenBottom() {
    const probe = document.createElement('div')
    probe.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:100svh;visibility:hidden;pointer-events:none'
    document.body.appendChild(probe)
    const svh = probe.getBoundingClientRect().height || window.innerHeight
    probe.remove()
    return Math.max(0, this.size.h - Math.min(svh, window.innerHeight))
  }

  // Layouts run one at a time: each station measures its text asynchronously, and two
  // overlapping passes (e.g. load, then a quick resize) would mix their results.
  layout() {
    const run = this.layoutQueue.then(() => this.runLayout())
    this.layoutQueue = run.catch(() => {})
    return run
  }

  async runLayout() {
    if (this.disposed) return false
    const { w: vw, h: vh } = this.size
    const visH = 2 * REST * Math.tan((FOV * Math.PI) / 360)
    const upx = visH / vh
    const v = {
      wide: window.matchMedia(WIDE_QUERY).matches,
      fine: this.fine,
      vw,
      vh,
      aspect: vw / vh,
      visH,
      visW: (visH * vw) / vh,
      upx,
      safeTop: (vw < 768 ? 74 : 92) * upx,
      // Leave room for the bottom bar (taller on phones, where it can wrap).
      safeBottom: ((vw < 768 ? 112 : 82) + this.hiddenBottom()) * upx,
    }
    const results = await Promise.all(this.stations.map((st) => st.layout(v)))
    if (this.disposed) return false
    this.v = v
    const first = !this.curve
    this.buildPath(results)
    this.applySections(results)
    if (!first) this.buildPathEffects()
    this.dirtyFrame = true
    return true
  }

  // Dust and streaks follow the flight path, so rebuild them when it changes.
  buildPathEffects() {
    for (const fx of [this.dust, this.streaks, this.debris]) {
      if (!fx) continue
      this.scene.remove(fx)
      fx.traverse((o) => {
        o.geometry?.dispose()
        o.material?.dispose()
      })
    }
    const stops = this.stations.map((s) => s.group.position)
    this.dust = makeDust(this.curve.getSpacedPoints(400), { count: this.budget.dust })
    this.streaks = makeStreaks(this.curve, { count: this.budget.streaks })
    this.debris = makeDebris(this.curve, stops, { count: this.budget.debris })
    this.scene.add(this.dust, this.streaks, this.debris)
  }

  // Two keyframes per station (arrive / leave its resting spot) joined by a smooth curve.
  buildPath(results) {
    const kf = []
    const pts = []
    this.keyIndex = []
    this.stations.forEach((st, i) => {
      const r = results[i]
      st.group.updateMatrixWorld(true)
      const toWorld = (x, y, z) => new THREE.Vector3(x, y, z).applyMatrix4(st.group.matrixWorld)
      if (i > 0) {
        const prev = this.stations[i - 1]
        for (const [x, y, z] of results[i - 1].exitVia ?? []) pts.push(new THREE.Vector3(x, y, z).applyMatrix4(prev.group.matrixWorld))
      }
      const pan = r.pan ?? 0
      const dolly = r.dolly ?? (pan > 0 ? 0 : 0.35)
      const start = { pos: toWorld(0, 0, REST), target: toWorld(0, 0, 0) }
      const end = { pos: toWorld(0, -pan, REST - dolly), target: toWorld(0, -pan, -dolly) }
      this.keyIndex.push(pts.length)
      pts.push(start.pos)
      kf.push(start)
      this.keyIndex.push(pts.length)
      pts.push(end.pos.clone().add(new THREE.Vector3(0, 0, -1e-3)))
      kf.push(end)
    })
    this.kf = kf
    this.curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal')
  }

  // Sections are only scroll length: dwell at a station, then the flight to the next.
  applySections(results) {
    const { vh, upx } = this.v
    this.panPx = results.map((r) => Math.round((r.pan ?? 0) / upx))
    this.dwellPx = results.map((r, i) => Math.round((r.dwell ?? 0.5) * vh) + this.panPx[i])
    this.flightPx = Math.round(FLIGHT * vh)
    const n = this.sections.length
    this.sections.forEach((el, i) => {
      el.style.height = `${this.dwellPx[i] + (i === n - 1 ? window.innerHeight : this.flightPx)}px`
    })
  }

  // Scroll offset (px) → path position s: station i rests on [2i, 2i+1], flies on [2i+1, 2i+2].
  sFromScroll(y) {
    const n = this.stations.length
    let acc = 0
    for (let i = 0; i < n; i++) {
      const d = Math.max(this.dwellPx[i], 1)
      // With copy to pan through, move 1:1 with the scroll (like reading a page), then hold.
      const pan = this.panPx[i]
      if (y <= acc + d) return 2 * i + (pan > 0 ? Math.min(1, Math.max(0, y - acc) / pan) : Math.max(0, y - acc) / d)
      acc += d
      if (i === n - 1) break
      if (y <= acc + this.flightPx) return 2 * i + 1 + (y - acc) / this.flightPx
      acc += this.flightPx
    }
    return 2 * n - 1
  }

  // Scroll offset where station i's resting spot begins (for links into the page).
  scrollFor(i) {
    let acc = 0
    for (let k = 0; k < i; k++) acc += this.dwellPx[k] + this.flightPx
    return acc
  }

  cameraAt(s, pos, target) {
    const last = this.kf.length - 1
    const c = Math.min(Math.max(s, 0), last)
    const k = Math.min(Math.floor(c), last - 1)
    const t = c - k
    const a = this.kf[k]
    const b = this.kf[k + 1]
    if (k % 2 === 0) {
      pos.lerpVectors(a.pos, b.pos, t)
      target.lerpVectors(a.target, b.target, t)
      return 0
    }
    const e = this.reduced ? (t < 0.5 ? 0 : 1) : smootherstep(t)
    const ia = this.keyIndex[k]
    const ib = this.keyIndex[k + 1]
    const u = (ia + e * (ib - ia)) / (this.curve.points.length - 1)
    this.curve.getPoint(u, pos)
    this.curve.getTangent(u, this.tangent)
    target.lerpVectors(a.target, b.target, e)
    // Mid-flight, look where we are going.
    const w = Math.sin(Math.PI * e) ** 2 * 0.65
    if (w > 0) target.lerp(this.tmp.copy(pos).addScaledVector(this.tangent, 14), w)
    return Math.sin(Math.PI * e)
  }

  proximity(i, s, out) {
    const a = 2 * i
    const b = 2 * i + 1
    if (s >= a && s <= b) {
      out.q = 1
      out.leaving = false
      out.local = s - a
    } else if (s < a) {
      const t = s - (a - 1)
      out.q = t <= 0 ? 0 : this.reduced ? (t < 0.5 ? 0 : 1) : smootherstep(t)
      out.leaving = false
      out.local = 0
    } else {
      const t = s - b
      out.q = t >= 1 ? 0 : this.reduced ? (t < 0.5 ? 1 : 0) : 1 - smootherstep(t)
      out.leaving = true
      out.local = 1
    }
    return out
  }

  playIntro() {
    this.stations?.[0]?.intro(this.reduced)
    this.dirtyFrame = true
    clearTimeout(this.introTimer)
    this.introTimer = setTimeout(() => (this.introDone = true), this.reduced ? 0 : 2800)
  }

  flyPlane() {
    this.stations?.find((s) => s.id === 'contact')?.fly()
  }

  // --- interaction ----------------------------------------------------------

  setNdc(e) {
    const w = this.canvas.clientWidth || window.innerWidth
    const h = this.canvas.clientHeight || window.innerHeight
    this.ndc.set((e.clientX / w) * 2 - 1, -(e.clientY / h) * 2 + 1)
  }

  onPointerMove(e) {
    this.setNdc(e)
    this.pointer.x = this.ndc.x
    this.pointer.y = this.ndc.y
    this.pointer.active = e.pointerType === 'mouse' || e.pointerType === 'pen'
    this.overDom = e.target instanceof Element && !!e.target.closest(INTERACTIVE_DOM)
    this.pointerMoved = true
  }

  onPointerOut(e) {
    if (e.relatedTarget) return
    this.pointer.active = false
    this.pointerMoved = true
  }

  isShown(o) {
    for (let p = o; p; p = p.parent) if (!p.visible) return false
    return true
  }

  pick() {
    this.raycaster.setFromCamera(this.ndc, this.camera)
    const candidates = this.interactives.filter((o) => this.isShown(o))
    return this.raycaster.intersectObjects(candidates, false)[0]?.object ?? null
  }

  onClick(e) {
    if (!this.ready || (e.target instanceof Element && e.target.closest(INTERACTIVE_DOM))) return
    this.setNdc(e)
    this.pick()?.userData.onPress?.()
  }

  hoverTest() {
    if (!this.fine || !this.pointerMoved) return
    this.pointerMoved = false
    const hit = this.pointer.active && !this.overDom ? this.pick() : null
    if (hit === this.hovered) return
    this.hovered?.userData.onLeave?.()
    this.hovered = hit
    hit?.userData.onEnter?.()
    this.onCursor(hit ? (hit.userData.cursor ?? 'link') : null)
  }

  // --- frame loop -----------------------------------------------------------

  tick(_time, deltaMs) {
    if (!this.ready || this.lost || document.hidden) return
    const dt = Math.min(deltaMs, 50) / 1000
    const reduced = this.reduced

    const target = this.sFromScroll(window.scrollY)
    if (reduced) {
      // Still scene: draw when something changed, and a few times a second anyway so that
      // text and textures finishing in the background still show up.
      const now = performance.now()
      if (target === this.s && !this.dirtyFrame && now - (this.lastDraw ?? 0) < 250) return
      this.lastDraw = now
      this.s = target
    } else {
      this.time += dt
      this.s += (target - this.s) * (1 - Math.exp(-dt * 12))
      if (Math.abs(target - this.s) < 1e-4) this.s = target
      const k = 1 - Math.exp(-dt * 5)
      this.smoothPointer.x += (this.pointer.x - this.smoothPointer.x) * k
      this.smoothPointer.y += (this.pointer.y - this.smoothPointer.y) * k
      if (this.fine) {
        this.look.x = this.smoothPointer.x
        this.look.y = this.smoothPointer.y
      } else {
        // Touch screens have no hover: let the scene sway on its own.
        this.look.x = Math.sin(this.time * 0.21) * 0.3
        this.look.y = Math.cos(this.time * 0.17) * 0.2
      }
    }

    const flight = this.cameraAt(this.s, this.camPos, this.camTarget)
    // Parallax: shift the camera sideways with the look direction (less while flying).
    const fwd = this.tmp.subVectors(this.camTarget, this.camPos).normalize()
    this.right.crossVectors(fwd, THREE.Object3D.DEFAULT_UP).normalize()
    this.upv.crossVectors(this.right, fwd)
    const par = 1 - flight * 0.7
    this.camPos.addScaledVector(this.right, this.look.x * 0.32 * par).addScaledVector(this.upv, this.look.y * 0.2 * par)
    this.camera.position.copy(this.camPos)
    this.camera.lookAt(this.camTarget)
    if (flight > 0) this.camera.rotateZ(-this.tangent.dot(this.right) * 0.4 * flight)
    const fov = FOV + flight * 7
    if (Math.abs(fov - this.camera.fov) > 0.01) {
      this.camera.fov = fov
      this.camera.updateProjectionMatrix()
    }

    const f = this.frame
    f.time = this.time
    f.dt = reduced ? 0 : dt
    f.pointerActive = this.pointer.active
    let active = 0
    let best = -1
    this.stations.forEach((st, i) => {
      const near = this.s > 2 * i - 1.9 && this.s < 2 * i + 2.9
      st.group.visible = near
      if (!near) return
      this.proximity(i, this.s, f)
      st.update(f)
      if (f.q > best) {
        best = f.q
        active = i
      }
    })
    if (active !== this.station) {
      this.station = active
      this.onStation(active)
    }

    this.stars.position.copy(this.camera.position)
    this.stars.userData.uniforms.uTime.value = this.time
    this.stars.userData.uniforms.uPixelRatio.value = this.dpr
    this.dust.userData.uniforms.uTime.value = this.time
    this.dust.userData.uniforms.uPixelRatio.value = this.dpr
    this.streaks.userData.uniforms.uOpacity.value = reduced ? 0 : flight
    setDebrisOpacity(this.debris, reduced ? 0 : Math.min(1, flight * 1.6))

    this.hoverTest()
    if (this.useComposer) this.composer.render(dt)
    else this.renderer.render(this.scene, this.camera)
    this.dirtyFrame = false
    this.adapt(deltaMs)
  }

  // If frames run slow, step down: lower resolution first, then drop bloom and MSAA.
  adapt(deltaMs) {
    if (this.reduced || !this.introDone || this.qualityLocked || this.quality === 0) return
    this.samples.push(deltaMs)
    if (this.samples.length < 90) return
    const median = [...this.samples].sort((a, b) => a - b)[45]
    this.samples = []
    if (median <= 22) {
      this.qualityLocked = true
      return
    }
    this.quality -= 1
    if (this.quality === 1) {
      this.dpr = 1
      this.resize()
    } else {
      this.useComposer = false
    }
  }

  dispose() {
    this.disposed = true
    gsap.ticker.remove(this.tick)
    clearTimeout(this.resizeTimer)
    clearTimeout(this.introTimer)
    this.ro?.disconnect()
    this.canvas.removeEventListener('webglcontextlost', this.onLost)
    this.canvas.removeEventListener('webglcontextrestored', this.onRestored)
    window.removeEventListener('pointermove', this.onPointerMove)
    document.removeEventListener('pointerout', this.onPointerOut)
    document.removeEventListener('click', this.onClick)
    this.stations?.forEach((s) => s.dispose())
    for (const fx of [this.stars, this.dust, this.streaks, this.debris]) {
      fx?.traverse((o) => {
        o.geometry?.dispose()
        o.material?.dispose()
      })
    }
    this.envTexture?.dispose()
    this.composer?.dispose()
    this.rt?.dispose()
    this.renderer.dispose()
    this.renderer.forceContextLoss()
  }
}
