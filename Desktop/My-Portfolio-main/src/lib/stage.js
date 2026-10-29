import { useSyncExternalStore } from 'react'

// Wide screens put the copy beside each 3D scene; tall ones stack it below.
export const WIDE_QUERY = '(min-width: 760px) and (min-aspect-ratio: 21/20)'

// A tiny store shared by the 3D world and the page around it.
// mode: 'loading' → 'webgl' (the 3D world runs) or 'fallback' (plain page).
const state = { chapter: 0, mode: 'loading' }
const listeners = new Set()
const emit = () => listeners.forEach((fn) => fn())
const subscribe = (fn) => {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export const stage = {
  world: null,
  setChapter(index) {
    if (state.chapter === index) return
    state.chapter = index
    emit()
  },
  setMode(mode) {
    if (state.mode === mode) return
    state.mode = mode
    emit()
  },
}

export const useChapter = () => useSyncExternalStore(subscribe, () => state.chapter, () => 0)
export const useMode = () => useSyncExternalStore(subscribe, () => state.mode, () => 'loading')
