import { expect, mock, test } from 'claude-code/testing'

import { KEY, PANE, allText, world } from './world'

const GOALS = 'mcp__overview__goals'
const COMPOSER = { wait: false, origin: { kind: 'composer' } } as const
const AFTERNOON = new Date(2026, 9, 6, 15, 0).getTime()

test("the head draws Claude's mood and the task's progress in the apps, and writes it on the terminal", async ($, on) => {
  const w = world(on)
  mock.clock(on, { now: AFTERNOON })
  await $.tool.call({ tool: GOALS, summary: 'The beta reaches testers', goals: [{ title: 'Testers get the new build', status: 'planned' }] })

  for (const surface of ['desktop', 'mobile', 'vscode'] as const) {
    const ui = await $.ui.mount({ ...PANE, surface })
    expect(await ui.find({ key: 'hero' })).toBeDefined()
    const [drawing] = await ui.findAll({ type: 'Svg' })
    expect(drawing?.props).toMatchObject({ isInteractive: true, height: 112, alt: 'PAUSED · YOUR TURN · The beta reaches testers · 0%' })
    expect(String(drawing?.props.source)).toContain('Resting')
    expect(String(drawing?.props.source)).toContain('The beta reaches testers')
    expect(await allText(ui)).toContain('PAUSED · YOUR TURN')
    await ui.unmount()
  }
  const terminal = await $.ui.mount({ ...PANE, surface: 'terminal' })
  expect(await terminal.find({ type: 'Svg' })).toBeUndefined()
  expect(await allText(terminal)).toContain('○ PAUSED · YOUR TURN')
  await terminal.unmount()

  await $.prompt.submit({ text: 'go', ...COMPOSER })
  await $.tool.call({ tool: GOALS, goals: [{ title: 'Testers get the new build', status: 'active', progress: 40 }, { title: 'The store shows it', status: 'planned' }] })
  let ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  const [working] = await ui.findAll({ type: 'Svg' })
  expect(String(working?.props.source)).toContain('Working')
  expect(String(working?.props.source)).toContain('>20<')
  expect(await allText(ui)).toContain('Next: The store shows it')
  await ui.unmount()

  await $.tool.call({ tool: GOALS, goals: [{ title: 'Testers get the new build', status: 'done' }, { title: 'The store shows it', status: 'done' }] })
  const finished = await $.ui.mount({ ...PANE, surface: 'terminal' })
  expect(await allText(finished)).toContain('✓ ALL DONE')
  expect(await allText(finished)).toContain('100%')
  await finished.unmount()
  ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  const [done] = await ui.findAll({ type: 'Svg' })
  expect(String(done?.props.source)).toContain('All done')
  await ui.unmount()
  expect(w.logs).toEqual([])
})

test('sections fold and unfold, keep their state across sessions, and frame in the colour of what they hold', async ($, on) => {
  const w = world(on)
  mock.clock(on, { now: AFTERNOON })
  w.stored[KEY] = {
    label: 'myapp',
    steps: [{ id: 's1', title: 'Pay the Play Console fee', status: 'todo', heard: 'todo', due: '2026-10-09', createdAt: AFTERNOON }],
  }
  await $.tool.call({ tool: 'mcp__overview__your_steps' })
  let ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  expect(await ui.find({ key: 'section:move' })).toMatchObject({ props: { borderColor: 'warning' } })
  expect(await ui.find({ type: 'Text', text: '1 now' })).toBeDefined()
  expect(await ui.find({ key: 'fold:move' })).toMatchObject({ text: '▾ Your move' })
  expect(await ui.find({ key: 'fold:queue' })).toMatchObject({ text: '▾ Up next' })
  expect((await ui.findAll({ type: 'Svg' })).length).toBeGreaterThanOrEqual(3)
  await ui.press({ key: 'fold:move' })
  expect(await ui.find({ key: 'tick:s1' })).toBeUndefined()
  expect(w.stored.sections).toEqual({ move: false })
  await ui.unmount()

  const terminal = await $.ui.mount({ ...PANE, surface: 'terminal' })
  expect(await terminal.find({ key: 'fold:move' })).toMatchObject({ text: '▸ ⚑ Your move' })
  await terminal.press({ key: 'fold:move' })
  expect(await terminal.find({ key: 'tick:s1' })).toBeDefined()
  await terminal.unmount()

  w.stored[KEY] = {
    label: 'myapp',
    steps: [{ id: 's1', title: 'Pay the Play Console fee', status: 'todo', heard: 'todo', due: '2026-10-05', createdAt: AFTERNOON }],
  }
  await $.tool.call({ tool: 'mcp__overview__your_steps' })
  ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  expect(await ui.find({ key: 'section:move' })).toMatchObject({ props: { borderColor: 'error' } })
  await ui.unmount()
})

test('each helper gets its own avatar named by its task, and stays a while once finished', { timeoutMs: 30_000 }, async ($, on) => {
  const w = world(on)
  const clock = mock.clock(on, { now: AFTERNOON })
  w.agents.push(
    { id: 'a1', description: 'Find the old pane code', type: 'Explore', status: 'running' },
    { id: 'a2', description: 'Plan the queue', type: 'Plan', status: 'running' },
  )
  await $.tool.call({ tool: 'mcp__fake__build' })
  await clock.advance(10_000)
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  expect(await ui.find({ key: 'fold:crew' })).toMatchObject({ text: '▾ At work' })
  expect(await allText(ui)).toContain(' 2 ')
  const avatars = (await ui.findAll({ type: 'Svg' })).filter(one => one.props.width === 48)
  expect(avatars.map(one => one.props.alt)).toEqual(['Find the old pane code', 'Plan the queue'])
  expect(await ui.find({ type: 'Text', text: 'Find the old pane code' })).toBeDefined()
  expect(String(avatars[0]?.props.source)).not.toBe(String(avatars[1]?.props.source))

  w.agents[0] = { ...(w.agents[0] as (typeof w.agents)[number]), status: 'completed' }
  await clock.advance(3 * 60_000)
  expect(await allText(ui)).toContain('helper here · finished · 0 steps · 0 min')
  expect(await allText(ui)).toContain('helper here · 0 steps')
  await clock.advance(16 * 60_000)
  expect(await ui.find({ type: 'Text', text: 'Find the old pane code' })).toBeUndefined()
  await ui.unmount()

  const terminal = await $.ui.mount({ ...PANE, surface: 'terminal' })
  expect(await terminal.find({ type: 'Text', text: 'Plan the queue' })).toBeDefined()
  await terminal.unmount()
})

test("every open session's Claude and its helpers show at work, each named by what it does", async ($, on) => {
  const w = world(on)
  const clock = mock.clock(on, { now: AFTERNOON })
  w.stored['session:S2'] = {
    id: 'S2', project: 'otherapp', summary: 'Daily puzzle streaks', active: 'Streaks survive a missed day',
    done: 1, total: 3, percent: 50, state: 'working', updatedAt: AFTERNOON,
    crew: [{ id: 'x9', description: 'Read the streak rules', type: 'Explore', status: 'running', steps: 4, startedAt: AFTERNOON - 120_000 }],
  }
  w.agents.push({ id: 'a1', description: 'Check the store listing', type: 'general-purpose', status: 'running' })
  await $.tool.call({ tool: 'mcp__fake__build' })
  await clock.advance(10_000)
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  const faces = (await ui.findAll({ type: 'Svg' })).filter(one => one.props.width === 48).map(one => one.props.alt)
  expect(faces).toEqual(['Check the store listing', 'Streaks survive a missed day', 'Read the streak rules'])
  const words = await allText(ui)
  expect(words).toContain('otherapp · working · 1 of 3')
  expect(words).toContain('helper in otherapp · 4 steps · 2 min')
  await ui.unmount()

  // This session's card carries its helpers to the other panes.
  expect(w.stored['session:S1']).toMatchObject({ crew: [{ id: 'a1', description: 'Check the store listing', status: 'running' }] })
})
