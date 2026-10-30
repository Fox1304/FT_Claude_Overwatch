import { expect, mock, test } from 'claude-code/testing'

import { parseCommits, recapOf, sinceWhen, summarize } from '../hooks/recap'
import { KEY, OTHER_KEY, PANE, allText, world } from './world'

const HOUR = 60 * 60_000
/** The person's last visit: the evening before. */
const LAST_SEEN = new Date(2026, 9, 29, 18, 0).getTime()
const MORNING = new Date(2026, 9, 30, 9, 0).getTime()
const START = { cwd: '/work/myapp-worktree', surface: 'terminal', isInteractive: true } as const
const BAND = {
  plugin: 'overview',
  component: 'AbovePrompt',
  props: { hasSurvey: false, isWorking: false, maxRows: 30, bodyColumns: 90, scroll: { offset: 0, bodyRows: 30 }, view: {} },
} as const
const seconds = (at: number) => Math.round(at / 1000)

/** The test's world, with what a session's start needs beneath the mod. */
const startable = (on: Parameters<typeof world>[0]) => {
  const w = world(on)
  on('tool.register', ($, e) => ({ value: { tool: e.name } }))
  on('command.register', ($, e) => ({ value: { command: e.name } }))
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('session.attach', ($, e) => ({ clientId: e.clientId }))
  // The engine's own band, beneath the mod's.
  on('ui.render', { component: 'AbovePrompt' }, ($, e) => {
    const { Text } = $.ui.resolve(e)

    return <Text key="engine-band">engine band</Text>
  })

  return w
}

/** A night of work: commits and helpers in myapp, steps done in otherapp, and uncommitted work in a folder without git. */
const seedNight = (w: ReturnType<typeof world>) => {
  w.stored.lastSeen = LAST_SEEN
  w.stored[KEY] = { label: 'myapp', steps: [] }
  w.stored[OTHER_KEY] = { label: 'otherapp', steps: [] }
  w.git['/work/myapp'] = [
    `${seconds(LAST_SEEN + 5 * HOUR)}\tfix(store): keep the 1.0.1 previews`,
    `${seconds(LAST_SEEN + 3 * HOUR)}\tfeat(store): featured video`,
  ].join('\n')
  w.git['/work/otherapp'] = ''
  w.stored['log:/work/myapp'] = [
    { at: LAST_SEEN + 4 * HOUR, kind: 'helper', title: 'Check the store listing' },
    { at: LAST_SEEN + 2 * HOUR, kind: 'goal', title: 'Testers get the new build' },
  ]
  w.stored['changes:/work/otherapp'] = [
    { at: LAST_SEEN + 7 * HOUR, text: 'Daily streaks → Done', tone: 'done' },
    { at: LAST_SEEN + 6 * HOUR, text: 'You ticked: Pay the fee', tone: 'you' },
    { at: LAST_SEEN + HOUR, text: 'Store page → Not done yet', tone: 'stuck' },
  ]
  // Work nothing committed: Claude and a helper in a folder that is no repository.
  w.stored['log:/work/atelier'] = [
    { at: LAST_SEEN + 9 * HOUR, kind: 'edit', paths: ['/work/atelier/a.md', '/work/atelier/b.md'] },
    { at: LAST_SEEN + 8 * HOUR, kind: 'goal', title: 'The poem collection is drafted' },
    { at: LAST_SEEN + 8 * HOUR, kind: 'helper', title: 'Draft the second poem', isFailed: true },
  ]
  // A project that did not move since the last visit.
  w.stored['changes:/work/quiet'] = [{ at: LAST_SEEN - HOUR, text: 'Old thing → Done', tone: 'done' }]
}

test('the first run shows no recap and only records the time', { timeoutMs: 30_000 }, async ($, on) => {
  const w = startable(on)
  mock.clock(on, { now: MORNING })
  w.stored['changes:/work/otherapp'] = [{ at: MORNING - HOUR, text: 'Daily streaks → Done', tone: 'done' }]
  await $.session.start(START)
  expect(w.stored.lastSeen).toBe(MORNING)
  const band = await $.ui.mount({ ...BAND, surface: 'desktop' })
  expect(await band.find({ key: 'recap-band' })).toBeUndefined()
  await band.unmount()
  const pane = await $.ui.mount({ ...PANE, surface: 'desktop' })
  expect(await pane.find({ key: 'recap-pane' })).toBeUndefined()
  await pane.unmount()
  expect(w.notified).toEqual([])
})

test('a return after a night of work in several projects shows one line per project, newest first, and notifies', { timeoutMs: 30_000 }, async ($, on) => {
  const w = startable(on)
  mock.clock(on, { now: MORNING })
  seedNight(w)
  await $.session.start(START)

  const band = await $.ui.mount({ ...BAND, surface: 'desktop' })
  expect(await band.find({ key: 'recap-band' })).toBeDefined()
  expect(await allText(band)).toContain('engine band')
  const [art] = await band.findAll({ type: 'Svg' })
  expect(art?.props.alt).toBe('Welcome back · 3 projects moved in 15 h')
  expect(String(art?.props.source)).toContain('Welcome back')
  const words = await allText(band)
  const atelier = words.indexOf('atelier')
  const otherapp = words.indexOf('otherapp')
  const myapp = words.indexOf('myapp')
  expect(atelier).toBeGreaterThanOrEqual(0)
  expect(atelier).toBeLessThan(otherapp)
  expect(otherapp).toBeLessThan(myapp)
  expect(words).toContain(' · 1 goal')
  expect(words).toContain(' · 2 commits')
  expect(words).toContain(' · 1 helper (1 failed)')
  expect(words).toContain(' · 2 files')
  expect(words).toContain(' · 1 stuck')
  expect(words).toContain(' — fix(store): keep the 1.0.1 previews')
  // The person's own tick is not news, and the quiet project is left out.
  expect(words).not.toContain('Pay the fee')
  expect(words).not.toContain('quiet')
  await band.unmount()

  expect(w.notified).toEqual([
    {
      title: 'While you were away · 3 projects moved in 15 h',
      text: [
        '• atelier · 1 goal · 1 helper (1 failed) · 2 files — The poem collection is drafted',
        '• otherapp · 1 stuck · 1 done — Daily streaks → Done',
        '• myapp · 1 goal · 2 commits · 1 helper — fix(store): keep the 1.0.1 previews',
      ].join('\n'),
    },
  ])
  expect(w.stored.lastSeen).toBe(MORNING)

  // The same recap waits in the pane until the person closes it; no second notification.
  const pane = await $.ui.mount({ ...PANE, surface: 'terminal' })
  expect(await allText(pane)).toContain('✦ WELCOME BACK · 3 projects moved in 15 h')
  await pane.press({ key: 'recap-hide:pane' })
  expect(await pane.find({ key: 'recap-pane' })).toBeUndefined()
  await pane.unmount()
  expect(w.notified.length).toBe(1)
})

test('restarting right after shows nothing new, and a reload never makes a second recap', { timeoutMs: 30_000 }, async ($, on) => {
  const w = startable(on)
  const clock = mock.clock(on, { now: MORNING })
  seedNight(w)
  await $.session.start(START)
  const band = await $.ui.mount({ ...BAND, surface: 'terminal' })
  expect(await allText(band)).toContain('WELCOME BACK')
  await band.unmount()

  // The mod reloads in the same session: no second look.
  await $.session.start(START)
  expect(w.notified.length).toBe(1)

  await clock.advance(60_000)
  w.me.id = 'S2'
  await $.session.start(START)
  const again = await $.ui.mount({ ...BAND, surface: 'desktop' })
  expect(await again.find({ key: 'recap-band' })).toBeUndefined()
  await again.unmount()
  expect(w.notified.length).toBe(1)
  expect(w.stored.lastSeen).toBe(MORNING + 60_000)
})

test('nothing since the last visit shows nothing and moves the time on; nor does what the person did or watched', { timeoutMs: 30_000 }, async ($, on) => {
  const w = startable(on)
  mock.clock(on, { now: MORNING })
  w.stored.lastSeen = LAST_SEEN
  w.git['/work/myapp'] = `${seconds(LAST_SEEN - HOUR)}\tolder commit`
  w.stored['changes:/work/myapp'] = [{ at: LAST_SEEN + HOUR, text: 'You ticked: Pay the fee', tone: 'you' }]
  // Otherapp moved while the person was typing there: they watched it.
  w.stored['watched:/work/otherapp'] = LAST_SEEN + 3 * HOUR
  w.stored['log:/work/otherapp'] = [{ at: LAST_SEEN + 2 * HOUR, kind: 'goal', title: 'Streaks survive a missed day' }]
  await $.session.start(START)
  const band = await $.ui.mount({ ...BAND, surface: 'desktop' })
  expect(await band.find({ key: 'recap-band' })).toBeUndefined()
  await band.unmount()
  expect(w.notified).toEqual([])
  expect(w.stored.lastSeen).toBe(MORNING)
})

test('where there is no OS notification the app notification carries it, and a run nobody sees keeps it for the person', { timeoutMs: 30_000 }, async ($, on) => {
  const w = startable(on)
  mock.clock(on, { now: MORNING })
  seedNight(w)
  w.os.canNotify = false
  // A run with no one at the prompt: nothing is drawn, the last visit stays.
  await $.session.start({ ...START, surface: null, isInteractive: false })
  expect(w.stored.lastSeen).toBe(LAST_SEEN)
  expect(w.phone).toEqual([])

  await $.session.attach({ surface: 'desktop', clientId: 'desktop-1' })
  const pane = await $.ui.mount({ ...PANE, surface: 'desktop' })
  expect(await pane.find({ key: 'recap-pane' })).toBeDefined()
  await pane.unmount()
  expect(w.notified).toEqual([])
  expect(w.phone.length).toBe(1)
  expect(w.phone[0]).toContain('While you were away · 3 projects moved in 15 h')
  expect(w.phone[0]).toContain('• otherapp · 1 stuck · 1 done')
  expect(w.stored.lastSeen).toBe(MORNING)
})

test('goals reached, helpers finished, work taken on and files changed are logged as they happen, committed or not', { timeoutMs: 30_000 }, async ($, on) => {
  const w = startable(on)
  const clock = mock.clock(on, { now: LAST_SEEN + HOUR })
  w.stored.lastSeen = LAST_SEEN
  on('tool.call', { tool: 'Edit' }, () => ({ result: 'edited' }))
  w.agents.push({ id: 'a1', description: 'Read the old pane code', type: 'Explore', status: 'running' })
  await $.tool.call({ tool: 'mcp__fake__build' })
  await $.tool.call({ tool: 'mcp__overview__goals', summary: 'A recap when the person returns', goals: [{ title: 'The recap shows', status: 'active' }] })
  await $.tool.call({ tool: 'Edit', file_path: '/work/myapp/a.ts', old_string: 'a', new_string: 'b' })
  await $.tool.call({ tool: 'Edit', file_path: '/work/myapp/a.ts', old_string: 'b', new_string: 'c', agentId: 'a1' })
  await clock.advance(10_000)
  w.agents[0] = { ...(w.agents[0] as (typeof w.agents)[number]), status: 'completed' }
  await clock.advance(50_000)
  await $.tool.call({ tool: 'mcp__overview__goals', goals: [{ title: 'The recap shows', status: 'done' }] })
  await $.turn.complete({ answer: 'Done.', durationMs: 1000, isAborted: false, turnId: 't-1', reason: 'answer' })

  const log = w.stored['log:/work/myapp'] as { kind: string; title?: string; paths?: string[] }[]
  expect(log.map(one => [one.kind, one.title ?? one.paths?.join(',')])).toEqual([
    ['edit', '/work/myapp/a.ts'],
    ['goal', 'The recap shows'],
    ['helper', 'Read the old pane code'],
    ['work', 'A recap when the person returns'],
  ])

  // The person comes back a little later, in a new session.
  await clock.advance(10 * 60_000)
  expect(w.stored.lastSeen).toBe(LAST_SEEN)
  w.me.id = 'S2'
  await $.session.start(START)
  const band = await $.ui.mount({ ...BAND, surface: 'terminal' })
  expect(await allText(band)).toContain('myapp · 1 goal · 1 helper · 1 file')
  await band.unmount()
})

test('the recap logic: last visit, what moved, and in which order', async () => {
  expect(sinceWhen(undefined)).toBeUndefined()
  expect(sinceWhen('yesterday')).toBeUndefined()
  expect(sinceWhen(0)).toBeUndefined()
  expect(sinceWhen(LAST_SEEN)).toBe(LAST_SEEN)
  expect(parseCommits(`${seconds(MORNING)}\tfeat: a\tb\n\nnot a commit`)).toEqual([{ at: MORNING, subject: 'feat: a\tb' }])

  const quiet = { root: '/q', label: 'q', feed: [{ at: LAST_SEEN - 1, text: 'x', tone: 'done' as const }], log: [], commits: [] }
  expect(summarize(quiet, LAST_SEEN)).toBeUndefined()
  const own = { root: '/o', label: 'o', feed: [{ at: LAST_SEEN + 1, text: 'You ticked: x', tone: 'you' as const }], log: [], commits: [] }
  expect(summarize(own, LAST_SEEN)).toBeUndefined()
  const early = { root: '/e', label: 'e', feed: [], log: [], commits: [{ at: LAST_SEEN + HOUR, subject: 'early' }] }
  const late = { root: '/l', label: 'l', feed: [], log: [{ at: LAST_SEEN + 2 * HOUR, kind: 'goal' as const, title: 'late' }], commits: [] }
  expect(recapOf([early, quiet, late, own], LAST_SEEN).map(line => [line.label, line.headline])).toEqual([
    ['l', 'late'],
    ['e', 'early'],
  ])
  expect(recapOf([], LAST_SEEN)).toEqual([])
  // Watched after it moved: no news.
  expect(summarize({ ...late, watchedAt: LAST_SEEN + 3 * HOUR }, LAST_SEEN)).toBeUndefined()
})
