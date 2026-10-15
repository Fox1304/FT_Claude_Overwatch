import { expect, mock, test } from 'claude-code/testing'

import { PANE, allText, unfold, world } from './world'

const MAP = 'mcp__overview__project_map'
const STEPS = 'mcp__overview__your_steps'
const AFTERNOON = new Date(2026, 9, 6, 15, 0).getTime()

const MYAPP = {
  milestones: [
    { title: 'Public beta', status: 'done', date: '2026-10-06' },
    { title: 'iOS 1.0 to review', status: 'active', date: '2026-10-14' },
    { title: 'Launch decision', status: 'next', date: '2026-10-26' },
    { title: 'Launch in France', status: 'later', date: '2026-11-02' },
  ],
  parts: [
    { title: 'Backend', status: 'done', note: 'Live in Paris' },
    { title: 'iOS app', status: 'active', progress: 70, note: '1.0 ready to submit', milestone: 'Launch decision' },
    { title: 'Mail', status: 'waiting', note: 'Waiting on your Brevo account', milestone: 'Launch decision' },
    { title: 'Legal & privacy', status: 'todo' },
  ],
}

test('the map stays folded under the plan line, and opens drawn in the app and written out in the terminal', async ($, on) => {
  const w = world(on)
  mock.clock(on, { now: AFTERNOON })
  const sent = await $.tool.call({ tool: MAP, ...MYAPP })
  expect(String(sent.result)).toContain('iOS app · 70%')
  expect(w.stored['map:/work/myapp']).toMatchObject({ milestones: MYAPP.milestones })

  for (const surface of ['desktop', 'mobile'] as const) {
    const ui = await $.ui.mount({ ...PANE, surface })
    const now = await allText(ui)
    expect(now).toContain('◉ PLAN')
    expect(now).toContain('iOS 1.0 to review · Wed 14 Oct')
    expect(now).not.toContain('you are here')
    expect(await ui.find({ type: 'Svg' })).toBeUndefined()
    expect(await ui.find({ type: 'Button', text: '▸ ◉ Project map · iOS 1.0 to review' })).toBeDefined()
    await unfold(ui, 'map')
    const opened = await allText(ui)
    for (const words of ['MYAPP · PROJECT MAP', 'iOS 1.0 to review · you are here', 'Waiting on you', 'In progress · 70%', 'PARTS · 1 of 4 done', 'Waiting on your Brevo account']) {
      expect(opened).toContain(words)
    }
    expect(await ui.find({ key: 'card:map' })).toMatchObject({ props: { borderColor: 'permission' } })
    expect(await ui.find({ key: 'edit:map:part:Mail' })).toBeDefined()
    await ui.press({ key: 'fold:map' })
    await ui.unmount()
  }

  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  expect(await ui.find({ type: 'Svg' })).toBeUndefined()
  expect(await ui.find({ type: 'Text', text: 'MYAPP · PROJECT MAP' })).toBeUndefined()
  await unfold(ui, 'map')
  expect(await ui.find({ type: 'Text', text: 'MYAPP · PROJECT MAP' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: 'PARTS · 1 of 4 done' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: 'Waiting on your Brevo account' })).toBeDefined()
  await ui.unmount()
})

test('what moved shows under Just now, and the part is outlined in the map', async ($, on) => {
  const w = world(on)
  const clock = mock.clock(on, { now: AFTERNOON })
  await $.tool.call({ tool: MAP, ...MYAPP })
  await clock.advance(60 * 60 * 1000)
  await $.tool.call({
    tool: MAP,
    parts: [
      { title: 'Backend', status: 'done' },
      { title: 'iOS app', status: 'active', progress: 85 },
      { title: 'Mail', status: 'done', note: 'Brevo ready' },
      { title: 'Legal & privacy', status: 'stuck', note: 'Waiting on a lawyer' },
    ],
  })
  await $.tool.call({ tool: MAP, milestones: [{ ...MYAPP.milestones[0] }, { title: 'iOS 1.0 to review', status: 'done' }, { title: 'Launch decision', status: 'active' }] })
  const feed = (w.stored['changes:/work/myapp'] as { text: string }[]).map(one => one.text)
  expect(feed).toEqual(['Now on Launch decision', 'iOS 1.0 to review reached', 'Legal & privacy → Stuck', 'Mail → Done', 'iOS app 70% → 85%'])

  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  const now = await allText(ui)
  expect(now).toContain('JUST NOW')
  expect(now).toContain('Now on Launch decision')
  expect(now).toContain('Legal & privacy → Stuck')
  expect(now).not.toContain('Mail → Done')
  expect(now).toContain('16:00')
  await unfold(ui, 'map')
  expect(await ui.find({ key: 'part:Legal & privacy' })).toMatchObject({ props: { borderColor: 'error' } })
  await ui.unmount()

  const terminal = await $.ui.mount({ ...PANE, surface: 'terminal' })
  expect(await terminal.find({ type: 'Text', text: 'JUST NOW' })).toBeDefined()
  expect(await terminal.find({ type: 'Text', text: /Legal & privacy → Stuck/ })).toBeDefined()
  await terminal.unmount()
})

test('a decision shows as Needs your call, with the default it would keep, never applied', async ($, on) => {
  const w = world(on)
  const clock = mock.clock(on, { now: AFTERNOON })
  await $.tool.call({
    tool: STEPS,
    add: [
      { title: 'Switch Stripe to live mode?', choices: ['Go live', 'Stay in test'], defaultChoice: 'Stay in test', decideBy: '2026-10-07T10:00' },
      { title: 'Pick a launch market', choices: ['France', 'UK'], defaultChoice: 'Germany' },
    ],
  })
  const [stripe, market] = w.steps()
  expect(stripe).toMatchObject({ defaultChoice: 'Stay in test', decideBy: '2026-10-07T10:00' })
  expect(market?.defaultChoice).toBeUndefined()

  for (const surface of ['terminal', 'desktop', 'mobile'] as const) {
    const ui = await $.ui.mount({ ...PANE, surface })
    expect(await ui.find({ type: 'Text', text: 'NEEDS YOUR CALL · 2' })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /Switch Stripe to live mode\?/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: '⏱ due tomorrow' })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: 'No answer keeps: Stay in test' })).toBeDefined()
    expect(await ui.find({ key: 'card:yours' })).toMatchObject({ props: { borderColor: 'warning' } })
    await ui.unmount()
  }

  await clock.advance(20 * 60 * 1000)
  expect(w.steps()[0]).toMatchObject({ status: 'todo' })
  expect(w.steps()[0]?.answer).toBeUndefined()
})

test('a tick and a pick land in the feed', async ($, on) => {
  const w = world(on)
  mock.clock(on, { now: AFTERNOON })
  await $.tool.call({ tool: STEPS, add: [{ title: 'Pay the fee' }, { title: 'Pick a market', choices: ['France', 'UK'] }] })
  const [fee, pick] = w.steps()
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  await ui.press({ key: `tick:${fee?.id}` })
  await ui.press({ key: `pick:${pick?.id}:0` })
  await $.tool.call({ tool: STEPS, confirm: [{ id: fee?.id ?? '', checked: 'Seen' }] })
  expect((w.stored['changes:/work/myapp'] as { text: string }[]).map(one => one.text)).toEqual([
    'Pay the fee → Done',
    'You chose: France',
    'You ticked: Pay the fee',
  ])
  await ui.unmount()
})
