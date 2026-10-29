// The page is a run of chapters; each one gives the particle cloud a new shape.
// side: where the shape sits on wide screens (1 right, -1 left, 0 centre) — the copy takes the other half.
export const chapters = [
  { id: 'home', shape: 'name', side: 0, title: 'Hello' },
  { id: 'intent', shape: 'galaxy', side: -1, title: 'Intent' },
  { id: 'about', shape: 'globe', side: 1, title: 'About' },
  { id: 'toolbox', shape: 'atom', side: -1, title: 'Toolbox' },
  { id: 'docmind', shape: 'docs', side: 1, title: 'DocMind AI' },
  { id: 'codearena', shape: 'code', side: -1, title: 'CodeArena' },
  { id: 'anchor', shape: 'anchor', side: 1, title: 'Anchor' },
  { id: 'journey', shape: 'helix', side: -1, title: 'Journey' },
  { id: 'contact', shape: 'plane', side: 1, title: 'Contact' },
  { id: 'fin', shape: 'stars', side: 0, title: 'Fin' },
]

export const chapterById = Object.fromEntries(chapters.map((c, index) => [c.id, { ...c, index }]))
