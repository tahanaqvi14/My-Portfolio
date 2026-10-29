// three.js needs WebGL2. Checked once, up front: without it the 3D code is never downloaded.
export const hasWebGL2 = (() => {
  try {
    const gl = document.createElement('canvas').getContext('webgl2')
    if (!gl) return false
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    return true
  } catch {
    return false
  }
})()

// Start fetching the 3D world as early as possible; later imports reuse this promise.
export const loadWorld = () => import('../world/World')
