import { expect, mock, test } from 'claude-code/testing'
import type { Engine } from 'claude-code/testing'

import { PANE, unfold, world } from './world'

const STEPS_TOOL = 'mcp__overview__your_steps'
const SURFACES = ['terminal', 'desktop', 'mobile'] as const

const addTwo = ($: Engine) =>
  $.tool.call({
    tool: STEPS_TOOL,
    add: [
      { title: 'Approve the new Apple agreement', detail: 'App Store Connect, Business' },
      { title: 'Pay the Play Console fee' },
    ],
  })

test('steps for the person show in the pane, shared by the whole repository', async ($, on) => {
  const w = world(on)
  mock.clock(on, { now: 1000 })
  const sent = await addTwo($)
  expect(String(sent.result)).toContain('Approve the new Apple agreement')
  expect(w.steps().map(step => step.status)).toEqual(['todo', 'todo'])

  for (const surface of SURFACES) {
    const pane = await $.ui.mount({ ...PANE, surface })
    expect(await pane.find({ type: 'Text', text: '2 now' })).toBeDefined()
    expect(await pane.find({ type: 'Text', text: 'Approve the new Apple agreement' })).toBeDefined()
    expect(await pane.find({ type: 'Button', text: '☐' })).toBeDefined()
    expect(await pane.find({ type: 'Text', text: 'App Store Connect, Business' })).toBeDefined()
    await pane.unmount()
  }
})

test('a tick waits, then an idle Claude picks it up once the person stops ticking', async ($, on) => {
  const w = world(on)
  const clock = mock.clock(on, { now: 1000 })
  await addTwo($)
  const [first] = w.steps()
  const pane = await $.ui.mount({ ...PANE, surface: 'desktop' })
  await pane.press({ key: `tick:${first?.id}` })
  expect(await pane.find({ key: `tick:${first?.id}`, type: 'Button' })).toMatchObject({ text: '☑' })
  expect(await pane.find({ type: 'Text', text: 'Ticked · Claude will pick it up' })).toBeDefined()

  await clock.advance(20_000)
  expect(w.prompts).toHaveLength(0)

  await clock.advance(20_000)
  expect(w.prompts).toHaveLength(1)
  expect(w.prompts[0]?.text).toContain('Approve the new Apple agreement')
  expect(w.prompts[0]?.text).not.toContain('Pay the Play Console fee')
  expect(await pane.find({ type: 'Text', text: 'Claude knows · confirming' })).toBeDefined()

  await clock.advance(60_000)
  expect(w.prompts).toHaveLength(1)
  await pane.unmount()
})

test("while Claude works, a tick reaches it with its next tool result", async ($, on) => {
  const w = world(on)
  const clock = mock.clock(on, { now: 1000 })
  await $.prompt.submit({ text: 'Ship the beta', wait: false, origin: { kind: 'composer' } })
  await addTwo($)
  const [, second] = w.steps()
  const pane = await $.ui.mount({ ...PANE, surface: 'terminal' })
  await pane.press({ key: `tick:${second?.id}` })

  const built = await $.tool.call({ tool: 'mcp__fake__build' })
  expect(w.logs).toEqual([])
  expect((built.context ?? []).join('\n')).toContain('Pay the Play Console fee')
  expect(await pane.find({ type: 'Text', text: 'Claude knows · confirming' })).toBeDefined()

  const again = await $.tool.call({ tool: 'mcp__fake__build' })
  expect(again.context ?? []).toEqual([])
  await clock.advance(120_000)
  expect(w.prompts).toHaveLength(1)
  await pane.unmount()
})

test('with pickup off, the next message carries the tick', { options: { pickupAfterSeconds: 0 } }, async ($, on) => {
  const w = world(on)
  const clock = mock.clock(on, { now: 1000 })
  await addTwo($)
  const [first] = w.steps()
  const pane = await $.ui.mount({ ...PANE, surface: 'desktop' })
  await pane.press({ key: `tick:${first?.id}` })
  await clock.advance(120_000)
  expect(w.prompts).toHaveLength(0)

  await $.prompt.submit({ text: 'What is left?', wait: false, origin: { kind: 'composer' } })
  expect(w.prompts).toHaveLength(1)
  expect(w.prompts[0]?.context.join('\n')).toContain('Approve the new Apple agreement')
  expect(w.steps()[0]?.heard).toBe('checked')
  await pane.unmount()
})

test('a tick undone before Claude hears it tells Claude nothing', async ($, on) => {
  const w = world(on)
  const clock = mock.clock(on, { now: 1000 })
  await addTwo($)
  const [first] = w.steps()
  const pane = await $.ui.mount({ ...PANE, surface: 'desktop' })
  await pane.press({ key: `tick:${first?.id}` })
  await pane.press({ key: `tick:${first?.id}` })
  await clock.advance(120_000)
  expect(w.prompts).toHaveLength(0)
  expect((await $.tool.call({ tool: 'mcp__fake__build' })).context ?? []).toEqual([])
  await pane.unmount()
})

test('Claude confirms a step or reopens it with what is missing', async ($, on) => {
  const w = world(on)
  mock.clock(on, { now: 1000 })
  await addTwo($)
  const [first, second] = w.steps()
  const sent = await $.tool.call({
    tool: STEPS_TOOL,
    confirm: [{ id: first?.id ?? '', checked: 'Seen in App Store Connect, agreement active' }],
    reopen: [{ id: second?.id ?? '', note: 'The payment still shows as pending' }],
    remove: ['nope00'],
  })
  expect(String(sent.result)).toContain('Unknown ids, nothing changed for them: nope00')

  for (const surface of SURFACES) {
    const pane = await $.ui.mount({ ...PANE, surface })
    await unfold(pane, 'confirmed')
    expect(await pane.find({ type: 'Text', text: 'Approve the new Apple agreement · confirmed' })).toBeDefined()
    expect(await pane.find({ type: 'Text', text: 'Seen in App Store Connect, agreement active' })).toBeDefined()
    expect(await pane.find({ type: 'Text', text: 'Claude: The payment still shows as pending' })).toBeDefined()
    expect(await pane.find({ type: 'Text', text: '1 now' })).toBeDefined()
    await pane.unmount()
  }
})

test("the mod's own message shows as one quiet line", async $ => {
  const text = 'The person ticked this step as done in the Overview pane:\n- a1b2c3 · Approve the new Apple agreement\nCheck each one yourself.'
  for (const surface of SURFACES) {
    const row = await $.ui.mount({
      plugin: 'overview',
      surface,
      component: 'UserMessage',
      props: { text, origin: { kind: 'plugin', name: 'overview' }, isExpanded: false },
    })
    expect(
      await row.find({ type: 'Text', text: '☑ You ticked: Approve the new Apple agreement · Claude is checking' }),
    ).toBeDefined()
    await row.unmount()
  }
})
