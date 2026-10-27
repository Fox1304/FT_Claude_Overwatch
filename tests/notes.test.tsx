import { expect, mock, test } from 'claude-code/testing'

import { PANE, allText, world } from './world'

const GOALS = 'mcp__overview__goals'
const STEPS = 'mcp__overview__your_steps'
const COMPOSER = { wait: false, origin: { kind: 'composer' } } as const
const AFTERNOON = new Date(2026, 9, 13, 15, 0).getTime()
const GOAL = 'Parents can pay in euros'
const BOX = `now::goal:${GOAL}`

test('the edit box opens on an item, refuses an empty note, and sends a note to an idle Claude', async ($, on) => {
  const w = world(on)
  mock.clock(on, { now: AFTERNOON })
  await $.tool.call({ tool: GOALS, goals: [{ title: GOAL, status: 'active' }] })

  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ ...PANE, surface })
    expect(await ui.find({ key: `edit:now:goal:${GOAL}`, type: 'Button' })).toMatchObject({ text: '✎' })
    expect(await ui.find({ type: 'Text', text: GOAL })).toBeDefined()
    await ui.unmount()
  }

  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  expect(await ui.find({ key: `note-input:${BOX.replace('::', ':')}` })).toBeUndefined()
  await ui.press({ key: `edit:now:goal:${GOAL}` })
  expect(await ui.find({ type: 'Text', text: '✎ Tell Claude what to change' })).toBeDefined()
  expect(await ui.find({ key: `note-input:now:goal:${GOAL}` })).toMatchObject({ props: { placeholder: 'Your note for Claude…' } })

  await ui.input({ key: `note-input:now:goal:${GOAL}`, text: '   ' })
  expect(await ui.find({ type: 'Text', text: /Type what should change first/ })).toBeDefined()
  expect(w.prompts).toHaveLength(0)

  await ui.input({ key: `note-input:now:goal:${GOAL}`, text: 'No longer relevant: we launch in France only.' })
  expect(w.prompts).toHaveLength(1)
  expect(w.prompts[0]?.text).toContain(`the goal « ${GOAL} »`)
  expect(w.prompts[0]?.text).toContain('« No longer relevant: we launch in France only. »')
  expect(w.prompts[0]?.text).toContain('mcp__overview__goals')
  expect(await ui.find({ key: `note-input:now:goal:${GOAL}` })).toBeUndefined()
  expect(await ui.find({ type: 'Text', text: '✎ Note sent · Claude is reworking this' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: '« No longer relevant: we launch in France only. »' })).toBeDefined()
  expect((w.stored['changes:/work/myapp'] as { text: string }[])[0]?.text).toBe(`Your note on ${GOAL}`)

  await $.tool.call({ tool: GOALS, goals: [{ title: 'Parents in France can pay in euros', status: 'active' }] })
  expect(await allText(ui)).not.toContain('Note sent')
  await ui.unmount()
})

test('the box closes with ✕, and the edit button toggles it', async ($, on) => {
  world(on)
  mock.clock(on, { now: AFTERNOON })
  await $.tool.call({ tool: GOALS, goals: [{ title: GOAL, status: 'active' }] })
  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  await ui.press({ key: `edit:now:goal:${GOAL}` })
  await ui.press({ key: `edit-close:now:goal:${GOAL}` })
  expect(await ui.find({ key: `note-input:now:goal:${GOAL}` })).toBeUndefined()
  await ui.press({ key: `edit:now:goal:${GOAL}` })
  await ui.press({ key: `edit:now:goal:${GOAL}` })
  expect(await ui.find({ key: `note-input:now:goal:${GOAL}` })).toBeUndefined()
  await ui.unmount()
})

test('while Claude works, a note waits for its next step', async ($, on) => {
  const w = world(on)
  mock.clock(on, { now: AFTERNOON })
  await $.prompt.submit({ text: 'Ship the beta', ...COMPOSER })
  await $.tool.call({ tool: STEPS, add: [{ title: 'Pay the Play Console fee', due: '2026-10-14' }] })
  const [step] = w.steps()
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  await ui.press({ key: `edit:move:step:${step?.id}` })
  await ui.input({ key: `note-input:move:step:${step?.id}`, text: 'Already paid last year, remove it.' })
  expect(await ui.find({ type: 'Text', text: '✎ Note queued · Claude reads it at its next step' })).toBeDefined()
  expect(w.prompts).toHaveLength(1)

  const built = await $.tool.call({ tool: 'mcp__fake__build' })
  const context = (built.context ?? []).join('\n')
  expect(context).toContain(`the step « Pay the Play Console fee » (step ${step?.id})`)
  expect(context).toContain('« Already paid last year, remove it. »')
  expect(await ui.find({ type: 'Text', text: '✎ Note sent · Claude is reworking this' })).toBeDefined()

  await $.tool.call({ tool: STEPS, remove: [step?.id ?? ''] })
  expect(await allText(ui)).not.toContain('Already paid last year')
  await ui.unmount()
})

test('a note that fails to send says so, keeps its words, and can be retried or discarded', async ($, on) => {
  const failing = { now: true }
  const w = world(on, { failPrompts: failing })
  mock.clock(on, { now: AFTERNOON })
  await $.tool.call({ tool: GOALS, goals: [{ title: GOAL, status: 'active' }] })
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  await ui.press({ key: `edit:now:goal:${GOAL}` })
  await ui.input({ key: `note-input:now:goal:${GOAL}`, text: 'Split it in two.' })
  expect(await ui.find({ type: 'Text', text: /⚠ Your note was not sent: .*offline/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: '« Split it in two. »' })).toBeDefined()

  await ui.press({ key: `edit:now:goal:${GOAL}` })
  expect(await ui.find({ key: `note-input:now:goal:${GOAL}` })).toMatchObject({ props: { value: 'Split it in two.' } })
  await ui.press({ key: `edit-close:now:goal:${GOAL}` })

  failing.now = false
  await ui.press({ key: `note-retry:now:goal:${GOAL}` })
  expect(w.prompts).toHaveLength(1)
  expect(await ui.find({ type: 'Text', text: '✎ Note sent · Claude is reworking this' })).toBeDefined()
  await ui.unmount()

  failing.now = true
  const again = await $.ui.mount({ ...PANE, surface: 'desktop' })
  await again.press({ key: `edit:now:goal:${GOAL}` })
  await again.input({ key: `note-input:now:goal:${GOAL}`, text: 'Never mind.' })
  await again.press({ key: `note-drop:now:goal:${GOAL}` })
  expect(await allText(again)).not.toContain('Never mind.')
  await again.unmount()
})

test('every kind of item has an edit button: goals, steps, map parts and milestones', async ($, on) => {
  const w = world(on)
  mock.clock(on, { now: AFTERNOON })
  await $.tool.call({ tool: GOALS, goals: [{ title: GOAL, status: 'active' }, { title: 'Invoices go out by mail', status: 'planned' }] })
  await $.tool.call({ tool: STEPS, add: [{ title: 'Approve the agreement', due: '2026-10-14' }, { title: 'Later thing', due: '2026-12-01' }] })
  await $.tool.call({
    tool: 'mcp__overview__project_map',
    milestones: [{ title: 'Public beta', status: 'active' }],
    parts: [{ title: 'Mail', status: 'waiting', note: 'Your Brevo account' }],
  })
  const [approve, later] = w.steps()
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  for (const key of [`edit:now:goal:${GOAL}`, `edit:move:step:${approve?.id}`]) {
    expect(await ui.find({ key })).toBeDefined()
  }
  await ui.press({ key: 'fold:goals' })
  expect(await ui.find({ key: 'edit:all:goal:Invoices go out by mail' })).toBeDefined()
  await ui.press({ key: 'fold:later' })
  expect(await ui.find({ key: `edit:later:step:${later?.id}` })).toBeDefined()
  await ui.press({ key: 'fold:map' })
  expect(await ui.find({ key: 'edit:map:part:Mail' })).toBeDefined()
  expect(await ui.find({ key: 'edit:map:milestone:Public beta' })).toBeDefined()
  await ui.press({ key: 'edit:map:part:Mail' })
  await ui.input({ key: 'note-input:map:part:Mail', text: 'Brevo is live since 7 Oct.' })
  expect(w.prompts[0]?.text).toContain('the part of the project map « Mail »')
  expect(w.prompts[0]?.text).toContain('mcp__overview__project_map ("parts")')
  await ui.unmount()
})

test('drawings carry no words of their own: every title stays selectable text', async ($, on) => {
  world(on)
  mock.clock(on, { now: AFTERNOON })
  await $.tool.call({ tool: GOALS, summary: 'Payments in euros', goals: [{ title: GOAL, status: 'active' }] })
  await $.tool.call({ tool: 'mcp__overview__project_map', milestones: [{ title: 'Public beta', status: 'active' }], parts: [{ title: 'Mail', status: 'done' }] })
  for (const surface of ['desktop', 'mobile', 'vscode'] as const) {
    const ui = await $.ui.mount({ ...PANE, surface })
    await ui.press({ key: 'fold:map' })
    const drawings = await ui.findAll({ type: 'Svg' })
    expect(drawings.length).toBeGreaterThan(0)
    expect(drawings.every(drawing => typeof drawing.props.alt === 'string' && drawing.props.alt !== '')).toBe(true)
    expect(drawings.some(drawing => String(drawing.props.source).includes(GOAL))).toBe(false)
    const buttons = await ui.findAll({ type: 'Button' })
    expect(buttons.some(button => button.text.includes(GOAL))).toBe(false)
    expect(await ui.find({ type: 'Text', text: GOAL })).toBeDefined()
    await ui.press({ key: 'fold:map' })
    await ui.unmount()
  }
})

test('on the phone, the box says to write the note in the conversation', async ($, on) => {
  world(on)
  mock.clock(on, { now: AFTERNOON })
  await $.tool.call({ tool: GOALS, goals: [{ title: GOAL, status: 'active' }] })
  const ui = await $.ui.mount({ ...PANE, surface: 'mobile' })
  await ui.press({ key: `edit:now:goal:${GOAL}` })
  expect(await ui.find({ type: 'Text', text: 'This app has no text box: write your note in the conversation.' })).toBeDefined()
  await ui.unmount()
})

test("the pane's note message reads as the person's note in the conversation", async $ => {
  const row = await $.ui.mount({
    plugin: 'overview',
    surface: 'desktop',
    component: 'UserMessage',
    props: {
      text: `The person left a note on an item of the Overview pane:\n- the goal « ${GOAL} »:\n  « Drop it »\nTake it into account now.`,
      origin: { kind: 'plugin', name: 'overview' },
      isExpanded: false,
    },
  })
  expect(await row.find({ type: 'Text', text: `✎ Your note on « ${GOAL} » · Claude is on it` })).toBeDefined()
  await row.unmount()
})
