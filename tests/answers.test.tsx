import { expect, mock, test } from 'claude-code/testing'

import { PANE, world } from './world'

const STEPS = 'mcp__overview__your_steps'
const AFTERNOON = new Date(2026, 9, 6, 15, 0).getTime()
const ASKS = 'Your SIREN, postal address and phone'

test('a step that asks for words gets an answer box, and Claude receives the answer', async ($, on) => {
  const w = world(on)
  mock.clock(on, { now: AFTERNOON })
  const sent = await $.tool.call({ tool: STEPS, add: [{ title: 'Settle your publisher identity', asks: ASKS, due: '2026-10-09' }] })
  expect(String(sent.result)).toContain(`answer waiting (asks: ${ASKS})`)
  expect(w.phone).toEqual(['myapp needs an answer: Settle your publisher identity'])
  const [step] = w.steps()

  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  expect(await ui.find({ type: 'Text', text: '⌨ ' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: 'Settle your publisher identity' })).toBeDefined()
  expect((await ui.find({ key: `answer:${step?.id}` }))?.props.placeholder).toBe(`${ASKS}…`)
  expect(await ui.find({ type: 'Text', text: /☐ tick when done · ◆ pick one · ⌨ type your answer, then Enter · ✎ tell Claude what to change/ })).toBeDefined()

  await ui.input({ key: `answer:${step?.id}`, text: 'Not registered · 3 rue Exemple, Lyon · 06 00 00 00 00' })
  expect(w.steps()[0]).toMatchObject({ status: 'checked', answer: 'Not registered · 3 rue Exemple, Lyon · 06 00 00 00 00' })
  expect(await ui.find({ type: 'Text', text: /Your answer: « Not registered/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: 'Answered · Claude will pick it up' })).toBeDefined()

  const built = await $.tool.call({ tool: 'mcp__fake__build' })
  const note = (built.context ?? []).join('\n')
  expect(note).toContain('The person answered in the Overview pane')
  expect(note).toContain(`(asked: ${ASKS})`)
  expect(note).toContain('« Not registered · 3 rue Exemple, Lyon · 06 00 00 00 00 »')
  expect(await ui.find({ type: 'Text', text: '✓ Claude knows · acting on it' })).toBeDefined()

  const list = await $.tool.call({ tool: STEPS })
  expect(String(list.result)).toContain('answered « Not registered')
  expect((w.stored['changes:/work/myapp'] as { text: string }[])[0]?.text).toBe('You answered: Settle your publisher identity')
  await ui.unmount()
})

test('an emptied answer is taken back', async ($, on) => {
  const w = world(on)
  mock.clock(on, { now: AFTERNOON })
  await $.tool.call({ tool: STEPS, add: [{ title: 'Send the video links', asks: 'The three YouTube links' }] })
  const [step] = w.steps()
  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  await ui.input({ key: `answer:${step?.id}`, text: 'https://youtu.be/a' })
  await ui.input({ key: `answer:${step?.id}`, text: '   ' })
  expect(w.steps()[0]).toMatchObject({ status: 'todo' })
  expect(w.steps()[0]?.answer).toBeUndefined()
  await ui.unmount()
})

test('on the phone, where there is no box, the step says to answer in the conversation', async ($, on) => {
  world(on)
  mock.clock(on, { now: AFTERNOON })
  await $.tool.call({ tool: STEPS, add: [{ title: 'Send the video links', asks: 'The three YouTube links' }] })
  const ui = await $.ui.mount({ ...PANE, surface: 'mobile' })
  expect(await ui.find({ type: 'Text', text: 'Answer in the conversation: The three YouTube links' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /✎ type your answer in the conversation/ })).toBeDefined()
  await ui.unmount()
})

test('a step cannot both offer choices and ask for words', async ($, on) => {
  const w = world(on)
  mock.clock(on)
  await $.tool.call({ tool: STEPS, add: [{ title: 'Pick a market', choices: ['France', 'UK'], asks: 'Which one' }] })
  expect(w.steps()[0]?.asks).toBeUndefined()
})

test("the pane's own messages read as what the person did", async $ => {
  const cases = [
    [
      'The person decided in the Overview pane:\n- a1 · Choose the icon → "Keep the current icon"\nAct on it.',
      '◆ You chose: Keep the current icon · Claude is on it',
    ],
    [
      'The person answered in the Overview pane:\n- a2 · Settle your publisher identity (asked: Your SIREN)\n  « 123 »\nUse the answer.',
      '✎ You answered: Settle your publisher identity · Claude is on it',
    ],
    ['The person unticked this step (or took back their pick or answer); not done after all:\n- a3 · Pay the fee', '☐ You took back: Pay the fee · Claude knows'],
  ] as const
  for (const [text, line] of cases) {
    const row = await $.ui.mount({
      plugin: 'overview',
      surface: 'desktop',
      component: 'UserMessage',
      props: { text, origin: { kind: 'plugin', name: 'overview' }, isExpanded: false },
    })
    expect(await row.find({ type: 'Text', text: line })).toBeDefined()
    await row.unmount()
  }
})
