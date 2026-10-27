import { expect, mock, test } from 'claude-code/testing'

import { PANE, world } from './world'

const STEPS = 'mcp__overview__your_steps'
const SURFACES = ['terminal', 'desktop', 'mobile'] as const
const AFTERNOON = new Date(2026, 9, 6, 15, 0).getTime()
const MORE = 'Your backups are encrypted with a passphrase that only lives on this Mac.\n\n**How**\n1. Open your password manager.\n2. Save it.'

test('a step opens to its explanation and links to the right section on GitHub', async ($, on) => {
  const w = world(on)
  mock.clock(on, { now: AFTERNOON })
  const sent = await $.tool.call({
    tool: STEPS,
    add: [
      {
        title: 'Save the backup passphrase in your vault',
        more: MORE,
        sources: [
          { label: 'HANDOFF › Backups', path: 'docs/HANDOFF.md', heading: '8.4 Backups and rollback' },
          { label: 'HANDOFF › This week', path: 'docs/HANDOFF.md', heading: 'This week (by Fri 9 Oct)' },
          { label: 'Line 42', path: 'docs/BUILD_LOG.md', line: 42, ref: 'feat/drops' },
          { label: 'Bad', url: 'http://example.com' },
        ],
      },
    ],
  })
  expect(String(sent.result)).toContain('Sources left out')
  const [step] = w.steps()
  expect(step?.links).toEqual([
    { label: 'HANDOFF › Backups', url: 'https://github.com/octocat/myapp/blob/main/docs/HANDOFF.md#84-backups-and-rollback' },
    { label: 'HANDOFF › This week', url: 'https://github.com/octocat/myapp/blob/main/docs/HANDOFF.md#this-week-by-fri-9-oct' },
    { label: 'Line 42', url: 'https://github.com/octocat/myapp/blob/feat%2Fdrops/docs/BUILD_LOG.md#L42' },
  ])

  for (const surface of SURFACES) {
    const pane = await $.ui.mount({ ...PANE, surface })
    expect(await pane.find({ type: 'Markdown' })).toBeUndefined()
    await pane.press({ key: `more:${step?.id}` })
    expect(await pane.find({ type: 'Button', text: '▾ Less' })).toBeDefined()
    expect((await pane.find({ type: 'Markdown' }))?.text).toContain('passphrase that only lives on this Mac')
    const link = await pane.find({ type: 'Link', text: 'HANDOFF › Backups' })
    expect(link?.props.href).toBe('https://github.com/octocat/myapp/blob/main/docs/HANDOFF.md#84-backups-and-rollback')
    await pane.press({ key: `more:${step?.id}` })
    await pane.unmount()
  }
})

test('Claude updates a step: new words, a moved date, more and links', async ($, on) => {
  const w = world(on)
  mock.clock(on, { now: AFTERNOON })
  await $.tool.call({ tool: STEPS, add: [{ title: 'Pay the fee', due: '2026-10-09' }] })
  const [step] = w.steps()
  const sent = await $.tool.call({
    tool: STEPS,
    update: [
      {
        id: step?.id ?? '',
        title: 'Pay the Play Console fee',
        due: 'none',
        more: 'Google asks a one-time fee.',
        sources: [{ label: 'Play Console', url: 'https://play.google.com/console' }],
      },
    ],
  })
  expect(String(sent.result)).toContain('Pay the Play Console fee')
  expect(w.steps()[0]).toMatchObject({
    title: 'Pay the Play Console fee',
    more: 'Google asks a one-time fee.',
    links: [{ label: 'Play Console', url: 'https://play.google.com/console' }],
  })
  expect(w.steps()[0]?.due).toBeUndefined()

  const pane = await $.ui.mount({ ...PANE, surface: 'desktop' })
  expect(await pane.find({ type: 'Button', text: '▸ Details' })).toBeDefined()
  await pane.unmount()
})
