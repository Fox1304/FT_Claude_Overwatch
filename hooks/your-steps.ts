import type { Goal, StepLink, YourStep, YourStepStatus } from '../types'

export const YOUR_STEPS_TOOL = 'mcp__overview__your_steps'
export const STORE_PREFIX = 'yourSteps:'

/** Confirmed steps stay this long, then leave the list. */
const DONE_KEPT_MS = 7 * 24 * 60 * 60 * 1000
const MAX_STEPS = 60
const DAY_MS = 24 * 60 * 60 * 1000
const DATE = /^\d{4}-\d{2}-\d{2}$/

export const YOUR_STEPS_DESCRIPTION = [
  "Keeps the list of steps only the person can take (a sign-in, a payment, a decision, a check on their phone) in the Overview pane, per project and across sessions.",
  'The person ticks a step when it is done. "add" new steps, "confirm" ticked ones you have checked (saying how), "reopen" one that is not done yet with a note, "remove" one no longer needed.',
  'Every call answers the current list with ids; call it with nothing to read the list.',
].join(' ')

const MORE_DESCRIPTION =
  'What it is about, opened from the pane: markdown, 50 to 140 words. What it is and why it matters now, "**How**" with 2 to 6 numbered actions (where, which menu, which values), for a decision what each option leads to, and "**Done when**" with how you will confirm it.'

const ASKS_DESCRIPTION =
  'When you need words or numbers from the person (an address, a name, links): what to type, in a few words ("Your SIREN, postal address and phone"). The pane shows an answer box and you receive the reply. Not with "choices".'

const DEFAULT_DESCRIPTION =
  'For a decision: the option that stands if the person does not answer, one of "choices" (usually the one that keeps things as they are). Shown on the card, never applied by itself.'

const DECIDE_BY_DESCRIPTION = 'For a decision: by when an answer is wanted, YYYY-MM-DD or YYYY-MM-DDTHH:MM.'

const SOURCES_SCHEMA = {
  type: 'array',
  description:
    'Where to read more, most useful first: a web page ({ label, url }), or a section of a file in this repository ({ label, path, heading } with the heading copied exactly as written after its #s, or { label, path, line }); repository files link to its page on GitHub, on "ref" (default main).',
  items: {
    type: 'object',
    properties: {
      label: { type: 'string', description: 'A short name: "HANDOFF › Mail setup".' },
      url: { type: 'string' },
      path: { type: 'string', description: 'Relative to the repository root: "docs/HANDOFF.md".' },
      heading: { type: 'string' },
      line: { type: 'number' },
      ref: { type: 'string' },
    },
    required: ['label'],
  },
}

export const YOUR_STEPS_SCHEMA = {
  type: 'object',
  properties: {
    add: {
      type: 'array',
      description: 'New steps for the person.',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'The action, in plain words: "Approve the new Apple agreement".' },
          detail: { type: 'string', description: 'Where or how, when useful: a link or the exact place.' },
          choices: {
            type: 'array',
            items: { type: 'string' },
            description: 'For a decision: 2 to 4 short options, drawn as buttons; the person picks one.',
          },
          due: { type: 'string', description: 'The day it is due by, YYYY-MM-DD, when there is a real deadline.' },
          asks: { type: 'string', description: ASKS_DESCRIPTION },
          defaultChoice: { type: 'string', description: DEFAULT_DESCRIPTION },
          decideBy: { type: 'string', description: DECIDE_BY_DESCRIPTION },
          more: { type: 'string', description: MORE_DESCRIPTION },
          sources: SOURCES_SCHEMA,
        },
        required: ['title'],
      },
    },
    update: {
      type: 'array',
      description: 'Changes to existing steps: only the fields given change ("due": "none" removes the date).',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          detail: { type: 'string' },
          due: { type: 'string' },
          choices: { type: 'array', items: { type: 'string' } },
          asks: { type: 'string', description: ASKS_DESCRIPTION },
          defaultChoice: { type: 'string', description: DEFAULT_DESCRIPTION },
          decideBy: { type: 'string', description: DECIDE_BY_DESCRIPTION },
          more: { type: 'string', description: MORE_DESCRIPTION },
          sources: SOURCES_SCHEMA,
        },
        required: ['id'],
      },
    },
    confirm: {
      type: 'array',
      description: 'Steps you have checked are done.',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          checked: {
            type: 'string',
            description: 'How you checked it, in a few plain words: "Seen in TestFlight, build 42". "Your word" when you could not check.',
          },
        },
        required: ['id', 'checked'],
      },
    },
    reopen: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          note: { type: 'string', description: 'What is still missing, in plain words.' },
        },
        required: ['id', 'note'],
      },
    },
    remove: { type: 'array', items: { type: 'string' }, description: 'Ids of steps no longer needed.' },
  },
}

export const YOUR_STEPS_GUIDE = `
## Steps only the person can take

Do every step you can yourself. When one truly needs the person (a sign-in or 2FA, a password or payment, a decision only they can make, a check on their phone), add it with the ${YOUR_STEPS_TOOL} tool ("add") rather than only writing it in a message: an action in plain words, with "detail" saying where when useful, and "due" (YYYY-MM-DD) when there is a real deadline. Their phone is told, and reminded once a day while a step waits. The list stays in the Overview pane for this project, across sessions, and the person ticks a step once done.
- Each step is answered one way, and its "more" must say that way: the person ticks it when it is done (the default), picks one of its "choices", or types into its answer box ("asks"). One decision per step: never bundle several choices or questions into one step; add one step for each. Never ask the person to "send Claude" something without "asks".
- A decision you can keep working around is a step with "choices" (2 to 4 short options): the person picks one in the pane, now or later, even from their phone. Go on with what does not depend on it. When you cannot go on at all without the answer, ask in the conversation instead.
- A decision may name "defaultChoice" (what stands without an answer, usually what keeps things as they are) and "decideBy": the pane shows « no answer by … keeps: … ». It is never applied by itself: without an answer, nothing changes.
- When you are told the person answered a step with "asks", use the answer, then "confirm" the step with "checked" saying what you did with it.
- When you are told the person picked an option, act on it, then "confirm" the step with "checked" saying what you did.
- When you are told the person ticked a step, or they say in a message that one is done, check it yourself when you can (the build now shows in TestFlight, the setting is on), then "confirm" it with "checked" saying how in a few plain words. If it is not done, "reopen" it with a short note saying what is missing. If you cannot check it, confirm it with "checked": "Your word".
- Give each step "more" (what it is, why now, how, and how you will confirm it) and "sources" (the document sections or pages with the details), so the person can open it in the pane. Keep them current with "update" when things change.
- The pane's « Your move » shows decisions, what is overdue or due within a week, and steps added in the last day; everything else folds under « Later ». Give "due" to any step that should happen soon, so it stays in front.
- The person can archive a step they no longer need (« The person archived… » reaches you) and restore it later. Stop waiting on an archived step and do not add it again; the list you read shows the archive apart.
- "remove" a step that is no longer needed. Call the tool with nothing to read the list.`

/** A source as Claude gives it, before it becomes a link. */
export type Source = { label: string; url?: string; path?: string; heading?: string; line?: number; ref?: string }

type Decision = { defaultChoice?: string; decideBy?: string }

export type NewStep = Decision & { title: string; detail?: string; choices?: string[]; asks?: string; due?: string; more?: string; sources?: Source[]; links?: StepLink[] }

export type StepChange = Decision & { id: string; title?: string; detail?: string; choices?: string[]; asks?: string; due?: string | null; more?: string; sources?: Source[]; links?: StepLink[] }

const DECIDE_BY = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/

/** A decision's default and deadline, kept only when the default is one of its choices. */
const parseDecision = (row: Record<string, unknown>, choices: readonly string[] | undefined): Decision => {
  const decision: Decision = {}
  const fallback = text(row.defaultChoice)
  if (fallback !== undefined && (choices === undefined || choices.includes(fallback))) decision.defaultChoice = fallback
  const by = text(row.decideBy)
  if (by !== undefined && DECIDE_BY.test(by)) decision.decideBy = by

  return decision
}

export type YourStepsOps = {
  add: NewStep[]
  update: StepChange[]
  confirm: { id: string; checked?: string }[]
  reopen: { id: string; note: string }[]
  remove: string[]
}

const text = (value: unknown) => (typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined)

const MORE_LIMIT = 4000

const parseSources = (value: unknown): Source[] | undefined => {
  if (!Array.isArray(value)) return undefined

  return value.flatMap(item => {
    const row = (item ?? {}) as Record<string, unknown>
    const label = text(row.label)
    if (label === undefined) return []
    const source: Source = { label }
    for (const key of ['url', 'path', 'heading', 'ref'] as const) {
      const value = text(row[key])
      if (value !== undefined) source[key] = value
    }
    if (typeof row.line === 'number' && Number.isInteger(row.line) && row.line > 0) source.line = row.line

    return source.url !== undefined || source.path !== undefined ? [source] : []
  })
}

const parseChoices = (value: unknown) => {
  const choices = (Array.isArray(value) ? value : []).flatMap(one => (text(one) === undefined ? [] : [text(one) as string]))

  return choices.length >= 2 ? [...new Set(choices)].slice(0, 4) : undefined
}

const rows = (value: unknown) =>
  (Array.isArray(value) ? value : []).map(item => (typeof item === 'string' ? { id: item } : ((item ?? {}) as Record<string, unknown>)))

/** Reads the model's operations loosely: rows without the needed text are dropped, bare ids accepted. */
export const parseOps = (raw: Record<string, unknown>): YourStepsOps => ({
  add: rows(raw.add).flatMap(row => {
    const title = text(row.title)
    if (title === undefined) return []
    const step: NewStep = { title }
    const detail = text(row.detail)
    if (detail !== undefined) step.detail = detail
    const choices = parseChoices(row.choices)
    if (choices !== undefined) step.choices = choices
    const due = text(row.due)
    if (due !== undefined && DATE.test(due)) step.due = due
    const more = text(row.more)
    if (more !== undefined) step.more = more.slice(0, MORE_LIMIT)
    const sources = parseSources(row.sources)
    if (sources !== undefined && sources.length > 0) step.sources = sources
    if (step.choices !== undefined) Object.assign(step, parseDecision(row, step.choices))
    const asks = text(row.asks)
    if (asks !== undefined && step.choices === undefined) step.asks = asks.slice(0, 140)

    return [step]
  }),
  update: rows(raw.update).flatMap(row => {
    const id = text(row.id)
    if (id === undefined) return []
    const change: StepChange = { id }
    const title = text(row.title)
    if (title !== undefined) change.title = title
    const detail = text(row.detail)
    if (detail !== undefined) change.detail = detail
    const due = text(row.due)
    if (due === 'none') change.due = null
    else if (due !== undefined && DATE.test(due)) change.due = due
    const choices = parseChoices(row.choices)
    if (choices !== undefined) change.choices = choices
    const more = text(row.more)
    if (more !== undefined) change.more = more.slice(0, MORE_LIMIT)
    const sources = parseSources(row.sources)
    if (sources !== undefined) change.sources = sources
    Object.assign(change, parseDecision(row, change.choices))
    const asks = text(row.asks)
    if (asks !== undefined) change.asks = asks.slice(0, 140)

    return [change]
  }),
  confirm: rows(raw.confirm).flatMap(row => {
    const id = text(row.id)
    if (id === undefined) return []
    const checked = text(row.checked)

    return [checked === undefined ? { id } : { id, checked }]
  }),
  reopen: rows(raw.reopen).flatMap(row => {
    const id = text(row.id)
    const note = text(row.note)

    return id === undefined || note === undefined ? [] : [{ id, note }]
  }),
  remove: rows(raw.remove).flatMap(row => (text(row.id) === undefined ? [] : [text(row.id) as string])),
})

export const isEmpty = (ops: YourStepsOps) =>
  ops.add.length + ops.update.length + ops.confirm.length + ops.reopen.length + ops.remove.length === 0

/** GitHub's anchor for a heading: lower case, punctuation dropped, spaces as hyphens. */
export const slugify = (heading: string) =>
  heading
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}_\- ]/gu, '')
    .replace(/ /g, '-')

/** The repository's web address on GitHub, from its remote; undefined for any other host. */
export const githubBase = (remote: string | null) => {
  const match = /github\.com[/:]([^/\s]+)\/([^/\s]+?)(?:\.git)?\/?$/.exec(remote ?? '')

  return match ? `https://github.com/${match[1]}/${match[2]}` : undefined
}

const encodePath = (path: string) => path.replace(/^\.?\//, '').split('/').map(encodeURIComponent).join('/')

/** Turns sources into https links; a repository file needs the repository on GitHub. */
export const linksFor = (sources: readonly Source[], base: string | undefined): { links: StepLink[]; dropped: string[] } => {
  const links: StepLink[] = []
  const dropped: string[] = []
  for (const source of sources) {
    if (source.url !== undefined) {
      if (/^https:\/\/[^\s@]+$/.test(source.url)) links.push({ label: source.label, url: source.url })
      else dropped.push(source.label)
      continue
    }
    if (base === undefined || source.path === undefined) {
      dropped.push(source.label)
      continue
    }
    const anchor = source.heading !== undefined ? `#${encodeURIComponent(slugify(source.heading))}` : source.line !== undefined ? `#L${source.line}` : ''
    links.push({ label: source.label, url: `${base}/blob/${encodeURIComponent(source.ref ?? 'main')}/${encodePath(source.path)}${anchor}` })
  }

  return { links, dropped }
}

/** Applies Claude's operations; ids it does not know are reported, never fatal. */
export const applyOps = (
  list: YourStep[],
  ops: YourStepsOps,
  now: number,
  newId: () => string,
): { list: YourStep[]; unknown: string[]; added: YourStep[] } => {
  const known = new Set(list.map(step => step.id))
  const unknown = [...ops.update.map(one => one.id), ...ops.confirm.map(one => one.id), ...ops.reopen.map(one => one.id), ...ops.remove].filter(
    id => !known.has(id),
  )
  const removed = new Set(ops.remove)
  const confirmed = new Map(ops.confirm.map(one => [one.id, one.checked]))
  const reopened = new Map(ops.reopen.map(one => [one.id, one.note]))

  const changes = new Map(ops.update.map(one => [one.id, one]))
  const changed = list.map(step => {
    const change = changes.get(step.id)
    if (change === undefined) return step
    const { id: _id, sources: _sources, due, ...fields } = change
    const next: YourStep = { ...step, ...fields }
    if (due === null) delete next.due
    else if (due !== undefined) next.due = due

    return next
  })

  const kept = changed.flatMap(step => {
    if (removed.has(step.id)) return []
    if (confirmed.has(step.id)) {
      const { note: _note, ...rest } = step
      const checked = confirmed.get(step.id)

      return [{ ...rest, ...(checked ? { checked } : {}), status: 'done' as const, heard: 'done' as const, doneAt: now }]
    }
    const note = reopened.get(step.id)
    if (note !== undefined) {
      const { doneAt: _doneAt, checked: _checked, answer: _answer, heardAnswer: _heard, ...rest } = step

      return [{ ...rest, note, status: 'todo' as const, heard: 'todo' as const }]
    }

    return [step]
  })
  const added: YourStep[] = ops.add
    .filter(one => !kept.some(step => step.status !== 'done' && !isArchived(step) && step.title.toLowerCase() === one.title.toLowerCase()))
    .map(({ sources: _sources, ...one }) => ({ ...one, id: newId(), status: 'todo' as const, heard: 'todo' as const, createdAt: now }))

  return { list: [...kept, ...added], unknown, added }
}

/** Whether the person archived the step: out of the active list until restored. */
export const isArchived = (step: YourStep) => step.archivedAt !== undefined

/** The steps that count: everything the person has not archived. */
export const activeSteps = (list: readonly YourStep[]) => list.filter(step => !isArchived(step))

/** The person's archive, most recently archived first. */
export const archivedSteps = (list: readonly YourStep[]) =>
  list.filter(isArchived).sort((a, b) => (b.archivedAt ?? 0) - (a.archivedAt ?? 0))

/** Archives an open step the person no longer needs; nothing is deleted, so it can be restored. */
export const archiveIn = (list: YourStep[], id: string, session: string, from: string, now: number) =>
  list.map(step =>
    step.id !== id || step.status === 'done' || isArchived(step) ? step : { ...step, archivedAt: now, tickedIn: session, tickedFrom: from, tickedAt: now },
  )

/** Brings an archived step back to the active list, as it was. */
export const restoreIn = (list: YourStep[], id: string, session: string, from: string, now: number) =>
  list.map(step => {
    if (step.id !== id || !isArchived(step)) return step
    const { archivedAt: _archivedAt, ...rest } = step

    return { ...rest, tickedIn: session, tickedFrom: from, tickedAt: now }
  })

/** Whether Claude has heard the step's archive state. */
const archiveHeard = (step: YourStep) => isArchived(step) === (step.heardArchived ?? false)

/** Drops confirmed steps once they are a week old, and keeps the list bounded. */
export const prune = (list: YourStep[], now: number) =>
  list.filter(step => step.status !== 'done' || now - (step.doneAt ?? now) < DONE_KEPT_MS).slice(-MAX_STEPS)

/** Ticks a step, or unticks it; a confirmed step stays confirmed. */
export const toggle = (list: YourStep[], id: string, session: string, from: string, now: number) =>
  list.map(step => {
    if (step.id !== id || step.status === 'done') return step
    const status: YourStepStatus = step.status === 'checked' ? 'todo' : 'checked'

    return { ...step, status, tickedIn: session, tickedFrom: from, tickedAt: now }
  })

/** Picks an option of a decision; picking the chosen one again takes the answer back. */
export const choose = (list: YourStep[], id: string, choice: string, session: string, from: string, now: number) =>
  list.map(step => {
    if (step.id !== id || step.status === 'done' || !(step.choices ?? []).includes(choice)) return step
    const tick = { tickedIn: session, tickedFrom: from, tickedAt: now }
    if (step.answer === choice) {
      const { answer: _answer, ...rest } = step

      return { ...rest, ...tick, status: 'todo' as const }
    }

    return { ...step, ...tick, answer: choice, status: 'checked' as const }
  })

/** Answers a step that asks for words; an empty answer takes it back. */
export const reply = (list: YourStep[], id: string, words: string, session: string, from: string, now: number) =>
  list.map(step => {
    if (step.id !== id || step.status === 'done' || step.asks === undefined) return step
    const tick = { tickedIn: session, tickedFrom: from, tickedAt: now }
    const answer = words.trim().slice(0, 2000)
    if (answer === '') {
      const { answer: _answer, ...rest } = step

      return { ...rest, ...tick, status: 'todo' as const }
    }

    return { ...step, ...tick, answer, status: 'checked' as const }
  })

/** How the person answers a step: tick it, pick an option, or type. */
export const answerKind = (step: YourStep) => (step.choices !== undefined ? 'pick' : step.asks !== undefined ? 'type' : 'tick')

/** Steps whose status, picked option or archive state Claude has not heard yet. */
export const unheard = (list: readonly YourStep[]) =>
  list.filter(
    step =>
      step.status !== 'done' &&
      (!archiveHeard(step) ||
        (!isArchived(step) && (step.status !== step.heard || (step.status === 'checked' && (step.answer ?? '') !== (step.heardAnswer ?? ''))))),
  )

/** The unheard ticks a session of project `key` picks up: its own pane's, and any other project's pane's. */
export const ticksFor = (list: readonly YourStep[], session: string, key: string) =>
  unheard(list).filter(step => step.tickedIn === session || (step.tickedFrom !== undefined && step.tickedFrom !== key))

/** Records that Claude was told these steps' statuses; a step ticked again since stays unheard. */
export const markHeard = (list: YourStep[], told: readonly YourStep[]) =>
  list.map(step => {
    const said = told.find(one => one.id === step.id)

    if (said === undefined || said.status !== step.status || said.answer !== step.answer || isArchived(said) !== isArchived(step)) return step
    const archived = isArchived(step) ? { heardArchived: true } : {}
    const { heardArchived: _heardArchived, ...rest } = step

    return step.answer === undefined ? { ...rest, ...archived, heard: step.status } : { ...rest, ...archived, heard: step.status, heardAnswer: step.answer }
  })

/** What Claude reads when the person has ticked or unticked steps. */
export const noteFor = (all: readonly YourStep[], goals: readonly Goal[] = []) => {
  const archivedNow = all.filter(step => isArchived(step) && !archiveHeard(step))
  const restored = all.filter(step => !isArchived(step) && !archiveHeard(step))
  const steps = activeSteps(all).filter(archiveHeard)
  const ticked = steps.filter(step => step.status === 'checked' && step.answer === undefined)
  const answered = steps.filter(step => step.status === 'checked' && step.answer !== undefined && step.asks !== undefined)
  const decided = steps.filter(step => step.status === 'checked' && step.answer !== undefined && step.asks === undefined)
  const unticked = steps.filter(step => step.status === 'todo')
  const unblocks = (step: YourStep) => {
    const names = goals
      .filter(goal => goal.status === 'waiting' && (goal.waitingFor ?? []).some(one => one === step.id || one.toLowerCase() === step.title.toLowerCase()))
      .map(goal => `"${goal.title}"`)

    return names.length > 0 ? ` (the goal ${names.join(', ')} waits on it)` : ''
  }
  const line = (step: YourStep) => `- ${step.id} · ${step.title}${unblocks(step)}`
  const pick = (step: YourStep) => `- ${step.id} · ${step.title} → "${step.answer}"${unblocks(step)}`
  const words = (step: YourStep) => `- ${step.id} · ${step.title} (asked: ${step.asks})${unblocks(step)}\n  « ${step.answer} »`
  const parts = [
    answered.length > 0 &&
      `The person answered in the Overview pane:\n${answered.map(words).join('\n')}\nUse ${answered.length === 1 ? 'the answer' : 'the answers'}, then confirm the step with ${YOUR_STEPS_TOOL}, "checked" saying what you did with it.`,
    decided.length > 0 &&
      `The person decided in the Overview pane:\n${decided.map(pick).join('\n')}\nAct on ${decided.length === 1 ? 'it' : 'them'}, then confirm the step with ${YOUR_STEPS_TOOL}, "checked" saying what you did.`,
    ticked.length > 0 &&
      `The person ticked ${ticked.length === 1 ? 'this step' : 'these steps'} as done in the Overview pane:\n${ticked.map(line).join('\n')}\nCheck each one yourself when you can, then confirm it with ${YOUR_STEPS_TOOL} (saying how you checked), or reopen it with a short note saying what is missing. Then carry on with any goal that was waiting on it.`,
    archivedNow.length > 0 &&
      `The person archived ${archivedNow.length === 1 ? 'this step' : 'these steps'} in the Overview pane as no longer relevant:\n${archivedNow.map(line).join('\n')}\nStop waiting on ${archivedNow.length === 1 ? 'it' : 'them'} and do not add ${archivedNow.length === 1 ? 'it' : 'them'} again; the person can restore an archived step from the pane.`,
    restored.length > 0 &&
      `The person restored ${restored.length === 1 ? 'this step' : 'these steps'} from the archive; open again:\n${restored.map(line).join('\n')}`,
    unticked.length > 0 &&
      `The person unticked ${unticked.length === 1 ? 'this step' : 'these steps'} (or took back their pick or answer); not done after all:\n${unticked.map(line).join('\n')}`,
  ].filter(Boolean)

  return parts.join('\n\n')
}

/** The list as the tool answers it to Claude. */
export const describeList = (list: readonly YourStep[]) => {
  const open = activeSteps(list).filter(step => step.status !== 'done')
  const shelved = archivedSteps(list)
  const archive = shelved.length > 0 ? `\nArchived by the person as no longer relevant (do not add them again):\n${shelved.map(step => `- ${step.id} · ${step.title}`).join('\n')}` : ''
  if (open.length === 0) return `No open steps for the person.${archive}`
  const word = (step: YourStep) =>
    step.status === 'checked'
      ? step.answer !== undefined
        ? step.asks !== undefined
          ? `answered « ${step.answer} », not confirmed yet`
          : `decided "${step.answer}", not confirmed yet`
        : 'ticked by the person, not confirmed yet'
      : step.note
        ? `to do (reopened: ${step.note})`
        : step.choices
          ? `decision waiting (${step.choices.join(' / ')})`
          : step.asks
            ? `answer waiting (asks: ${step.asks})`
            : 'to do'
  const due = (step: YourStep) => (step.due ? ` · due ${step.due}` : '')

  return ['Open steps for the person:', ...open.map(step => `- ${step.id} · ${word(step)}${due(step)} · ${step.title}`)].join('\n') + archive
}

/** The quiet transcript line for one call of the tool. */
export const summarizeCall = (input: unknown) => {
  const ops = parseOps((input ?? {}) as Record<string, unknown>)
  const parts = [
    ops.add.length > 0 && `${ops.add.length} added`,
    ops.update.length > 0 && `${ops.update.length} updated`,
    ops.confirm.length > 0 && `${ops.confirm.length} confirmed`,
    ops.reopen.length > 0 && `${ops.reopen.length} reopened`,
    ops.remove.length > 0 && `${ops.remove.length} removed`,
  ].filter(Boolean)

  return `Your steps · ${parts.length > 0 ? parts.join(', ') : 'checked the list'}`
}

/** A project's steps as kept in the store: `{ label, steps }`, or a bare list from before labels. */
export const readStored = (stored: unknown): { label?: string; steps: YourStep[] } => {
  if (Array.isArray(stored)) return { steps: stored as YourStep[] }
  if (typeof stored !== 'object' || stored === null) return { steps: [] }
  const { label, steps } = stored as { label?: unknown; steps?: unknown }

  return { label: typeof label === 'string' ? label : undefined, steps: Array.isArray(steps) ? (steps as YourStep[]) : [] }
}

/** A project's short name: its git remote's repository name, else its folder's name. */
export const labelFor = (root: string, remote: string | null) => {
  const fromRemote = remote?.replace(/\.git$/, '').split(/[/:]/).pop()
  const fromFolder = root.split('/').filter(Boolean).pop()

  return fromRemote || fromFolder || root
}

/** The phone line when Claude adds or reopens steps, under 200 characters. */
export const phoneLine = (label: string, added: readonly YourStep[], reopened: readonly { note: string; title: string }[]) => {
  const asks = (step: YourStep | undefined) => (step?.choices ? 'needs a decision' : step?.asks ? 'needs an answer' : 'needs you')
  const parts = [
    added.length === 1 && `${label} ${asks(added[0])}: ${added[0]?.title}`,
    added.length > 1 && `${label} needs you for ${added.length} steps: ${added.map(step => step.title).join(' · ')}`,
    reopened.length > 0 && `Not done yet: ${reopened.map(one => `${one.title} (${one.note})`).join(' · ')}`,
  ].filter(Boolean)
  const line = parts.join(' — ')

  return line.length > 195 ? `${line.slice(0, 194)}…` : line
}

const pad = (n: number) => String(n).padStart(2, '0')

/** The local day of a clock time, `YYYY-MM-DD`. */
export const dayOf = (ms: number) => {
  const date = new Date(ms)

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** "Mon 2 Nov" for `2026-11-02`. */
export const dayName = (day: string) => {
  const [year, month, date] = day.split('-').map(Number)
  const at = new Date(year ?? 1970, (month ?? 1) - 1, date ?? 1)

  return `${WEEKDAYS[at.getDay()]} ${at.getDate()} ${MONTHS[at.getMonth()]}`
}

const daysBetween = (from: string, to: string) => {
  const at = (day: string) => {
    const [year, month, date] = day.split('-').map(Number)

    return Date.UTC(year ?? 1970, (month ?? 1) - 1, date ?? 1)
  }

  return Math.round((at(to) - at(from)) / DAY_MS)
}

/** The deadline as the pane says it, and whether it is pressing (today, tomorrow or past). */
export const dueText = (due: string, now: number) => {
  const left = daysBetween(dayOf(now), due)
  if (left < 0) return { text: `overdue since ${dayName(due)}`, isPressing: true }
  if (left === 0) return { text: 'due today', isPressing: true }
  if (left === 1) return { text: 'due tomorrow', isPressing: true }

  return { text: `by ${dayName(due)}`, isPressing: false }
}

/** How long a step has waited, once it is a day or more. */
export const waitedText = (step: YourStep, now: number) => {
  const days = Math.floor((now - step.createdAt) / DAY_MS)

  return days >= 1 ? `waiting ${days === 1 ? '1 day' : `${days} days`}` : undefined
}

/** Open steps with a deadline first, soonest first, then the rest as they came. */
export const sortSteps = (steps: readonly YourStep[]) =>
  [...steps].sort((a, b) => {
    if (a.due !== undefined && b.due !== undefined) return a.due.localeCompare(b.due)
    if (a.due !== undefined) return -1
    if (b.due !== undefined) return 1

    return a.createdAt - b.createdAt
  })

/**
 * Steps the person's phone should be reminded of now: still to do, and either waiting a day or due
 * by tomorrow, with no reminder in the last day. Only between 9:00 and 21:00 local time.
 */
export const dueReminders = (list: readonly YourStep[], now: number) => {
  const hour = new Date(now).getHours()
  if (hour < 9 || hour >= 21) return []

  return list.filter(step => {
    if (step.status !== 'todo' || isArchived(step)) return false
    if (step.remindedAt !== undefined && now - step.remindedAt < DAY_MS) return false
    const isOld = now - step.createdAt >= DAY_MS
    const isNear = step.due !== undefined && daysBetween(dayOf(now), step.due) <= 1

    return isOld || isNear
  })
}

/** One phone line for the steps to be reminded of, under 200 characters. */
export const reminderLine = (label: string, steps: readonly YourStep[], now: number) => {
  const tag = (step: YourStep) => (step.due ? ` (${dueText(step.due, now).text})` : '')
  const line =
    steps.length === 1
      ? `${label}: still waiting for you — ${steps[0]?.title}${steps[0] ? tag(steps[0]) : ''}`
      : `${label}: ${steps.length} steps waiting for you — ${steps.map(step => `${step.title}${tag(step)}`).join(' · ')}`

  return line.length > 195 ? `${line.slice(0, 194)}…` : line
}

export const markReminded = (list: YourStep[], reminded: readonly YourStep[], now: number) =>
  list.map(step => (reminded.some(one => one.id === step.id) ? { ...step, remindedAt: now } : step))

export type StepGroup = { id: 'overdue' | 'soon' | 'later' | 'undated'; label: string; steps: YourStep[] }

/** Open steps by urgency: overdue, due within a week, later, and with no date; empty groups left out. */
export const groupSteps = (steps: readonly YourStep[], now: number): StepGroup[] => {
  const today = dayOf(now)
  const groups: StepGroup[] = [
    { id: 'overdue', label: 'Overdue', steps: [] },
    { id: 'soon', label: 'This week', steps: [] },
    { id: 'later', label: 'Later', steps: [] },
    { id: 'undated', label: 'No date', steps: [] },
  ]
  for (const step of sortSteps(steps)) {
    const left = step.due === undefined ? undefined : daysBetween(today, step.due)
    const id = left === undefined ? 'undated' : left < 0 ? 'overdue' : left <= 7 ? 'soon' : 'later'
    groups.find(group => group.id === id)?.steps.push(step)
  }

  return groups.filter(group => group.steps.length > 0)
}
