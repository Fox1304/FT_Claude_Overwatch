import { expect, mock, test } from 'claude-code/testing'
import type { Engine } from 'claude-code/testing'

import { KEY, PANE, unfold, world } from './world'

const STEPS = 'mcp__overview__your_steps'
const AFTERNOON = new Date(2026, 9, 26, 15, 0).getTime()
const DAY = 24 * 60 * 60 * 1000
const COMMAND = { origin: { kind: 'composer' as const }, presentation: { isFullscreen: false, columns: 100 } }

const addThree = ($: Engine) =>
  $.tool.call({ tool: STEPS, add: [{ title: 'Approve the new Apple agreement' }, { title: 'Pay the Play Console fee' }, { title: 'Send the press kit' }] })

test('Claude archives a step only once it is confirmed, or as obsolete with a reason', async ($, on) => {
  const w = world(on)
  mock.clock(on, { now: AFTERNOON })
  await addThree($)
  const [apple, fee, kit] = w.steps()
  await $.tool.call({ tool: STEPS, confirm: [{ id: apple?.id ?? '', checked: 'Seen in App Store Connect' }] })

  const sent = String(
    (
      await $.tool.call({
        tool: STEPS,
        archive: [
          { id: apple?.id ?? '', why: 'done' },
          { id: fee?.id ?? '', why: 'done' },
          { id: kit?.id ?? '', why: 'obsolete' },
        ],
      })
    ).result,
  )
  expect(sent).toContain(`Not archived: ${fee?.id} (not confirmed yet`)
  expect(sent).toContain(`${kit?.id} (an obsolete step needs a "note" saying why)`)
  expect(sent).toContain(`Archived: ${apple?.id}. The person can undo it.`)
  expect(w.steps().find(step => step.id === apple?.id)).toMatchObject({ archivedBy: 'claude', archivedWhy: 'done', status: 'done' })
  expect(w.steps().find(step => step.id === fee?.id)?.archivedAt).toBeUndefined()

  await $.tool.call({ tool: STEPS, archive: [{ id: kit?.id ?? '', why: 'obsolete', note: 'the launch moved to print only' }] })
  expect(w.steps().find(step => step.id === kit?.id)).toMatchObject({ archivedBy: 'claude', archivedWhy: 'the launch moved to print only' })
  expect(w.toasts.at(-1)).toBe('⊟ Claude archived « Send the press kit » · ↺ Undo in the Overview pane, or /overview undo')
  // Claude archived it itself: nothing is sent back to it.
  expect(w.prompts).toHaveLength(0)
})

test('"remove" archives as obsolete: nothing is ever deleted', async ($, on) => {
  const w = world(on)
  mock.clock(on, { now: AFTERNOON })
  await addThree($)
  const [, fee] = w.steps()
  await $.tool.call({ tool: STEPS, remove: [fee?.id ?? ''] })
  expect(w.steps()).toHaveLength(3)
  expect(w.steps().find(step => step.id === fee?.id)).toMatchObject({ archivedBy: 'claude', archivedWhy: 'no longer needed' })
  const listed = String((await $.tool.call({ tool: STEPS })).result)
  expect(listed).toContain(`- ${fee?.id} · Pay the Play Console fee (obsolete: no longer needed)`)
})

test('a confirmed step moves to the archive after a week instead of being deleted', async ($, on) => {
  const w = world(on)
  mock.clock(on, { now: AFTERNOON })
  await addThree($)
  const [apple] = w.steps()
  await $.tool.call({ tool: STEPS, confirm: [{ id: apple?.id ?? '', checked: 'Seen' }] })
  // Confirmed eight days ago: the next change of the list moves it to the archive.
  w.stored[KEY] = { label: 'myapp', steps: w.steps().map(step => (step.id === apple?.id ? { ...step, doneAt: AFTERNOON - 8 * DAY } : step)) }
  await $.tool.call({ tool: STEPS, add: [{ title: 'Renew the domain' }] })
  expect(w.steps()).toHaveLength(4)
  expect(w.steps().find(step => step.id === apple?.id)).toMatchObject({ status: 'done', archivedBy: 'auto', archivedWhy: 'done' })
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  expect(await ui.find({ key: 'fold:confirmed' })).toBeUndefined()
  await unfold(ui, 'archived')
  expect(await ui.find({ type: 'Text', text: /^Approve the new Apple agreement · confirmed, archived after a week/ })).toBeDefined()
  await ui.unmount()
})

test("an archive is offered for undo: the pane's Undo, or /overview undo, brings it back", async ($, on) => {
  const w = world(on)
  mock.clock(on, { now: AFTERNOON })
  await addThree($)
  const [apple, fee] = w.steps()
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  await ui.press({ key: `archive:move:${apple?.id}` })
  expect(w.toasts.at(-1)).toBe('⊟ Archived « Approve the new Apple agreement » · ↺ Undo in the Overview pane, or /overview undo')
  expect(await ui.find({ type: 'Text', text: '⊟ Archived: Approve the new Apple agreement' })).toBeDefined()
  await ui.press({ key: 'undo-archive' })
  expect(w.steps().find(step => step.id === apple?.id)?.archivedAt).toBeUndefined()
  expect(await ui.find({ key: 'undo-archive' })).toBeUndefined()
  expect(w.toasts.at(-1)).toBe('↺ Restored « Approve the new Apple agreement »')
  await ui.unmount()

  await $.tool.call({ tool: STEPS, archive: [{ id: fee?.id ?? '', why: 'obsolete', note: 'paid by the agency' }] })
  const undone = await $.command.run({ command: 'overview', args: 'undo', ...COMMAND })
  expect(undone).toMatchObject({ text: 'Restored « Pay the Play Console fee ».' })
  expect(w.steps().find(step => step.id === fee?.id)?.archivedAt).toBeUndefined()
  expect(String((await $.command.run({ command: 'overview', args: 'undo', ...COMMAND })).text)).toStartWith('Nothing to undo')
})

test('the undo bar leaves the pane after two minutes; the archive stays restorable', async ($, on) => {
  const w = world(on)
  const clock = mock.clock(on, { now: AFTERNOON })
  await addThree($)
  const [apple] = w.steps()
  let ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  await ui.press({ key: `archive:move:${apple?.id}` })
  await ui.unmount()
  await clock.advance(3 * 60_000)
  ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  expect(await ui.find({ key: 'undo-archive' })).toBeUndefined()
  await unfold(ui, 'archived')
  await ui.press({ key: `restore:${apple?.id}` })
  expect(w.steps().find(step => step.id === apple?.id)?.archivedAt).toBeUndefined()
  await ui.unmount()
})

test('Your move can be searched (accents ignored) and filtered, archive included', async ($, on) => {
  const w = world(on)
  mock.clock(on, { now: AFTERNOON })
  await $.tool.call({
    tool: STEPS,
    add: [
      { title: 'Approve the new Apple agreement', detail: 'App Store Connect, Business' },
      { title: 'Pay the Play Console fee', due: '2026-10-20' },
      { title: 'Choose the launch market', choices: ['France', 'UK'] },
      { title: 'Relire la fiche « Éveil »', due: '2026-12-01' },
    ],
  })
  const [apple] = w.steps()
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  await ui.press({ key: `archive:move:${apple?.id}` })
  expect(await ui.find({ key: 'filter:decide' })).toBeUndefined()
  await ui.press({ key: 'fold:search' })
  expect((await ui.find({ key: 'filter:decide' }))?.text).toBe('○ Decisions · 1')
  expect((await ui.find({ key: 'filter:overdue' }))?.text).toBe('○ Overdue · 1')
  expect((await ui.find({ key: 'filter:archived' }))?.text).toBe('○ Archived · 1')
  expect(await ui.find({ key: 'filter:ticked' })).toBeUndefined()

  await ui.input({ key: 'step-search', text: 'eveil', kind: 'change' })
  expect(await ui.find({ type: 'Text', text: 'FOUND · 1 for « eveil »' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: 'Relire la fiche « Éveil »' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: 'Pay the Play Console fee' })).toBeUndefined()

  await ui.input({ key: 'step-search', text: '', kind: 'change' })
  await ui.press({ key: 'filter:decide' })
  expect(await ui.find({ type: 'Text', text: 'FOUND · 1' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: 'Choose the launch market' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: 'NEEDS YOUR CALL · 1' })).toBeUndefined()

  await ui.press({ key: 'filter:archived' })
  expect(await ui.find({ key: `restore:${apple?.id}` })).toBeDefined()
  await ui.input({ key: 'step-search', text: 'store connect', kind: 'change' })
  expect(await ui.find({ type: 'Text', text: 'FOUND · 1 for « store connect »' })).toBeDefined()

  await ui.press({ key: 'filter-clear' })
  expect(await ui.find({ type: 'Text', text: 'NEEDS YOUR CALL · 1' })).toBeDefined()
  await ui.unmount()

  // The phone has no text box: the filters alone.
  const phone = await $.ui.mount({ ...PANE, surface: 'mobile' })
  expect(await phone.find({ key: 'step-search' })).toBeUndefined()
  expect(await phone.find({ key: 'filter:decide' })).toBeDefined()
  await phone.unmount()
})
