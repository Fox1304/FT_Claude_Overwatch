import { expect, mock, test } from 'claude-code/testing'

import { KEY, PANE, unfold, world } from './world'

const GOALS = 'mcp__overview__goals'
const STEPS = 'mcp__overview__your_steps'
const SURFACES = ['terminal', 'desktop', 'mobile'] as const
const COMPOSER = { wait: false, origin: { kind: 'composer' } } as const
/** Tue 6 Oct 2026, 15:00 on the machine's clock. */
const AFTERNOON = new Date(2026, 9, 6, 15, 0).getTime()
const HOUR = 60 * 60 * 1000

test('other open sessions show at a glance; gone ones are hidden, then forgotten', async ($, on) => {
  const w = world(on)
  const clock = mock.clock(on, { now: AFTERNOON })
  w.stored['session:S2'] = {
    id: 'S2', project: 'otherapp', summary: 'Daily puzzle streaks', active: 'Streaks survive a missed day',
    done: 1, total: 3, state: 'working', updatedAt: AFTERNOON - 5_000,
  }
  w.stored['session:S3'] = { id: 'S3', project: 'myapp', summary: 'Old', done: 0, total: 0, state: 'idle', updatedAt: AFTERNOON - 5 * 60_000 }
  w.stored['session:S4'] = { id: 'S4', project: 'myapp', summary: 'Older', done: 0, total: 0, state: 'idle', updatedAt: AFTERNOON - 2 * HOUR }
  await $.tool.call({ tool: 'mcp__fake__build' })
  await clock.advance(10_000)

  for (const surface of SURFACES) {
    const pane = await $.ui.mount({ ...PANE, surface })
    expect(await pane.find({ type: 'Text', text: 'OTHER SESSIONS · 1' })).toBeDefined()
    expect(await pane.find({ type: 'Text', text: 'Daily puzzle streaks · 1 of 3 done · working' })).toBeDefined()
    expect(await pane.find({ type: 'Text', text: /Older|^Old/ })).toBeUndefined()
    await pane.unmount()
  }
  expect(w.stored['session:S4']).toBeUndefined()
  expect(w.stored['session:S3']).toBeDefined()
  expect(w.stored['session:S1']).toMatchObject({ project: 'myapp', state: 'idle' })
})

test("this session's card follows its goals", async ($, on) => {
  const w = world(on)
  mock.clock(on, { now: AFTERNOON })
  await $.prompt.submit({ text: 'Ship the beta', ...COMPOSER })
  await $.tool.call({
    tool: GOALS,
    summary: 'The beta reaches testers',
    goals: [
      { title: 'Rewards give drops', status: 'done' },
      { title: 'Testers get the new build', status: 'active' },
    ],
  })
  expect(w.stored['session:S1']).toMatchObject({
    summary: 'The beta reaches testers', active: 'Testers get the new build', done: 1, total: 2, state: 'working',
  })
})

test('a decision is answered with buttons, and Claude hears each pick', async ($, on) => {
  const w = world(on)
  mock.clock(on, { now: AFTERNOON })
  await $.tool.call({
    tool: STEPS,
    add: [{ title: "Choose Play's target audience", choices: ['18 and over', 'Mixed ages'] }],
  })
  expect(w.phone).toEqual(["myapp needs a decision: Choose Play's target audience"])
  const [step] = w.steps()

  for (const surface of SURFACES) {
    const pane = await $.ui.mount({ ...PANE, surface })
    expect(await pane.find({ type: 'Text', text: "Choose Play's target audience" })).toBeDefined()
    expect(await pane.find({ type: 'Button', text: '○ 18 and over' })).toBeDefined()
    expect(await pane.find({ type: 'Button', text: '○ Mixed ages' })).toBeDefined()
    await pane.unmount()
  }

  const pane = await $.ui.mount({ ...PANE, surface: 'desktop' })
  await pane.press({ key: `pick:${step?.id}:0` })
  expect(await pane.find({ type: 'Button', text: '● 18 and over' })).toBeDefined()
  expect(await pane.find({ type: 'Text', text: 'Picked · Claude will pick it up' })).toBeDefined()
  const first = await $.tool.call({ tool: 'mcp__fake__build' })
  expect((first.context ?? []).join('\n')).toContain(`${step?.id} · Choose Play's target audience → "18 and over"`)
  expect(await pane.find({ type: 'Text', text: 'Claude knows · acting on it' })).toBeDefined()

  await pane.press({ key: `pick:${step?.id}:1` })
  const second = await $.tool.call({ tool: 'mcp__fake__build' })
  expect((second.context ?? []).join('\n')).toContain('→ "Mixed ages"')

  await $.tool.call({ tool: STEPS, confirm: [{ id: step?.id ?? '', checked: 'Saved as mixed ages in Play Console' }] })
  await unfold(pane, 'confirmed')
  expect(await pane.find({ type: 'Text', text: "Choose Play's target audience · Mixed ages · confirmed" })).toBeDefined()
  await pane.unmount()
})

test('picking the chosen option again takes it back', async ($, on) => {
  const w = world(on)
  mock.clock(on, { now: AFTERNOON })
  await $.tool.call({ tool: STEPS, add: [{ title: 'Pick a launch market', choices: ['France', 'UK'] }] })
  const [step] = w.steps()
  const pane = await $.ui.mount({ ...PANE, surface: 'desktop' })
  await pane.press({ key: `pick:${step?.id}:1` })
  await pane.press({ key: `pick:${step?.id}:1` })
  expect(w.steps()[0]).toMatchObject({ status: 'todo' })
  expect(w.steps()[0]?.answer).toBeUndefined()
  expect((await $.tool.call({ tool: 'mcp__fake__build' })).context ?? []).toEqual([])
  await pane.unmount()
})

test('each goal opens to what was done for it', async ($, on) => {
  world(on)
  mock.clock(on, { now: AFTERNOON })
  on('tool.call', { tool: 'mcp__fake__deploy' }, () => ({ result: 'deployed' }))
  await $.tool.call({ tool: 'mcp__fake__build' })
  await $.tool.call({ tool: GOALS, goals: [{ title: 'Testers get the new build', status: 'active' }] })
  await $.tool.call({ tool: 'mcp__fake__build' })
  await $.tool.call({ tool: 'mcp__fake__deploy' })

  for (const surface of SURFACES) {
    const pane = await $.ui.mount({ ...PANE, surface })
    await unfold(pane, 'goals')
    expect(await pane.find({ type: 'Button', text: '▸ 3 things done' })).toBeDefined()
    expect(await pane.find({ type: 'Text', text: 'Used build (×2)' })).toBeUndefined()
    await pane.press({ key: 'acts:now:Testers get the new build' })
    expect(await pane.find({ type: 'Button', text: '▾ 3 things done' })).toBeDefined()
    expect(await pane.find({ type: 'Text', text: 'Used build (×2)' })).toBeDefined()
    expect(await pane.find({ type: 'Text', text: 'Used deploy' })).toBeDefined()
    await pane.press({ key: 'acts:now:Testers get the new build' })
    await pane.unmount()
  }
})

test('deadlines show in plain words, soonest first', async ($, on) => {
  const w = world(on)
  mock.clock(on, { now: AFTERNOON })
  await $.tool.call({
    tool: STEPS,
    add: [
      { title: 'Send the press release', due: '2026-10-16' },
      { title: 'Set the spend limits', due: '2026-10-05' },
      { title: 'Recruit the testers', due: '2026-10-07' },
      { title: 'Proofread the site' },
    ],
  })
  expect(w.steps().map(step => step.due ?? '-')).toEqual(['2026-10-16', '2026-10-05', '2026-10-07', '-'])

  for (const surface of SURFACES) {
    const pane = await $.ui.mount({ ...PANE, surface })
    expect(await pane.find({ type: 'Text', text: 'OVERDUE · 1' })).toBeDefined()
    expect(await pane.find({ type: 'Text', text: 'THIS WEEK · 1' })).toBeDefined()
    expect(await pane.find({ type: 'Text', text: 'by Fri 16 Oct' })).toBeUndefined()
    await pane.press({ key: 'fold:later' })
    expect(await pane.find({ type: 'Text', text: 'overdue since Mon 5 Oct' })).toBeDefined()
    expect(await pane.find({ type: 'Text', text: 'due tomorrow' })).toBeDefined()
    expect(await pane.find({ type: 'Text', text: 'by Fri 16 Oct' })).toBeDefined()
    const titles = (await pane.findAll({ type: 'Text' })).map(one => one.text)
    const order = ['Set the spend limits', 'Recruit the testers', 'Proofread the site', 'Send the press release'].map(title => titles.indexOf(title))
    expect(order.every(index => index >= 0)).toBe(true)
    expect([...order].sort((a, b) => a - b)).toEqual(order)
    expect((await pane.findAll({ type: 'Button', text: '☐' })).length).toBe(4)
    await pane.press({ key: 'fold:later' })
    await pane.unmount()
  }
})

test('a step waiting a day, or due by tomorrow, reminds the phone once a day', async ($, on) => {
  const w = world(on)
  const clock = mock.clock(on, { now: AFTERNOON })
  w.stored[KEY] = {
    label: 'myapp',
    steps: [
      { id: 'o1', title: 'Create the Brevo account', status: 'todo', heard: 'todo', createdAt: AFTERNOON - 26 * HOUR },
      { id: 'n1', title: 'Fresh step', status: 'todo', heard: 'todo', createdAt: AFTERNOON - HOUR },
    ],
  }
  await $.tool.call({ tool: 'mcp__fake__build' })
  await clock.advance(10_000)
  expect(w.phone).toEqual(['myapp: still waiting for you — Create the Brevo account'])

  await clock.advance(2 * HOUR)
  expect(w.phone).toHaveLength(1)

  const pane = await $.ui.mount({ ...PANE, surface: 'desktop' })
  expect(await pane.find({ type: 'Text', text: 'waiting 1 day' })).toBeUndefined()
  await unfold(pane, 'later')
  expect(await pane.find({ type: 'Text', text: 'waiting 1 day' })).toBeDefined()
  await pane.unmount()
})

test('no reminders at night', async ($, on) => {
  const w = world(on)
  const clock = mock.clock(on, { now: new Date(2026, 9, 6, 23, 0).getTime() })
  w.stored[KEY] = {
    label: 'myapp',
    steps: [{ id: 'o1', title: 'Create the Brevo account', status: 'todo', heard: 'todo', due: '2026-10-07', createdAt: 0 }],
  }
  await $.tool.call({ tool: 'mcp__fake__build' })
  await clock.advance(10_000)
  expect(w.phone).toEqual([])
})
