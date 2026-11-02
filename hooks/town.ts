import type { EngineInterface } from 'claude-code'

import type { TownDiscovery, TownDraft, TownGate, TownOverview, TownStep, TownView } from '../types'

/**
 * A local Clauverwatch town, seen through its visitor door: its open steps and waiting gates, and
 * answers to its steps. The door takes no key; the town finds no secret here. Everything stays in
 * memory: this file never touches the store, because the town reads the store's steps back.
 */

export const TOWN_NAME = 'Clauverwatch'
/** The quiet after a failure, and how often a missing town is looked for again. */
export const QUIET_MS = 60_000
export const CURL = '/usr/bin/curl'
export const OPEN = '/usr/bin/open'
export const VISITOR = 'X-Clauverwatch-Visitor: 1'
/** The longest answer the door takes. */
export const ANSWER_CHARS = 2000

export const NO_TOWN: TownView = { phase: 'absent', discovery: null, overview: null, readAt: null, retryAt: 0, logged: [], drafts: {} }

/** The person's home folder, from the environment; none when it is not an absolute path. */
export const homeFolder = (): string | null => {
  const home = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env?.HOME

  return typeof home === 'string' && home.startsWith('/') ? home.replace(/\/+$/, '') : null
}

export const discoveryPath = (home: string) => `${home}/.clauverwatch/daemon.json`

const isRecord = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value)
const isText = (value: unknown, max: number) => typeof value === 'string' && value.length <= max
const isTextOrNull = (value: unknown, max: number) => value === null || isText(value, max)
const isCount = (value: unknown) => typeof value === 'number' && Number.isInteger(value) && value >= 0
const isTime = (value: unknown) => typeof value === 'string' && value.length <= 40 && !Number.isNaN(Date.parse(value))
const isTimeOrNull = (value: unknown) => value === null || isTime(value)
const STEP_ID = /^S-\d{4,}$/
const GATE_ID = /^G-\d{4,}$/
const ERRAND_ID = /^E-\d{4,}$/

/** The discovery file, checked: a running town of ours, with a door, on a port it may use. */
export const parseDiscovery = (text: string): TownDiscovery | null => {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    return null
  }
  if (!isRecord(raw) || raw.name !== TOWN_NAME || raw.stoppedAt !== null || !isTime(raw.startedAt)) return null
  const port = raw.port
  if (typeof port !== 'number' || !Number.isInteger(port) || port < 1024 || port > 65535) return null
  if (typeof raw.outside !== 'number' || raw.outside < 1) return null

  return { port, startedAt: raw.startedAt as string }
}

const isErrand = (value: unknown) => value === null || (isRecord(value) && typeof value.id === 'string' && ERRAND_ID.test(value.id) && isText(value.title, 200))
const isHood = (value: unknown) => value === null || (isRecord(value) && typeof value.slug === 'string' && /^[a-z0-9-]{1,40}$/.test(value.slug) && isText(value.name, 80))

const isStep = (one: unknown): one is TownStep =>
  isRecord(one) &&
  typeof one.id === 'string' &&
  STEP_ID.test(one.id) &&
  (one.kind === 'tick' || one.kind === 'pick' || one.kind === 'type') &&
  isText(one.title, 200) &&
  isText(one.more, 2000) &&
  typeof one.moreCut === 'boolean' &&
  Array.isArray(one.choices) &&
  one.choices.length <= 4 &&
  one.choices.every(choice => isText(choice, 200)) &&
  isTextOrNull(one.defaultChoice, 200) &&
  isTextOrNull(one.asks, 200) &&
  isTimeOrNull(one.decideBy) &&
  isTimeOrNull(one.due) &&
  isText(one.askedBy, 60) &&
  isErrand(one.errand) &&
  isHood(one.neighborhood) &&
  (one.status === 'open' || one.status === 'reopened') &&
  isTextOrNull(one.reopenNote, 1000) &&
  typeof one.council === 'boolean' &&
  isTime(one.createdAt)

const isGate = (one: unknown): one is TownGate =>
  isRecord(one) &&
  typeof one.id === 'string' &&
  GATE_ID.test(one.id) &&
  isText(one.class, 40) &&
  isText(one.classLabel, 40) &&
  typeof one.macOnly === 'boolean' &&
  isErrand(one.errand) &&
  isHood(one.neighborhood) &&
  isText(one.why, 300) &&
  isTime(one.createdAt)

/** The door's answer, field by field as the town's `OutsideOverview` lays it; anything else is no answer. */
export const parseOverview = (text: string): TownOverview | null => {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    return null
  }
  if (!isRecord(raw) || raw.api !== 1 || !isRecord(raw.town)) return null
  const town = raw.town
  if (!isText(town.name, 60) || typeof town.url !== 'string' || !/^http:\/\/127\.0\.0\.1:\d{4,5}\/$/.test(town.url) || !isTime(town.startedAt)) return null
  if (!Array.isArray(raw.steps) || raw.steps.length > 50 || !raw.steps.every(isStep)) return null
  if (!Array.isArray(raw.gates) || raw.gates.length > 50 || !raw.gates.every(isGate)) return null
  if (!isCount(raw.moreSteps) || !isCount(raw.moreGates)) return null

  return raw as unknown as TownOverview
}

const doorUrl = (port: number, path: string) => `http://127.0.0.1:${port}${path}`

/** Curl, with no config file, no proxy, no cookie, no Origin: the visitor header and nothing else of ours. */
const curlBase = (connect: string, total: string) => [
  CURL,
  '-q',
  '--silent',
  '--show-error',
  '--noproxy',
  '*',
  '--connect-timeout',
  connect,
  '--max-time',
  total,
  '-H',
  VISITOR,
  '-H',
  'Accept: application/json',
  '--write-out',
  '\n%{http_code}',
]

export const overviewArgv = (port: number) => [...curlBase('0.5', '1.5'), doorUrl(port, '/outside/overview')]

export const answerArgv = (port: number, id: string, answer: string | null) => [
  ...curlBase('0.5', '3'),
  '-X',
  'POST',
  '-H',
  'Content-Type: application/json',
  // The body always starts with `{`, so curl never takes it for a file name.
  '--data-binary',
  JSON.stringify({ answer }),
  doorUrl(port, `/outside/steps/${encodeURIComponent(id)}/answer`),
]

/** Curl's output: the body, then the status on the last line. */
export const splitReply = (stdout: string): { status: number; body: string } => {
  const at = stdout.lastIndexOf('\n')
  const status = Number(stdout.slice(at + 1).trim())

  return { status: Number.isInteger(status) ? status : 0, body: at < 0 ? '' : stdout.slice(0, at) }
}

type Ran = { exitCode: number; stdout: string; isStdoutTruncated?: boolean }

async function run($: EngineInterface, argv: string[], timeoutMs: number): Promise<Ran | null> {
  try {
    return (await $.process.run(argv, { timeoutMs })) as Ran
  } catch {
    return null
  }
}

/** A pick's answer, as the town's own page writes it: the choice, the choice and own words, or own words alone. */
export const pickAnswer = (choice: string | null, words: string) => {
  const own = words.trim()
  if (choice === null) return own

  return own === '' ? choice : `${choice} — ${own}`
}

/** "4 Nov": a town date in plain words. */
export const plainDate = (iso: string) => {
  const date = new Date(iso)

  return `${date.getDate()} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][date.getMonth()]}`
}

/** "Asked by The Mayor · E-0046 Build the pane · Claude mods". */
export const askedLine = (step: TownStep) =>
  [`Asked by ${step.askedBy}`, step.errand !== null ? `${step.errand.id} ${step.errand.title}` : '', step.neighborhood?.name ?? ''].filter(Boolean).join(' · ')

/** "From your town · 2 steps · 1 gate". */
export const headLine = (overview: TownOverview) => {
  const steps = overview.steps.length
  const gates = overview.gates.length
  const parts = [steps > 0 ? `${steps} step${steps === 1 ? '' : 's'}` : '', gates > 0 ? `${gates} gate${gates === 1 ? '' : 's'}` : ''].filter(Boolean)

  return ['From your town', ...parts].join(' · ')
}

/** Drafts the person still holds: words kept for a pick, or an answer the town did not take. */
export const heldDrafts = (view: TownView) => Object.entries(view.drafts).filter(([, draft]) => draft.state === 'not_sent' || draft.words.trim() !== '')

/** Whether the pane shows the town's section: a town with something waiting, or an answer still held. */
export const isShown = (view: TownView) =>
  view.phase === 'present' && view.overview !== null
    ? view.overview.steps.length + view.overview.gates.length + view.overview.moreSteps + view.overview.moreGates > 0 || heldDrafts(view).length > 0
    : heldDrafts(view).length > 0

function logOnce($: EngineInterface, view: TownView, startedAt: string, reason: string): TownView {
  const mark = `${startedAt}|${reason}`
  if (view.logged.includes(mark)) return view
  $.ui.log(`overview: the local town did not answer (${reason})`, { to: 'debug' })

  return { ...view, logged: [...view.logged, mark] }
}

/** The town's newest list: steps answered elsewhere leave, and so do the person's drafts for them, each with one toast. */
const takeOverview = (view: TownView, overview: TownOverview): { view: TownView; toasts: string[] } => {
  const open = new Set(overview.steps.map(step => step.id))
  const toasts: string[] = []
  const drafts: Record<string, TownDraft> = {}
  for (const [id, draft] of Object.entries(view.drafts)) {
    if (open.has(id) || draft.state === 'sending') drafts[id] = draft
    else if (draft.state === 'not_sent' || draft.words.trim() !== '') toasts.push(`Answered in the town: ${draft.title}.`)
  }

  return { view: { ...view, phase: 'present', overview, retryAt: 0, drafts }, toasts }
}

/**
 * One sweep's look at the town: read the discovery file (at most once a minute while there is no town),
 * then at most one request. Quiet when there is no town: no request, no log, no toast.
 */
export async function lookAtTown($: EngineInterface, view: TownView, now: number): Promise<{ view: TownView; toasts: string[] }> {
  if (view.phase === 'off') return { view, toasts: [] }
  const home = homeFolder()
  if (home === null) return { view: { ...view, phase: 'off', overview: null }, toasts: [] }
  if (view.phase === 'absent' && view.readAt !== null && now - view.readAt < QUIET_MS) return { view, toasts: [] }

  let text = ''
  try {
    text = await $.fs.read(discoveryPath(home))
  } catch {
    text = ''
  }
  const discovery = typeof text === 'string' && text.trim() !== '' ? parseDiscovery(text) : null
  if (discovery === null) return { view: { ...view, phase: 'absent', discovery: null, overview: null, readAt: now }, toasts: [] }

  const isRestarted = view.discovery?.startedAt !== discovery.startedAt
  const seen: TownView = { ...view, discovery, readAt: now }
  if (view.phase === 'failing' && !isRestarted && now < view.retryAt) return { view: seen, toasts: [] }

  const looked = readProbe(await run($, overviewArgv(discovery.port), 2500), discovery.startedAt)
  if (typeof looked === 'string') {
    const failing: TownView = { ...seen, phase: 'failing', overview: null, retryAt: now + QUIET_MS }

    return { view: logOnce($, failing, discovery.startedAt, looked), toasts: [] }
  }

  return takeOverview(seen, looked)
}

/** The probe's overview, or the reason it failed. */
const readProbe = (ran: Ran | null, startedAt: string): TownOverview | string => {
  if (ran === null) return 'curl did not run'
  if (ran.exitCode !== 0) return `curl exit ${ran.exitCode}`
  if (ran.isStdoutTruncated === true) return 'answer too long'
  const reply = splitReply(ran.stdout)
  if (reply.status !== 200) return `HTTP ${reply.status}`
  const overview = parseOverview(reply.body)
  if (overview === null) return 'unreadable answer'
  if (overview.town.startedAt !== startedAt) return 'another program on its port'

  return overview
}

/** How a send ended. */
export type Sent =
  | { kind: 'sent' }
  | { kind: 'down' }
  | { kind: 'conflict'; status: string; answer: string | null; via: string | null }
  | { kind: 'gone' }
  | { kind: 'refused'; message: string }

/** Sends one answer through the door; never resent by itself. */
export async function sendAnswer($: EngineInterface, port: number, id: string, answer: string | null): Promise<Sent> {
  const ran = await run($, answerArgv(port, id, answer), 4000)
  if (ran === null || ran.exitCode !== 0) return { kind: 'down' }
  const reply = splitReply(ran.stdout)
  if (reply.status === 200) return { kind: 'sent' }
  if (reply.status === 404) return { kind: 'gone' }
  let body: Record<string, unknown> = {}
  try {
    const parsed: unknown = JSON.parse(reply.body)
    if (isRecord(parsed)) body = parsed
  } catch {
    // no body to read
  }
  if (reply.status === 409) {
    return {
      kind: 'conflict',
      status: typeof body.status === 'string' ? body.status : 'answered',
      answer: typeof body.answer === 'string' ? body.answer : null,
      via: typeof body.answeredVia === 'string' ? body.answeredVia : null,
    }
  }
  if (reply.status === 0) return { kind: 'down' }
  const message = typeof body.error === 'string' && body.error.trim() !== '' ? body.error.slice(0, 300) : `The town refused it (HTTP ${reply.status}).`

  return { kind: 'refused', message }
}

const withoutStep = (view: TownView, id: string): TownView => {
  const drafts = { ...view.drafts }
  delete drafts[id]

  return { ...view, drafts, overview: view.overview === null ? null : { ...view.overview, steps: view.overview.steps.filter(step => step.id !== id) } }
}

/** What the conflict toast says, from where the step was answered. */
export const conflictText = (status: string, via: string | null) =>
  status === 'confirmed' || status === 'archived'
    ? 'No longer open in the town.'
    : via === 'discord'
      ? 'Already answered from Discord.'
      : via === 'overview'
        ? 'Already answered from an Overview pane.'
        : 'Already answered in the town.'

/** The pane after a send: the step leaves, or stays with what went wrong. */
export const settleAnswer = (view: TownView, id: string, answer: string | null, sent: Sent, now: number): { view: TownView; toasts: string[] } => {
  const draft = view.drafts[id]
  if (sent.kind === 'sent') return { view: withoutStep(view, id), toasts: ['Sent to the town.'] }
  if (sent.kind === 'gone') return { view: withoutStep(view, id), toasts: ['This step is no longer in the town.'] }
  if (sent.kind === 'conflict') {
    // An earlier send of this very answer landed: it is sent.
    const ours = answer ?? 'done'
    if (sent.via === 'overview' && sent.answer === ours) return { view: withoutStep(view, id), toasts: [] }

    return { view: withoutStep(view, id), toasts: [conflictText(sent.status, sent.via)] }
  }
  const title = draft?.title ?? view.overview?.steps.find(step => step.id === id)?.title ?? id
  const words = draft?.words ?? ''
  if (sent.kind === 'refused') return { view: { ...view, drafts: { ...view.drafts, [id]: { title, words, answer, state: 'editing', problem: sent.message } } }, toasts: [] }

  // The town went down: the answer stays, marked, and nothing is asked of the town for a minute.
  return {
    view: { ...view, phase: 'failing', overview: null, retryAt: now + QUIET_MS, drafts: { ...view.drafts, [id]: { title, words, answer, state: 'not_sent' } } },
    toasts: [],
  }
}

/** Opens the town's own page in the browser, where gates are decided. */
export async function openTown($: EngineInterface, url: string) {
  if (!/^http:\/\/127\.0\.0\.1:\d{4,5}\/$/.test(url)) return
  await run($, [OPEN, url], 5000)
}
