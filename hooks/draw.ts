/**
 * The pane's drawings, as SVG documents: Claude's avatar with the task's progress, a helper's
 * avatar, and the sections' icons. Words stay in the pane's text, where they can be selected;
 * a drawing holds shapes, a percentage and short labels only.
 */

export type Mood = 'working' | 'waiting' | 'done' | 'idle'
export type Ink = 'claude' | 'ok' | 'warn' | 'bad' | 'blue' | 'plan' | 'mute'

const FONT = `font-family="ui-rounded, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"`

/** Light and dark palettes, and motion that stops for people who asked for less of it. */
const STYLE = `<style>
svg{--eye:#29261f;--ink:#29261f;--mute:#8d8a80;--track:#e8e4d9;--face:#ffffff;--claude:#d97757;--ok:#2f9e6a;--warn:#d99a06;--bad:#e5484d;--blue:#6a7cf0;--plan:#8b6fe8;--chip:#f3efe6}
@media (prefers-color-scheme: dark){svg{--ink:#f1efe7;--mute:#9d9a90;--track:#3a3935;--face:#fffdf8;--ok:#4eba65;--warn:#f2c14e;--bad:#ff6b80;--blue:#a5b0fa;--plan:#b39dfa;--chip:#2e2d29}}
.bob{animation:bob 1.8s ease-in-out infinite}
.blink{transform-box:fill-box;transform-origin:center;animation:blink 4.2s infinite}
.look{animation:look 3.2s ease-in-out infinite}
.spin{transform-box:view-box;animation:spin 1.4s linear infinite}
.pulse{transform-box:fill-box;transform-origin:center;animation:pulse 1.6s ease-out infinite}
.twinkle{transform-box:fill-box;transform-origin:center;animation:twinkle 1.8s ease-in-out infinite}
.float{animation:float 3s ease-in-out infinite}
.hop{animation:hop 1.2s ease-in-out infinite}
@keyframes bob{50%{transform:translateY(-3px)}}
@keyframes blink{0%,92%,100%{transform:scaleY(1)}95%{transform:scaleY(.12)}}
@keyframes look{0%,100%{transform:translateX(0)}30%{transform:translateX(2px)}65%{transform:translateX(-2px)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes pulse{0%{transform:scale(.7);opacity:.7}100%{transform:scale(1.9);opacity:0}}
@keyframes twinkle{0%,100%{transform:scale(.6);opacity:.35}50%{transform:scale(1.1);opacity:1}}
@keyframes float{0%{transform:translate(0,4px);opacity:0}30%{opacity:1}100%{transform:translate(6px,-10px);opacity:0}}
@keyframes hop{50%{transform:translateY(-4px)}}
@media (prefers-reduced-motion: reduce){*{animation:none!important}}
</style>`

/** Drawings already made, by what they show: a pane redraws often, and most of it has not changed. */
const made = new Map<string, string>()
const remember = (key: string, draw: () => string) => {
  const known = made.get(key)
  if (known !== undefined) return known
  const drawn = draw()
  if (made.size >= 120) made.delete(made.keys().next().value as string)
  made.set(key, drawn)

  return drawn
}

/** Words in at most `count` lines of `room` letters, the last one cut with « … » when they do not fit. */
const wrapWords = (text: string, room: number, count: number) => {
  const lines: string[] = []
  let line = ''
  for (const word of text.split(/\s+/)) {
    const next = line === '' ? word : `${line} ${word}`
    if (next.length <= room || line === '') {
      line = next
      continue
    }
    lines.push(line)
    line = word
  }
  lines.push(line)
  if (lines.length <= count) return lines.map(one => (one.length > room ? `${one.slice(0, room - 1)}…` : one))
  const kept = lines.slice(0, count)
  const last = kept[count - 1] as string

  return [...kept.slice(0, -1), `${last.length > room - 1 ? last.slice(0, room - 1).trimEnd() : last}…`]
}

const escape = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const svg = (width: number, height: number, body: string, title?: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${STYLE}${title ? `<title>${escape(title)}</title>` : ''}${body}</svg>`

/** The same colour for the same name, from a small set that reads well in both themes. */
const COATS = ['#7c8cf8', '#3fb6a8', '#4fb3c9', '#c27ce0', '#5aa9e6', '#e9b949', '#ef6f91', '#6cc070']
export const coatOf = (name: string) => {
  let hash = 2166136261
  for (const char of name) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619) >>> 0

  return COATS[hash % COATS.length] as string
}

const sparkle = (x: number, y: number, size: number, fill: string, extra = '') =>
  `<path ${extra} fill="${fill}" d="M${x} ${y - size}Q${x + size * 0.18} ${y - size * 0.18} ${x + size} ${y}Q${x + size * 0.18} ${y + size * 0.18} ${x} ${y + size}Q${x - size * 0.18} ${y + size * 0.18} ${x - size} ${y}Q${x - size * 0.18} ${y - size * 0.18} ${x} ${y - size}Z"/>`

const check = (x: number, y: number, size: number) =>
  `<path d="M${x - size * 0.45} ${y}l${size * 0.3} ${size * 0.32}l${size * 0.6} -${size * 0.66}" fill="none" stroke="#fff" stroke-width="${Math.max(1.6, size * 0.22)}" stroke-linecap="round" stroke-linejoin="round"/>`

/** Two eyes as the mood shows them: looking around, looking up at the person, happy, or asleep. */
const eyes = (mood: Mood | 'failed', left: number, right: number, y: number, size: number) => {
  if (mood === 'done') {
    return [left, right]
      .map(x => `<path d="M${x - size} ${y + size * 0.2}q${size} -${size * 1.3} ${size * 2} 0" fill="none" stroke="var(--eye)" stroke-width="${size * 0.42}" stroke-linecap="round"/>`)
      .join('')
  }
  if (mood === 'idle') {
    return [left, right]
      .map(x => `<path d="M${x - size} ${y}q${size} ${size * 0.8} ${size * 2} 0" fill="none" stroke="var(--eye)" stroke-width="${size * 0.38}" stroke-linecap="round"/>`)
      .join('')
  }
  const lift = mood === 'waiting' ? -size * 0.35 : 0
  const pupils = [left, right].map(x => `<circle cx="${x + size * 0.12}" cy="${y + size * 0.15 + lift}" r="${size * 0.5}" fill="var(--eye)"/>`).join('')
  const whites = [left, right].map(x => `<ellipse cx="${x}" cy="${y}" rx="${size * 0.95}" ry="${size * 1.08}" fill="var(--face)"/>`).join('')

  return `<g class="blink">${whites}<g class="${mood === 'working' ? 'look' : ''}">${pupils}</g></g>`
}

/** Claude, drawn small: a round orange friend with a spark on its antenna. Its centre is at (36, 42). */
const claudeAvatar = (mood: Mood) => {
  const mouth =
    mood === 'done'
      ? `<path d="M29 51q7 7 14 0" fill="var(--eye)" opacity=".85"/>`
      : mood === 'waiting'
        ? `<ellipse cx="36" cy="52" rx="3.2" ry="3.6" fill="var(--eye)" opacity=".85"/>`
        : `<path d="M30 51q6 5 12 0" fill="none" stroke="var(--eye)" stroke-width="2.4" stroke-linecap="round"/>`
  const extras =
    mood === 'waiting'
      ? `<g class="hop"><rect x="54" y="2" width="18" height="18" rx="9" fill="var(--warn)"/><rect x="61.6" y="5.5" width="2.8" height="7" rx="1.4" fill="#fff"/><circle cx="63" cy="15.4" r="1.6" fill="#fff"/></g>`
      : mood === 'done'
        ? `${sparkle(8, 18, 4, 'var(--warn)', 'class="twinkle"')}${sparkle(66, 26, 3.4, 'var(--ok)', 'class="twinkle" style="animation-delay:.5s"')}${sparkle(62, 64, 2.6, 'var(--blue)', 'class="twinkle" style="animation-delay:1s"')}`
        : mood === 'idle'
          ? `<text x="56" y="20" font-size="11" font-weight="700" fill="var(--mute)" class="float" ${FONT}>z</text><text x="62" y="12" font-size="8" font-weight="700" fill="var(--mute)" class="float" style="animation-delay:1.4s" ${FONT}>z</text>`
          : ''

  return `<g class="${mood === 'working' ? 'bob' : ''}">
<line x1="36" y1="17" x2="36" y2="8" stroke="var(--claude)" stroke-width="3" stroke-linecap="round"/>
${sparkle(36, 6, 5.5, mood === 'idle' ? 'var(--mute)' : 'var(--warn)', mood === 'working' ? 'class="twinkle"' : '')}
<ellipse cx="36" cy="69" rx="20" ry="3.5" fill="#000" opacity=".1"/>
<rect x="8" y="16" width="56" height="52" rx="25" fill="var(--claude)"/>
<circle cx="18" cy="49" r="4.2" fill="#ff8fa3" opacity=".55"/><circle cx="54" cy="49" r="4.2" fill="#ff8fa3" opacity=".55"/>
${eyes(mood, 26, 46, 38, 6.4)}
${mouth}
</g>${extras}`
}

const MOOD_LABEL: Record<Mood, { text: string; ink: Ink }> = {
  working: { text: 'Working', ink: 'claude' },
  waiting: { text: 'Needs you', ink: 'warn' },
  done: { text: 'All done', ink: 'ok' },
  idle: { text: 'Resting', ink: 'mute' },
}

export type HeroInput = {
  /** CSS pixels the drawing may take. */
  width: number
  mood: Mood
  /** The task's progress, 0 to 100. */
  percent: number
  /** Each goal's status, in order. */
  goals: readonly ('planned' | 'active' | 'waiting' | 'done')[]
  project: string
  /** What this session works on: its aim or current goal, the name it goes by. */
  task: string
  /** Helpers running for this session. */
  helpers: number
}

/** The pane's head: Claude and its mood, the project's badge, the goals as a trail, and the progress ring. */
export const drawHero = (input: HeroInput) => remember(`hero:${JSON.stringify(input)}`, () => heroOf(input))

const heroOf = ({ width, mood, percent, goals, project, task, helpers }: HeroInput) => {
  const w = Math.round(Math.max(300, Math.min(760, width)))
  const h = 112
  const ring = { x: w - 52, y: 58, r: 34 }
  const full = 2 * Math.PI * ring.r
  const value = Math.max(0, Math.min(100, Math.round(percent)))
  const left = 92
  const right = w - 108
  const label = MOOD_LABEL[mood]
  const initial = (project.trim().charAt(0) || '·').toUpperCase()
  const chipWidth = label.text.length * 6.6 + 26
  const captionX = left + chipWidth + 8
  // The task names the session: up to two lines beside the project's badge, about 7.2 px a letter.
  const room = Math.max(10, Math.floor((right - left - 32) / 7.2))
  const lines = wrapWords(task.trim() || 'Ready when you are', room, 2)

  const head = `<rect x="${left}" y="10" width="24" height="24" rx="7" fill="${coatOf(project || 'project')}"/>
<text x="${left + 12}" y="27" text-anchor="middle" font-size="13" font-weight="800" fill="#fff" ${FONT}>${escape(initial)}</text>
${lines.map((line, index) => `<text x="${left + 32}" y="${27 + index * 17}" font-size="13.5" font-weight="700" fill="var(--ink)" ${FONT}>${escape(line)}</text>`).join('')}
<rect x="${left}" y="83" width="${chipWidth}" height="18" rx="9" fill="var(--chip)"/>
<circle cx="${left + 11}" cy="92" r="3.5" fill="var(--${label.ink})"/>${mood === 'working' ? `<circle cx="${left + 11}" cy="92" r="3.5" fill="var(--${label.ink})" class="pulse"/>` : ''}
<text x="${left + 20}" y="96" font-size="11" font-weight="700" fill="var(--ink)" ${FONT}>${label.text}</text>`

  const span = right - left
  const count = goals.length
  let trail = ''
  if (count === 0) {
    trail = `<text x="${left}" y="68" font-size="12" fill="var(--mute)" ${FONT}>Goals show here once Claude starts a task</text>`
  } else if (span >= 90) {
    const step = count === 1 ? 0 : Math.min(46, (span - 16) / (count - 1))
    const x = (index: number) => left + 8 + index * step
    const y = 66
    const lines = goals
      .slice(0, -1)
      .map((status, index) => `<line x1="${x(index)}" y1="${y}" x2="${x(index + 1)}" y2="${y}" stroke="var(--${status === 'done' ? 'ok' : 'track'})" stroke-width="3" stroke-linecap="round"/>`)
      .join('')
    const nodes = goals
      .map((status, index) => {
        const cx = x(index)
        if (status === 'done') return `<circle cx="${cx}" cy="${y}" r="7.5" fill="var(--ok)"/>${check(cx, y, 7)}`
        if (status === 'active') return `<circle cx="${cx}" cy="${y}" r="7.5" fill="var(--claude)" class="pulse"/><circle cx="${cx}" cy="${y}" r="7.5" fill="var(--claude)"/><circle cx="${cx}" cy="${y}" r="2.6" fill="#fff"/>`
        if (status === 'waiting') return `<circle cx="${cx}" cy="${y}" r="7.5" fill="var(--warn)"/><rect x="${cx - 1.2}" y="${y - 4.2}" width="2.4" height="5" rx="1.2" fill="#fff"/><circle cx="${cx}" cy="${y + 3.2}" r="1.3" fill="#fff"/>`

        return `<circle cx="${cx}" cy="${y}" r="6.5" fill="var(--chip)" stroke="var(--track)" stroke-width="2.5"/>`
      })
      .join('')
    const done = goals.filter(status => status === 'done').length
    const caption = `${project || 'This project'} · ${done} of ${count} goals${helpers > 0 ? ` · ${helpers} helper${helpers === 1 ? '' : 's'}` : ''}`
    const captionRoom = Math.max(6, Math.floor((right - captionX) / 6.2))
    trail = `${lines}${nodes}<text x="${captionX}" y="96" font-size="11.5" fill="var(--mute)" ${FONT}>${escape(caption.length > captionRoom ? `${caption.slice(0, captionRoom - 1).trimEnd()}…` : caption)}</text>`
  }

  const arc = `<circle cx="${ring.x}" cy="${ring.y}" r="${ring.r}" fill="none" stroke="var(--track)" stroke-width="9"/>
<circle cx="${ring.x}" cy="${ring.y}" r="${ring.r}" fill="none" stroke="var(--${value >= 100 ? 'ok' : 'claude'})" stroke-width="9" stroke-linecap="round"
 stroke-dasharray="${full.toFixed(1)}" stroke-dashoffset="${(full * (1 - value / 100)).toFixed(1)}" transform="rotate(-90 ${ring.x} ${ring.y})" style="animation:grow 1.1s ease-out"/>
<style>@keyframes grow{from{stroke-dashoffset:${full.toFixed(1)}}}</style>
<text x="${ring.x}" y="${ring.y + 4}" text-anchor="middle" font-size="19" font-weight="800" fill="var(--ink)" ${FONT}>${value}<tspan font-size="11" font-weight="700">%</tspan></text>
<text x="${ring.x}" y="${ring.y + 18}" text-anchor="middle" font-size="9.5" fill="var(--mute)" ${FONT}>${value >= 100 ? 'done' : 'progress'}</text>`

  return svg(w, h, `<g transform="translate(6 18)">${claudeAvatar(mood)}</g>${head}${trail}${arc}`)
}

/** What each kind of helper carries: a magnifier to explore, a pencil to plan, a book to look up, a spark otherwise. */
const accessory = (type: string) => {
  const kind = type.toLowerCase()
  if (kind.includes('explore')) return `<circle cx="46" cy="44" r="6" fill="var(--face)" stroke="var(--eye)" stroke-width="2.4"/><line x1="50.5" y1="48.5" x2="55" y2="53" stroke="var(--eye)" stroke-width="3" stroke-linecap="round"/>`
  if (kind.includes('plan')) return `<g transform="rotate(35 47 44)"><rect x="44.5" y="34" width="5" height="16" rx="1.5" fill="var(--warn)"/><path d="M44.5 50h5l-2.5 4z" fill="var(--eye)"/></g>`
  if (kind.includes('guide') || kind.includes('doc')) return `<rect x="40" y="40" width="14" height="11" rx="2" fill="var(--blue)"/><line x1="47" y1="41" x2="47" y2="50" stroke="#fff" stroke-width="1.4"/>`
  if (kind.includes('review') || kind.includes('verif')) return `<circle cx="47" cy="45" r="7" fill="var(--ok)"/>${check(47, 45, 7)}`

  return `<line x1="32" y1="18" x2="32" y2="11" stroke="var(--eye)" stroke-width="2.2" stroke-linecap="round" opacity=".7"/>${sparkle(32, 9, 4, 'var(--warn)', 'class="twinkle"')}`
}

export type HelperInput = { id: string; type: string; status: 'running' | 'done' | 'failed'; description: string }

/** A helper: its own coat and accessory, a spinning ring while it works, a badge once it ends. */
export const drawHelper = (input: HelperInput) => remember(`helper:${JSON.stringify(input)}`, () => helperOf(input))

const helperOf = ({ id, type, status, description }: HelperInput) => {
  const size = 64
  const c = 32
  const r = 28
  const full = 2 * Math.PI * r
  const ring =
    status === 'running'
      ? `<circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="var(--track)" stroke-width="4"/>
<g class="spin" style="transform-origin:${c}px ${c}px"><circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="var(--claude)" stroke-width="4" stroke-linecap="round" stroke-dasharray="${(full * 0.28).toFixed(1)} ${full.toFixed(1)}"/></g>`
      : `<circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="var(--${status === 'done' ? 'ok' : 'warn'})" stroke-width="4"/>`
  const badge =
    status === 'done'
      ? `<circle cx="53" cy="53" r="9" fill="var(--ok)"/>${check(53, 53, 8)}`
      : status === 'failed'
        ? `<circle cx="53" cy="53" r="9" fill="var(--warn)"/><rect x="51.8" y="47.5" width="2.4" height="6.5" rx="1.2" fill="#fff"/><circle cx="53" cy="57.2" r="1.4" fill="#fff"/>`
        : ''
  const mood = status === 'running' ? 'working' : status === 'done' ? 'done' : 'failed'
  const mouth = status === 'failed' ? `<line x1="28" y1="42" x2="36" y2="42" stroke="var(--eye)" stroke-width="2" stroke-linecap="round"/>` : `<path d="M28 41q4 3.5 8 0" fill="none" stroke="var(--eye)" stroke-width="2" stroke-linecap="round"/>`
  const body = `<g class="${status === 'running' ? 'bob' : ''}"><rect x="15" y="17" width="34" height="32" rx="15" fill="${coatOf(id)}"/>${eyes(mood, 26, 38, 31, 3.6)}${mouth}${accessory(type)}</g>`

  return svg(size, size, `${ring}${body}${badge}`, description)
}

export type SessionInput = { id: string; mood: Mood; percent: number; task: string }

/** Another session's Claude, small: its mood, and its task's progress as a ring around it. */
export const drawSession = (input: SessionInput) => remember(`session:${JSON.stringify(input)}`, () => sessionOf(input))

const sessionOf = ({ mood, percent, task }: SessionInput) => {
  const c = 32
  const r = 28
  const full = 2 * Math.PI * r
  const value = Math.max(0, Math.min(100, Math.round(percent)))
  const ring = `<circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="var(--track)" stroke-width="4"/>${
    value > 0
      ? `<circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="var(--${value >= 100 ? 'ok' : 'claude'})" stroke-width="4" stroke-linecap="round" stroke-dasharray="${full.toFixed(1)}" stroke-dashoffset="${(full * (1 - value / 100)).toFixed(1)}" transform="rotate(-90 ${c} ${c})"/>`
      : ''
  }`

  return svg(64, 64, `${ring}<g transform="translate(13 11.5) scale(.53)">${claudeAvatar(mood)}</g>`, task)
}

/** A small spinner for « being read ». */
export const drawSpinner = () =>
  remember('spinner', () => spinnerOf())

const spinnerOf = () =>
  svg(14, 14, `<circle cx="7" cy="7" r="5" fill="none" stroke="var(--track)" stroke-width="2"/><g class="spin" style="transform-origin:7px 7px"><path d="M7 2a5 5 0 0 1 5 5" fill="none" stroke="var(--claude)" stroke-width="2" stroke-linecap="round"/></g>`)

export type IconKind = 'now' | 'move' | 'queue' | 'goals' | 'recent' | 'map' | 'elsewhere' | 'crew'

const ICON_PATHS: Record<IconKind, string> = {
  now: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  move: '<path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5"/>',
  queue: '<path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0 0 12 3z"/>',
  goals: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2"/>',
  recent: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  map: '<path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3z"/><path d="M9 3v15"/><path d="M15 6v15"/>',
  elsewhere: '<rect x="3" y="4" width="13" height="10" rx="2"/><path d="M8 18h11a2 2 0 0 0 2-2V8"/>',
  crew: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.6c2.8.2 5 2 5 5"/>',
}

/** Mid-tones that read on a light and a dark pane alike, so an icon needs no style sheet. */
const ICON_INK: Record<Ink, string> = { claude: '#d97757', ok: '#3fa66a', warn: '#dc9f12', bad: '#e5484d', blue: '#7182f2', plan: '#9a7ef0', mute: '#8d8a80' }

/** A section's drawn icon, in the colour of what it holds. */
export const drawIcon = (kind: IconKind, ink: Ink) =>
  remember(
    `icon:${kind}:${ink}`,
    () =>
      `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"><g transform="scale(.75)" fill="none" stroke="${ICON_INK[ink]}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${ICON_PATHS[kind]}</g></svg>`,
  )

export type WelcomeInput = {
  /** CSS pixels the drawing may take. */
  width: number
  /** "3 projects moved in 14 h". */
  caption: string
  /** The totals worth a tile, the most telling first (four at most are drawn). */
  tiles: readonly { kind: 'commits' | 'goals' | 'done' | 'helpers' | 'files' | 'updates' | 'stuck'; count: number }[]
  /** Each project's share of what happened, in the recap's order, coloured as its line is. */
  shares: readonly { label: string; weight: number }[]
}

const TILE: Record<WelcomeInput['tiles'][number]['kind'], { word: string; fill: string; glyph: string }> = {
  goals: { word: 'goals', fill: 'var(--ok)', glyph: '<path d="M-4 0l3 3 5-6" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>' },
  commits: { word: 'commits', fill: 'var(--claude)', glyph: '<circle r="2.6" fill="none" stroke="#fff" stroke-width="2"/><path d="M-7 0h4.4M2.6 0H7" stroke="#fff" stroke-width="2" stroke-linecap="round"/>' },
  done: { word: 'done', fill: 'var(--ok)', glyph: '<path d="M-4.5 0.5l2.6 2.6 6.4-6.4" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>' },
  helpers: { word: 'helpers', fill: 'var(--blue)', glyph: '<circle cx="-2.3" cy="-0.6" r="1.4" fill="#fff"/><circle cx="2.3" cy="-0.6" r="1.4" fill="#fff"/><path d="M-2.4 2.8q2.4 1.8 4.8 0" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>' },
  files: { word: 'files', fill: 'var(--plan)', glyph: '<path d="M-4 4l1-3.6 5.6-5.6 2.6 2.6L-0.4 3z" fill="#fff"/>' },
  updates: { word: 'updates', fill: 'var(--mute)', glyph: '<path d="M-4 1.5a4.5 4.5 0 0 0 8.4-1M4 -1.5a4.5 4.5 0 0 0-8.4 1" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>' },
  stuck: { word: 'stuck', fill: 'var(--warn)', glyph: '<rect x="-1.1" y="-5" width="2.2" height="6" rx="1.1" fill="#fff"/><circle cy="3.6" r="1.3" fill="#fff"/>' },
}

/**
 * « What did you miss »: Claude waving the person back in, the totals as tiles, and a strip
 * where each project that moved takes its share, in the colour its line carries.
 */
export const drawWelcome = (input: WelcomeInput) => remember(`welcome:${JSON.stringify(input)}`, () => welcomeOf(input))

const welcomeOf = ({ width, caption, tiles, shares }: WelcomeInput) => {
  const height = 92
  const shown = tiles.slice(0, Math.max(1, Math.min(4, Math.floor((width - 250) / 78))))
  const tileWidth = 72
  const tilesLeft = width - shown.length * (tileWidth + 6)
  const tileMarks = shown
    .map((tile, index) => {
      const look = TILE[tile.kind]
      const x = tilesLeft + index * (tileWidth + 6)

      return `<g class="pop" style="animation-delay:${0.08 * index}s"><rect x="${x}" y="10" width="${tileWidth}" height="50" rx="12" fill="var(--chip)"/>
<g transform="translate(${x + 17} 25)"><circle r="9.5" fill="${look.fill}"/>${look.glyph}</g>
<text x="${x + 31}" y="31" font-size="18" font-weight="800" fill="var(--ink)" ${FONT}>${tile.count > 999 ? '999+' : tile.count}</text>
<text x="${x + 10}" y="51" font-size="10.5" font-weight="700" fill="var(--mute)" ${FONT}>${look.word}</text></g>`
    })
    .join('')
  const total = shares.reduce((sum, one) => sum + Math.max(1, one.weight), 0)
  const stripLeft = 8
  const stripWidth = width - 16
  let at = stripLeft
  const strip = shares
    .map((share, index) => {
      const span = (Math.max(1, share.weight) / total) * stripWidth
      const piece = `<rect class="grow" style="animation-delay:${0.1 * index}s" x="${at.toFixed(1)}" y="74" width="${Math.max(2, span - 3).toFixed(1)}" height="9" rx="4.5" fill="${coatOf(share.label)}"/>`
      at += span

      return piece
    })
    .join('')
  const words = wrapWords(caption, Math.max(14, Math.floor((tilesLeft - 96) / 6.6)), 2)

  return svg(
    width,
    height,
    `<style>.pop{animation:pop .5s ease-out both}.grow{transform-box:fill-box;transform-origin:left;animation:grow .7s ease-out both}.wave{transform-box:fill-box;transform-origin:20% 90%;animation:wave 1.2s ease-in-out 3}
@keyframes pop{from{opacity:0;transform:translateY(6px)}}@keyframes grow{from{transform:scaleX(0)}}@keyframes wave{50%{transform:rotate(-24deg)}}
@media (prefers-reduced-motion: reduce){*{animation:none!important}}</style>
<g transform="translate(-2 -6) scale(.92)">${claudeAvatar('done')}<g class="wave"><ellipse cx="68" cy="40" rx="5" ry="6.5" fill="var(--claude)"/><path d="M63 46l-4 6" stroke="var(--claude)" stroke-width="4" stroke-linecap="round"/></g></g>
<text x="84" y="30" font-size="17" font-weight="800" fill="var(--ink)" ${FONT}>Welcome back</text>
${words.map((line, index) => `<text x="84" y="${49 + index * 15}" font-size="12" font-weight="600" fill="var(--mute)" ${FONT}>${escape(line)}</text>`).join('')}
${tileMarks}
<rect x="${stripLeft}" y="74" width="${stripWidth}" height="9" rx="4.5" fill="var(--track)"/>${strip}`,
    `${caption}`,
  )
}
