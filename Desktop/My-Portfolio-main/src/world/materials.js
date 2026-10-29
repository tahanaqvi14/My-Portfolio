import * as THREE from 'three'

// Black chrome faces with warm copper sides: the extruded lettering.
export function letterMaterials() {
  const face = new THREE.MeshPhysicalMaterial({
    color: '#1b1e26',
    metalness: 1,
    roughness: 0.2,
    clearcoat: 0.6,
    clearcoatRoughness: 0.16,
    envMapIntensity: 1.15,
  })
  const side = new THREE.MeshPhysicalMaterial({
    color: '#8a4a2a',
    metalness: 1,
    roughness: 0.32,
    envMapIntensity: 0.9,
  })
  return [face, side]
}

export function darkMetal(color = '#191c23', roughness = 0.38) {
  return new THREE.MeshPhysicalMaterial({ color, metalness: 0.75, roughness, clearcoat: 0.4, clearcoatRoughness: 0.3 })
}
