import { expect, mock, test } from 'claude-code/testing'

import { KEY, PANE, allText, world } from './world'

const GOALS = 'mcp__overview__goals'
const SURFACES = ['terminal', 'desktop', 'mobile'] as const
const COMPOSER = { wait: false, origin: { kind: 'composer' } } as const
const AFTERNOON = new Date(2026, 9, 6, 15, 0).getTime()

const borderOf = async (ui: { find: (q: { key: string }) => Promise<{ props: Record<string, unknown> } | undefined> }, key: string) =>
  (await ui.find({ key: `card:${key}` }))?.props

test("the task card's frame takes the color of what is happening", async ($, on) => {
  const w = world(on)
  mock.clock(on, { now: AFTERNOON })
  await $.tool.call({ tool: GOALS, summary: 'The beta reaches testers', goals: [{ title: 'Testers get the new build', status: 'planned' }] })

  for (const surface of SURFACES) {
    const ui = await $.ui.mount({ ...PANE, surface })
    expect(await borderOf(ui, 'now')).toMatchObject({ borderStyle: 'round', borderColor: 'inactive' })
    expect(await allText(ui)).toContain('PAUSED · YOUR TURN')
    await ui.unmount()
  }

  await $.prompt.submit({ text: 'go', ...COMPOSER })
  let ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  expect(await allText(ui)).toContain('● WORKING')
  expect(await borderOf(ui, 'now')).toMatchObject({ borderColor: 'claude' })
  await ui.unmount()

  await $.tool.call({ tool: GOALS, goals: [{ title: 'Testers get the new build', status: 'done' }] })
  const finished = await $.ui.mount({ ...PANE, surface: 'terminal' })
  expect(await borderOf(finished, 'now')).toMatchObject({ borderColor: 'success' })
  expect(await finished.find({ type: 'Text', text: '✓ ALL DONE' })).toBeDefined()
  await finished.unmount()
  ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  expect(await allText(ui)).toContain('ALL DONE')
  await ui.unmount()
  expect(w.logs).toEqual([])
})

test('your steps turn red-framed when one is overdue, blue otherwise', async ($, on) => {
  const w = world(on)
  mock.clock(on, { now: AFTERNOON })
  w.stored[KEY] = {
    label: 'myapp',
    steps: [{ id: 's1', title: 'Pay the Play Console fee', status: 'todo', heard: 'todo', due: '2026-10-09', createdAt: AFTERNOON }],
  }
  await $.tool.call({ tool: 'mcp__overview__your_steps' })
  let ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  expect(await borderOf(ui, 'yours')).toMatchObject({ borderColor: 'warning' })
  expect(await ui.find({ type: 'Text', text: '1 now' })).toBeDefined()
  await ui.unmount()

  w.stored[KEY] = {
    label: 'myapp',
    steps: [{ id: 's1', title: 'Pay the Play Console fee', status: 'todo', heard: 'todo', due: '2026-10-05', createdAt: AFTERNOON }],
  }
  await $.tool.call({ tool: 'mcp__overview__your_steps' })
  ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  expect(await borderOf(ui, 'yours')).toMatchObject({ borderColor: 'error' })
  expect(await ui.find({ type: 'Text', text: '1 now' })).toBeDefined()
  await ui.unmount()
})
