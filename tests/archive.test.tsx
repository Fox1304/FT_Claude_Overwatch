import { expect, mock, test } from 'claude-code/testing'
import type { Engine } from 'claude-code/testing'

import { PANE, unfold, world } from './world'

const STEPS_TOOL = 'mcp__overview__your_steps'
const GOALS = 'mcp__overview__goals'
const SURFACES = ['terminal', 'desktop', 'mobile'] as const
const AFTERNOON = new Date(2026, 9, 26, 15, 0).getTime()

const addTwo = ($: Engine) =>
  $.tool.call({
    tool: STEPS_TOOL,
    add: [{ title: 'Approve the new Apple agreement' }, { title: 'Pay the Play Console fee' }],
  })

test('an archived step leaves the active list and its count, and shows under Archived', async ($, on) => {
  const w = world(on)
  mock.clock(on, { now: AFTERNOON })
  await addTwo($)
  const [apple, play] = w.steps()

  for (const surface of SURFACES) {
    const ui = await $.ui.mount({ ...PANE, surface })
    expect(await ui.find({ type: 'Text', text: '2 now' })).toBeDefined()
    expect(await ui.find({ key: `archive:move:${apple?.id}` })).toBeDefined()
    await ui.unmount()
  }

  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  await ui.press({ key: `archive:move:${apple?.id}` })
  expect(w.steps().find(step => step.id === apple?.id)).toMatchObject({ archivedAt: AFTERNOON, status: 'todo' })
  expect(w.steps()).toHaveLength(2)
  // Folded at first: the restore buttons show only once Archived is opened.
  expect((await ui.find({ key: 'fold:archived' }))?.text).toBe('▸ ⊟ Archived · 1')
  expect(await ui.find({ key: `restore:${apple?.id}` })).toBeUndefined()
  await ui.unmount()

  for (const surface of SURFACES) {
    const pane = await $.ui.mount({ ...PANE, surface })
    expect(await pane.find({ type: 'Text', text: '1 now' })).toBeDefined()
    expect(await pane.find({ key: `tick:${apple?.id}` })).toBeUndefined()
    expect(await pane.find({ key: `tick:${play?.id}` })).toBeDefined()
    expect((await pane.find({ key: 'fold:archived' }))?.text).toEndWith('⊟ Archived · 1')
    await unfold(pane, 'archived')
    expect(await pane.find({ type: 'Text', text: 'Approve the new Apple agreement · archived 15:00' })).toBeDefined()
    expect(await pane.find({ key: `restore:${apple?.id}` })).toBeDefined()
    await pane.unmount()
  }
})

test('a restored step comes back as it was, and Claude hears both moves', async ($, on) => {
  const w = world(on)
  const clock = mock.clock(on, { now: AFTERNOON })
  await addTwo($)
  const [apple] = w.steps()
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  await ui.press({ key: `archive:move:${apple?.id}` })

  await clock.advance(40_000)
  expect(w.prompts).toHaveLength(1)
  expect(w.prompts[0]?.text).toContain('The person archived this step in the Overview pane as no longer relevant')
  expect(w.prompts[0]?.text).toContain('Approve the new Apple agreement')
  expect(w.prompts[0]?.text).not.toContain('Pay the Play Console fee')

  const listed = String((await $.tool.call({ tool: STEPS_TOOL })).result)
  expect(listed).toContain('Archived, kept and restorable by the person')
  expect(listed.split('Archived, kept')[0]).not.toContain('Approve the new Apple agreement')

  await unfold(ui, 'archived')
  await ui.press({ key: `restore:${apple?.id}` })
  expect(w.steps().find(step => step.id === apple?.id)?.archivedAt).toBeUndefined()
  expect(await ui.find({ key: `tick:${apple?.id}` })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: '2 now' })).toBeDefined()
  expect(await ui.find({ key: 'fold:archived' })).toBeUndefined()

  await clock.advance(40_000)
  expect(w.prompts).toHaveLength(2)
  expect(w.prompts[1]?.text).toContain('The person restored this step from the archive')
  expect(w.prompts[1]?.text).not.toContain('unticked')
  await clock.advance(60_000)
  expect(w.prompts).toHaveLength(2)
  await ui.unmount()
})

test('an archived step no longer holds a waiting goal back, nor reminds the phone', async ($, on) => {
  const w = world(on)
  const clock = mock.clock(on, { now: AFTERNOON })
  await $.tool.call({ tool: STEPS_TOOL, add: [{ title: 'Pay the Play Console fee', due: '2026-10-27' }] })
  const [fee] = w.steps()
  await $.tool.call({ tool: GOALS, goals: [{ title: 'The app is on Google Play', status: 'waiting', waitingFor: [fee?.id ?? ''] }] })
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  expect(await ui.find({ type: 'Text', text: 'WAITING FOR YOU' })).toBeDefined()
  await ui.press({ key: `archive:move:${fee?.id}` })
  expect(await ui.find({ type: 'Text', text: 'WAITING FOR YOU' })).toBeUndefined()
  expect(await ui.find({ type: 'Text', text: 'nothing open' })).toBeDefined()
  await ui.unmount()

  const before = w.phone.length
  // Due tomorrow: a step still open would remind the phone at the next sweep.
  await clock.advance(60_000)
  expect(w.phone.slice(before).some(line => line.includes('Pay the Play Console fee'))).toBe(false)
})

test("Claude adding the same step again makes a new one, and the archived one stays archived", async ($, on) => {
  const w = world(on)
  mock.clock(on, { now: AFTERNOON })
  await addTwo($)
  const [apple] = w.steps()
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  await ui.press({ key: `archive:move:${apple?.id}` })
  await ui.unmount()
  await $.tool.call({ tool: STEPS_TOOL, add: [{ title: 'Approve the new Apple agreement' }] })
  const same = w.steps().filter(step => step.title === 'Approve the new Apple agreement')
  expect(same).toHaveLength(2)
  expect(same.filter(step => step.archivedAt !== undefined)).toHaveLength(1)
})
