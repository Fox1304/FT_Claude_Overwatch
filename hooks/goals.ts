import type { Board, Goal, GoalStatus, YourStep } from '../types'

export const GOALS_TOOL = 'mcp__overview__goals'
export const STATUSES: readonly GoalStatus[] = ['planned', 'active', 'waiting', 'done']
const EARLIER_KEPT = 30

export const EMPTY: Board = { summary: '', goals: [], earlier: [] }

export const GOALS_DESCRIPTION = [
  'Updates the Overview pane: the person sees only these goals, never your steps.',
  'Send the whole list each time; it replaces the previous one.',
  'Each title is a result the person gets, in plain words, without file names, commands, tools or code.',
].join(' ')

export const GOALS_SCHEMA = {
  type: 'object',
  properties: {
    summary: { type: 'string', description: 'One short line: the overall aim, as a result.' },
    goals: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'The result, in plain words.' },
          status: { type: 'string', enum: STATUSES },
          progress: { type: 'number', minimum: 0, maximum: 100 },
          waitingFor: {
            type: 'array',
            items: { type: 'string' },
            description: 'For a "waiting" goal: the ids of the person\'s steps it waits on.',
          },
        },
        required: ['title', 'status'],
      },
    },
  },
  required: ['goals'],
}

export const GOALS_GUIDE = `# Overview pane

The person follows your work in an Overview pane that shows outcomes only. Keep it current with the ${GOALS_TOOL} tool.

- When a request needs more than a couple of steps, call it before starting, with the top-level goals (usually 2 to 6).
- Write each goal as the result the person will get, in plain words a non-engineer understands, in the language they write in. No file names, commands, tool names, code identifiers, test names or technical steps. Good: "Parents can pay in euros". Bad: "Add EUR price to PaywallStore.swift and run xcodebuild". Titles that read as technical steps are sent back.
- Exactly one goal is "active" while you work; the rest are "planned", "waiting" or "done". Mark a goal "done" as soon as its result is reached, and set "progress" (0 to 100) on the active goal when you can estimate it.
- A goal that cannot go on until the person does something is "waiting", with "waitingFor" naming the ids of their steps (add those first with the steps tool). Go on with other goals meanwhile, or tell the person you are waiting.
- Send the whole list every time, finished goals included; it replaces the previous list. A new request starts a new list.
- "summary" is one short line naming the overall aim.
- The person can leave a note on any goal, step or map item from the pane (its ✎ button). It reaches you as « The person left a note… »: rework, reword, reorder or remove that item as asked, then say in one line what you changed.
- Before your final answer, mark every reached goal "done". Skip the tool for quick answers and questions.`

export const HIDDEN_NOTE = `
- The person does not see your tool calls, only this pane and your messages. When you write to them mid-task, say what changed for them, not which files or commands you used.`

/** The engine's own names that look like code but are plain words. */
const BRANDS = /^(macOS|iPadOS|watchOS|tvOS|visionOS)$/

const TECHNICAL: readonly RegExp[] = [
  /`/,
  /\b[\w-]+\.(swift|kts?|tsx?|jsx?|mjs|json|md|ya?ml|sh|py|sql|xml|gradle|plist|html|css|toml|lock|env|xcodeproj|pbxproj)\b/i,
  /(^|\s)(~|\.{1,2})?\/[\w.-]+\//,
  /\b(xcodebuild|gradlew|npm|npx|pnpm|yarn|git|supabase|fastlane|deno|curl|grep|sed|jq|tsc|swiftlint|simctl|adb)\b/i,
  /(^|\s)--?[a-z][\w-]*/,
  /\w\(\)/,
  /\b[a-z0-9]+_[a-z0-9_]+\b/,
]

const isCamel = (word: string) => /^[a-z]{2,}[A-Z][A-Za-z]*$/.test(word) && !BRANDS.test(word)

/** The goal titles that read as technical steps rather than results. */
export const technicalTitles = (goals: readonly Goal[]) =>
  goals
    .map(goal => goal.title)
    .filter(title => TECHNICAL.some(pattern => pattern.test(title)) || title.split(/[^\w]+/).some(isCamel))

const sameTitle = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase()

/** Reads the model's goals loosely: unknown statuses become planned, bad rows go. */
export const parseGoals = (raw: unknown): Goal[] =>
  (Array.isArray(raw) ? raw : []).flatMap(item => {
    if (typeof item !== 'object' || item === null) return []
    const { title, status, progress, waitingFor } = item as Record<string, unknown>
    if (typeof title !== 'string' || title.trim() === '') return []
    const goal: Goal = {
      title: title.trim(),
      status: STATUSES.includes(status as GoalStatus) ? (status as GoalStatus) : 'planned',
    }
    if (typeof progress === 'number' && Number.isFinite(progress) && goal.status === 'active') {
      goal.progress = Math.max(0, Math.min(100, Math.round(progress)))
    }
    if (goal.status === 'waiting' && Array.isArray(waitingFor)) {
      const named = waitingFor.filter((one): one is string => typeof one === 'string' && one.trim() !== '')
      if (named.length > 0) goal.waitingFor = named.map(one => one.trim())
    }

    return [goal]
  })

/** The new list wins; finished goals it dropped move to `earlier`. */
export const merge = (prev: Board, goals: Goal[], summary: string, now: number): Board => {
  const stamped = goals.map(goal => {
    if (goal.status !== 'done') return goal
    const before = prev.goals.find(one => sameTitle(one.title, goal.title))

    return { ...goal, doneAt: before?.doneAt ?? now }
  })
  const kept = (one: Goal) => !stamped.some(goal => sameTitle(goal.title, one.title))
  const leftDone = prev.goals
    .filter(one => one.status === 'done' && kept(one))
    .sort((a, b) => (b.doneAt ?? 0) - (a.doneAt ?? 0))
  const earlier = [...leftDone, ...prev.earlier.filter(kept)].slice(0, EARLIER_KEPT)

  return { summary, goals: stamped, earlier }
}

/** A finished request's goals move to the done list when the person asks for something new. */
export const archive = (prev: Board): Board => {
  const isFinished = prev.goals.length > 0 && prev.goals.every(goal => goal.status === 'done')
  if (!isFinished) return prev
  const done = [...prev.goals].sort((a, b) => (b.doneAt ?? 0) - (a.doneAt ?? 0))

  return { summary: '', goals: [], earlier: [...done, ...prev.earlier].slice(0, EARLIER_KEPT) }
}

/** The person's steps a waiting goal names, by id or by title. */
export const stepsFor = (goal: Goal, steps: readonly YourStep[]) =>
  (goal.waitingFor ?? []).flatMap(name => {
    const found = steps.find(step => step.id === name || sameTitle(step.title, name))

    return found === undefined ? [] : [found]
  })

/** Whether a waiting goal still waits on the person: some of its steps are not ticked yet. */
export const isBlocked = (goal: Goal, steps: readonly YourStep[]) => {
  if (goal.status !== 'waiting') return false
  const named = stepsFor(goal, steps)

  return named.length === 0 || named.some(step => step.status === 'todo')
}
