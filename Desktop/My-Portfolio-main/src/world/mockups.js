import * as THREE from 'three'

// Animated, illustrative interfaces for the three projects, drawn on a canvas that
// becomes the texture of each 3D screen. Layout units are a 1024 x 640 design grid.

const W = 1024
const H = 640
const SANS = `'Archivo', 'Helvetica Neue', Arial, sans-serif`
const MONO = `'IBM Plex Mono', ui-monospace, Menlo, monospace`

const C = {
  bg: '#0a0c11',
  panel: '#11141b',
  panel2: '#161a23',
  line: '#232838',
  text: '#e8ebf2',
  body: '#a3abbd',
  dim: '#69718a',
}

function rr(ctx, x, y, w, h, r) {
  const k = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + k, y)
  ctx.arcTo(x + w, y, x + w, y + h, k)
  ctx.arcTo(x + w, y + h, x, y + h, k)
  ctx.arcTo(x, y + h, x, y, k)
  ctx.arcTo(x, y, x + w, y, k)
  ctx.closePath()
}

function box(ctx, x, y, w, h, r, fill, stroke) {
  rr(ctx, x, y, w, h, r)
  if (fill) {
    ctx.fillStyle = fill
    ctx.fill()
  }
  if (stroke) {
    ctx.strokeStyle = stroke
    ctx.lineWidth = 1.5
    ctx.stroke()
  }
}

function txt(ctx, s, x, y, { size = 15, weight = 500, color = C.text, font = SANS, align = 'left' } = {}) {
  ctx.font = `${weight} ${size}px ${font}`
  ctx.fillStyle = color
  ctx.textAlign = align
  ctx.textBaseline = 'alphabetic'
  ctx.fillText(s, x, y)
}

// Word-wrapped text revealed up to `chars` characters. Returns the y after the last line.
function para(ctx, s, x, y, maxW, { size = 15, lh = 22, color = C.text, weight = 400, chars = Infinity, font = SANS } = {}) {
  ctx.font = `${weight} ${size}px ${font}`
  ctx.fillStyle = color
  ctx.textAlign = 'left'
  const words = s.slice(0, Math.max(0, chars)).split(' ')
  let line = ''
  let yy = y
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, yy)
      line = word
      yy += lh
    } else line = test
  }
  if (line) ctx.fillText(line, x, yy)
  return yy
}

const cycle = (t, period) => (t % period) / period
const clamp01 = (x) => Math.min(Math.max(x, 0), 1)

function chrome(ctx, accent, title) {
  ctx.fillStyle = C.bg
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = C.panel
  ctx.fillRect(0, 0, W, 44)
  ;['#ff5f57', '#febc2e', '#28c840'].forEach((c, i) => {
    ctx.beginPath()
    ctx.arc(24 + i * 20, 22, 6, 0, Math.PI * 2)
    ctx.fillStyle = c
    ctx.fill()
  })
  box(ctx, 300, 11, 424, 22, 11, C.panel2)
  txt(ctx, title, W / 2, 27, { size: 12, color: C.dim, font: MONO, align: 'center' })
  ctx.fillStyle = accent
  ctx.fillRect(0, 44, W, 2)
}

// DocMind AI: chat with your documents, answers with verifiable citations.
function drawDocMind(ctx, t) {
  const accent = '#93c2f7'
  chrome(ctx, accent, 'docmind.ai / workspace')
  const k = cycle(t, 11)
  const time = k * 11

  // Sidebar: workspace documents with processing status.
  box(ctx, 16, 62, 236, 562, 14, C.panel)
  txt(ctx, 'DocMind AI', 36, 96, { size: 20, weight: 800 })
  ctx.beginPath()
  ctx.arc(232, 89, 5, 0, Math.PI * 2)
  ctx.fillStyle = accent
  ctx.fill()
  txt(ctx, 'DOCUMENTS', 36, 132, { size: 11, color: C.dim, font: MONO })
  const docs = [
    ['Refund-Policy.pdf', 'Ready'],
    ['Employee-Handbook.pdf', 'Ready'],
    ['Pricing-2025.docx', 'Ready'],
    ['Q3-Board-Report.pdf', 'Processing'],
  ]
  docs.forEach(([name, status], i) => {
    const y = 148 + i * 54
    const active = i === 0
    if (active) box(ctx, 26, y - 2, 216, 46, 10, '#1a2333', '#2a3b57')
    box(ctx, 38, y + 9, 22, 26, 4, active ? accent : '#2a3142')
    txt(ctx, name, 72, y + 21, { size: 13.5, weight: active ? 700 : 500, color: active ? C.text : C.body })
    const processing = status === 'Processing'
    const pct = processing ? clamp01((time % 5) / 5) : 1
    txt(ctx, processing ? `Processing ${Math.round(pct * 100)}%` : status, 72, y + 37, {
      size: 11,
      color: processing ? '#ffb347' : '#3fe0a0',
      font: MONO,
    })
  })
  txt(ctx, 'USAGE THIS MONTH', 36, 560, { size: 11, color: C.dim, font: MONO })
  box(ctx, 36, 574, 196, 8, 4, '#232a3a')
  box(ctx, 36, 574, 196 * 0.62, 8, 4, accent)
  txt(ctx, '62% of plan', 36, 604, { size: 12, color: C.body })

  // Conversation.
  box(ctx, 268, 62, 740, 562, 14, C.panel)
  txt(ctx, 'Chat with Refund-Policy.pdf', 292, 96, { size: 16, weight: 700 })
  txt(ctx, 'Grounded in your documents only', 292, 118, { size: 12, color: C.dim, font: MONO })
  ctx.fillStyle = C.line
  ctx.fillRect(268, 134, 740, 1)

  const q = 'Can customers get a refund after 30 days?'
  if (time > 0.6) {
    ctx.font = `500 15px ${SANS}`
    const qw = ctx.measureText(q).width + 36
    box(ctx, 984 - qw, 156, qw, 44, 16, '#22406a')
    txt(ctx, q, 984 - qw + 18, 184, { size: 15, weight: 500 })
  }
  const answer =
    'Refunds are available within 30 days of purchase. After that, unused items can be returned for store credit, and annual plans are refunded pro rata.'
  if (time > 1.4) {
    box(ctx, 292, 222, 560, 150, 16, C.panel2)
    txt(ctx, 'DocMind', 314, 250, { size: 12, color: accent, font: MONO, weight: 500 })
    const typing = time < 2.4
    if (typing) {
      for (let i = 0; i < 3; i++) {
        ctx.beginPath()
        ctx.arc(318 + i * 14, 282, 4, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(232,235,242,${0.3 + 0.7 * Math.abs(Math.sin(time * 6 + i))})`
        ctx.fill()
      }
    } else {
      const chars = Math.floor((time - 2.4) * 48)
      const endY = para(ctx, answer, 314, 282, 516, { size: 15, lh: 23, chars })
      if (chars < answer.length && Math.floor(time * 3) % 2 === 0) {
        ctx.fillStyle = accent
        ctx.fillRect(316 + 0, endY + 6, 8, 2)
      }
      if (chars >= answer.length) {
        ;['[1] p. 2', '[2] p. 4'].forEach((c, i) => {
          box(ctx, 314 + i * 94, 340, 84, 22, 11, '#1d3150')
          txt(ctx, c, 356 + i * 94, 356, { size: 11.5, color: accent, font: MONO, align: 'center' })
        })
      }
    }
  }
  // Source panel: the cited passage, highlighted.
  if (time > 5.6) {
    const a = clamp01((time - 5.6) / 0.6)
    ctx.globalAlpha = a
    box(ctx, 292, 392, 692, 150, 14, '#0f131a', '#24304a')
    txt(ctx, 'SOURCE  ·  Refund-Policy.pdf  ·  page 2', 314, 420, { size: 11.5, color: C.dim, font: MONO })
    box(ctx, 312, 434, 652, 30, 6, `rgba(147,194,247,${0.14 + 0.08 * Math.sin(time * 3)})`)
    txt(ctx, '“Customers may request a full refund within 30 days of purchase.”', 322, 455, { size: 14.5, color: C.text })
    para(ctx, 'Requests made after this period are handled as store credit for unused items. Annual subscriptions are refunded on a pro-rata basis.', 314, 492, 640, { size: 13.5, lh: 21, color: C.body })
    ctx.globalAlpha = 1
  }
  // Input.
  box(ctx, 292, 562, 692, 46, 23, C.panel2, C.line)
  txt(ctx, 'Ask anything about your documents…', 316, 591, { size: 14, color: C.dim })
  box(ctx, 940, 568, 36, 34, 17, accent)
  txt(ctx, '↑', 958, 592, { size: 16, weight: 700, color: '#0a0c11', align: 'center' })
}

// CodeArena: a ranked, ten-minute head-to-head with live scores.
const CODE = [
  ['function', ' ', 'twoSum', '(nums, target) {'],
  ['  ', 'const', ' seen = ', 'new', ' Map()'],
  ['  ', 'for', ' (', 'let', ' i = 0; i < nums.length; i++) {'],
  ['    ', 'const', ' need = target - nums[i]'],
  ['    ', 'if', ' (seen.has(need)) ', 'return', ' [seen.get(need), i]'],
  ['    seen.set(nums[i], i)'],
  ['  }'],
  ['  ', 'return', ' []'],
  ['}'],
]
const KEYWORDS = new Set(['function', 'const', 'new', 'for', 'let', 'if', 'return'])

function drawCodeArena(ctx, t) {
  const accent = '#7ee2a8'
  chrome(ctx, accent, 'codearena / ranked-match')
  const time = cycle(t, 12) * 12

  // Match bar.
  box(ctx, 16, 58, 992, 58, 12, C.panel)
  txt(ctx, 'CodeArena', 34, 94, { size: 20, weight: 800 })
  ctx.beginPath()
  ctx.arc(196, 87, 5, 0, Math.PI * 2)
  ctx.fillStyle = Math.floor(time * 2) % 2 ? '#ff5f57' : '#ff8a80'
  ctx.fill()
  txt(ctx, 'LIVE  ·  RANKED', 208, 92, { size: 12, color: C.body, font: MONO })
  const left = Math.max(0, 600 - 23 - Math.floor(time))
  const mm = String(Math.floor(left / 60)).padStart(2, '0')
  const ss = String(left % 60).padStart(2, '0')
  box(ctx, 452, 68, 120, 38, 10, '#0c1f17', '#1f4d37')
  txt(ctx, `${mm}:${ss}`, 512, 95, { size: 22, weight: 700, color: accent, font: MONO, align: 'center' })
  txt(ctx, 'You  1420', 760, 92, { size: 14, weight: 700 })
  txt(ctx, 'vs', 852, 92, { size: 13, color: C.dim })
  txt(ctx, 'rival_dev  1405', 880, 92, { size: 14, weight: 500, color: C.body })

  // Problem.
  box(ctx, 16, 128, 286, 496, 12, C.panel)
  txt(ctx, 'Two Sum', 36, 164, { size: 19, weight: 800 })
  box(ctx, 36, 176, 70, 22, 11, '#2b2414')
  txt(ctx, 'Medium', 71, 192, { size: 11.5, color: '#ffb347', font: MONO, align: 'center' })
  para(ctx, 'Given an array of integers and a target, return the indices of the two numbers that add up to the target.', 36, 230, 246, { size: 14, lh: 22, color: C.body })
  txt(ctx, 'TESTS', 36, 344, { size: 11, color: C.dim, font: MONO })
  const passed = time > 8.6 ? 3 : time > 7.6 ? 2 : time > 6.8 ? 1 : 0
  for (let i = 0; i < 3; i++) {
    const ok = i < passed
    box(ctx, 36, 358 + i * 44, 246, 34, 8, ok ? '#0f2a1d' : C.panel2)
    txt(ctx, `Case ${i + 1}`, 52, 380 + i * 44, { size: 13, color: ok ? accent : C.body, font: MONO })
    txt(ctx, ok ? 'passed' : '—', 266, 380 + i * 44, { size: 12, color: ok ? accent : C.dim, font: MONO, align: 'right' })
  }

  // Editor with code typing in.
  box(ctx, 314, 128, 450, 496, 12, '#0d1016')
  txt(ctx, 'solution.js', 334, 158, { size: 12.5, color: C.body, font: MONO })
  ctx.fillStyle = C.line
  ctx.fillRect(314, 172, 450, 1)
  const totalChars = CODE.reduce((s, l) => s + l.join('').length, 0)
  let remaining = Math.floor(clamp01((time - 0.4) / 6) * totalChars)
  let cursor = null
  CODE.forEach((tokens, row) => {
    const y = 204 + row * 30
    txt(ctx, String(row + 1).padStart(2, ' '), 332, y, { size: 13, color: '#3b4256', font: MONO })
    if (remaining <= 0) return
    let x = 368
    for (const tok of tokens) {
      const shown = tok.slice(0, remaining)
      remaining -= tok.length
      const color = KEYWORDS.has(tok) ? '#c792ea' : tok === 'twoSum' ? '#82aaff' : '#d6deeb'
      txt(ctx, shown, x, y, { size: 14, color, font: MONO })
      ctx.font = `400 14px ${MONO}`
      x += ctx.measureText(shown).width
      if (remaining <= 0) break
    }
    // The caret sits where typing has reached.
    if (remaining <= 0 && !cursor) cursor = [x, y]
  })
  if (cursor && Math.floor(time * 3) % 2 === 0) {
    ctx.fillStyle = accent
    ctx.fillRect(cursor[0] + 1, cursor[1] - 13, 2, 16)
  }
  const submitted = time > 6.6
  box(ctx, 610, 572, 136, 36, 10, submitted ? accent : '#1b2a22')
  txt(ctx, submitted ? 'Submitted' : 'Submit', 678, 595, { size: 13.5, weight: 700, color: submitted ? '#0a0c11' : accent, align: 'center' })

  // Live scoreboard.
  box(ctx, 776, 128, 232, 496, 12, C.panel)
  txt(ctx, 'LIVE SCORE', 796, 160, { size: 11, color: C.dim, font: MONO })
  const players = [
    ['You', 1420, passed * 100 + (time > 9 ? 40 : 0)],
    ['rival_dev', 1405, time > 5 ? 200 : time > 3 ? 100 : 0],
  ]
  players.forEach(([name, rank, score], i) => {
    const y = 182 + i * 92
    box(ctx, 792, y, 200, 78, 10, i === 0 ? '#122019' : C.panel2)
    txt(ctx, name, 808, y + 28, { size: 15, weight: 700 })
    txt(ctx, `rank ${rank}`, 976, y + 28, { size: 11.5, color: C.dim, font: MONO, align: 'right' })
    txt(ctx, String(score), 808, y + 62, { size: 24, weight: 800, color: i === 0 ? accent : C.text, font: MONO })
    box(ctx, 880, y + 50, 96, 8, 4, '#232a3a')
    box(ctx, 880, y + 50, 96 * Math.min(score / 340, 1), 8, 4, i === 0 ? accent : '#82aaff')
  })
  txt(ctx, 'MATCH HISTORY', 796, 400, { size: 11, color: C.dim, font: MONO })
  ;[
    ['W', 'Valid Parentheses', '+24'],
    ['L', 'Merge Intervals', '−18'],
    ['W', 'LRU Cache', '+31'],
  ].forEach(([res, name, delta], i) => {
    const y = 420 + i * 46
    box(ctx, 792, y, 200, 38, 8, C.panel2)
    txt(ctx, res, 810, y + 25, { size: 13, weight: 800, color: res === 'W' ? accent : '#ff8a80', font: MONO })
    txt(ctx, name, 834, y + 25, { size: 12.5, color: C.body })
    txt(ctx, delta, 978, y + 25, { size: 12, color: res === 'W' ? accent : '#ff8a80', font: MONO, align: 'right' })
  })
}

// Anchor: rehearse a negotiation against an AI that pushes back; the ledger holds the line.
function drawAnchor(ctx, t) {
  const accent = '#d9a8ff'
  chrome(ctx, accent, 'anchor / session')
  const time = cycle(t, 13) * 13

  box(ctx, 16, 58, 640, 566, 14, C.panel)
  txt(ctx, 'Salary negotiation', 38, 94, { size: 18, weight: 800 })
  txt(ctx, 'OPPONENT  ·  HARD BARGAINER', 38, 116, { size: 11, color: C.dim, font: MONO })
  box(ctx, 520, 78, 116, 30, 15, '#2a1f38')
  txt(ctx, 'Voice on', 578, 98, { size: 12, color: accent, font: MONO, align: 'center' })
  ctx.fillStyle = C.line
  ctx.fillRect(16, 134, 640, 1)

  const msgs = [
    { at: 0.4, me: false, text: 'We can offer $92,000. That is the standard band for this role.' },
    { at: 2.4, me: true, text: 'Given the scope and my experience, I am looking for $110,000.' },
    { at: 5.0, me: false, text: 'I can stretch to $98,000, but that is as far as I can go today.' },
    { at: 8.0, me: true, text: 'If we add a six-month review, I could meet you at $104,000.' },
  ]
  let y = 160
  msgs.forEach((m) => {
    if (time < m.at) return
    const chars = Math.floor((time - m.at) * 60)
    ctx.font = `400 14.5px ${SANS}`
    const w = 410
    const x = m.me ? 640 - w - 18 : 34
    box(ctx, x, y, w, 70, 16, m.me ? '#2a1f38' : C.panel2)
    txt(ctx, m.me ? 'YOU' : 'OPPONENT', x + 18, y + 22, { size: 10.5, color: m.me ? accent : C.dim, font: MONO })
    para(ctx, m.text, x + 18, y + 44, w - 36, { size: 14.5, lh: 20, chars })
    y += 84
  })
  // Voice input.
  box(ctx, 34, 548, 604, 56, 28, C.panel2, C.line)
  for (let i = 0; i < 36; i++) {
    const h = 6 + Math.abs(Math.sin(time * 7 + i * 0.7) * Math.sin(time * 2.3 + i)) * 26
    ctx.fillStyle = i < 30 ? accent : '#3a3148'
    ctx.fillRect(66 + i * 9, 576 - h / 2, 4, h)
  }
  txt(ctx, 'Listening…', 620, 582, { size: 13, color: C.body, align: 'right' })

  // Ledger: offers against a hidden limit the AI never sees.
  box(ctx, 668, 58, 340, 380, 14, C.panel)
  txt(ctx, 'LEDGER', 690, 92, { size: 11, color: C.dim, font: MONO })
  const offers = [
    ['Their opening', '$92,000', 0.4],
    ['Your anchor', '$110,000', 2.4],
    ['Their counter', '$98,000', 5.0],
    ['Your move', '$104,000', 8.0],
  ]
  offers.forEach(([label, value, at], i) => {
    const yy = 112 + i * 52
    const on = time >= at
    box(ctx, 686, yy, 304, 42, 10, on ? '#1a1524' : '#13151c')
    txt(ctx, label, 702, yy + 27, { size: 13, color: on ? C.body : C.dim })
    txt(ctx, on ? value : '—', 974, yy + 27, { size: 14, weight: 700, color: on ? C.text : C.dim, font: MONO, align: 'right' })
  })
  txt(ctx, 'HIDDEN LIMIT', 690, 344, { size: 11, color: C.dim, font: MONO })
  box(ctx, 690, 358, 296, 10, 5, '#2a2436')
  const pos = time > 8 ? 0.72 : time > 5 ? 0.46 : time > 2.4 ? 0.3 : 0.12
  box(ctx, 690, 358, 296 * pos, 10, 5, accent)
  ctx.fillStyle = '#ff8a80'
  ctx.fillRect(690 + 296 * 0.86, 352, 2, 22)
  txt(ctx, 'locked in code', 690, 400, { size: 12, color: C.body })

  // Feedback report with a quoted, verified citation.
  box(ctx, 668, 450, 340, 174, 14, C.panel)
  txt(ctx, 'FEEDBACK REPORT', 690, 482, { size: 11, color: C.dim, font: MONO })
  if (time > 9.5) {
    const a = clamp01((time - 9.5) / 0.6)
    ctx.globalAlpha = a
    para(ctx, '“Given the scope and my experience…” — a strong, specific anchor.', 690, 512, 296, { size: 14, lh: 21, color: C.text })
    box(ctx, 690, 566, 118, 24, 12, '#16301f')
    txt(ctx, 'citation verified', 749, 582, { size: 11, color: '#3fe0a0', font: MONO, align: 'center' })
    ctx.globalAlpha = 1
  } else {
    para(ctx, 'Generated when the session ends, quoting your own messages.', 690, 512, 296, { size: 13.5, lh: 21, color: C.dim })
  }
}

const DRAW = { docmind: drawDocMind, codearena: drawCodeArena, anchor: drawAnchor }

export function createMockup(id, scale = 1) {
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(W * scale)
  canvas.height = Math.round(H * scale)
  const ctx = canvas.getContext('2d')
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  let last = -1
  return {
    texture,
    // Redraws at most ~24 times a second.
    draw(time) {
      if (time - last < 1 / 24 && last >= 0) return
      last = time
      ctx.setTransform(scale, 0, 0, scale, 0, 0)
      DRAW[id](ctx, time)
      texture.needsUpdate = true
    },
    dispose() {
      texture.dispose()
    },
  }
}
