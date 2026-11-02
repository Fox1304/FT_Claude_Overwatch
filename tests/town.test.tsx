import { expect, mock, test } from 'claude-code/testing'

import { answerArgv, overviewArgv, parseDiscovery, parseOverview, pickAnswer, splitReply } from '../hooks/town'
import { overviewV1 as fixture } from './fixtures/town-overview-v1'
import { PANE, allText, world } from './world'

const MORNING = new Date(2026, 10, 2, 9, 0).getTime()
const SWEEP = 10_000
const STEPS = 'mcp__overview__your_steps'

// The town is found from the home folder; give the test engine one when it has none.
const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env
if (env !== undefined && !(env.HOME ?? '').startsWith('/')) env.HOME = '/Users/tester'
const HOME = (env?.HOME ?? '/Users/tester').replace(/\/+$/, '')
const DISCOVERY = `${HOME}/.clauverwatch/daemon.json`
const STARTED = fixture.town.startedAt
const TITLES = fixture.steps.map(step => step.title)

const discovery = (change: Record<string, unknown> = {}) =>
  JSON.stringify({ schemaVersion: 1, name: 'Clauverwatch', port: 52100, pid: 4242, startedAt: STARTED, stoppedAt: null, outside: 1, ...change })

type World = ReturnType<typeof world>
type Overview = typeof fixture

/** A town behind the stand-in door: it lists its open steps, takes answers once, and can go down or answer with a conflict. */
const withTown = (w: World) => {
  w.files[DISCOVERY] = discovery()
  const town = {
    overview: JSON.parse(JSON.stringify(fixture)) as Overview,
    answers: [] as { id: string; answer: string | null }[],
    isDown: false,
    conflicts: {} as Record<string, Record<string, unknown>>,
    refusals: {} as Record<string, string>,
  }
  w.town.reply = argv => {
    if (town.isDown) return { exitCode: 7 }
    const url = argv[argv.length - 1] ?? ''
    if (url === 'http://127.0.0.1:52100/outside/overview') return { status: 200, body: JSON.stringify(town.overview) }
    const id = /^http:\/\/127\.0\.0\.1:52100\/outside\/steps\/(S-\d{4,})\/answer$/.exec(url)?.[1]
    if (id === undefined) return { status: 404, body: '{"ok":false,"code":"not_found","error":"Not found."}' }
    const conflict = town.conflicts[id]
    if (conflict !== undefined) return { status: 409, body: JSON.stringify({ ok: false, code: 'step_not_open', error: `${id} was already answered.`, id, ...conflict }) }
    const refusal = town.refusals[id]
    if (refusal !== undefined) return { status: 400, body: JSON.stringify({ ok: false, code: 'bad_request', error: refusal }) }
    const step = town.overview.steps.find(one => one.id === id)
    if (step === undefined) return { status: 404, body: '{"ok":false,"code":"not_found","error":"No such step."}' }
    const sent = JSON.parse(argv[argv.indexOf('--data-binary') + 1] ?? '{}') as { answer: string | null }
    town.overview.steps = town.overview.steps.filter(one => one.id !== id)
    town.answers.push({ id, answer: step.kind === 'tick' ? 'done' : sent.answer })

    return { status: 200, body: JSON.stringify({ ok: true, id, status: 'answered', answeredAt: '2026-11-02T09:00:30.000Z' }) }
  }

  return town
}

/** The test's world and clock; the session's first tool call then starts the pane's sweep. */
const begin = (on: Parameters<typeof world>[0]) => ({ w: world(on), clock: mock.clock(on, { now: MORNING }) })

const posts = (w: World) => w.curls.filter(argv => argv.includes('POST'))
const gets = (w: World) => w.curls.filter(argv => !argv.includes('POST'))
const townLogs = (w: World) => w.logs.filter(line => /town|clauverwatch/i.test(line))

test('town: no discovery file leaves the pane as in 2.2.0', { timeoutMs: 30_000 }, async ($, on) => {
  const { w, clock } = begin(on)
  await $.tool.call({ tool: 'mcp__fake__build' })
  await $.tool.call({ tool: STEPS, add: [{ title: 'Pay the store fee' }] })
  for (let sweep = 0; sweep < 8; sweep += 1) await clock.advance(SWEEP)
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  expect(await ui.find({ key: 'section:move' })).toBeDefined()
  expect(await ui.find({ key: 'section:town' })).toBeUndefined()
  expect(await allText(ui)).not.toContain('From your town')
  await ui.unmount()
  expect(w.curls).toEqual([])
  expect(townLogs(w)).toEqual([])
  expect(w.toasts.filter(text => /town/i.test(text))).toEqual([])
  expect(Object.keys(w.stored).some(key => /town|clauverwatch/i.test(key))).toBe(false)
})

test('town: a stopped, foreign or out-of-range discovery file sends no request', { timeoutMs: 30_000 }, async ($, on) => {
  const { w, clock } = begin(on)
  await $.tool.call({ tool: 'mcp__fake__build' })
  const files = [
    discovery({ stoppedAt: '2026-11-02T08:30:00.000Z' }),
    discovery({ name: 'Somebody else' }),
    discovery({ port: 80 }),
    discovery({ port: 70_000 }),
    discovery({ outside: 0 }),
    '{ not json',
  ]
  for (const file of files) {
    w.files[DISCOVERY] = file
    await clock.advance(7 * SWEEP)
  }
  expect(w.curls).toEqual([])
  expect(townLogs(w)).toEqual([])
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  expect(await ui.find({ key: 'section:town' })).toBeUndefined()
  await ui.unmount()
})

test('town: at most one request per sweep, then a 60 s quiet after a failure', { timeoutMs: 30_000 }, async ($, on) => {
  const { w, clock } = begin(on)
  await $.tool.call({ tool: 'mcp__fake__build' })
  const town = withTown(w)
  town.isDown = true
  await clock.advance(SWEEP)
  expect(w.curls.length).toBe(1)
  // Quiet for a minute after the failure, and one debug line only.
  for (let sweep = 0; sweep < 5; sweep += 1) await clock.advance(SWEEP)
  expect(w.curls.length).toBe(1)
  await clock.advance(SWEEP)
  expect(w.curls.length).toBe(2)
  expect(townLogs(w).length).toBe(1)
  expect(w.toasts).toEqual([])

  // Back up: one GET per sweep, never more.
  town.isDown = false
  for (let sweep = 0; sweep < 6; sweep += 1) await clock.advance(SWEEP)
  const before = w.curls.length
  await clock.advance(SWEEP)
  expect(w.curls.length).toBe(before + 1)
  await clock.advance(SWEEP)
  expect(w.curls.length).toBe(before + 2)
  expect(gets(w)[0]).toEqual(overviewArgv(52100))
})

test('town: a new startedAt probes at the next sweep', { timeoutMs: 30_000 }, async ($, on) => {
  const { w, clock } = begin(on)
  await $.tool.call({ tool: 'mcp__fake__build' })
  const town = withTown(w)
  town.isDown = true
  await clock.advance(SWEEP)
  expect(w.curls.length).toBe(1)
  // The town restarted: a new discovery, and the door answers again.
  const restarted = '2026-11-02T09:00:05.000Z'
  w.files[DISCOVERY] = discovery({ startedAt: restarted })
  town.overview.town.startedAt = restarted
  town.isDown = false
  await clock.advance(SWEEP)
  expect(w.curls.length).toBe(2)
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  expect(await ui.find({ key: 'section:town' })).toBeDefined()
  await ui.unmount()
})

test('town: a startedAt mismatch counts as no town', { timeoutMs: 30_000 }, async ($, on) => {
  const { w, clock } = begin(on)
  await $.tool.call({ tool: 'mcp__fake__build' })
  withTown(w)
  w.files[DISCOVERY] = discovery({ startedAt: '2026-11-01T08:00:00.000Z' })
  await clock.advance(SWEEP)
  expect(w.curls.length).toBe(1)
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  expect(await ui.find({ key: 'section:town' })).toBeUndefined()
  expect(await allText(ui)).not.toContain(TITLES[0])
  await ui.unmount()
  expect(townLogs(w).length).toBe(1)
  expect(w.toasts).toEqual([])
})

test('town: shows open steps and waiting gates after Your move', { timeoutMs: 30_000 }, async ($, on) => {
  const { w, clock } = begin(on)
  await $.tool.call({ tool: 'mcp__fake__build' })
  withTown(w)
  await $.tool.call({ tool: STEPS, add: [{ title: 'Pay the store fee' }] })
  await clock.advance(SWEEP)
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  expect(await ui.find({ key: 'fold:town' })).toMatchObject({ text: '▾ From your town · 4 steps · 2 gates' })
  const text = await allText(ui)
  for (const title of TITLES) expect(text).toContain(title)
  // Right after Your move, before Up next.
  expect(text.indexOf('Pay the store fee') < text.indexOf(TITLES[0] ?? '')).toBe(true)
  expect(await ui.find({ type: 'Text', text: 'Asked by The Mayor · E-0201 Prepare the store release · Sample app' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: 'For the town council' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /↺ Reopened: That address bounced; give another one\./ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /due 4 Nov/ })).toBeDefined()
  expect(String((await ui.find({ key: 'town-pick:S-0102:1' }))?.text)).toContain('Thursday (default; never applied by itself)')
  expect(String((await ui.find({ key: 'town-pick:S-0102:0' }))?.text)).not.toContain('default')
  expect((await ui.find({ key: 'town-answer:S-0103' }))?.props.placeholder).toBe('An email address…')
  expect(await ui.find({ type: 'Text', text: /Waiting at the City Gate: Publish · E-0201 Prepare the store release \(G-0101\)/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: 'The release notes are ready to go out.' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: 'Only on the Mac' })).toBeDefined()
  await ui.unmount()

  // More than the door lists: one line says so.
  const crowded = { ...fixture, moreSteps: 2, moreGates: 1 }
  w.town.reply = () => ({ status: 200, body: JSON.stringify(crowded) })
  await clock.advance(SWEEP)
  const again = await $.ui.mount({ ...PANE, surface: 'terminal' })
  expect(await again.find({ type: 'Text', text: 'and 3 more in the town' })).toBeDefined()
  await again.unmount()
})

test('town: gates show no decide control and only Open the town', { timeoutMs: 30_000 }, async ($, on) => {
  const { w, clock } = begin(on)
  await $.tool.call({ tool: 'mcp__fake__build' })
  withTown(w)
  await clock.advance(SWEEP)
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  const labels = (await ui.findAll({ type: 'Button' })).map(one => String(one.props.label ?? ''))
  for (const gate of ['G-0101', 'G-0102']) {
    expect(labels.filter(label => label.includes(gate))).toEqual([`Open the town to decide gate ${gate}`])
  }
  expect(labels.filter(label => /approve|deny|reject|allow/i.test(label))).toEqual([])
  expect(await ui.find({ type: 'Text', text: /Read-only gate · Decide it in the town\./ })).toBeDefined()
  await ui.press({ key: 'town-open:G-0101' })
  await ui.unmount()
  expect(w.opened).toEqual([['/usr/bin/open', 'http://127.0.0.1:52100/']])
  // Nothing about a gate is ever sent.
  expect(posts(w)).toEqual([])
})

test('town: answering a tick, a pick and a type sends it and removes it', { timeoutMs: 30_000 }, async ($, on) => {
  const { w, clock } = begin(on)
  await $.tool.call({ tool: 'mcp__fake__build' })
  const town = withTown(w)
  await clock.advance(SWEEP)
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })

  await ui.press({ key: 'town-tick:S-0101' })
  expect(await ui.find({ key: 'town-step:S-0101' })).toBeUndefined()
  await ui.input({ key: 'town-words:S-0102', text: 'from the second week' })
  expect(await ui.find({ type: 'Text', text: /Own words: « from the second week »/ })).toBeDefined()
  await ui.press({ key: 'town-pick:S-0102:0' })
  expect(await ui.find({ key: 'town-step:S-0102' })).toBeUndefined()
  await ui.input({ key: 'town-answer:S-0103', text: 'help@example.com' })
  expect(await ui.find({ key: 'town-step:S-0103' })).toBeUndefined()
  await ui.unmount()

  expect(town.answers).toEqual([
    { id: 'S-0101', answer: 'done' },
    { id: 'S-0102', answer: 'Tuesday — from the second week' },
    { id: 'S-0103', answer: 'help@example.com' },
  ])
  expect(w.toasts).toEqual(['Sent to the town.', 'Sent to the town.', 'Sent to the town.'])
  const sent = posts(w)
  expect(sent[0]).toEqual(answerArgv(52100, 'S-0101', null))
  expect(sent[1]).toEqual(answerArgv(52100, 'S-0102', 'Tuesday — from the second week'))
  for (const argv of w.curls) {
    expect(argv[0]).toBe('/usr/bin/curl')
    expect(argv).toContain('X-Clauverwatch-Visitor: 1')
    expect(argv.filter(arg => /^(origin|cookie|authorization)\s*:/i.test(arg))).toEqual([])
    expect(argv.filter(arg => /^(-b|--cookie|-u|--user|-e|--referer)$/.test(arg))).toEqual([])
  }
  for (const argv of sent) expect(argv).toContain('Content-Type: application/json')

  // Own words alone, and the pick format, as the town page writes them.
  expect(pickAnswer('Tuesday', '')).toBe('Tuesday')
  expect(pickAnswer('Tuesday', '  later  ')).toBe('Tuesday — later')
  expect(pickAnswer(null, 'Neither, next month')).toBe('Neither, next month')
})

test('town: a step answered in the town is gone after the next fetch', { timeoutMs: 30_000 }, async ($, on) => {
  const { w, clock } = begin(on)
  await $.tool.call({ tool: 'mcp__fake__build' })
  const town = withTown(w)
  await clock.advance(SWEEP)
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  await ui.input({ key: 'town-words:S-0102', text: 'mornings only' })
  // Thomas answers both in the town itself.
  town.overview.steps = town.overview.steps.filter(step => step.id !== 'S-0101' && step.id !== 'S-0102')
  await clock.advance(SWEEP)
  expect(await ui.find({ key: 'town-step:S-0101' })).toBeUndefined()
  expect(await ui.find({ key: 'town-step:S-0102' })).toBeUndefined()
  expect(await ui.find({ key: 'town-step:S-0103' })).toBeDefined()
  await ui.unmount()
  // The draft left with its step, with one toast; the tick had none to drop.
  expect(w.toasts).toEqual(['Answered in the town: Which launch day do you want?.'])
  expect(posts(w)).toEqual([])
})

test('town: a 409 removes the step with a toast; a 409 naming our own answer counts as sent', { timeoutMs: 30_000 }, async ($, on) => {
  const { w, clock } = begin(on)
  await $.tool.call({ tool: 'mcp__fake__build' })
  const town = withTown(w)
  town.conflicts['S-0101'] = { status: 'answered', answer: 'done', answeredAt: '2026-11-02T08:59:00.000Z', answeredVia: 'discord' }
  town.conflicts['S-0103'] = { status: 'answered', answer: 'help@example.com', answeredAt: '2026-11-02T08:59:00.000Z', answeredVia: 'overview' }
  town.conflicts['S-0104'] = { status: 'confirmed', answer: 'Keep it', answeredAt: '2026-11-02T08:59:00.000Z', answeredVia: 'town' }
  town.refusals['S-0102'] = 'Pick one of the choices or write an answer.'
  await clock.advance(SWEEP)
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })

  await ui.press({ key: 'town-tick:S-0101' })
  expect(await ui.find({ key: 'town-step:S-0101' })).toBeUndefined()
  await ui.input({ key: 'town-answer:S-0103', text: 'help@example.com' })
  expect(await ui.find({ key: 'town-step:S-0103' })).toBeUndefined()
  await ui.press({ key: 'town-pick:S-0104:0' })
  expect(await ui.find({ key: 'town-step:S-0104' })).toBeUndefined()
  // A 400 keeps the step, with the town's own words under it.
  await ui.press({ key: 'town-pick:S-0102:0' })
  expect(await ui.find({ key: 'town-step:S-0102' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: '⚠ Pick one of the choices or write an answer.' })).toBeDefined()
  await ui.unmount()

  expect(w.toasts).toEqual(['Already answered from Discord.', 'No longer open in the town.'])
})

test('town: the town going down mid-answer keeps the draft, marks it not sent and never resends', { timeoutMs: 30_000 }, async ($, on) => {
  const { w, clock } = begin(on)
  await $.tool.call({ tool: 'mcp__fake__build' })
  const town = withTown(w)
  await clock.advance(SWEEP)
  town.isDown = true
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  await ui.press({ key: 'town-tick:S-0101' })
  expect(posts(w).length).toBe(1)
  expect(await ui.find({ type: 'Text', text: 'Not sent: the town did not answer.' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: `Your town stopped answering. Your unsent answer for ${TITLES[0]} is kept until this session ends.` })).toBeDefined()
  expect(w.toasts).toEqual([])

  // Minutes pass, the town comes back: the list returns, and the answer is still not sent by itself.
  for (let sweep = 0; sweep < 12; sweep += 1) await clock.advance(SWEEP)
  town.isDown = false
  for (let sweep = 0; sweep < 7; sweep += 1) await clock.advance(SWEEP)
  expect(posts(w).length).toBe(1)
  expect(town.answers).toEqual([])

  // Back in the list, still marked; sent again by hand, once.
  expect(await ui.find({ type: 'Text', text: 'Not sent: the town did not answer. Send it again when you are ready.' })).toBeDefined()
  await ui.press({ key: 'town-tick:S-0101' })
  expect(posts(w).length).toBe(2)
  expect(town.answers).toEqual([{ id: 'S-0101', answer: 'done' }])
  expect(await ui.find({ key: 'town-step:S-0101' })).toBeUndefined()
  await ui.unmount()
})

test('town: nothing about town items reaches the store', { timeoutMs: 30_000 }, async ($, on) => {
  const { w, clock } = begin(on)
  await $.tool.call({ tool: 'mcp__fake__build' })
  const town = withTown(w)
  town.conflicts['S-0104'] = { status: 'answered', answer: 'Keep it', answeredAt: '2026-11-02T08:59:00.000Z', answeredVia: 'discord' }
  await clock.advance(SWEEP)
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  // Show, answer, conflict, outage.
  await ui.press({ key: 'fold:town' })
  await ui.press({ key: 'fold:town' })
  await ui.press({ key: 'town-tick:S-0101' })
  await ui.press({ key: 'town-pick:S-0104:0' })
  await ui.input({ key: 'town-words:S-0102', text: 'only in the morning' })
  town.isDown = true
  await ui.input({ key: 'town-answer:S-0103', text: 'help@example.com' })
  await clock.advance(SWEEP)
  await ui.unmount()

  const dump = JSON.stringify(w.stored)
  for (const id of ['S-0101', 'S-0102', 'S-0103', 'S-0104', 'G-0101', 'G-0102']) expect(dump).not.toContain(id)
  for (const words of [...TITLES, 'only in the morning', 'help@example.com', 'The release notes are ready to go out.']) expect(dump).not.toContain(words)
  expect(Object.keys(w.stored).filter(key => key.startsWith('yourSteps:'))).toEqual([])
  // The fold of the section is the one thing kept, in the pane's own sections key.
  expect(w.stored.sections).toMatchObject({ town: true })
})

test('town: every town control has a screen-reader description and states are written in words', { timeoutMs: 30_000 }, async ($, on) => {
  const { w, clock } = begin(on)
  await $.tool.call({ tool: 'mcp__fake__build' })
  const town = withTown(w)
  await clock.advance(SWEEP)
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  const described = {
    'town-tick:S-0101': 'Answer town step S-0101: done',
    'town-pick:S-0102:0': 'Answer town step S-0102, pick: Tuesday',
    'town-pick:S-0104:1': 'Answer town step S-0104, pick: Stop it',
    'town-words:S-0102': 'Own words for town step S-0102',
    'town-answer:S-0103': 'Answer town step S-0103',
    'town-open:G-0102': 'Open the town to decide gate G-0102',
  }
  for (const [key, label] of Object.entries(described)) expect((await ui.find({ key }))?.props.label).toBe(label)
  expect(await ui.find({ type: 'Text', text: /Read-only gate/ })).toBeDefined()
  town.isDown = true
  await ui.press({ key: 'town-tick:S-0101' })
  expect(await ui.find({ type: 'Text', text: 'Not sent: the town did not answer.' })).toBeDefined()
  expect((await ui.find({ key: 'town-resend:S-0101' }))?.props.label).toBe('Send your answer to town step S-0101 again')
  await ui.unmount()
})

test('town: town items change no mood, alert or count', { timeoutMs: 30_000 }, async ($, on) => {
  const { w, clock } = begin(on)
  await $.tool.call({ tool: 'mcp__fake__build' })
  withTown(w)
  await clock.advance(SWEEP)
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  expect(await ui.find({ key: 'section:town' })).toBeDefined()
  expect(await ui.find({ key: 'section:move' })).toBeUndefined()
  expect(await ui.find({ key: 'section:elsewhere' })).toBeUndefined()
  const alts = (await ui.findAll({ type: 'Svg' })).map(one => String(one.props.alt))
  expect(alts.some(alt => alt.startsWith('READY WHEN YOU ARE'))).toBe(true)
  expect(alts.some(alt => alt.includes('WAITING FOR YOU'))).toBe(false)
  await ui.unmount()
  expect(w.phone).toEqual([])
  expect(w.notified).toEqual([])
})

test('town: the door answer and the discovery file are read field by field', async () => {
  expect(parseOverview(JSON.stringify(fixture))).not.toBeNull()
  expect(parseOverview(JSON.stringify({ ...fixture, api: 2 }))).toBeNull()
  expect(parseOverview(JSON.stringify({ ...fixture, town: { ...fixture.town, url: 'http://example.com/' } }))).toBeNull()
  expect(parseOverview(JSON.stringify({ ...fixture, steps: [{ ...fixture.steps[0], status: 'answered' }] }))).toBeNull()
  expect(parseOverview(JSON.stringify({ ...fixture, moreSteps: -1 }))).toBeNull()
  expect(parseOverview('<html>')).toBeNull()
  expect(parseDiscovery(discovery())).toEqual({ port: 52100, startedAt: STARTED })
  expect(parseDiscovery(discovery({ stoppedAt: STARTED }))).toBeNull()
  expect(parseDiscovery('')).toBeNull()
  expect(splitReply('{"a":1}\n200')).toEqual({ status: 200, body: '{"a":1}' })
  expect(splitReply('')).toEqual({ status: 0, body: '' })
})
