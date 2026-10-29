import { expect, mock, test } from 'claude-code/testing'
import type { Engine } from 'claude-code/testing'

import { applyQueueOps, moveTask, nextTask, parseQueueOps, parseRead } from '../hooks/queue'
import type { QueueTask } from '../types'
import { PANE, allText, unfold, world } from './world'

const QUEUE = 'mcp__overview__queue'
const GOALS = 'mcp__overview__goals'
const QUEUE_KEY = 'queue:/work/myapp'
const AFTERNOON = new Date(2026, 9, 27, 15, 0).getTime()
const COMPOSER = { wait: false, origin: { kind: 'composer' } } as const
const COMMAND = { origin: { kind: 'composer' as const }, presentation: { isFullscreen: false, columns: 100 } }
const BRIEF = '**Goal**: Let parents export the week as a PDF.\n\n**Done when**: a PDF of the week opens from the agenda.'
const CLEAR = JSON.stringify({ clear: true, title: 'Export the week as a PDF', brief: BRIEF, questions: [] })
const UNCLEAR = JSON.stringify({
  clear: false,
  title: 'A weekly summary for parents',
  questions: [
    { topic: 'Format', question: 'Where should the summary show?', options: ['By email', 'In the app'], recommended: 1 },
    { topic: 'Day', question: 'Which day should it come?', options: ['Friday', 'Sunday'], recommended: 0 },
  ],
})

const task = (id: string, title: string, extra: Partial<QueueTask> = {}): QueueTask => ({
  id,
  raw: title,
  title,
  brief: `**Goal**: ${title}.`,
  status: 'ready',
  askedIn: 'S1',
  createdAt: AFTERNOON - 60_000,
  ...extra,
})

/** Claude finishes a turn of the main conversation with these last words. */
const finishTurn = ($: Engine, answer: string, isAborted = false) =>
  $.turn.complete({ answer, durationMs: 1000, isAborted, turnId: `t-${answer.length}`, reason: isAborted ? 'aborted' : 'answer' })

test('reading an idea: a clear one is filed with its brief, the reply must be the expected JSON', () => {
  expect(parseRead(CLEAR)).toEqual({ isClear: true, title: 'Export the week as a PDF', brief: BRIEF })
  expect(parseRead(`Here it is:\n${UNCLEAR}`)).toMatchObject({ isClear: false, questions: [{ topic: 'Format' }, { topic: 'Day' }] })
  expect(parseRead('no json')).toBeUndefined()
  expect(parseRead('{"clear":false,"title":"x","questions":[]}')).toBeUndefined()
})

test('the queue keeps its order: a task moves among the tasks still to do, held ones are skipped', () => {
  const tasks = [task('a', 'First'), task('b', 'Second', { isHeld: true }), task('d', 'Done', { status: 'done' }), task('c', 'Third')]
  expect(moveTask(tasks, 'c', -1).map(one => one.id)).toEqual(['a', 'c', 'd', 'b'])
  expect(moveTask(tasks, 'a', -1).map(one => one.id)).toEqual(['a', 'b', 'd', 'c'])
  expect(nextTask(moveTask(tasks, 'a', 1), 'S1')?.id).toBe('a')
  expect(nextTask([task('b', 'Second', { isHeld: true }), task('c', 'Third')], 'S1')?.id).toBe('c')
  // A session only takes the tasks written in it.
  expect(nextTask([task('a', 'First', { askedIn: 'S2' }), task('c', 'Third')], 'S1')?.id).toBe('c')
  expect(nextTask([task('a', 'First', { askedIn: 'S2' })], 'S1')).toBeUndefined()
  const ops = parseQueueOps({ add: [{ title: 'Later idea', brief: '**Goal**: x' }], finish: [{ id: 'a', outcome: 'Shipped' }, { id: 'zz', outcome: '' }] })
  const applied = applyQueueOps(tasks, ops, AFTERNOON, () => 'n1', 'S1')
  expect(applied.unknown).toEqual(['zz'])
  expect(applied.list.find(one => one.id === 'a')).toMatchObject({ status: 'done', outcome: 'Shipped', doneAt: AFTERNOON })
  expect(applied.list.at(-1)).toMatchObject({ id: 'n1', status: 'ready', addedBy: 'claude', askedIn: 'S1' })
})

test('a dropped idea that is clear is filed as a ready task with its brief', async ($, on) => {
  const w = world(on)
  mock.clock(on, { now: AFTERNOON })
  w.replies.push(CLEAR)
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  expect(await ui.find({ key: 'idea-input' })).toMatchObject({ props: { placeholder: 'Drop an idea, a feature, a task…' } })
  await ui.input({ key: 'idea-input', text: 'parents should be able to export the week as pdf', kind: 'change' })
  expect((await ui.find({ key: 'idea-input' }))?.props.value).toBe('parents should be able to export the week as pdf')
  await ui.input({ key: 'idea-input', text: 'parents should be able to export the week as pdf' })
  expect((await ui.find({ key: 'idea-input' }))?.props.value).toBe('')
  expect(w.reads).toHaveLength(1)
  expect(w.reads[0]?.model).toBe('sonnet')
  expect(w.reads[0]?.prompt).toContain('parents should be able to export the week as pdf')
  const [filed] = w.queued()
  expect(filed).toMatchObject({ status: 'ready', title: 'Export the week as a PDF', brief: BRIEF, raw: 'parents should be able to export the week as pdf', addedBy: 'person' })
  expect(await ui.find({ type: 'Text', text: 'Export the week as a PDF' })).toBeDefined()
  expect(await allText(ui)).toContain('Ready')
  expect(await ui.find({ type: 'Markdown' })).toBeUndefined()
  await ui.press({ key: `task-open:${filed?.id}` })
  expect((await ui.find({ type: 'Markdown' }))?.text).toContain('a PDF of the week opens from the agenda')
  await ui.unmount()
})

test('an unclear idea comes back with questions; the answers go into the brief', async ($, on) => {
  const w = world(on)
  mock.clock(on, { now: AFTERNOON })
  w.replies.push(UNCLEAR, CLEAR)
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  await ui.input({ key: 'idea-input', text: 'a weekly summary for parents' })
  const [asking] = w.queued()
  expect(asking).toMatchObject({ status: 'asking', title: 'A weekly summary for parents', rounds: 1 })
  expect(w.toasts.at(-1)).toBe('? Claude has 2 questions about « A weekly summary for parents »')
  expect(await ui.find({ type: 'Text', text: 'Where should the summary show?' })).toBeDefined()
  expect(await ui.find({ key: `task-pick:${asking?.id}:0:1` })).toMatchObject({ text: '○ In the app ★' })
  await ui.press({ key: `task-pick:${asking?.id}:0:0` })
  expect(await ui.find({ key: `task-pick:${asking?.id}:0:0` })).toMatchObject({ text: '● By email' })
  await ui.input({ key: `task-answer:${asking?.id}:1`, text: 'Saturday morning' })
  await ui.press({ key: `task-file:${asking?.id}` })
  expect(w.reads[1]?.prompt).toContain('Where should the summary show? → By email')
  expect(w.reads[1]?.prompt).toContain('Which day should it come? → Saturday morning')
  expect(w.queued()[0]).toMatchObject({ status: 'ready', brief: BRIEF })
  await ui.unmount()
})

test('a failed read says why and can be tried again', async ($, on) => {
  const w = world(on)
  mock.clock(on, { now: AFTERNOON })
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  await ui.input({ key: 'idea-input', text: 'dark mode for the agenda' })
  const [failed] = w.queued()
  expect(failed).toMatchObject({ status: 'failed', error: 'no reply (empty-reply)' })
  expect(await allText(ui)).toContain('no reply (empty-reply)')
  w.replies.push(CLEAR)
  await ui.press({ key: `task-retry:${failed?.id}` })
  expect(w.queued()[0]?.status).toBe('ready')
  await ui.unmount()
})

test('the person orders the queue, holds a task, and removes one', async ($, on) => {
  const w = world(on)
  mock.clock(on, { now: AFTERNOON })
  w.stored[QUEUE_KEY] = { tasks: [task('a1', 'Export the week'), task('b2', 'Weekly summary'), task('c3', 'Dark agenda')], autopilot: true }
  await $.tool.call({ tool: QUEUE })
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  expect(await ui.find({ key: 'task-up:a1' })).toBeUndefined()
  expect(await ui.find({ key: 'task-down:c3' })).toBeUndefined()
  await ui.press({ key: 'task-down:a1' })
  expect(w.queued().map(one => one.id)).toEqual(['b2', 'a1', 'c3'])
  await ui.press({ key: 'task-hold:b2' })
  expect(w.queued()[0]?.isHeld).toBe(true)
  expect(await allText(ui)).toContain('On hold · Claude leaves it alone')
  expect(await ui.find({ key: 'task-hold:b2' })).toMatchObject({ text: '▶' })
  await ui.press({ key: 'task-remove:c3' })
  expect(w.queued().find(one => one.id === 'c3')?.removedAt).toBe(AFTERNOON)
  await unfold(ui, 'queue-removed')
  await ui.press({ key: 'task-restore:c3' })
  expect(w.queued().find(one => one.id === 'c3')?.removedAt).toBeUndefined()
  const listed = String((await $.tool.call({ tool: QUEUE })).result)
  expect(listed).toContain('1. b2 · Weekly summary — on hold')
  expect(listed).toContain('2. a1 · Export the week — ready')
  await ui.unmount()
})

test('once its session is free, the next ready task starts by itself after a countdown, then the one after', async ($, on) => {
  const w = world(on)
  const clock = mock.clock(on, { now: AFTERNOON })
  w.stored[QUEUE_KEY] = { tasks: [task('h1', 'Held idea', { isHeld: true }), task('a1', 'Export the week'), task('b2', 'Weekly summary')], autopilot: true }
  await $.prompt.submit({ text: 'Fix the login screen', ...COMPOSER })
  await $.tool.call({ tool: GOALS, goals: [{ title: 'Parents can log in again', status: 'done' }] })
  await finishTurn($, 'The login screen works again.')

  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  // Free only once idle as long as a tick waits before an idle Claude picks it up (30 s).
  expect(await allText(ui)).not.toContain('▶ Next at')
  await clock.advance(40_000)
  expect(await allText(ui)).toContain('▶ Next at 15:01:')
  expect(await allText(ui)).toContain('Export the week')
  expect(w.prompts).toHaveLength(1)
  await clock.advance(60_000)
  expect(w.prompts).toHaveLength(2)
  expect(w.prompts[1]?.text).toContain("Next task from the person's queue (task a1, « Export the week »)")
  expect(w.prompts[1]?.text).toContain('**Goal**: Export the week.')
  expect(w.queued().find(one => one.id === 'a1')).toMatchObject({ status: 'running', startedIn: 'S1' })
  expect(await allText(ui)).toContain('Claude is on it')

  // Claude works through it and ends: the task is done and the next one counts down.
  await $.prompt.submit({ text: w.prompts[1]?.text ?? '', wait: false, origin: { kind: 'plugin', name: 'overview' } })
  await finishTurn($, 'Parents can now export the week as a PDF.')
  expect(w.queued().find(one => one.id === 'a1')).toMatchObject({ status: 'done', outcome: 'Parents can now export the week as a PDF.' })
  await clock.advance(110_000)
  expect(w.prompts.at(-1)?.text).toContain('(task b2, « Weekly summary »)')
  expect(w.queued().find(one => one.id === 'h1')?.status).toBe('ready')
  await ui.unmount()
})

test('nothing starts alone while Claude asks a question, after « Not now », with autopilot off, or in a session just opened', { timeoutMs: 20_000 }, async ($, on) => {
  const w = world(on)
  const clock = mock.clock(on, { now: AFTERNOON })
  w.stored[QUEUE_KEY] = { tasks: [task('a1', 'Export the week')], autopilot: true }
  await $.tool.call({ tool: QUEUE })
  await clock.advance(120_000)
  expect(w.prompts).toHaveLength(0)

  await finishTurn($, 'Should I also cover the iPad layout?')
  await clock.advance(120_000)
  expect(w.prompts).toHaveLength(0)

  await $.prompt.submit({ text: 'No, phones only', ...COMPOSER })
  await finishTurn($, 'Done for phones.')
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  await clock.advance(40_000)
  await ui.press({ key: 'countdown-snooze' })
  await clock.advance(120_000)
  expect(w.prompts).toHaveLength(1)

  await $.prompt.submit({ text: 'Thanks', ...COMPOSER })
  await ui.press({ key: 'autopilot' })
  expect((w.stored[QUEUE_KEY] as { autopilot: boolean }).autopilot).toBe(false)
  await finishTurn($, 'You are welcome.')
  await clock.advance(120_000)
  expect(w.prompts).toHaveLength(2)

  // « Start now » still starts it at once.
  await ui.press({ key: 'task-start:a1' })
  expect(w.prompts.at(-1)?.text).toContain('(task a1, « Export the week »)')
  await ui.unmount()
})

/** Another open session of the project, its card just published (a card older than 90 s is a closed session). */
const otherSession = (w: ReturnType<typeof world>, id: string, now: number, extra: Record<string, unknown> = {}) => {
  w.stored[`session:${id}`] = { id, project: 'myapp', key: 'yourSteps:/work/myapp', summary: 'Release', done: 0, total: 0, state: 'idle', updatedAt: now, ...extra }
}

test('an idea written in this session runs here once free, even after the person moved to another session', { timeoutMs: 20_000 }, async ($, on) => {
  const w = world(on)
  const clock = mock.clock(on, { now: AFTERNOON })
  w.replies.push(CLEAR)
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  await ui.input({ key: 'idea-input', text: 'parents should be able to export the week as pdf' })
  const [idea] = w.queued()
  expect(idea).toMatchObject({ status: 'ready', askedIn: 'S1' })
  await ui.unmount()

  // The person now types in session S2: it is the project's last used, but the idea stays S1's.
  otherSession(w, 'S2', AFTERNOON, { activeAt: AFTERNOON + 1_000 })
  await $.prompt.submit({ text: 'Fix the login screen', ...COMPOSER })
  await finishTurn($, 'Fixed.')
  await clock.advance(50_000)
  otherSession(w, 'S2', AFTERNOON + 50_000, { activeAt: AFTERNOON + 1_000 })
  await clock.advance(60_000)
  expect(w.prompts.at(-1)?.text).toContain(`(task ${idea?.id}, « Export the week as a PDF »)`)
  expect(w.queued()[0]).toMatchObject({ status: 'running', startedIn: 'S1', askedIn: 'S1' })
})

test("another session never runs an idea that is not its own, and says where it will run", { timeoutMs: 20_000 }, async ($, on) => {
  const w = world(on)
  const clock = mock.clock(on, { now: AFTERNOON })
  w.me.id = 'S2'
  w.stored[QUEUE_KEY] = { tasks: [task('a1', 'Export the week', { askedIn: 'S1' })], autopilot: true }
  otherSession(w, 'S1', AFTERNOON, { summary: 'Agenda polish' })
  await $.prompt.submit({ text: 'Fix the login screen', ...COMPOSER })
  await finishTurn($, 'Fixed.')
  for (let at = 1; at <= 3; at += 1) {
    await clock.advance(50_000)
    otherSession(w, 'S1', AFTERNOON + at * 50_000, { summary: 'Agenda polish' })
  }
  expect(w.prompts).toHaveLength(1)
  expect(w.queued()[0]?.status).toBe('ready')
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  expect(await allText(ui)).toContain('Runs in Claude in « Agenda polish »')
  expect(await ui.find({ key: 'task-here:a1' })).toBeUndefined()
  expect(w.toasts.some(line => line.includes('Its session is closed'))).toBe(false)
  await ui.unmount()
})

test('an idea is never launched while its session works, or right after it finished', { timeoutMs: 20_000 }, async ($, on) => {
  const w = world(on)
  const clock = mock.clock(on, { now: AFTERNOON })
  w.stored[QUEUE_KEY] = { tasks: [task('a1', 'Export the week')], autopilot: true }
  await $.prompt.submit({ text: 'Fix the login screen', ...COMPOSER })
  await finishTurn($, 'Fixed.')
  // Working again: a long turn never lets the idea in.
  await $.prompt.submit({ text: 'Now the signup screen', ...COMPOSER })
  await clock.advance(200_000)
  expect(w.prompts).toHaveLength(2)
  // Finished a moment ago: not free yet.
  await finishTurn($, 'Done.')
  await clock.advance(20_000)
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  expect(await allText(ui)).not.toContain('▶ Next at')
  expect(w.prompts).toHaveLength(2)
  await ui.unmount()
})

test('an idea whose session is gone is never launched alone: the person chooses where it runs, or dismisses it', { timeoutMs: 20_000 }, async ($, on) => {
  const w = world(on)
  const clock = mock.clock(on, { now: AFTERNOON })
  w.stored[QUEUE_KEY] = {
    tasks: [task('a1', 'Export the week', { askedIn: 'S9' }), task('b2', 'Weekly summary', { askedIn: 'S9' }), task('c3', 'Dark agenda', { askedIn: undefined })],
    autopilot: true,
  }
  otherSession(w, 'S2', AFTERNOON, { summary: 'Agenda polish' })
  await $.prompt.submit({ text: 'Fix the login screen', ...COMPOSER })
  await finishTurn($, 'Fixed.')
  await clock.advance(50_000)
  otherSession(w, 'S2', AFTERNOON + 50_000, { summary: 'Agenda polish' })
  await clock.advance(60_000)
  otherSession(w, 'S2', AFTERNOON + 110_000, { summary: 'Agenda polish' })
  expect(w.prompts).toHaveLength(1)
  expect(w.queued().map(one => one.status)).toEqual(['ready', 'ready', 'ready'])
  expect(w.toasts.filter(line => line.startsWith('Its session is closed'))).toHaveLength(3)

  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  expect(await allText(ui)).toContain('The session it was written in is closed. Where should it run?')
  expect(await ui.find({ key: 'task-start:a1' })).toBeUndefined()
  expect(await ui.find({ key: 'task-send:a1:S2' })).toMatchObject({ text: '→ Claude in « Agenda polish »' })
  await ui.press({ key: 'task-send:a1:S2' })
  expect(w.queued().find(one => one.id === 'a1')?.askedIn).toBe('S2')
  await ui.press({ key: 'task-dismiss:b2' })
  expect(w.queued().find(one => one.id === 'b2')?.removedAt).toBeDefined()
  await ui.press({ key: 'task-here:c3' })
  expect(w.prompts.at(-1)?.text).toContain('(task c3, « Dark agenda »)')
  expect(w.queued().find(one => one.id === 'c3')).toMatchObject({ status: 'running', askedIn: 'S1' })
  await ui.unmount()
})

test('Claude adds to the queue when asked, and marks a started task finished', async ($, on) => {
  const w = world(on)
  mock.clock(on, { now: AFTERNOON })
  const added = await $.tool.call({ tool: QUEUE, add: [{ title: 'Dark mode for the agenda', brief: '**Goal**: Give the agenda a dark mode.' }] })
  expect(String(added.result)).toContain('Dark mode for the agenda — ready')
  const [one] = w.queued()
  expect(one).toMatchObject({ status: 'ready', addedBy: 'claude' })
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  await ui.press({ key: `task-start:${one?.id}` })
  expect(w.queued()[0]?.status).toBe('running')
  const finished = await $.tool.call({ tool: QUEUE, finish: [{ id: one?.id ?? '', outcome: 'The agenda follows the dark theme' }] })
  expect(String(finished.result)).toContain('The agenda follows the dark theme')
  expect(w.queued()[0]).toMatchObject({ status: 'done', outcome: 'The agenda follows the dark theme' })
  await unfold(ui, 'queue-done')
  expect(await ui.find({ type: 'Text', text: 'The agenda follows the dark theme' })).toBeDefined()
  await ui.unmount()
})

test('the queue has a command, a guide for Claude, and a quiet line in the conversation', async ($, on) => {
  const w = world(on)
  mock.clock(on, { now: AFTERNOON })
  on('prompt.compose', () => ({ sections: [] }))
  w.replies.push(CLEAR)
  const said = await $.command.run({ command: 'idea', args: 'export the week as pdf', ...COMMAND })
  expect(String(said.text)).toContain('Idea dropped into Up next')
  expect(w.queued()).toHaveLength(1)

  const composed = await $.prompt.compose({ model: 'claude-opus-5-5', promptModel: 'claude-opus-5-5', surfaces: ['desktop'], tools: [GOALS, QUEUE], outputStyle: null, traits: [] })
  expect(composed.sections.find(section => section.id === 'overview:guide')?.text).toContain("## The person's task queue")

  const row = await $.ui.mount({
    plugin: 'overview',
    surface: 'desktop',
    component: 'UserMessage',
    props: { text: "Next task from the person's queue (task a1, « Export the week »), started by the Overview pane now that the previous work is finished:\n\nx", origin: { kind: 'plugin', name: 'overview' }, isExpanded: false },
  })
  expect(await row.find({ type: 'Text', text: '▶ From your queue: Export the week · Claude is on it' })).toBeDefined()
  await row.unmount()
})
