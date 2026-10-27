import type { On } from 'claude-code'
import { expect, mock, test } from 'claude-code/testing'

import { unfold, world } from './world'

const TOOL = 'mcp__overview__goals'
const SURFACES = ['terminal', 'desktop'] as const
const PANE = {
  plugin: 'overview',
  component: 'Pane',
  requestId: 'overview',
  props: {
    title: 'Overview',
    isFocused: false,
    bodyColumns: 48,
    placement: 'dock',
    scroll: { offset: 0, bodyRows: 30 },
    view: {},
  },
} as const

test('the pane shows the goals as now, next and done on every surface', async ($, on) => {
  world(on)
  mock.clock(on, { now: 1000 })
  const sent = await $.tool.call({
    tool: TOOL,
    summary: 'Drops replace coins for the beta',
    goals: [
      { title: 'Rewards give drops', status: 'done' },
      { title: 'The shop shows drop prices', status: 'active', progress: 60 },
      { title: 'Testers get the new build', status: 'planned' },
    ],
  })
  expect(sent.text ?? sent.result).toContain('1 of 3 done')

  for (const surface of SURFACES) {
    const ui = await $.ui.mount({ ...PANE, surface })
    await unfold(ui, 'goals')
    expect(await ui.find({ type: 'Text', text: 'Drops replace coins for the beta' })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: '1/3' })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: 'The shop shows drop prices' })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: '60%' })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: 'Next: Testers get the new build' })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: 'DONE' })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: 'Rewards give drops' })).toBeDefined()
    await ui.unmount()
  }
})

test('finished goals of an earlier request stay under done', async ($, on) => {
  world(on)
  mock.clock(on, { now: 1000 })
  await $.tool.call({
    tool: TOOL,
    goals: [
      { title: 'Rewards give drops', status: 'done' },
      { title: 'A plan that was dropped', status: 'planned' },
    ],
  })
  await $.tool.call({
    tool: TOOL,
    goals: [{ title: 'The site shows the launch date', status: 'active' }],
  })

  for (const surface of SURFACES) {
    const ui = await $.ui.mount({ ...PANE, surface })
    await unfold(ui, 'goals')
    expect(await ui.find({ type: 'Text', text: 'Rewards give drops' })).toBeUndefined()
    await ui.press({ key: 'fold:earlier' })
    expect(await ui.find({ type: 'Text', text: 'Rewards give drops' })).toBeDefined()
    await ui.press({ key: 'fold:earlier' })
    expect(await ui.find({ type: 'Text', text: 'The site shows the launch date' })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: 'A plan that was dropped' })).toBeUndefined()
    expect(await ui.find({ type: 'Text', text: '0/1' })).toBeDefined()
    await ui.unmount()
  }
})

test('an empty list is refused and the pane invites a task', async ($, on) => {
  world(on)
  mock.clock(on)
  const sent = await $.tool.call({ tool: TOOL, goals: [] })
  expect(sent.text ?? sent.deny).toMatch(/at least one goal/)

  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  expect(await ui.find({ type: 'Text', text: /Goals appear here/ })).toBeDefined()
  await ui.unmount()
})

test('the system prompt tells Claude to keep the overview in plain words', async ($, on) => {
  on('prompt.compose', () => ({ sections: [{ id: 'intro', text: 'base', scope: 'shared' }] }))
  const composed = await $.prompt.compose({
    model: 'claude-opus-5-5',
    promptModel: 'claude-opus-5-5',
    surfaces: ['desktop'],
    tools: [TOOL],
    outputStyle: null,
    traits: [],
  })
  const guide = composed.sections.find(section => section.id === 'overview:guide')
  expect(guide?.scope).toBe('session')
  expect(guide?.text).toContain('No file names, commands')
})

test('the conversation shows each update as one quiet line', async $ => {
  const input = {
    goals: [
      { title: 'Rewards give drops', status: 'done' },
      { title: 'The shop shows drop prices', status: 'active' },
    ],
  }
  for (const surface of SURFACES) {
    const row = await $.ui.mount({
      plugin: 'overview',
      surface,
      component: 'ToolUse',
      props: { tool_use_id: 't1', tool: TOOL, input, isRunning: false, isErrored: false, isInterrupted: false },
    })
    expect(await row.find({ type: 'Text', text: 'Overview · 1 of 2 done · The shop shows drop prices' })).toBeDefined()
    await row.unmount()

    const result = await $.ui.mount({
      plugin: 'overview',
      surface,
      component: 'ToolResult',
      props: { tool_use_id: 't1', tool: TOOL, output: 'Overview updated: 1 of 2 done.', isErrored: false },
    })
    expect(await result.find({ type: 'Text' })).toBeUndefined()
    await result.unmount()
  }
})

/** Stands for the engine's own drawing of a row, so a test sees whether the mod let it through. */
const engineDraws = (on: On) =>
  on('ui.render', ($, e) => {
    const { Text } = $.ui.resolve(e)
    const label = e.component === 'Spinner' ? (e.props.message ?? e.props.word) : `engine ${e.component}`

    return <Text>{label}</Text>
  })

const ROW = { isRunning: false, isErrored: false, isInterrupted: false } as const

test('technical steps are hidden, rows meant for the person stay', async ($, on) => {
  engineDraws(on)
  for (const surface of SURFACES) {
    const bash = await $.ui.mount({
      plugin: 'overview',
      surface,
      component: 'ToolUse',
      props: { ...ROW, tool_use_id: 'b1', tool: 'Bash', input: { command: 'ls' } },
    })
    expect(await bash.find({ type: 'Text' })).toBeUndefined()
    await bash.unmount()

    const group = await $.ui.mount({
      plugin: 'overview',
      surface,
      component: 'ToolGroup',
      props: { calls: [], isActive: false, isExpanded: false },
    })
    expect(await group.find({ type: 'Text' })).toBeUndefined()
    await group.unmount()

    const file = await $.ui.mount({
      plugin: 'overview',
      surface,
      component: 'ToolUse',
      props: { ...ROW, tool_use_id: 'f1', tool: 'SendUserFile', input: { files: ['a.png'] } },
    })
    expect(await file.find({ type: 'Text', text: 'engine ToolUse' })).toBeDefined()
    await file.unmount()

    const widget = await $.ui.mount({
      plugin: 'overview',
      surface,
      component: 'ToolResult',
      props: { tool_use_id: 'w1', tool: 'mcp__visualize__show_widget', output: 'ok', isErrored: false },
    })
    expect(await widget.find({ type: 'Text', text: 'engine ToolResult' })).toBeDefined()
    await widget.unmount()
  }
})

test('the pane switch shows the steps again and remembers it', async ($, on) => {
  engineDraws(on)
  const { stored } = world(on)
  mock.clock(on)
  const pane = await $.ui.mount({ ...PANE, surface: 'desktop' })
  expect(await pane.find({ key: 'steps-toggle', text: 'Show technical steps' })).toBeDefined()
  await pane.press({ key: 'steps-toggle' })
  expect(await pane.find({ key: 'steps-toggle', text: 'Hide technical steps' })).toBeDefined()
  expect(stored.showSteps).toBe(true)
  await pane.unmount()

  const bash = await $.ui.mount({
    plugin: 'overview',
    surface: 'desktop',
    component: 'ToolUse',
    props: { ...ROW, tool_use_id: 'b2', tool: 'Bash', input: { command: 'ls' } },
  })
  expect(await bash.find({ type: 'Text', text: 'engine ToolUse' })).toBeDefined()
  await bash.unmount()
})

test('the working line names the current goal instead of the step', async ($, on) => {
  engineDraws(on)
  world(on)
  mock.clock(on)
  const spinner = { word: 'Creating notes.md', message: null, suffix: '…', mode: 'tool-use' } as const

  const before = await $.ui.mount({ plugin: 'overview', surface: 'desktop', component: 'Spinner', props: spinner })
  expect(await before.find({ type: 'Text', text: 'Working' })).toBeDefined()
  await before.unmount()

  await $.tool.call({
    tool: TOOL,
    goals: [{ title: 'The shop shows drop prices', status: 'active' }],
  })
  for (const surface of SURFACES) {
    const during = await $.ui.mount({ plugin: 'overview', surface, component: 'Spinner', props: spinner })
    expect(await during.find({ type: 'Text', text: 'The shop shows drop prices' })).toBeDefined()
    await during.unmount()
  }
})
