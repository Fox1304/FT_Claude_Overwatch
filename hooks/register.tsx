import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register, RenderChildren, Timer } from 'claude-code'

import type { Board, Change, Goal, Helper, ItemKind, ItemNote, LastArchive, Milestone, OtherProject, Part, SessionCard, StepFilter, YourStep } from '../types'
import { noteLine, noteMessage, noteText, putNote, setNoteStatus, settleNotes } from './notes'
import {
  CHANGES_PREFIX,
  EMPTY_MAP,
  MAP_DESCRIPTION,
  MAP_GUIDE,
  MAP_PREFIX,
  MAP_SCHEMA,
  MAP_TOOL,
  addChanges,
  applyMap,
  describeMap,
  diffMaps,
  parseMap,
  readChanges,
  readMap,
} from './map'
import {
  BEFORE_PLAN,
  HEARTBEAT_MS,
  SESSION_FORGET_MS,
  SESSION_PREFIX,
  SESSION_STALE_MS,
  cardFor,
  cardLine,
  countOf,
  describeAction,
  forgetGone,
  record,
} from './activity'
import {
  EMPTY,
  GOALS_DESCRIPTION,
  GOALS_GUIDE,
  GOALS_SCHEMA,
  GOALS_TOOL,
  HIDDEN_NOTE,
  archive,
  isBlocked,
  merge,
  parseGoals,
  stepsFor,
  technicalTitles,
} from './goals'
import {
  STORE_PREFIX,
  YOUR_STEPS_DESCRIPTION,
  YOUR_STEPS_GUIDE,
  YOUR_STEPS_SCHEMA,
  YOUR_STEPS_TOOL,
  answerKind,
  applyOps,
  choose,
  describeList,
  dueReminders,
  dayName,
  dayOf,
  dueText,
  githubBase,
  groupSteps,
  isEmpty,
  labelFor,
  linksFor,
  markHeard,
  markReminded,
  noteFor,
  parseOps,
  phoneLine,
  prune,
  readStored,
  reminderLine,
  reply,
  sortSteps,
  summarizeCall,
  ticksFor,
  toggle,
  unheard,
  waitedText,
  FILTERS,
  activeSteps,
  archiveIn,
  archivedSteps,
  filterSteps,
  restoreIn,
} from './your-steps'

const PANE = 'overview'
const TITLE = 'Overview'

const STEPS_KEY = 'showSteps'
/** How often ticks, other projects and helpers are looked at. */
const SWEEP_MS = 10_000
const PICKUP_DEFAULT_SECONDS = 30
/** Tool calls without an Overview update before Claude is reminded. */
const NUDGE_AFTER = 12

const board = atom({ plugin: 'overview', key: 'board' } as const, EMPTY)
const isWorking = atom({ plugin: 'overview', key: 'isWorking' } as const, false)
const showSteps = atom({ plugin: 'overview', key: 'showSteps' } as const, false)
const shownCalls = atom({ plugin: 'overview', key: 'shownCalls' } as const, [])
const yourSteps = atom({ plugin: 'overview', key: 'yourSteps' } as const, [])
const project = atom({ plugin: 'overview', key: 'project' } as const, '')
const projectLabel = atom({ plugin: 'overview', key: 'projectLabel' } as const, '')
const otherProjects = atom({ plugin: 'overview', key: 'otherProjects' } as const, [])
const helpers = atom({ plugin: 'overview', key: 'helpers' } as const, [])
const otherSessions = atom({ plugin: 'overview', key: 'otherSessions' } as const, [])
const activity = atom({ plugin: 'overview', key: 'activity' } as const, {})
const openGoals = atom({ plugin: 'overview', key: 'openGoals' } as const, [])
const unfolded = atom({ plugin: 'overview', key: 'unfolded' } as const, [])
const openedSteps = atom({ plugin: 'overview', key: 'openSteps' } as const, [])
const projectMap = atom({ plugin: 'overview', key: 'projectMap' } as const, EMPTY_MAP)
const changes = atom({ plugin: 'overview', key: 'changes' } as const, [])
const editing = atom({ plugin: 'overview', key: 'editing' } as const, '')
const editProblem = atom({ plugin: 'overview', key: 'editProblem' } as const, '')
const notes = atom({ plugin: 'overview', key: 'notes' } as const, [])
const lastArchive = atom({ plugin: 'overview', key: 'lastArchive' } as const, null)
const stepSearch = atom({ plugin: 'overview', key: 'stepSearch' } as const, '')
const stepFilter = atom({ plugin: 'overview', key: 'stepFilter' } as const, 'all')

/** How long the pane offers to undo the last archive; /overview undo works until the next one. */
const UNDO_MS = 2 * 60_000

/** Tools whose rows are for the person (files, widgets, plans, findings): never hidden. */
const FOR_THE_PERSON = new Set([
  'AskUserQuestion',
  'ExitPlanMode',
  'ReportFindings',
  'SendUserFile',
  'mcp__ccd_session__spawn_task',
])

/** Prompts that are not the person asking for something new. */
const NOT_THE_PERSON = new Set(['plugin', 'task-notification', 'auto-continuation'])

const isForThePerson = (tool: string, input: unknown) => {
  if (FOR_THE_PERSON.has(tool) || tool.endsWith('__show_widget')) return true
  if (tool !== 'Artifact') return false
  const action = (input as { action?: unknown } | null)?.action

  return action === undefined || action === 'publish' || action === 'open'
}

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)

/** Module variables: a reload drops timers, starts the count afresh and reads the options again. */
let sweeping: Timer | undefined
let pickupMs = PICKUP_DEFAULT_SECONDS * 1000
let phoneAlerts = true
let callsSinceGoals = 0
let lastCard = ''
let lastCardAt = 0

/** Shows or hides the steps (flips them without a value) and remembers it across sessions. */
const setSteps = async ($: EngineInterface, value?: boolean) => {
  const isShown = await update($, showSteps, shown => value ?? !shown)
  await $.store.set(STEPS_KEY, isShown)

  return isShown
}

/** The store key of this project's steps: the repository's main root, so worktrees share them. */
const projectKey = async ($: EngineInterface) => {
  const known = await read($, project)
  if (known !== '' && (await read($, projectLabel)) !== '') return known
  const repo = await $.session.repo()
  const root = repo?.root ?? (await $.session.root())
  const key = `${STORE_PREFIX}${root}`
  await update($, projectLabel, () => labelFor(root, repo?.remote ?? null))
  await update($, project, () => key)

  return key
}

/** Reads this project's steps back from the store (another session may have changed them). */
const loadYourSteps = async ($: EngineInterface) => {
  const { steps } = readStored(await $.store.get(await projectKey($)))
  if (!same(await read($, yourSteps), steps)) await update($, yourSteps, () => steps)

  return steps
}

/** Reads every other project's open steps. */
const loadOtherProjects = async ($: EngineInterface) => {
  const own = await projectKey($)
  const keys = (await $.store.keys()).filter(key => key.startsWith(STORE_PREFIX) && key !== own)
  const found: OtherProject[] = []
  for (const key of keys) {
    const { label, steps } = readStored(await $.store.get(key))
    const open = activeSteps(steps).filter(step => step.status !== 'done')
    if (open.length > 0) found.push({ key, label: label ?? labelFor(key.slice(STORE_PREFIX.length), null), steps: open })
  }
  if (!same(await read($, otherProjects), found)) await update($, otherProjects, () => found)
}

/** Applies a change to the freshest list of a project in the store, so parallel sessions keep each other's steps. */
const changeStepsAt = async ($: EngineInterface, key: string, change: (list: YourStep[]) => YourStep[]) => {
  const own = await projectKey($)
  const now = await $.clock.now()
  const stored = readStored(await $.store.get(key))
  const steps = prune(change(stored.steps), now)
  const label = key === own ? await read($, projectLabel) : stored.label
  await $.store.set(key, { label, steps })
  if (key === own) {
    await update($, yourSteps, () => steps)
  } else {
    await loadOtherProjects($)
  }

  return steps
}

/** The project's root, out of its steps' store key. */
const rootOf = (key: string) => key.slice(STORE_PREFIX.length)

/** Reads this project's map and feed back from the store (another session may have changed them). */
const loadMap = async ($: EngineInterface) => {
  const root = rootOf(await projectKey($))
  const map = readMap(await $.store.get(`${MAP_PREFIX}${root}`))
  const feed = readChanges(await $.store.get(`${CHANGES_PREFIX}${root}`))
  if (!same(await read($, projectMap), map)) await update($, projectMap, () => map)
  if (!same(await read($, changes), feed)) await update($, changes, () => feed)

  return map
}

/** Adds lines to a project's feed (this one, or the one whose step was ticked from here). */
const recordChanges = async ($: EngineInterface, key: string, added: Change[]) => {
  if (added.length === 0) return
  const storeKey = `${CHANGES_PREFIX}${rootOf(key)}`
  const feed = addChanges(readChanges(await $.store.get(storeKey)), added)
  await $.store.set(storeKey, feed)
  if (key === (await projectKey($))) await update($, changes, () => feed)
}

/** Picks an option of a decision, in this project or another one. */
const chooseStep = async ($: EngineInterface, key: string, id: string, choice: string) => {
  ensureSweep($)
  const session = await $.session.id()
  const from = await projectKey($)
  const now = await $.clock.now()
  const list = await changeStepsAt($, key, steps => choose(steps, id, choice, session, from, now))
  const step = list.find(one => one.id === id)
  if (step?.answer !== undefined) await recordChanges($, key, [{ at: now, text: `You chose: ${step.answer}`, tone: 'you' }])
}

/** Answers a step that asks for words, in this project or another one; an empty answer takes it back. */
const answerStep = async ($: EngineInterface, key: string, id: string, words: string) => {
  ensureSweep($)
  const session = await $.session.id()
  const from = await projectKey($)
  const now = await $.clock.now()
  const list = await changeStepsAt($, key, steps => reply(steps, id, words, session, from, now))
  const step = list.find(one => one.id === id)
  if (step?.answer !== undefined) await recordChanges($, key, [{ at: now, text: `You answered: ${step.title}`, tone: 'you' }])
}

/** Publishes what this session is doing, when it changed or as a heartbeat; never fails its caller. */
const publishCard = async ($: EngineInterface) => {
  try {
    await writeCard($)
  } catch (error) {
    $.ui.log(`overview: session card not published: ${String(error)}`, { to: 'debug' })
  }
}

const writeCard = async ($: EngineInterface) => {
  const id = await $.session.id()
  const now = await $.clock.now()
  await projectKey($)
  const card = cardFor(id, await read($, projectLabel), await read($, board), await read($, isWorking), await read($, yourSteps), now)
  const { updatedAt: _at, ...words } = card
  const said = JSON.stringify(words)
  if (said === lastCard && now - lastCardAt < HEARTBEAT_MS) return
  lastCard = said
  lastCardAt = now
  await $.store.set(`${SESSION_PREFIX}${id}`, card)
}

/** Reads the other open sessions' cards, and forgets the ones gone for an hour. */
const loadOtherSessions = async ($: EngineInterface) => {
  const own = `${SESSION_PREFIX}${await $.session.id()}`
  const now = await $.clock.now()
  const found: SessionCard[] = []
  for (const key of (await $.store.keys()).filter(one => one.startsWith(SESSION_PREFIX) && one !== own)) {
    const card = (await $.store.get(key)) as SessionCard | undefined
    const age = now - (card?.updatedAt ?? 0)
    if (age >= SESSION_FORGET_MS) await $.store.delete(key)
    else if (card !== undefined && age < SESSION_STALE_MS) found.push(card)
  }
  found.sort((a, b) => a.project.localeCompare(b.project) || a.id.localeCompare(b.id))
  if (!same(await read($, otherSessions), found)) await update($, otherSessions, () => found)
}

/** Reminds the person's phone of steps that have waited a day, or are due by tomorrow. */
const remind = async ($: EngineInterface) => {
  if (!phoneAlerts) return
  const now = await $.clock.now()
  const due = dueReminders(await read($, yourSteps), now)
  if (due.length === 0) return
  await changeYourSteps($, steps => markReminded(steps, due, now))
  await notifyPhone($, reminderLine(await read($, projectLabel), sortSteps(due), now))
}

const toggleFold = async ($: EngineInterface, part: string) => {
  await update($, unfolded, open => ((open ?? []).includes(part) ? (open ?? []).filter(one => one !== part) : [...(open ?? []), part]))
}

const toggleStepOpen = async ($: EngineInterface, id: string) => {
  await update($, openedSteps, open => ((open ?? []).includes(id) ? (open ?? []).filter(one => one !== id) : [...(open ?? []), id]))
}

/** The repository's GitHub address, which links to its documents start from. */
const repoBase = async ($: EngineInterface) => githubBase((await $.session.repo())?.remote ?? null)

const toggleGoalOpen = async ($: EngineInterface, title: string) => {
  await update($, openGoals, open => ((open ?? []).includes(title) ? (open ?? []).filter(one => one !== title) : [...(open ?? []), title]))
}

/** Notes what a tool call did, under the goal Claude is working on. */
const recordAction = async ($: EngineInterface, tool: string, input: unknown, failed: boolean) => {
  const label = describeAction(tool, input)
  if (label === null) return
  const active = (await read($, board)).goals.find(goal => goal.status === 'active')?.title ?? BEFORE_PLAN
  await update($, activity, log => record(log ?? {}, active, label, failed))
}

const tickStep = async ($: EngineInterface, key: string, id: string) => {
  ensureSweep($)
  const session = await $.session.id()
  const from = await projectKey($)
  const now = await $.clock.now()
  const list = await changeStepsAt($, key, steps => toggle(steps, id, session, from, now))
  const step = list.find(one => one.id === id)
  if (step?.status === 'checked') await recordChanges($, key, [{ at: now, text: `You ticked: ${step.title}`, tone: 'you' }])
}

/** Archives a step the person no longer needs: it leaves the active list, and Claude hears of it like a tick. */
const archiveStep = async ($: EngineInterface, key: string, id: string) => {
  ensureSweep($)
  const session = await $.session.id()
  const from = await projectKey($)
  const now = await $.clock.now()
  const list = await changeStepsAt($, key, steps => archiveIn(steps, id, session, from, now))
  const step = list.find(one => one.id === id)
  if (step?.archivedAt !== now) return
  await recordChanges($, key, [{ at: now, text: `You archived: ${step.title}`, tone: 'you' }])
  await offerUndo($, { key, ids: [id], titles: [step.title], by: 'you', at: now })
}

/** Keeps the last archive for its undo, and says so in a toast. */
const offerUndo = async ($: EngineInterface, done: LastArchive) => {
  await update($, lastArchive, () => done)
  const what = done.titles.length === 1 ? `« ${done.titles[0]} »` : `${done.titles.length} steps`
  $.ui.toast(`⊟ ${done.by === 'claude' ? 'Claude archived' : 'Archived'} ${what} · ↺ Undo in the Overview pane, or /overview undo`, { timeoutMs: 8000 })
}

/** Brings back every step of the last archive, as it was. */
const undoArchive = async ($: EngineInterface) => {
  const last = await read($, lastArchive)
  if (last === null) return 'Nothing to undo: no step was archived since this session started.'
  const session = await $.session.id()
  const from = await projectKey($)
  const now = await $.clock.now()
  await changeStepsAt($, last.key, steps => last.ids.reduce((list, id) => restoreIn(list, id, session, from, now), steps))
  await update($, lastArchive, () => null)
  await recordChanges($, last.key, last.titles.map(title => ({ at: now, text: `You restored: ${title}`, tone: 'you' as const })))
  const what = last.titles.length === 1 ? `« ${last.titles[0]} »` : `${last.titles.length} steps`
  $.ui.toast(`↺ Restored ${what}`)

  return `Restored ${what}.`
}

const dismissUndo = async ($: EngineInterface) => {
  await update($, lastArchive, () => null)
}

const setSearch = async ($: EngineInterface, words: string) => {
  await update($, stepSearch, () => words.slice(0, 120))
}

const setFilter = async ($: EngineInterface, filter: StepFilter) => {
  await update($, stepFilter, current => (current === filter ? 'all' : filter))
}

const clearSearch = async ($: EngineInterface) => {
  await update($, stepSearch, () => '')
  await update($, stepFilter, () => 'all')
}

/** Brings an archived step back to the active list. */
const restoreStep = async ($: EngineInterface, key: string, id: string) => {
  ensureSweep($)
  const session = await $.session.id()
  const from = await projectKey($)
  const now = await $.clock.now()
  const list = await changeStepsAt($, key, steps => restoreIn(steps, id, session, from, now))
  const step = list.find(one => one.id === id)
  if (step !== undefined && step.archivedAt === undefined) await recordChanges($, key, [{ at: now, text: `You restored: ${step.title}`, tone: 'you' }])
}

/** Running subagents, for the pane. */
const refreshHelpers = async ($: EngineInterface) => {
  const running: Helper[] = (await $.agent.list())
    .filter(agent => agent.status === 'running')
    .map(agent => ({ id: agent.id, description: agent.description }))
  if (!same(await read($, helpers), running)) await update($, helpers, () => running)
}

/** Tells the person's phone, through the app's own notifications (sent only when they are away). */
const notifyPhone = async ($: EngineInterface, message: string) => {
  if (!phoneAlerts || message === '') return
  try {
    await $.tool.call({ tool: 'PushNotification', message, status: 'proactive' })
  } catch (error) {
    $.ui.log(`overview: phone alert not sent: ${String(error)}`, { to: 'debug' })
  }
}

/**
 * Reads other sessions' changes back, and while Claude is idle tells it about the ticks this
 * session picks up in a turn of its own, once the person has stopped ticking for `pickupMs`
 * (never when it is 0). While Claude works, its next tool result carries them instead.
 */
const sweep = async ($: EngineInterface) => {
  const list = await loadYourSteps($)
  await loadOtherProjects($)
  await refreshHelpers($)
  await publishCard($)
  await loadOtherSessions($)
  await loadMap($)
  await remind($)
  await settle($, () => false)
  if (!(await read($, isWorking))) {
    const queued = (await read($, notes)).filter(note => note.status === 'queued')
    if (queued.length > 0) await deliverNotes($, queued.map(note => note.item))
  }
  if (pickupMs <= 0 || unheard(list).length === 0 || (await read($, isWorking))) return
  const waiting = ticksFor(list, await $.session.id(), await projectKey($))
  const lastTick = Math.max(0, ...waiting.map(step => step.tickedAt ?? 0))
  if (waiting.length === 0 || (await $.clock.now()) - lastTick < pickupMs) return
  await changeYourSteps($, steps => markHeard(steps, waiting))
  void $.prompt.submit({ text: noteFor(waiting, (await read($, board)).goals) })
}

const changeYourSteps = async ($: EngineInterface, change: (list: YourStep[]) => YourStep[]) =>
  changeStepsAt($, await projectKey($), change)

/** The ticks this session picks up that Claude has not heard, marked heard as they are handed over. */
const takeTicks = async ($: EngineInterface) => {
  const list = await read($, yourSteps)
  if (unheard(list).length === 0) return []
  const waiting = ticksFor(list, await $.session.id(), await projectKey($))
  if (waiting.length > 0) await changeYourSteps($, steps => markHeard(steps, waiting))

  return waiting
}

/** An item of the pane a note can be left on. */
type ItemRef = { item: string; kind: ItemKind; title: string; stepId?: string; stepKey?: string }

/** Opens the edit box of an item (`where` tells apart the places one item is drawn), or closes it when open. */
const toggleEdit = async ($: EngineInterface, box: string) => {
  await update($, editProblem, () => '')
  await update($, editing, open => (open === box ? '' : box))
}

const closeEdit = async ($: EngineInterface) => {
  await update($, editProblem, () => '')
  await update($, editing, () => '')
}

/** Sends the notes on these items to Claude: a turn of their own when it is idle, its next step when it works. */
const deliverNotes = async ($: EngineInterface, items: readonly string[]) => {
  const waiting = (await read($, notes)).filter(note => items.includes(note.item) && note.status !== 'sent')
  if (waiting.length === 0) return
  const keys = waiting.map(note => note.item)
  if (await read($, isWorking)) {
    await update($, notes, list => setNoteStatus(list ?? [], keys, 'queued'))

    return
  }
  await update($, notes, list => setNoteStatus(list ?? [], keys, 'sending'))
  try {
    // A prompt that did not enter answers with `drop` (the reason) rather than throwing.
    const sent = await $.prompt.submit({ text: noteMessage(waiting) })
    if (sent.drop !== undefined) throw new Error(sent.drop)
    await update($, notes, list => setNoteStatus(list ?? [], keys, 'sent'))
  } catch (error) {
    await update($, notes, list => setNoteStatus(list ?? [], keys, 'error', String(error instanceof Error ? error.message : error).slice(0, 160)))
  }
}

/** Takes the person's note on an item: empty, it asks for words; else it goes to Claude. */
const sendNote = async ($: EngineInterface, box: string, ref: ItemRef, words: string) => {
  const text = noteText(words)
  if (text === undefined) {
    await update($, editProblem, () => box)

    return
  }
  const now = await $.clock.now()
  await update($, notes, list => putNote(list ?? [], { ...ref, text, status: 'sending', at: now }))
  await closeEdit($)
  await recordChanges($, ref.stepKey ?? (await projectKey($)), [{ at: now, text: `Your note on ${ref.title}`, tone: 'you' }])
  await deliverNotes($, [ref.item])
}

const retryNote = async ($: EngineInterface, item: string) => deliverNotes($, [item])

const dropNote = async ($: EngineInterface, item: string) => {
  await update($, notes, list => (list ?? []).filter(note => note.item !== item))
}

/** The queued notes Claude has not read, marked sent as they ride on its next tool result. */
const takeNotes = async ($: EngineInterface) => {
  const queued = (await read($, notes)).filter(note => note.status === 'queued')
  if (queued.length > 0) await update($, notes, list => setNoteStatus(list ?? [], queued.map(note => note.item), 'sent'))

  return queued
}

/** Drops delivered notes on the items Claude has just reworked. */
const settle = async ($: EngineInterface, reworked: (note: ItemNote) => boolean) => {
  const now = await $.clock.now()
  const list = await read($, notes)
  const kept = settleNotes(list, reworked, now)
  if (kept.length !== list.length) await update($, notes, () => kept)
}

/** Starts the periodic look, once per load. */
const ensureSweep = ($: EngineInterface) => {
  sweeping ??= $.clock.every(SWEEP_MS, () => {
    sweep($).catch(error => $.ui.log(`overview: ${String(error)}`, { to: 'debug' }))
  })
}

/** What rides on Claude's tool result: the person's ticks, and a reminder when the pane has gone stale. */
const contextFor = async ($: EngineInterface, tool: string) => {
  const notes: string[] = []
  const ticks = await takeTicks($)
  if (ticks.length > 0) notes.push(noteFor(ticks, (await read($, board)).goals))
  const queued = await takeNotes($)
  if (queued.length > 0) notes.push(noteMessage(queued))
  callsSinceGoals = tool === GOALS_TOOL ? 0 : callsSinceGoals + 1
  if (callsSinceGoals >= NUDGE_AFTER) {
    callsSinceGoals = 0
    const hasGoals = (await read($, board)).goals.length > 0
    notes.push(
      hasGoals
        ? `The Overview pane has not changed for a while. Update it with ${GOALS_TOOL}: mark reached goals done, set the active one and its progress.`
        : `You have been working for a while and the person's Overview pane is empty. Send the top-level goals with ${GOALS_TOOL}, as plain-word results.`,
    )
  }

  return notes
}

const bar = (done: number, total: number, width: number) => {
  const filled = total === 0 ? 0 : Math.round((done / total) * width)

  return '█'.repeat(filled) + '░'.repeat(Math.max(0, width - filled))
}

export const register: Register = (on, options) => {
  const seconds = Number(options.pickupAfterSeconds ?? PICKUP_DEFAULT_SECONDS)
  pickupMs = Number.isFinite(seconds) ? Math.max(0, seconds) * 1000 : PICKUP_DEFAULT_SECONDS * 1000
  phoneAlerts = options.phoneAlerts !== false

  on('session.start', async ($, e, next) => {
    await $.tool.register({ name: 'goals', description: GOALS_DESCRIPTION, inputSchema: GOALS_SCHEMA })
    await $.tool.register({ name: 'your_steps', description: YOUR_STEPS_DESCRIPTION, inputSchema: YOUR_STEPS_SCHEMA })
    await $.tool.register({ name: 'project_map', description: MAP_DESCRIPTION, inputSchema: MAP_SCHEMA })
    await $.command.register({
      name: 'overview',
      description: 'Show what Claude is doing, will do and has finished; "steps" shows or hides the technical steps',
      argumentHint: '[steps [on|off]]',
      immediate: true,
    })
    const stored = await $.store.get(STEPS_KEY)
    await update($, showSteps, () => stored === true)
    await loadYourSteps($)
    await loadOtherProjects($)
    await loadMap($)
    ensureSweep($)
    void $.ui.open({ id: PANE, title: TITLE })

    return next(e)
  })

  on('command.run', { command: 'overview' }, async ($, e) => {
    const [word, value] = e.args.trim().toLowerCase().split(/\s+/)
    if (word === 'undo') return { text: await undoArchive($) }
    if (word === 'steps') {
      const isShown = await setSteps($, value === 'on' ? true : value === 'off' ? false : undefined)

      return {
        text: isShown
          ? 'Technical steps are shown in the conversation.'
          : 'Technical steps are hidden from the conversation.',
      }
    }
    await $.ui.open({ id: PANE, title: TITLE })

    return { text: 'Overview pane opened. /overview steps shows or hides the technical steps.' }
  })

  on('prompt.compose', async ($, e, next) => {
    const composed = await next(e)
    if (!e.tools.includes(GOALS_TOOL)) return composed
    const text =
      ((await read($, showSteps)) ? GOALS_GUIDE : GOALS_GUIDE + HIDDEN_NOTE) +
      (e.tools.includes(YOUR_STEPS_TOOL) ? YOUR_STEPS_GUIDE : '') +
      (e.tools.includes(MAP_TOOL) ? MAP_GUIDE : '')

    return {
      sections: [...composed.sections, { id: 'overview:guide', text, scope: 'session' }],
    }
  })

  on('tool.describe', { tool: 'mcp__overview__goals' }, async ($, e, next) => ({ ...(await next(e)), isDeferred: false }))
  on('tool.describe', { tool: 'mcp__overview__your_steps' }, async ($, e, next) => ({ ...(await next(e)), isDeferred: false }))
  on('tool.check', { tool: 'mcp__overview__goals' }, () => ({ decision: 'allow' }))
  on('tool.check', { tool: 'mcp__overview__your_steps' }, () => ({ decision: 'allow' }))
  on('tool.describe', { tool: 'mcp__overview__project_map' }, async ($, e, next) => ({ ...(await next(e)), isDeferred: false }))
  on('tool.check', { tool: 'mcp__overview__project_map' }, () => ({ decision: 'allow' }))

  on('tool.call', { tool: 'mcp__overview__project_map' }, async ($, e) => {
    const input = parseMap(e as unknown as Record<string, unknown>)
    if (input.milestones === undefined && input.parts === undefined) return { result: describeMap(await loadMap($)) }
    const root = rootOf(await projectKey($))
    const now = await $.clock.now()
    const before = readMap(await $.store.get(`${MAP_PREFIX}${root}`))
    const after = applyMap(before, input, now)
    await $.store.set(`${MAP_PREFIX}${root}`, after)
    await update($, projectMap, () => after)
    await settle($, note => (note.kind === 'part' && input.parts !== undefined) || (note.kind === 'milestone' && input.milestones !== undefined))
    await recordChanges($, await projectKey($), diffMaps(before, after, now))

    return { result: `Map updated.\n\n${describeMap(after)}` }
  })

  on('tool.call', async ($, e, next) => {
    ensureSweep($)
    if (String(e.tool) === 'Artifact' && isForThePerson('Artifact', e)) {
      await update($, shownCalls, ids => [...(ids ?? []), e.tool_use_id].slice(-100))
    }
    const ran = await next(e)
    if (e.agentId !== undefined || ran.deny !== undefined) return ran
    try {
      await recordAction($, String(e.tool), e, ran.isError === true)
      if (String(e.tool) === 'Agent') await refreshHelpers($)
      const notes = await contextFor($, String(e.tool))

      return notes.length === 0 ? ran : { ...ran, context: [...(ran.context ?? []), ...notes] }
    } catch (error) {
      $.ui.log(`overview: ${String(error)}`, { to: 'debug' })

      return ran
    }
  })

  on('tool.call', { tool: 'mcp__overview__goals' }, async ($, e) => {
    if (e.agentId !== undefined) {
      return { result: 'Only the main conversation keeps the overview; carry on with your task.' }
    }
    const args = e as unknown as Record<string, unknown>
    const goals = parseGoals(args.goals)
    if (goals.length === 0) {
      return { deny: 'Give at least one goal, each with a title and a status.' }
    }
    const technical = technicalTitles(goals)
    if (technical.length > 0) {
      return {
        deny: `These titles read as technical steps; rewrite them as results the person gets, in plain words, and send the list again: ${technical.map(title => `"${title}"`).join(', ')}`,
      }
    }
    const summary = typeof args.summary === 'string' ? args.summary.trim() : ''
    const now = await $.clock.now()
    const merged = await update($, board, prev => merge(prev ?? EMPTY, goals, summary, now))
    await settle($, note => note.kind === 'goal')
    const firstActive = goals.find(goal => goal.status === 'active')?.title
    await update($, activity, log => {
      const { [BEFORE_PLAN]: early, ...rest } = log ?? {}
      const moved = early !== undefined && firstActive !== undefined && rest[firstActive] === undefined
      const kept = moved ? { ...rest, [firstActive]: early } : early === undefined ? rest : { ...rest, [BEFORE_PLAN]: early }

      return forgetGone(kept, merged)
    })
    await publishCard($)
    const done = goals.filter(goal => goal.status === 'done').length
    const steps = await read($, yourSteps)
    const unmatched = goals.filter(goal => goal.status === 'waiting' && stepsFor(goal, steps).length === 0)
    const hint =
      unmatched.length > 0
        ? `\n\n${unmatched.map(goal => `"${goal.title}"`).join(', ')} waits on no known step of the person: add the step with ${YOUR_STEPS_TOOL} and name its id in "waitingFor".`
        : ''

    return { result: `Overview updated: ${done} of ${goals.length} done.${hint}` }
  })

  on('tool.call', { tool: 'mcp__overview__your_steps' }, async ($, e) => {
    const ops = parseOps(e as unknown as Record<string, unknown>)
    if (isEmpty(ops)) return { result: describeList(await loadYourSteps($)) }
    const base = await repoBase($)
    const dropped: string[] = []
    for (const step of [...ops.add, ...ops.update]) {
      if (step.sources === undefined) continue
      const made = linksFor(step.sources, base)
      step.links = made.links
      dropped.push(...made.dropped)
    }
    const now = await $.clock.now()
    let unknown: string[] = []
    let added: YourStep[] = []
    let archived: YourStep[] = []
    let refused: { id: string; reason: string }[] = []
    const before = await loadYourSteps($)
    const touched = new Set([...ops.update.map(one => one.id), ...ops.archive.map(one => one.id), ...ops.confirm.map(one => one.id), ...ops.reopen.map(one => one.id)])
    await settle($, note => note.kind === 'step' && note.stepId !== undefined && touched.has(note.stepId))
    const list = await changeYourSteps($, steps => {
      const applied = applyOps(steps, ops, now, () => crypto.randomUUID().slice(0, 6))
      unknown = applied.unknown
      added = applied.added
      archived = applied.archived
      refused = applied.refused

      return applied.list
    })
    const reopened = ops.reopen.flatMap(one => {
      const step = before.find(found => found.id === one.id)

      return step === undefined ? [] : [{ title: step.title, note: one.note }]
    })
    await notifyPhone($, phoneLine(await read($, projectLabel), added, reopened))
    const titleOf = (id: string) => before.find(step => step.id === id)?.title
    await recordChanges($, await projectKey($), [
      ...ops.confirm.flatMap(one => (titleOf(one.id) ? [{ at: now, text: `${titleOf(one.id)} → Done`, tone: 'done' as const }] : [])),
      ...reopened.map(one => ({ at: now, text: `${one.title} → Not done yet`, tone: 'stuck' as const })),
      ...archived.map(one => ({ at: now, text: `Claude archived: ${one.title} (${one.archivedWhy === 'done' ? 'done' : 'obsolete'})`, tone: 'info' as const })),
    ])
    if (archived.length > 0) await offerUndo($, { key: await projectKey($), ids: archived.map(one => one.id), titles: archived.map(one => one.title), by: 'claude', at: now })
    const warning =
      (unknown.length > 0 ? `\n\nUnknown ids, nothing changed for them: ${unknown.join(', ')}.` : '') +
      (refused.length > 0 ? `\n\nNot archived: ${refused.map(one => `${one.id} (${one.reason})`).join('; ')}.` : '') +
      (archived.length > 0 ? `\n\nArchived: ${archived.map(one => one.id).join(', ')}. The person can undo it.` : '') +
      (dropped.length > 0
        ? `\n\nSources left out (not an https address, or a repository file outside GitHub): ${dropped.join(', ')}.`
        : '')

    return { result: describeList(list) + warning }
  })

  on('prompt.submit', async ($, e, next) => {
    ensureSweep($)
    await update($, isWorking, () => true)
    callsSinceGoals = 0
    if (!NOT_THE_PERSON.has(e.origin.kind)) await update($, board, prev => archive(prev ?? EMPTY))
    let ticks: string | undefined
    if (!(e.origin.kind === 'plugin' && e.origin.name === 'overview')) {
      try {
        const waiting = unheard(await loadYourSteps($))
        if (waiting.length > 0) {
          await changeYourSteps($, steps => markHeard(steps, waiting))
          ticks = noteFor(waiting, (await read($, board)).goals)
        }
      } catch (error) {
        $.ui.log(`overview: ${String(error)}`, { to: 'debug' })
      }
    }
    try {
      return await next(ticks === undefined ? e : { ...e, context: [...(e.context ?? []), ticks] })
    } catch (error) {
      // The prompt never started a turn: Claude is not working after all.
      await update($, isWorking, () => false)
      throw error
    }
  })

  on('turn.complete', async ($, e, next) => {
    if (e.agentId === undefined) await update($, isWorking, () => false)
    await refreshHelpers($)
    await publishCard($)
    if (e.agentId === undefined) {
      const queued = (await read($, notes)).filter(note => note.status === 'queued')
      if (queued.length > 0) await deliverNotes($, queued.map(note => note.item))
    }

    return next(e)
  })

  on('session.end', async ($, e, next) => {
    await $.store.delete(`${SESSION_PREFIX}${e.sessionId}`)
    lastCard = ''
    if (e.reason === 'clear') {
      await update($, board, () => EMPTY)
      await update($, isWorking, () => false)
      await update($, activity, () => ({}))
    }

    return next(e)
  })

  on('ui.render', { component: 'ToolUse' }, async ($, e, next) => {
    const { Box, Text } = $.ui.resolve(e)
    if (e.props.tool === YOUR_STEPS_TOOL) {
      return (
        <Box>
          <Text dimColor wrap="truncate-end">
            {summarizeCall(e.props.input)}
          </Text>
        </Box>
      )
    }
    if (e.props.tool !== GOALS_TOOL) {
      const isShown = (await read($, showSteps)) || isForThePerson(e.props.tool, e.props.input)

      return isShown ? next(e) : <Box display="none" />
    }
    const goals = parseGoals((e.props.input as Record<string, unknown> | null)?.goals)
    const done = goals.filter(goal => goal.status === 'done').length
    const active = goals.find(goal => goal.status === 'active')
    const waits = goals.some(goal => goal.status === 'waiting')

    return (
      <Box>
        <Text dimColor wrap="truncate-end">
          Overview · {done} of {goals.length} done{active ? ` · ${active.title}` : ''}
          {waits ? ' · waiting for you' : ''}
        </Text>
      </Box>
    )
  })

  on('ui.render', { component: 'ToolResult' }, async ($, e, next) => {
    const { Box } = $.ui.resolve(e)
    const { tool, tool_use_id: id } = e.props
    const isShown =
      tool !== GOALS_TOOL &&
      tool !== YOUR_STEPS_TOOL &&
      ((await read($, showSteps)) ||
        (tool === 'Artifact' ? (await read($, shownCalls)).includes(id) : isForThePerson(tool, null)))

    return isShown ? next(e) : <Box display="none" />
  })

  on('ui.render', { component: 'UserMessage', props: { origin: { kind: 'plugin' } } }, ($, e, next) => {
    const { origin, text, isExpanded } = e.props
    if (origin.kind !== 'plugin' || origin.name !== 'overview' || isExpanded) return next(e)
    const { Box, Text } = $.ui.resolve(e)
    const titles = (part: string) =>
      [...part.matchAll(/^- \S+ · (.+?)(?: \(asked: .*?\))?(?: \(the goal .*\))?$/gm)].map(match => (match[1] ?? '').replace(/ → ".*"$/, ''))
    const lines = text.split('\n\n').flatMap(part => {
      const names = titles(part).join(', ')
      if (part.startsWith('The person answered')) return [`✎ You answered: ${names} · Claude is on it`]
      if (part.startsWith('The person decided')) {
        const picks = [...part.matchAll(/→ "(.+)"/g)].map(match => match[1]).join(', ')

        return [`◆ You chose: ${picks} · Claude is on it`]
      }
      if (part.startsWith('The person ticked')) return [`☑ You ticked: ${names} · Claude is checking`]
      if (part.startsWith('The person unticked')) return [`☐ You took back: ${names} · Claude knows`]
      if (part.startsWith('The person archived')) return [`⊟ You archived: ${names} · Claude knows`]
      if (part.startsWith('The person restored')) return [`↺ You restored: ${names} · Claude knows`]
      if (part.startsWith('The person left')) return [noteLine(part)]

      return []
    })

    return (
      <Box flexDirection="column">
        {lines.map((line, index) => (
          <Text key={`said:${index}`} dimColor wrap="wrap">
            {line}
          </Text>
        ))}
      </Box>
    )
  })

  on('ui.render', { component: 'ToolGroup' }, async ($, e, next) => {
    const { Box } = $.ui.resolve(e)

    return (await read($, showSteps)) ? next(e) : <Box display="none" />
  })

  on('ui.render', { component: 'ToolProgress' }, async ($, e, next) =>
    (await read($, showSteps)) ? next(e) : next({ ...e, props: { ...e.props, hint: '' } }),
  )

  on('ui.render', { component: 'Spinner' }, async ($, e, next) => {
    if (await read($, showSteps)) return next(e)
    const active = (await read($, board)).goals.find(goal => goal.status === 'active')
    if (active !== undefined) return next({ ...e, props: { ...e.props, message: active.title } })
    if (e.surface === 'desktop') return next({ ...e, props: { ...e.props, message: 'Working' } })

    return next(e)
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const table = $.ui.resolve(e)
    const { Box, Button, Link, Markdown, Text } = table
    // The table answers for every element name; the phone app draws no text field yet.
    const Input = e.surface !== 'mobile' && 'Input' in table ? table.Input : undefined
    const map = await read($, projectMap)
    const feed = await read($, changes)
    const projectName = await read($, projectLabel)
    const { summary, goals, earlier }: Board = await read($, board)
    const working = await read($, isWorking)
    const stepsShown = await read($, showSteps)
    const mine = await read($, yourSteps)
    const others = await read($, otherProjects)
    const helping = await read($, helpers)
    const sessions = await read($, otherSessions)
    const log = await read($, activity)
    const opened = await read($, openGoals)
    const open = await read($, unfolded)
    const expanded = await read($, openedSteps)
    const editBox = await read($, editing)
    const problem = await read($, editProblem)
    const itemNotes = await read($, notes)
    const undoable = await read($, lastArchive)
    const search = await read($, stepSearch)
    const filter = await read($, stepFilter)
    const own = await read($, project)
    const clock = await $.clock.now()
    /** Room inside a card: its border and padding take four cells. */
    const inner = Math.max(12, e.props.bodyColumns - 4)
    const projectTitle = projectName !== '' ? projectName.charAt(0).toUpperCase() + projectName.slice(1) : 'This project'

    /**
     * One meaning per colour and icon, everywhere in the pane: Claude's work, what needs the person,
     * what is late, soon, new, later, done, the plan, notes to Claude, and what happens elsewhere.
     */
    const TONE = {
      claude: { color: 'claude', icon: '●' },
      call: { color: 'error', icon: '◆' },
      overdue: { color: 'error', icon: '⚠' },
      soon: { color: 'warning', icon: '⏱' },
      waiting: { color: 'warning', icon: '◐' },
      fresh: { color: 'suggestion', icon: '✦' },
      later: { color: 'inactive', icon: '○' },
      done: { color: 'success', icon: '✓' },
      plan: { color: 'permission', icon: '◉' },
      note: { color: 'suggestion', icon: '✎' },
      elsewhere: { color: 'promptBorder', icon: '⋯' },
    } as const
    type Tone = keyof typeof TONE

    const shelf = archivedSteps(mine)
    const openSteps = activeSteps(mine).filter(step => step.status !== 'done')
    const groups = groupSteps(openSteps, clock)
    const confirmed = activeSteps(mine)
      .filter(step => step.status === 'done')
      .sort((a, b) => (b.doneAt ?? 0) - (a.doneAt ?? 0))
      .slice(0, 3)
    const overdue = groups.find(group => group.id === 'overdue')?.steps.length ?? 0

    const planned = goals.filter(goal => goal.status === 'planned')
    const done = goals
      .filter(goal => goal.status === 'done')
      .sort((a, b) => (b.doneAt ?? 0) - (a.doneAt ?? 0))
    const isAllDone = goals.length > 0 && done.length === goals.length
    const isBlockedOnYou = goals.some(goal => isBlocked(goal, mine))
    const activeGoal = goals.find(goal => goal.status === 'active')
    const waitingGoal = goals.find(goal => isBlocked(goal, mine))
    const percent = goals.length === 0 ? 0 : Math.round(((activeGoal?.progress !== undefined ? done.length + activeGoal.progress / 100 : done.length) / goals.length) * 100)

    const state = isAllDone
      ? { tone: 'done' as Tone, text: 'ALL DONE' }
      : working
        ? { tone: 'claude' as Tone, text: 'WORKING' }
        : isBlockedOnYou
          ? { tone: 'waiting' as Tone, text: 'WAITING FOR YOU' }
          : helping.length > 0
            ? { tone: 'elsewhere' as Tone, text: 'HELPERS WORKING' }
            : goals.length > 0
              ? { tone: 'later' as Tone, text: 'PAUSED · YOUR TURN' }
              : { tone: 'later' as Tone, text: 'READY WHEN YOU ARE' }

    /** "14:05" today, "Mon 14:05" another day. */
    const clockText = (at: number) => {
      const date = new Date(at)
      const time = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`

      return dayOf(at) === dayOf(clock) ? time : `${dayName(dayOf(at)).split(' ')[0]} ${time}`
    }

    /** A section card: an icon and a bold coloured title, a dim note on the right, then the body. */
    const card = (key: string, tone: Tone, title: string, note: string | undefined, body: RenderChildren[]) => (
      <Box key={`card:${key}`} flexDirection="column" borderStyle="round" borderColor={TONE[tone].color} paddingX={1} marginTop={1}>
        <Box key={`head:${key}`} justifyContent="space-between">
          <Text bold color={TONE[tone].color} wrap="truncate-end">
            {TONE[tone].icon} {title}
          </Text>
          {note !== undefined && <Text dimColor> {note}</Text>}
        </Box>
        {body}
      </Box>
    )

    /** A small heading inside a card, in the colour of its meaning. */
    const label = (key: string, text: string, tone?: Tone) => (
      <Box key={`label:${key}`} marginTop={1}>
        <Text bold color={tone ? TONE[tone].color : undefined} dimColor={tone === undefined || tone === 'later'}>
          {tone ? `${TONE[tone].icon} ` : ''}
          {text}
        </Text>
      </Box>
    )

    /** The fold switch of a part of the pane, with its count. */
    const fold = (part: string, text: string) => (
      <Box key={`fold:${part}`} marginTop={1}>
        <Button key={`fold:${part}`} plain dimColor label={`${open.includes(part) ? '▾' : '▸'} ${text}`} onPress={() => toggleFold($, part)} />
      </Box>
    )

    /**
     * One item's line: an optional control (tick or icon) on the left, the title as plain text in the middle,
     * so it can be selected, and the ✎ edit button on the right, apart from the text.
     */
    const itemLine = (where: string, ref: ItemRef, lead: RenderChildren, title: RenderChildren, trail?: RenderChildren) => (
      <Box key={`line:${where}:${ref.item}`} flexDirection="row">
        {lead}
        <Box key={`title:${where}:${ref.item}`} flexGrow={1} flexShrink={1}>
          {title}
        </Box>
        {trail}
        <Box key={`edit-at:${where}:${ref.item}`} marginLeft={1}>
          <Button
            key={`edit:${where}:${ref.item}`}
            plain
            dimColor={editBox !== `${where}::${ref.item}`}
            label="✎"
            onPress={() => toggleEdit($, `${where}::${ref.item}`)}
          />
        </Box>
      </Box>
    )

    /** The edit box of an item while open, and the state of the note left on it. */
    const itemEdit = (where: string, ref: ItemRef) => {
      const box = `${where}::${ref.item}`
      const note = itemNotes.find(one => one.item === ref.item)
      const isOpen = editBox === box
      const status =
        note === undefined
          ? null
          : note.status === 'sending'
            ? <Text color={TONE.note.color} wrap="wrap">✎ Sending your note to Claude…</Text>
            : note.status === 'queued'
              ? <Text color={TONE.note.color} wrap="wrap">✎ Note queued · Claude reads it at its next step</Text>
              : note.status === 'sent'
                ? <Text color={TONE.note.color} wrap="wrap">✎ Note sent · Claude is reworking this</Text>
                : (
                    <Box key={`note-error:${where}:${ref.item}`} flexDirection="column">
                      <Text color="error" wrap="wrap">
                        ⚠ Your note was not sent{note.error ? `: ${note.error}` : ''}
                      </Text>
                      <Box key={`note-actions:${where}:${ref.item}`} columnGap={2}>
                        <Button key={`note-retry:${where}:${ref.item}`} plain label="↻ Retry" onPress={() => retryNote($, ref.item)} />
                        <Button key={`note-drop:${where}:${ref.item}`} plain dimColor label="✕ Discard" onPress={() => dropNote($, ref.item)} />
                      </Box>
                    </Box>
                  )

      return (
        <Box key={`edit-box:${where}:${ref.item}`} flexDirection="column" paddingLeft={2}>
          {note !== undefined && !isOpen && (
            <Box key={`note:${where}:${ref.item}`} flexDirection="column">
              {status}
              <Text dimColor wrap="wrap">
                « {note.text} »
              </Text>
            </Box>
          )}
          {isOpen && (
            <Box key={`editor:${where}:${ref.item}`} flexDirection="column" borderStyle="round" borderColor={TONE.note.color} paddingX={1}>
              <Box key={`editor-head:${where}:${ref.item}`} justifyContent="space-between">
                <Text bold color={TONE.note.color}>
                  ✎ Tell Claude what to change
                </Text>
                <Button key={`edit-close:${where}:${ref.item}`} plain dimColor role="dismiss" label="✕" onPress={() => closeEdit($)} />
              </Box>
              <Text dimColor wrap="wrap">
                No longer relevant, needs rework, wrong date… Claude reworks the item with your note.
              </Text>
              {Input !== undefined ? (
                <Input
                  key={`note-input:${where}:${ref.item}`}
                  placeholder="Your note for Claude…"
                  value={note?.status === 'error' ? note.text : undefined}
                  submitLabel="send to Claude"
                  autoFocus
                  onSubmit={words => sendNote($, box, ref, words)}
                />
              ) : (
                <Text color="warning" wrap="wrap">
                  This app has no text box: write your note in the conversation.
                </Text>
              )}
              {problem === box && (
                <Text color="error" wrap="wrap">
                  ⚠ Type what should change first, or close the box with ✕.
                </Text>
              )}
            </Box>
          )}
        </Box>
      )
    }

    /** What a step's deadline says, in the colour of how pressing it is. */
    const deadline = (step: YourStep) => {
      const day = step.due ?? step.decideBy?.slice(0, 10)
      if (day === undefined || step.status !== 'todo') return null
      const { text, isPressing } = dueText(day, clock)
      const tone: Tone = text.startsWith('overdue') ? 'overdue' : isPressing ? 'soon' : 'later'

      return (
        <Text key={`due:${step.id}`} color={TONE[tone].color} dimColor={tone === 'later'} wrap="wrap">
          {tone === 'later' ? '⏱' : TONE[tone].icon} {text}
        </Text>
      )
    }

    /** The "More" switch under a step, and what it opens: the explanation and its links. */
    const stepMore = (step: YourStep) => {
      const links = step.links ?? []
      if (step.more === undefined && links.length === 0) return null
      const isOpen = expanded.includes(step.id)

      return (
        <Box key={`more:${step.id}`} flexDirection="column">
          <Button
            key={`more:${step.id}`}
            plain
            dimColor={!isOpen}
            label={isOpen ? '▾ Less' : links.length > 0 && step.more === undefined ? '▸ Where to read more' : '▸ More'}
            onPress={() => toggleStepOpen($, step.id)}
          />
          {isOpen && (
            <Box key={`more-card:${step.id}`} flexDirection="column" borderStyle="round" borderColor="subtle" paddingX={1}>
              {step.more !== undefined && <Markdown key={`more-text:${step.id}`} text={step.more} />}
              {links.length > 0 && (
                <Box key={`more-links:${step.id}`} flexDirection="column" marginTop={step.more !== undefined ? 1 : 0}>
                  {links.map((link, index) => (
                    <Box key={`link:${step.id}:${index}`}>
                      <Text color="suggestion">↗ </Text>
                      <Link href={link.url} label={link.label} />
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </Box>
      )
    }

    /** The lines under a step: when, where, what Claude said, where it stands. */
    const stepAbout = (step: YourStep, pickedUpBy: string, isBrief: boolean) => {
      const waited = step.due === undefined && step.status === 'todo' ? waitedText(step, clock) : undefined
      const told = step.answer !== undefined ? 'Claude knows · acting on it' : 'Claude knows · confirming'
      const isHeard = step.heard === 'checked' && (step.answer ?? '') === (step.heardAnswer ?? '')

      return (
        <Box key={`about:${step.id}`} flexDirection="column" paddingLeft={2}>
          {deadline(step)}
          {step.choices !== undefined && step.defaultChoice !== undefined && step.status === 'todo' && (
            <Text dimColor wrap="wrap">
              No answer keeps: {step.defaultChoice}
            </Text>
          )}
          {waited !== undefined && (
            <Text dimColor wrap="wrap">
              {waited}
            </Text>
          )}
          {!isBrief && step.detail !== undefined && step.status === 'todo' && (
            <Text dimColor wrap="wrap">
              {step.detail}
            </Text>
          )}
          {step.note !== undefined && step.status === 'todo' && (
            <Text color="warning" wrap="wrap">
              ↺ Claude: {step.note}
            </Text>
          )}
          {stepMore(step)}
          {step.status === 'checked' && (
            <Text color={isHeard ? TONE.done.color : TONE.note.color} wrap="wrap">
              {isHeard ? `✓ ${told}` : `${step.answer === undefined ? 'Ticked' : step.asks !== undefined ? 'Answered' : 'Picked'} · ${pickedUpBy}`}
            </Text>
          )}
        </Box>
      )
    }

    /** One step: its control, its title as text, its edit button, then how to answer it and what stands under it. */
    const stepItem = (step: YourStep, at: string, where: string, hotkey: string | undefined, pickedUpBy: string, isBrief: boolean) => {
      const ref: ItemRef = { item: `step:${step.id}`, kind: 'step', title: step.title, stepId: step.id, stepKey: at }
      const kind = answerKind(step)
      const isChecked = step.status === 'checked'
      const lead =
        kind === 'tick' ? (
          <Box key={`tick-at:${where}:${step.id}`} marginRight={1}>
            <Button key={`${where === 'other' ? 'other' : 'tick'}:${step.id}`} plain label={isChecked ? '☑' : '☐'} hotkey={hotkey} onPress={() => tickStep($, at, step.id)} />
          </Box>
        ) : (
          <Text key={`icon:${where}:${step.id}`} color={isChecked ? TONE.done.color : kind === 'pick' ? TONE.call.color : TONE.note.color}>
            {isChecked ? '☑ ' : kind === 'pick' ? '◆ ' : '⌨ '}
          </Text>
        )
      const title = (
        <Text bold={!isBrief} dimColor={isChecked} wrap="wrap">
          {step.title}
        </Text>
      )

      const archiveButton =
        step.status === 'done' ? undefined : (
          <Box key={`archive-at:${where}:${step.id}`} marginLeft={1}>
            <Button key={`archive:${where}:${step.id}`} plain dimColor label="⊟" onPress={() => archiveStep($, at, step.id)} />
          </Box>
        )

      return (
        <Box key={`row:${where}:${step.id}`} flexDirection="column" marginTop={isBrief ? 0 : 1}>
          {itemLine(where, ref, lead, title, archiveButton)}
          {kind === 'pick' && (
            <Box key={`choices:${step.id}`} flexDirection="row" flexWrap="wrap" columnGap={2} paddingLeft={2}>
              {(step.choices ?? []).map((choice, index) => (
                <Button
                  key={`${where === 'other' ? 'other-pick' : 'pick'}:${step.id}:${index}`}
                  plain
                  label={`${step.answer === choice ? '●' : '○'} ${choice}`}
                  onPress={() => chooseStep($, at, step.id, choice)}
                />
              ))}
            </Box>
          )}
          {kind === 'type' && (
            <Box key={`answer-box:${step.id}`} flexDirection="column" paddingLeft={2}>
              {step.answer !== undefined && (
                <Text wrap="wrap">
                  <Text dimColor>Your answer: </Text>« {step.answer} »
                </Text>
              )}
              {Input !== undefined ? (
                <Input
                  key={`${where === 'other' ? 'other-answer' : 'answer'}:${step.id}`}
                  placeholder={step.answer !== undefined ? 'Type to change your answer' : `${step.asks}…`}
                  submitLabel="send to Claude"
                  onSubmit={words => answerStep($, at, step.id, words)}
                />
              ) : (
                step.answer === undefined && (
                  <Text dimColor wrap="wrap">
                    Answer in the conversation: {step.asks}
                  </Text>
                )
              )}
            </Box>
          )}
          {itemEdit(where, ref)}
          {stepAbout(step, pickedUpBy, isBrief)}
        </Box>
      )
    }

    /** A step that needs the person soon, in its own card framed in the colour of its urgency. */
    const stepCard = (step: YourStep, tone: Tone, hotkey: string | undefined) => (
      <Box key={`step-card:${step.id}`} flexDirection="column" borderStyle="round" borderColor={TONE[tone].color} borderDimColor paddingX={1} marginTop={1}>
        {stepItem(step, own, 'move', hotkey, 'Claude will pick it up', false)}
      </Box>
    )

    /** The "what was done" switch and list under a goal. */
    const goalActions = (goal: Goal, where: string) => {
      const actions = log[goal.title]
      const count = countOf(actions)
      if (count === 0) return null
      const isOpen = opened.includes(goal.title)

      return (
        <Box key={`acts:${where}:${goal.title}`} flexDirection="column" paddingLeft={2}>
          <Button
            key={`acts:${where}:${goal.title}`}
            plain
            dimColor
            label={`${isOpen ? '▾' : '▸'} ${count === 1 ? '1 thing done' : `${count} things done`}`}
            onPress={() => toggleGoalOpen($, goal.title)}
          />
          {isOpen &&
            (actions ?? []).map((action, index) => (
              <Text key={`act:${where}:${goal.title}:${index}`} dimColor={!action.failed} color={action.failed ? 'warning' : undefined} wrap="wrap">
                {'  · '}
                {action.label}
                {action.count > 1 ? ` (×${action.count})` : ''}
                {action.failed ? ' — did not work' : ''}
              </Text>
            ))}
        </Box>
      )
    }

    /** One goal: its icon, its title as text, its progress, its edit button, then what it waits on. */
    const goalItem = (goal: Goal, where: string, withActions: boolean) => {
      const ref: ItemRef = { item: `goal:${goal.title}`, kind: 'goal', title: goal.title }
      const tone: Tone = goal.status === 'done' ? 'done' : goal.status === 'active' ? 'claude' : goal.status === 'waiting' ? 'waiting' : 'later'
      const blocked = isBlocked(goal, mine)
      const named = stepsFor(goal, mine)

      return (
        <Box key={`goal:${where}:${goal.title}`} flexDirection="column">
          {itemLine(
            where,
            ref,
            <Text key={`goal-icon:${where}:${goal.title}`} color={TONE[tone].color}>
              {TONE[tone].icon}{' '}
            </Text>,
            <Text bold={goal.status === 'active'} dimColor={goal.status === 'done'} wrap="wrap">
              {goal.title}
            </Text>,
            goal.progress !== undefined && goal.status === 'active' ? (
              <Text key={`goal-progress:${where}:${goal.title}`} color={TONE.claude.color}>
                {' '}
                {goal.progress}%
              </Text>
            ) : undefined,
          )}
          {goal.status === 'waiting' && (
            <Box key={`wait:${where}:${goal.title}`} paddingLeft={2}>
              <Text color={blocked ? TONE.waiting.color : TONE.done.color} wrap="wrap">
                {blocked
                  ? `↳ Waiting for you${named.length > 0 ? `: ${named.filter(step => step.status === 'todo').map(step => step.title).join(' · ')}` : ''}`
                  : '↳ You did your part · Claude carries on'}
              </Text>
            </Box>
          )}
          {itemEdit(where, ref)}
          {withActions && goalActions(goal, where)}
        </Box>
      )
    }

    const barWidth = Math.max(8, Math.min(28, inner - 16))
    const filled = Math.round((percent / 100) * barWidth)
    const recent = feed.filter(change => clock - change.at < 3 * 24 * 60 * 60 * 1000).slice(0, 3)
    const toneOfChange = { done: 'done', stuck: 'overdue', progress: 'soon', you: 'note', info: 'plan' } as const
    const plan = map.milestones.filter((_, index) => index >= Math.max(0, map.milestones.findIndex(one => one.status === 'active') - 1)).slice(0, 3)
    const milestoneTone = (milestone: Milestone): Tone => (milestone.status === 'done' ? 'done' : milestone.status === 'active' ? 'plan' : 'later')

    /** NOW: what Claude is on, how far along, what comes next, what just changed, and the plan as one line. */
    const nowCard = card('now', state.tone, state.text, projectTitle, [
      summary !== '' && summary !== activeGoal?.title && (
        <Box key="aim" marginTop={1}>
          <Text dimColor wrap="wrap">
            {summary}
          </Text>
        </Box>
      ),
      activeGoal !== undefined || waitingGoal !== undefined ? (
        <Box key="current" flexDirection="column" marginTop={summary !== '' ? 0 : 1}>
          {goalItem((activeGoal ?? waitingGoal) as Goal, 'now', false)}
        </Box>
      ) : (
        goals.length === 0 && (
          <Box key="empty" marginTop={1}>
            <Text dimColor wrap="wrap">
              Goals appear here when Claude starts a task.
            </Text>
          </Box>
        )
      ),
      goals.length > 0 && (
        <Box key="progress" marginTop={1}>
          <Text>
            <Text color={TONE.done.color}>{'█'.repeat(filled)}</Text>
            <Text color="subtle">{'░'.repeat(barWidth - filled)}</Text>
            <Text dimColor>
              {' '}
              {done.length} of {goals.length} done
            </Text>
          </Text>
        </Box>
      ),
      planned.length > 0 && label('next', 'NEXT', 'later'),
      ...planned.slice(0, 2).map(goal => goalItem(goal, 'next', false)),
      helping.length > 0 && (
        <Box key="helpers-line" marginTop={1}>
          <Text color={TONE.elsewhere.color} wrap="wrap">
            {TONE.elsewhere.icon} {helping.length === 1 ? '1 helper' : `${helping.length} helpers`} working in the background
          </Text>
        </Box>
      ),
      recent.length > 0 && label('just', 'JUST NOW'),
      ...recent.map((change, index) => (
        <Box key={`just:${index}`} justifyContent="space-between">
          <Box key={`just-text:${index}`} flexShrink={1}>
            <Text wrap="wrap">
              <Text color={TONE[toneOfChange[change.tone]].color}>{TONE[toneOfChange[change.tone]].icon} </Text>
              {change.text}
            </Text>
          </Box>
          <Text dimColor> {clockText(change.at)}</Text>
        </Box>
      )),
      plan.length > 0 && (
        <Box key="plan" marginTop={1} flexWrap="wrap">
          <Text color={TONE.plan.color} bold>
            {TONE.plan.icon} PLAN{' '}
          </Text>
          {plan.map((milestone, index) => (
            <Text key={`plan:${index}`} wrap="wrap">
              {index > 0 ? <Text color="subtle"> ─ </Text> : ''}
              <Text color={TONE[milestoneTone(milestone)].color}>{TONE[milestoneTone(milestone)].icon} </Text>
              <Text bold={milestone.status === 'active'} dimColor={milestone.status !== 'active'}>
                {milestone.title}
                {milestone.date && milestone.status !== 'done' ? ` · ${dayName(milestone.date)}` : ''}
              </Text>
            </Text>
          ))}
        </Box>
      ),
    ])

    /** YOUR MOVE: decisions, overdue, this week and new steps in cards; the rest folded. */
    const answerDay = (step: YourStep) => step.decideBy?.slice(0, 10) ?? step.due
    const fortnight = dayOf(clock + 14 * 24 * 60 * 60 * 1000)
    const callsNow = openSteps
      .filter(step => step.choices !== undefined && (answerDay(step) === undefined || (answerDay(step) as string) <= fortnight))
      .sort((a, b) => (answerDay(a) ?? '9999').localeCompare(answerDay(b) ?? '9999'))
    const actions = openSteps.filter(step => !callsNow.includes(step))
    const byUrgency = groupSteps(actions, clock)
    const isNew = (step: YourStep) => clock - step.createdAt < 24 * 60 * 60 * 1000
    const newSteps = byUrgency.filter(group => group.id === 'undated').flatMap(group => group.steps.filter(isNew))
    const nowGroups: { id: string; label: string; tone: Tone; steps: YourStep[] }[] = [
      ...byUrgency.filter(group => group.id === 'overdue').map(group => ({ id: group.id, label: 'OVERDUE', tone: 'overdue' as Tone, steps: group.steps })),
      ...byUrgency.filter(group => group.id === 'soon').map(group => ({ id: group.id, label: 'THIS WEEK', tone: 'soon' as Tone, steps: group.steps })),
      ...(newSteps.length > 0 ? [{ id: 'undated', label: 'NEW', tone: 'fresh' as Tone, steps: newSteps }] : []),
    ]
    const laterSteps = sortSteps(
      byUrgency.flatMap(group => (group.id === 'later' ? group.steps : group.id === 'undated' ? group.steps.filter(step => !isNew(step)) : [])),
    )
    const nowCount = callsNow.length + nowGroups.reduce((sum, group) => sum + group.steps.length, 0)
    let hotkeys = 0
    const moveTone: Tone = overdue > 0 ? 'overdue' : callsNow.length > 0 ? 'call' : nowCount > 0 ? 'soon' : 'done'
    /** An archived step: what it was, who archived it and when, and Restore. */
    const archivedRow = (step: YourStep) => (
      <Box key={`archived:${step.id}`} flexDirection="row">
        <Box key={`archived-title:${step.id}`} flexGrow={1} flexShrink={1}>
          <Text dimColor wrap="wrap">
            {step.title} · {step.archivedBy === 'claude' ? `archived by Claude (${step.archivedWhy === 'done' ? 'done' : step.archivedWhy})` : step.archivedBy === 'auto' ? 'confirmed, archived after a week' : 'archived'} {clockText(step.archivedAt ?? clock)}
          </Text>
        </Box>
        <Box key={`restore-at:${step.id}`} marginLeft={1}>
          <Button key={`restore:${step.id}`} plain label="↺ Restore" onPress={() => restoreStep($, own, step.id)} />
        </Box>
      </Box>
    )

    /** The last archive, offered for undo for a couple of minutes. */
    const undoShown = undoable !== null && clock - undoable.at < UNDO_MS
    const undoBar = undoShown && undoable !== null && (
      <Box key="undo-bar" flexDirection="row" marginTop={1}>
        <Box key="undo-text" flexGrow={1} flexShrink={1}>
          <Text color={TONE.note.color} wrap="wrap">
            ⊟ {undoable.by === 'claude' ? 'Claude archived' : 'Archived'}: {undoable.titles.join(', ')}
          </Text>
        </Box>
        <Box key="undo-actions" marginLeft={1} columnGap={2}>
          <Button key="undo-archive" plain label="↺ Undo" onPress={() => void undoArchive($)} />
          <Button key="undo-dismiss" plain dimColor label="✕" onPress={() => dismissUndo($)} />
        </Box>
      </Box>
    )

    /** Search and filter: a box where the surface has one, and a chip per filter that has steps. */
    const isNarrowed = search.trim() !== '' || filter !== 'all'
    const matches = filterSteps(mine, filter, search, clock)
    const counts = Object.fromEntries(FILTERS.map(one => [one.id, filterSteps(mine, one.id, '', clock).length]))
    const finder =
      openSteps.length + shelf.length < 2
        ? []
        : [
            Input !== undefined && (
              <Box key="search" marginTop={1}>
                <Input key="step-search" placeholder="Search your steps…" value={search} onInput={words => setSearch($, words)} onSubmit={words => setSearch($, words)} />
              </Box>
            ),
            <Box key="filters" flexDirection="row" flexWrap="wrap" columnGap={2} marginTop={Input !== undefined ? 0 : 1}>
              {FILTERS.filter(one => one.id === 'all' || one.id === filter || (counts[one.id] ?? 0) > 0).map(one => (
                <Button
                  key={`filter:${one.id}`}
                  plain
                  dimColor={filter !== one.id}
                  label={`${filter === one.id ? '●' : '○'} ${one.label}${one.id === 'all' ? '' : ` · ${counts[one.id] ?? 0}`}`}
                  onPress={() => (one.id === 'all' ? clearSearch($) : setFilter($, one.id))}
                />
              ))}
            </Box>,
          ]
    const found = [
      label('found', `FOUND · ${matches.length}${search.trim() ? ` for « ${search.trim()} »` : ''}`, 'fresh'),
      ...(matches.length === 0
        ? [
            <Box key="found-none">
              <Text dimColor wrap="wrap">
                No step matches.
              </Text>
            </Box>,
          ]
        : filter === 'archived'
          ? matches.map(archivedRow)
          : matches.map(step => stepItem(step, own, 'found', undefined, 'Claude will pick it up', true))),
      <Box key="found-clear" marginTop={1}>
        <Button key="filter-clear" plain dimColor label="✕ Clear search and filter" onPress={() => clearSearch($)} />
      </Box>,
    ]

    const yourCard =
      openSteps.length > 0 || confirmed.length > 0 || shelf.length > 0 || undoShown
        ? card(
            'yours',
            moveTone,
            'YOUR MOVE',
            nowCount > 0
              ? `${nowCount} now${laterSteps.length > 0 ? ` · ${laterSteps.length} later` : ''}`
              : laterSteps.length > 0
                ? `${laterSteps.length} later`
                : openSteps.length > 0
                  ? 'all ticked'
                  : 'nothing open',
            [
              openSteps.length > 0 && (
                <Box key="how" marginTop={1}>
                  <Text dimColor wrap="wrap">
                    ☐ tick when done · ◆ pick one · ⌨ type your answer{Input !== undefined ? ', then Enter' : ' in the conversation'} · ✎ tell Claude what to change · ⊟ archive if no longer relevant
                  </Text>
                </Box>
              ),
              undoBar,
              ...finder,
              ...(isNarrowed ? found : []),
              !isNarrowed && callsNow.length > 0 && label('decide', `NEEDS YOUR CALL · ${callsNow.length}`, 'call'),
              ...(isNarrowed ? [] : callsNow.map(step => stepCard(step, 'call', undefined))),
              ...(isNarrowed ? [] : nowGroups).flatMap(group => [
                label(`group:${group.id}`, `${group.label} · ${group.steps.length}`, group.tone),
                ...group.steps.map(step => {
                  hotkeys += 1

                  return stepCard(step, group.tone, hotkeys <= 9 ? String(hotkeys) : undefined)
                }),
              ]),
              !isNarrowed && nowCount === 0 && (
                <Box key="calm" marginTop={1}>
                  <Text color={TONE.done.color} wrap="wrap">
                    {TONE.done.icon} Nothing needed from you this week.
                  </Text>
                </Box>
              ),
              !isNarrowed && laterSteps.length > 0 && fold('later', `${TONE.later.icon} Later · ${laterSteps.length}`),
              ...(!isNarrowed && open.includes('later') ? laterSteps.map(step => stepItem(step, own, 'later', undefined, 'Claude will pick it up', true)) : []),
              !isNarrowed && confirmed.length > 0 && fold('confirmed', `${TONE.done.icon} Confirmed recently · ${confirmed.length}`),
              ...(!isNarrowed && open.includes('confirmed')
                ? confirmed.map(step => (
                    <Box key={`confirmed:${step.id}`} flexDirection="column">
                      <Box key={`done-line:${step.id}`}>
                        <Text color={TONE.done.color}>{TONE.done.icon} </Text>
                        <Box flexGrow={1} flexShrink={1}>
                          <Text dimColor wrap="wrap">
                            {step.title}
                            {step.answer !== undefined ? ` · ${step.answer}` : ''} · confirmed
                          </Text>
                        </Box>
                      </Box>
                      {step.checked !== undefined && (
                        <Box key={`checked:${step.id}`} paddingLeft={2}>
                          <Text dimColor italic wrap="wrap">
                            {step.checked}
                          </Text>
                        </Box>
                      )}
                    </Box>
                  ))
                : []),
              !isNarrowed && shelf.length > 0 && fold('archived', `⊟ Archived · ${shelf.length}`),
              ...(!isNarrowed && open.includes('archived') ? shelf.map(archivedRow) : []),
            ],
          )
        : null

    /** ALL GOALS, folded: every goal of the task, with what was done for each, and earlier ones. */
    const goalsPart =
      goals.length + earlier.length === 0
        ? null
        : !open.includes('goals')
          ? fold('goals', goals.length > 0 ? `All goals · ${done.length} of ${goals.length} done` : `Earlier goals · ${earlier.length}`)
          : [
              fold('goals', 'All goals'),
              card('goals', 'claude', summary !== '' ? summary : 'GOALS', goals.length > 0 ? `${done.length}/${goals.length}` : undefined, [
                ...goals
                  .filter(goal => goal.status !== 'done')
                  .map(goal => (
                    <Box key={`all:${goal.title}`} marginTop={1}>
                      {goalItem(goal, 'all', true)}
                    </Box>
                  )),
                done.length > 0 && label('done', 'DONE', 'done'),
                ...done.map(goal => goalItem(goal, 'done', true)),
                earlier.length > 0 && fold('earlier', `Finished earlier · ${earlier.length}`),
                ...(open.includes('earlier')
                  ? earlier.map((goal, index) => (
                      <Box key={`earlier:${index}:${goal.title}`}>
                        <Text color={TONE.done.color}>{TONE.done.icon} </Text>
                        <Box flexGrow={1} flexShrink={1}>
                          <Text dimColor wrap="wrap">
                            {goal.title}
                          </Text>
                        </Box>
                      </Box>
                    ))
                  : []),
              ]),
            ]

    /** PROJECT MAP, folded: the milestones as one chain, then one card per part. */
    const hasMap = map.milestones.length > 0 || map.parts.length > 0
    const planActive = map.milestones.find(one => one.status === 'active') ?? map.milestones.find(one => one.status === 'next')
    const partTone: Record<Part['status'], Tone> = { done: 'done', active: 'soon', stuck: 'overdue', waiting: 'waiting', todo: 'later' }
    const partWord: Record<Part['status'], string> = { done: 'Done', active: 'In progress', stuck: 'Stuck', waiting: 'Waiting on you', todo: 'Not started' }
    const columns = inner >= 60 ? 2 : 1
    const partWidth = columns === 2 ? Math.floor((inner - 1) / 2) : inner
    const partCard = (part: Part) => {
      const tone = partTone[part.status]
      const ref: ItemRef = { item: `part:${part.title}`, kind: 'part', title: part.title }
      const partBar = Math.max(6, partWidth - 12)
      const partFilled = Math.round(((part.progress ?? 0) / 100) * partBar)

      return (
        <Box key={`part:${part.title}`} flexDirection="column" width={partWidth} borderStyle="round" borderColor={TONE[tone].color} borderDimColor={part.status === 'todo' || part.status === 'done'} paddingX={1}>
          {itemLine(
            'map',
            ref,
            <Text key={`part-icon:${part.title}`} color={TONE[tone].color}>
              {TONE[tone].icon}{' '}
            </Text>,
            <Text bold dimColor={part.status === 'todo'} wrap="wrap">
              {part.title}
            </Text>,
          )}
          <Text color={TONE[tone].color} wrap="wrap">
            {partWord[part.status]}
            {part.status === 'active' && part.progress !== undefined ? ` · ${part.progress}%` : ''}
          </Text>
          {part.status === 'active' && part.progress !== undefined && (
            <Text>
              <Text color={TONE.soon.color}>{'█'.repeat(partFilled)}</Text>
              <Text color="subtle">{'░'.repeat(partBar - partFilled)}</Text>
            </Text>
          )}
          {part.note !== undefined && (
            <Text dimColor wrap="wrap">
              {part.note}
            </Text>
          )}
          {itemEdit('map', ref)}
        </Box>
      )
    }
    const mapPart = !hasMap
      ? null
      : !open.includes('map')
        ? fold('map', `${TONE.plan.icon} Project map${planActive ? ` · ${planActive.title}` : ''}`)
        : [
            fold('map', `${TONE.plan.icon} Project map`),
            card('map', 'plan', `${projectTitle.toUpperCase()} · PROJECT MAP`, map.updatedAt > 0 ? `updated ${clockText(map.updatedAt)}` : undefined, [
              map.milestones.length > 0 && label('milestones', 'MILESTONES', 'plan'),
              ...map.milestones.map(milestone => {
                const tone = milestoneTone(milestone)
                const ref: ItemRef = { item: `milestone:${milestone.title}`, kind: 'milestone', title: milestone.title }

                return (
                  <Box key={`milestone:${milestone.title}`} flexDirection="column">
                    {itemLine(
                      'map',
                      ref,
                      <Text key={`ms-icon:${milestone.title}`} color={TONE[tone].color}>
                        {TONE[tone].icon}{' '}
                      </Text>,
                      <Text bold={milestone.status === 'active'} dimColor={milestone.status === 'later'} wrap="wrap">
                        {milestone.title}
                        {milestone.status === 'active' ? ' · you are here' : ''}
                      </Text>,
                      milestone.date ? <Text key={`ms-date:${milestone.title}`} dimColor> {dayName(milestone.date)}</Text> : undefined,
                    )}
                    {itemEdit('map', ref)}
                  </Box>
                )
              }),
              map.parts.length > 0 && label('parts', `PARTS · ${map.parts.filter(part => part.status === 'done').length} of ${map.parts.length} done`, 'plan'),
              map.parts.length > 0 && (
                <Box key="parts-grid" flexDirection="row" flexWrap="wrap" columnGap={1} rowGap={0}>
                  {map.parts.map(partCard)}
                </Box>
              ),
            ]),
          ]

    /** ELSEWHERE: helpers, other sessions, and other projects' steps. */
    const elsewhere = helping.length + sessions.length + others.length
    const elsewhereCard =
      elsewhere > 0
        ? card('elsewhere', 'elsewhere', 'ELSEWHERE', undefined, [
            helping.length > 0 && label('helpers', `HELPERS · ${helping.length} working`),
            ...helping.map(helper => (
              <Text key={`helper:${helper.id}`} dimColor wrap="wrap">
                {TONE.elsewhere.icon} {helper.description}
              </Text>
            )),
            sessions.length > 0 && label('sessions', `OTHER SESSIONS · ${sessions.length}`),
            ...sessions.map(one => {
              const tone: Tone = one.state === 'waiting' ? 'waiting' : one.state === 'working' ? 'claude' : one.state === 'done' ? 'done' : 'later'

              return (
                <Box key={`session:${one.id}`} flexDirection="column">
                  <Text bold={one.state === 'waiting'}>
                    <Text color={TONE[tone].color}>{TONE[tone].icon} </Text>
                    {one.project}
                  </Text>
                  <Box key={`session-line:${one.id}`} paddingLeft={2}>
                    <Text dimColor wrap="wrap">
                      {cardLine(one)}
                    </Text>
                  </Box>
                </Box>
              )
            }),
            others.length > 0 && label('others', 'OTHER PROJECTS'),
            ...others.map(other => (
              <Box key={`project:${other.key}`} flexDirection="column">
                <Text bold>{other.label}</Text>
                {sortSteps(other.steps).map(step => stepItem(step, other.key, 'other', undefined, `Claude in ${other.label} will pick it up`, true))}
              </Box>
            )),
          ])
        : null

    return (
      <Box flexDirection="column">
        {nowCard}
        {yourCard}
        {goalsPart}
        {mapPart}
        {elsewhereCard}
        <Box key="steps" marginTop={1} justifyContent="flex-end">
          <Button key="steps-toggle" label={stepsShown ? 'Hide technical steps' : 'Show technical steps'} hotkey="s" plain dimColor onPress={() => setSteps($)} />
        </Box>
      </Box>
    )
  })
}
