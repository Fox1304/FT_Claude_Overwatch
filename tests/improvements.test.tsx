import { expect, mock, test } from 'claude-code/testing'

import { OTHER_KEY, PANE, allText, unfold, world } from './world'

const GOALS = 'mcp__overview__goals'
const STEPS = 'mcp__overview__your_steps'
const SURFACES = ['terminal', 'desktop', 'mobile'] as const
const COMPOSER = { wait: false, origin: { kind: 'composer' } } as const

test('a goal waiting on the person says so, and lets go once they tick', async ($, on) => {
  const w = world(on)
  mock.clock(on, { now: 1000 })
  await $.tool.call({ tool: STEPS, add: [{ title: 'Pay the Play Console fee' }] })
  const [fee] = w.steps()
  await $.tool.call({
    tool: GOALS,
    goals: [
      { title: 'The app is on the Play Store', status: 'waiting', waitingFor: [fee?.id ?? ''] },
      { title: 'Testers get the new build', status: 'planned' },
    ],
  })

  for (const surface of SURFACES) {
    const pane = await $.ui.mount({ ...PANE, surface })
    await unfold(pane, 'goals')
    expect(await pane.find({ type: 'Text', text: 'Waiting for you' })).toBeDefined()
    expect(await pane.find({ type: 'Text', text: 'Waiting for you: Pay the Play Console fee' })).toBeDefined()
    await pane.unmount()
  }

  const pane = await $.ui.mount({ ...PANE, surface: 'desktop' })
  expect(await allText(pane)).toContain('Waiting for you: Pay the Play Console fee')
  await pane.press({ key: `tick:${fee?.id}` })
  expect(await pane.find({ type: 'Text', text: 'You did your part · Claude carries on' })).toBeDefined()
  const built = await $.tool.call({ tool: 'mcp__fake__build' })
  expect((built.context ?? []).join('\n')).toContain('the goal "The app is on the Play Store" waits on it')
  await pane.unmount()
})

test('a waiting goal naming no known step is pointed back to the steps tool', async ($, on) => {
  world(on)
  mock.clock(on)
  const sent = await $.tool.call({
    tool: GOALS,
    goals: [{ title: 'The app is on the Play Store', status: 'waiting', waitingFor: ['zzz999'] }],
  })
  expect(String(sent.result)).toContain('waits on no known step')
})

test("the person's phone hears about new and reopened steps", async ($, on) => {
  const w = world(on)
  mock.clock(on)
  await $.tool.call({ tool: STEPS, add: [{ title: 'Approve the new Apple agreement' }] })
  expect(w.phone).toEqual(['myapp needs you: Approve the new Apple agreement'])

  const [step] = w.steps()
  await $.tool.call({ tool: STEPS, reopen: [{ id: step?.id ?? '', note: 'still pending' }] })
  expect(w.phone[1]).toBe('Not done yet: Approve the new Apple agreement (still pending)')

  await $.tool.call({ tool: STEPS, confirm: [{ id: step?.id ?? '', checked: 'Your word' }] })
  expect(w.phone).toHaveLength(2)
})

test('phone alerts can be turned off', { options: { phoneAlerts: false } }, async ($, on) => {
  const w = world(on)
  mock.clock(on)
  await $.tool.call({ tool: STEPS, add: [{ title: 'Approve the new Apple agreement' }] })
  expect(w.phone).toEqual([])
})

test("other projects' steps show and can be ticked from here", async ($, on) => {
  const w = world(on)
  const clock = mock.clock(on, { now: 1000 })
  w.stored[OTHER_KEY] = {
    label: 'otherapp',
    steps: [{ id: 'n1', title: 'Renew the Apple certificate', status: 'todo', heard: 'todo', createdAt: 1 }],
  }
  await $.tool.call({ tool: STEPS, add: [{ title: 'Pay the Play Console fee' }] })
  await clock.advance(10_000)

  for (const surface of SURFACES) {
    const pane = await $.ui.mount({ ...PANE, surface })
    expect(await pane.find({ type: 'Text', text: 'OTHER PROJECTS' })).toBeDefined()
    expect(await pane.find({ type: 'Text', text: 'otherapp' })).toBeDefined()
    expect(await pane.find({ type: 'Text', text: 'Renew the Apple certificate' })).toBeDefined()
    expect(await pane.find({ key: 'other:n1' })).toMatchObject({ text: '☐' })
    await pane.unmount()
  }

  const pane = await $.ui.mount({ ...PANE, surface: 'desktop' })
  await pane.press({ key: 'other:n1' })
  expect(w.stepsAt(OTHER_KEY)[0]).toMatchObject({ status: 'checked', tickedFrom: 'yourSteps:/work/myapp' })
  expect(await pane.find({ type: 'Text', text: 'Ticked · Claude in otherapp will pick it up' })).toBeDefined()

  await clock.advance(60_000)
  expect(w.prompts).toHaveLength(0)
  await pane.unmount()
})

test('a step ticked from another project is picked up here', async ($, on) => {
  const w = world(on)
  const clock = mock.clock(on, { now: 100_000 })
  w.stored['yourSteps:/work/myapp'] = {
    label: 'myapp',
    steps: [
      {
        id: 'k1',
        title: 'Approve the new Apple agreement',
        status: 'checked',
        heard: 'todo',
        tickedIn: 'S-elsewhere',
        tickedFrom: OTHER_KEY,
        tickedAt: 50_000,
        createdAt: 1,
      },
    ],
  }
  await $.tool.call({ tool: 'mcp__fake__build' })
  await clock.advance(10_000)
  expect(w.prompts).toHaveLength(1)
  expect(w.prompts[0]?.text).toContain('Approve the new Apple agreement')
})

test('Claude is reminded when the pane goes stale, and not before', async ($, on) => {
  world(on)
  mock.clock(on)
  await $.prompt.submit({ text: 'Ship the beta', ...COMPOSER })
  for (let call = 1; call < 12; call += 1) {
    expect((await $.tool.call({ tool: 'mcp__fake__build' })).context ?? []).toEqual([])
  }
  const twelfth = await $.tool.call({ tool: 'mcp__fake__build' })
  expect((twelfth.context ?? []).join('\n')).toContain('Overview pane is empty')

  await $.tool.call({ tool: GOALS, goals: [{ title: 'Testers get the new build', status: 'active' }] })
  for (let call = 1; call < 12; call += 1) await $.tool.call({ tool: 'mcp__fake__build' })
  const stale = await $.tool.call({ tool: 'mcp__fake__build' })
  expect((stale.context ?? []).join('\n')).toContain('has not changed for a while')
})

test('technical goal titles are sent back, plain ones pass', async ($, on) => {
  world(on)
  mock.clock(on)
  for (const title of ['Edit PaywallStore.swift', 'Run xcodebuild tests', 'Set beta_premium_until', 'Call fetchPrices()']) {
    const sent = await $.tool.call({ tool: GOALS, goals: [{ title, status: 'active' }] })
    expect(sent.text ?? sent.deny).toContain('read as technical steps')
  }
  const plain = await $.tool.call({
    tool: GOALS,
    goals: [
      { title: 'Parents can pay in euros', status: 'active' },
      { title: 'The macOS and iOS builds reach TestFlight', status: 'planned' },
    ],
  })
  expect(String(plain.result)).toContain('0 of 2 done')
})

test('background helpers show in the pane', async ($, on) => {
  const w = world(on)
  const clock = mock.clock(on)
  w.agents.push(
    { id: 'a1', description: 'Check the store listing', type: 'general-purpose', status: 'running' },
    { id: 'a2', description: 'Finished earlier', type: 'Explore', status: 'completed' },
  )
  await $.tool.call({ tool: STEPS })
  const pane = await $.ui.mount({ ...PANE, surface: 'desktop' })
  await clock.advance(10_000)
  expect(await pane.find({ type: 'Text', text: 'HELPERS · 1 working' })).toBeDefined()
  expect(await pane.find({ type: 'Text', text: '⋯ Check the store listing' })).toBeDefined()
  expect(await allText(pane)).toContain('1 helper working in the background')
  expect(await pane.find({ type: 'Text', text: /Finished earlier/ })).toBeUndefined()
  await pane.unmount()
})

test("a finished task's goals clear away when the person asks for something new", async ($, on) => {
  world(on)
  mock.clock(on)
  await $.tool.call({ tool: GOALS, summary: 'Drops for the beta', goals: [{ title: 'Rewards give drops', status: 'done' }] })

  await $.prompt.submit({ text: 'noted', wait: false, origin: { kind: 'task-notification' } })
  let pane = await $.ui.mount({ ...PANE, surface: 'desktop' })
  await unfold(pane, 'goals')
  expect(await pane.find({ type: 'Text', text: 'Drops for the beta' })).toBeDefined()
  await pane.unmount()

  await $.prompt.submit({ text: 'Now the site', ...COMPOSER })
  pane = await $.ui.mount({ ...PANE, surface: 'desktop' })
  await unfold(pane, 'goals')
  expect(await pane.find({ type: 'Text', text: 'Drops for the beta' })).toBeUndefined()
  expect(await pane.find({ type: 'Button', text: '▸ Finished earlier · 1' })).toBeDefined()
  await pane.press({ key: 'fold:earlier' })
  expect(await pane.find({ type: 'Text', text: 'Rewards give drops' })).toBeDefined()
  expect(await pane.find({ type: 'Text', text: /\d\/1$/ })).toBeUndefined()
  await pane.unmount()
})

test('an unfinished task stays when the person writes', async ($, on) => {
  world(on)
  mock.clock(on)
  await $.tool.call({ tool: GOALS, goals: [{ title: 'Rewards give drops', status: 'active' }] })
  await $.prompt.submit({ text: 'How is it going?', ...COMPOSER })
  const pane = await $.ui.mount({ ...PANE, surface: 'desktop' })
  expect(await pane.find({ type: 'Button', text: '▸ All goals · 0 of 1 done' })).toBeDefined()
  await unfold(pane, 'goals')
  expect(await pane.find({ type: 'Text', text: '0/1' })).toBeDefined()
  await pane.unmount()
})
