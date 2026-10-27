import type { Action, Board, CrewMember, SessionCard, YourStep } from '../types'
import { isBlocked } from './goals'

export const SESSION_PREFIX = 'session:'
/** A session that has not published for this long is gone (it crashed or was closed hard). */
export const SESSION_STALE_MS = 90_000
/** Gone sessions' cards are deleted after this long. */
export const SESSION_FORGET_MS = 60 * 60 * 1000
/** A session republishes an unchanged card this often, as a heartbeat. */
export const HEARTBEAT_MS = 30_000
/** The bucket for actions taken before Claude set any active goal. */
export const BEFORE_PLAN = 'Getting started'

const ACTIONS_PER_GOAL = 30
const GOALS_WITH_ACTIVITY = 40

const base = (path: unknown) => (typeof path === 'string' ? (path.split('/').pop() ?? path) : 'a file')

const host = (url: unknown) => {
  if (typeof url !== 'string') return 'a page'
  const match = /^https?:\/\/([^/]+)/.exec(url)

  return match?.[1] ?? url
}

const humanize = (name: string) => name.replace(/[_-]+/g, ' ').trim()

/**
 * One line for what a tool call did, as a reader of the pane wants it; null for calls that are
 * bookkeeping (loading a tool, the overview's own tools).
 */
export const describeAction = (tool: string, input: unknown): string | null => {
  const args = (input ?? {}) as Record<string, unknown>
  const text = (value: unknown) => (typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined)
  if (tool.startsWith('mcp__overview__') || tool === 'ToolSearch' || tool === 'TodoWrite') return null
  switch (tool) {
    case 'Bash':
    case 'PowerShell':
      return text(args.description) ?? 'Ran a command'
    case 'Read':
      return `Read ${base(args.file_path)}`
    case 'Write':
      return `Wrote ${base(args.file_path)}`
    case 'Edit':
    case 'MultiEdit':
    case 'NotebookEdit':
      return `Changed ${base(args.file_path ?? args.notebook_path)}`
    case 'Grep':
    case 'Glob':
      return 'Searched the code'
    case 'WebFetch':
      return `Read ${host(args.url)}`
    case 'WebSearch':
      return `Searched the web${text(args.query) ? `: ${text(args.query)}` : ''}`
    case 'Agent':
    case 'Task':
      return `Asked a helper${text(args.description) ? `: ${text(args.description)}` : ''}`
    case 'Skill':
      return `Used the ${text(args.skill) ?? ''} skill`.replace('  ', ' ')
    case 'Artifact':
      return 'Worked on a published page'
    case 'AskUserQuestion':
      return 'Asked you a question'
    case 'SendUserFile':
      return 'Sent you a file'
  }
  if (tool.startsWith('mcp__Claude_Browser__') || tool.startsWith('mcp__claude-in-chrome__')) return 'Used the browser'
  if (tool.startsWith('mcp__computer-use__')) return 'Used the computer'
  if (tool.startsWith('mcp__Claude_Code_iOS_Simulator__')) return 'Used the iPhone simulator'
  const mcp = /^mcp__([^_]+(?:_[^_]+)*?)__(.+)$/.exec(tool)
  if (mcp) return `Used ${humanize(mcp[2] ?? tool)}`

  return humanize(tool)
}

/** Adds one action to a goal's list, counting a repeat of the last line instead of adding it. */
export const record = (
  activity: Record<string, Action[]>,
  goal: string,
  label: string,
  failed: boolean,
): Record<string, Action[]> => {
  const list = activity[goal] ?? []
  const last = list[list.length - 1]
  const next =
    last !== undefined && last.label === label && Boolean(last.failed) === failed
      ? [...list.slice(0, -1), { ...last, count: last.count + 1 }]
      : [...list, failed ? { label, count: 1, failed } : { label, count: 1 }].slice(-ACTIONS_PER_GOAL)
  const kept = Object.entries({ ...activity, [goal]: next }).slice(-GOALS_WITH_ACTIVITY)

  return Object.fromEntries(kept)
}

/** Keeps only the goals the pane can still show. */
export const forgetGone = (activity: Record<string, Action[]>, board: Board) => {
  const titles = new Set([BEFORE_PLAN, ...board.goals.map(goal => goal.title), ...board.earlier.map(goal => goal.title)])

  return Object.fromEntries(Object.entries(activity).filter(([title]) => titles.has(title)))
}

export const countOf = (actions: readonly Action[] | undefined) =>
  (actions ?? []).reduce((sum, action) => sum + action.count, 0)

/** What this session publishes about itself for the other sessions' panes. */
export const cardFor = (
  id: string,
  project: string,
  board: Board,
  working: boolean,
  steps: readonly YourStep[],
  now: number,
  key?: string,
  activeAt?: number,
  crew?: readonly CrewMember[],
): SessionCard => {
  const { summary, goals } = board
  const done = goals.filter(goal => goal.status === 'done').length
  const current = goals.find(goal => goal.status === 'active')
  const active = current?.title
  const percent = goals.length === 0 ? 0 : Math.round(((done + (current?.progress ?? 0) / 100) / goals.length) * 100)
  const state: SessionCard['state'] =
    goals.length > 0 && done === goals.length
      ? 'done'
      : working
        ? 'working'
        : goals.some(goal => isBlocked(goal, steps))
          ? 'waiting'
          : goals.length > 0
            ? 'paused'
            : 'idle'

  return {
    id,
    project,
    summary,
    ...(active ? { active } : {}),
    done,
    total: goals.length,
    state,
    updatedAt: now,
    ...(key !== undefined ? { key } : {}),
    ...(activeAt !== undefined ? { activeAt } : {}),
    ...(goals.length > 0 ? { percent } : {}),
    ...(crew !== undefined && crew.length > 0 ? { crew: [...crew] } : {}),
  }
}
