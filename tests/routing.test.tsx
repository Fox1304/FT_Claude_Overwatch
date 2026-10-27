import { expect, mock, test } from 'claude-code/testing'

import { hearerOf, heirOf } from '../hooks/routing'
import { KEY, OTHER_KEY, PANE, unfold, world } from './world'

const STEPS = 'mcp__overview__your_steps'
const GOALS = 'mcp__overview__goals'
const MAP = 'mcp__overview__project_map'
const COMPOSER = { wait: false, origin: { kind: 'composer' } } as const
const AFTERNOON = new Date(2026, 9, 27, 15, 0).getTime()
const RELEASE = 'Release the beta'

type World = ReturnType<typeof world>

/** Another session of myapp, open: it has just published its card. */
const openSession = (w: World, id: string, now: number, extra: Record<string, unknown> = {}) => {
  w.stored[`session:${id}`] = { id, project: 'myapp', key: KEY, summary: RELEASE, done: 0, total: 2, state: 'working', updatedAt: now, ...extra }
}

test('who hears what the person did: the asking session while open, else the pane they used, else the last-used session', () => {
  const live = [
    { id: 'S1', key: KEY, activeAt: 10 },
    { id: 'S2', key: KEY, activeAt: 30 },
    { id: 'S3', key: OTHER_KEY, activeAt: 50 },
  ]
  expect(hearerOf({ askedIn: 'S2', tickedIn: 'S1', tickedFrom: KEY }, KEY, live)).toBe('S2')
  expect(hearerOf({ askedIn: 'S9', tickedIn: 'S1', tickedFrom: KEY }, KEY, live)).toBe('S1')
  // Ticked from otherapp's pane, its asking session closed: myapp's last-used session hears it.
  expect(hearerOf({ askedIn: 'S9', tickedIn: 'S3', tickedFrom: OTHER_KEY }, KEY, live)).toBe('S2')
  expect(hearerOf({ tickedIn: 'S3', tickedFrom: OTHER_KEY }, 'yourSteps:/work/closed', live)).toBeUndefined()
  // Every session agrees on one heir, ties going to the lower id.
  expect(heirOf([{ id: 'S5', key: KEY }, { id: 'S4', key: KEY }], KEY)?.id).toBe('S4')
})

test('a tick goes to the session that asked for the step, not to the one it was ticked in', async ($, on) => {
  const w = world(on)
  const clock = mock.clock(on, { now: AFTERNOON })
  w.me.id = 'S2'
  await $.tool.call({ tool: STEPS, add: [{ title: 'Approve the new Apple agreement' }] })
  const [step] = w.steps()
  expect(step?.askedIn).toBe('S2')

  w.me.id = 'S1'
  openSession(w, 'S2', AFTERNOON)
  await clock.advance(10_000)
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  expect(await ui.find({ type: 'Text', text: `Asked by Claude in « ${RELEASE} »` })).toBeDefined()
  await ui.press({ key: `tick:${step?.id}` })
  expect(w.toasts).toContain(`↗ Claude in « ${RELEASE} » will pick it up`)
  expect(await ui.find({ type: 'Text', text: `Ticked · Claude in « ${RELEASE} » will pick it up` })).toBeDefined()

  await clock.advance(40_000)
  expect(w.prompts).toHaveLength(0)
  expect(w.steps()[0]?.heard).toBe('todo')

  w.me.id = 'S2'
  await clock.advance(10_000)
  expect(w.prompts).toHaveLength(1)
  expect(w.prompts[0]?.text).toContain('Approve the new Apple agreement')
  expect(w.steps()[0]?.heard).toBe('checked')
  await ui.unmount()
})

test('the person typing in another session does not take the tick away from the asking one', async ($, on) => {
  const w = world(on)
  const clock = mock.clock(on, { now: AFTERNOON })
  w.me.id = 'S2'
  await $.tool.call({ tool: STEPS, add: [{ title: 'Pay the Play Console fee' }] })
  const [step] = w.steps()
  w.me.id = 'S1'
  openSession(w, 'S2', AFTERNOON)
  await clock.advance(10_000)
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  await ui.press({ key: `tick:${step?.id}` })
  await ui.unmount()

  await $.prompt.submit({ text: 'Fix the login screen', ...COMPOSER })
  expect(w.prompts[0]?.context.join('\n') ?? '').not.toContain('Pay the Play Console fee')
  expect(w.steps()[0]).toMatchObject({ status: 'checked', heard: 'todo' })
})

test('when the asking session is closed, the session the person ticked in hears it', async ($, on) => {
  const w = world(on)
  const clock = mock.clock(on, { now: AFTERNOON })
  w.me.id = 'S2'
  await $.tool.call({ tool: STEPS, add: [{ title: 'Approve the new Apple agreement' }] })
  const [step] = w.steps()
  // S2 published a card three minutes ago and nothing since: it is closed.
  w.me.id = 'S1'
  openSession(w, 'S2', AFTERNOON - 3 * 60_000)
  await clock.advance(10_000)
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  expect(await ui.find({ type: 'Text', text: `Asked by Claude in « ${RELEASE} »` })).toBeUndefined()
  await ui.press({ key: `tick:${step?.id}` })
  expect(w.toasts).toContain('↗ Its session is closed: Claude here will pick it up')
  expect(await ui.find({ type: 'Text', text: 'Ticked · its session is closed: Claude here will pick it up' })).toBeDefined()

  await clock.advance(40_000)
  expect(w.prompts).toHaveLength(1)
  expect(w.prompts[0]?.text).toContain('Approve the new Apple agreement')
  await ui.unmount()
})

test("a tick from another project's pane reaches one session of the project: the one used last", async ($, on) => {
  const w = world(on)
  const clock = mock.clock(on, { now: AFTERNOON })
  w.stored[KEY] = {
    label: 'myapp',
    steps: [
      {
        id: 'k1',
        title: 'Renew the Apple certificate',
        status: 'checked',
        heard: 'todo',
        askedIn: 'S9',
        tickedIn: 'S-otherapp',
        tickedFrom: OTHER_KEY,
        tickedAt: AFTERNOON - 60_000,
        createdAt: 1,
      },
    ],
  }
  openSession(w, 'S2', AFTERNOON, { activeAt: AFTERNOON + 5_000 })
  await $.tool.call({ tool: 'mcp__fake__build' })
  await clock.advance(20_000)
  expect(w.prompts).toHaveLength(0)

  // S2 closes: this session is now the project's last used, and hears it once.
  delete w.stored['session:S2']
  await clock.advance(20_000)
  expect(w.prompts).toHaveLength(1)
  expect(w.prompts[0]?.text).toContain('Renew the Apple certificate')
  await clock.advance(30_000)
  expect(w.prompts).toHaveLength(1)
})

test('a note on a step goes to the session that asked for it', async ($, on) => {
  const w = world(on)
  const clock = mock.clock(on, { now: AFTERNOON })
  w.me.id = 'S2'
  await $.tool.call({ tool: STEPS, add: [{ title: 'Pay the Play Console fee', due: '2026-10-28' }] })
  const [step] = w.steps()
  w.me.id = 'S1'
  openSession(w, 'S2', AFTERNOON)
  await clock.advance(10_000)
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  await ui.press({ key: `edit:move:step:${step?.id}` })
  await ui.input({ key: `note-input:move:step:${step?.id}`, text: 'Already paid last year.' })
  expect(w.prompts).toHaveLength(0)
  expect(w.stored[`inbox#s#S2#step:${step?.id}`]).toMatchObject({ target: 'S2', key: KEY, note: { text: 'Already paid last year.' } })
  expect(w.toasts).toContain(`✎ Note sent to Claude in « ${RELEASE} »`)
  expect(await ui.find({ type: 'Text', text: `✎ Note sent to Claude in « ${RELEASE} »` })).toBeDefined()
  await clock.advance(20_000)
  expect(w.prompts).toHaveLength(0)

  w.me.id = 'S2'
  await clock.advance(10_000)
  expect(w.prompts).toHaveLength(1)
  expect(w.prompts[0]?.text).toContain(`the step « Pay the Play Console fee » (step ${step?.id})`)
  expect(w.prompts[0]?.text).toContain('« Already paid last year. »')
  expect(w.stored[`inbox#s#S2#step:${step?.id}`]).toBeUndefined()
  await ui.unmount()
})

test('a note on the map goes to the session that sent it, and waits for the heir once that one closes', async ($, on) => {
  const w = world(on)
  const clock = mock.clock(on, { now: AFTERNOON })
  w.me.id = 'S2'
  await $.tool.call({ tool: MAP, milestones: [{ title: 'Public beta', status: 'active' }], parts: [{ title: 'Mail', status: 'waiting' }] })
  w.me.id = 'S1'
  openSession(w, 'S2', AFTERNOON)
  await clock.advance(10_000)
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  await unfold(ui, 'map')
  await ui.press({ key: 'edit:map:part:Mail' })
  await ui.input({ key: 'note-input:map:part:Mail', text: 'Brevo is live since 7 Oct.' })
  expect(w.prompts).toHaveLength(0)
  expect(w.stored['inbox#s#S2#part:Mail']).toBeDefined()

  // S2 closed before reading it: this session, the project's heir, takes it over.
  delete w.stored['session:S2']
  await clock.advance(10_000)
  expect(w.prompts).toHaveLength(1)
  expect(w.prompts[0]?.text).toContain('the part of the project map « Mail »')
  await ui.unmount()
})

test("a note on another project's step waits for that project's next session", async ($, on) => {
  const w = world(on)
  const clock = mock.clock(on, { now: AFTERNOON })
  w.stored[OTHER_KEY] = {
    label: 'otherapp',
    steps: [{ id: 'n1', title: 'Renew the Apple certificate', status: 'todo', heard: 'todo', askedIn: 'S7', createdAt: 1 }],
  }
  await $.tool.call({ tool: 'mcp__fake__build' })
  await clock.advance(10_000)
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  await ui.press({ key: 'edit:other:step:n1' })
  await ui.input({ key: 'note-input:other:step:n1', text: 'Use the new team.' })
  expect(w.stored[`inbox#p#${OTHER_KEY}#step:n1`]).toMatchObject({ target: '', key: OTHER_KEY })
  expect(await ui.find({ type: 'Text', text: '✎ Note sent to Claude in otherapp, at its next session' })).toBeDefined()
  await clock.advance(60_000)
  expect(w.prompts).toHaveLength(0)
  expect(w.stored[`inbox#p#${OTHER_KEY}#step:n1`]).toBeDefined()
  await ui.unmount()
})

test('the session that waits on a step, or changes it, becomes the one that hears it', async ($, on) => {
  const w = world(on)
  mock.clock(on, { now: AFTERNOON })
  w.me.id = 'S2'
  await $.tool.call({ tool: STEPS, add: [{ title: 'Approve the new Apple agreement' }, { title: 'Pay the Play Console fee' }] })
  const [apple, fee] = w.steps()

  w.me.id = 'S1'
  await $.tool.call({ tool: GOALS, goals: [{ title: 'The app is on the App Store', status: 'waiting', waitingFor: [apple?.id ?? ''] }] })
  expect(w.steps().find(step => step.id === apple?.id)?.askedIn).toBe('S1')
  expect(w.steps().find(step => step.id === fee?.id)?.askedIn).toBe('S2')

  w.me.id = 'S3'
  await $.tool.call({ tool: STEPS, update: [{ id: fee?.id ?? '', due: '2026-10-30' }] })
  expect(w.steps().find(step => step.id === fee?.id)?.askedIn).toBe('S3')
})
