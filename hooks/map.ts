import type { Change, Milestone, Part, ProjectMap } from '../types'

export const MAP_TOOL = 'mcp__overview__project_map'
export const MAP_PREFIX = 'map:'
export const CHANGES_PREFIX = 'changes:'
export const EMPTY_MAP: ProjectMap = { milestones: [], parts: [], updatedAt: 0 }

const MILESTONE_STATUSES: readonly Milestone['status'][] = ['done', 'active', 'next', 'later']
const PART_STATUSES: readonly Part['status'][] = ['done', 'active', 'stuck', 'waiting', 'todo']
const CHANGES_KEPT = 40
const DATE = /^\d{4}-\d{2}-\d{2}$/

export const MAP_DESCRIPTION = [
  "Keeps the project's map in the Overview pane, shared by every session of this project: its milestones (a timeline) and its parts (a grid of cards).",
  'Send "milestones" and/or "parts"; each list you send replaces the stored one, the other stays. Call it with nothing to read the map.',
  'Titles and notes in plain words a non-engineer understands, no file names or code.',
].join(' ')

export const MAP_SCHEMA = {
  type: 'object',
  properties: {
    milestones: {
      type: 'array',
      description: 'The stages, in order, 3 to 7: exactly one "active" while work goes on.',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Short: "Public beta", "Launch".' },
          status: { type: 'string', enum: MILESTONE_STATUSES },
          date: { type: 'string', description: 'YYYY-MM-DD: when reached (done) or planned.' },
        },
        required: ['title', 'status'],
      },
    },
    parts: {
      type: 'array',
      description: 'The parts of the project, 4 to 12.',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Short: "iOS app", "Mail", "Store pages".' },
          status: { type: 'string', enum: PART_STATUSES },
          progress: { type: 'number', minimum: 0, maximum: 100 },
          note: { type: 'string', description: 'One short line: what is left, what it waits on, when it shipped.' },
          milestone: { type: 'string', description: 'The milestone it is needed for, by its title.' },
        },
        required: ['title', 'status'],
      },
    },
  },
}

export const MAP_GUIDE = `
## Project map

For a project with work that spans days, keep its map with the ${MAP_TOOL} tool: the milestones (3 to 7, in order, one "active") and the parts (4 to 12 cards: status "done", "active" with "progress", "stuck", "waiting" on the person, or "todo"; a one-line "note"; the "milestone" it is needed for). Read it first when you start on the project (call it with nothing), and update it when a part or a milestone moves; the pane shows what changed. Plain words only.`

const text = (value: unknown, limit = 120) =>
  typeof value === 'string' && value.trim() !== '' ? value.trim().slice(0, limit) : undefined

export type MapInput = { milestones?: Milestone[]; parts?: Part[] }

/** Reads the model's map loosely: rows without a title go, unknown statuses fall back. */
export const parseMap = (raw: Record<string, unknown>): MapInput => {
  const input: MapInput = {}
  if (Array.isArray(raw.milestones)) {
    input.milestones = raw.milestones.slice(0, 9).flatMap(item => {
      const row = (item ?? {}) as Record<string, unknown>
      const title = text(row.title, 40)
      if (title === undefined) return []
      const status = MILESTONE_STATUSES.includes(row.status as Milestone['status']) ? (row.status as Milestone['status']) : 'later'
      const milestone: Milestone = { title, status }
      const date = text(row.date)
      if (date !== undefined && DATE.test(date)) milestone.date = date

      return [milestone]
    })
  }
  if (Array.isArray(raw.parts)) {
    input.parts = raw.parts.slice(0, 16).flatMap(item => {
      const row = (item ?? {}) as Record<string, unknown>
      const title = text(row.title, 40)
      if (title === undefined) return []
      const status = PART_STATUSES.includes(row.status as Part['status']) ? (row.status as Part['status']) : 'todo'
      const part: Part = { title, status }
      if (typeof row.progress === 'number' && Number.isFinite(row.progress) && status === 'active') {
        part.progress = Math.max(0, Math.min(100, Math.round(row.progress)))
      }
      const note = text(row.note, 90)
      if (note !== undefined) part.note = note
      const milestone = text(row.milestone, 40)
      if (milestone !== undefined) part.milestone = milestone

      return [part]
    })
  }

  return input
}

export const readMap = (stored: unknown): ProjectMap => {
  if (typeof stored !== 'object' || stored === null) return EMPTY_MAP
  const { milestones, parts, updatedAt, updatedIn } = stored as Partial<ProjectMap>

  return {
    milestones: Array.isArray(milestones) ? milestones : [],
    parts: Array.isArray(parts) ? parts : [],
    updatedAt: typeof updatedAt === 'number' ? updatedAt : 0,
    ...(typeof updatedIn === 'string' ? { updatedIn } : {}),
  }
}

export const readChanges = (stored: unknown): Change[] => (Array.isArray(stored) ? (stored as Change[]) : [])

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase()

const partWord = (part: Part) =>
  part.status === 'active'
    ? part.progress !== undefined
      ? `${part.progress}%`
      : 'In progress'
    : { done: 'Done', stuck: 'Stuck', waiting: 'Waiting on you', todo: 'Not started' }[part.status]

/** What moved between two maps, as feed lines: parts and milestones whose status (or progress) changed. */
export const diffMaps = (before: ProjectMap, after: ProjectMap, now: number): Change[] => {
  const changes: Change[] = []
  for (const part of after.parts) {
    const was = before.parts.find(one => same(one.title, part.title))
    if (was === undefined) {
      if (before.parts.length > 0) changes.push({ at: now, text: `${part.title} → ${partWord(part)}`, tone: 'info' })
      continue
    }
    if (was.status === part.status && was.progress === part.progress) continue
    const tone: Change['tone'] =
      part.status === 'done' ? 'done' : part.status === 'stuck' ? 'stuck' : part.status === 'waiting' ? 'you' : 'progress'
    const from = was.status === 'active' && part.status === 'active' && was.progress !== undefined ? `${was.progress}% → ` : '→ '
    changes.push({ at: now, text: `${part.title} ${from}${partWord(part)}`, tone })
  }
  for (const milestone of after.milestones) {
    const was = before.milestones.find(one => same(one.title, milestone.title))
    if (was === undefined || was.status === milestone.status) continue
    if (milestone.status === 'done') changes.push({ at: now, text: `${milestone.title} reached`, tone: 'done' })
    else if (milestone.status === 'active') changes.push({ at: now, text: `Now on ${milestone.title}`, tone: 'progress' })
  }

  return changes
}

/** Adds lines to the feed, newest first, keeping it bounded. */
export const addChanges = (feed: readonly Change[], added: readonly Change[]) =>
  [...[...added].reverse(), ...feed].slice(0, CHANGES_KEPT)

/** Applies a map input: each list sent replaces the stored one. */
export const applyMap = (map: ProjectMap, input: MapInput, now: number, session?: string): ProjectMap => ({
  milestones: input.milestones ?? map.milestones,
  parts: input.parts ?? map.parts,
  updatedAt: now,
  ...(session !== undefined ? { updatedIn: session } : map.updatedIn !== undefined ? { updatedIn: map.updatedIn } : {}),
})

/** The map as the tool answers it to Claude. */
export const describeMap = (map: ProjectMap) => {
  if (map.milestones.length === 0 && map.parts.length === 0) return 'No map for this project yet.'
  const milestones = map.milestones.map(one => `- ${one.title} · ${one.status}${one.date ? ` · ${one.date}` : ''}`)
  const parts = map.parts.map(
    one =>
      `- ${one.title} · ${partWord(one)}${one.note ? ` · ${one.note}` : ''}${one.milestone ? ` · for ${one.milestone}` : ''}`,
  )

  return ['Milestones:', ...milestones, '', 'Parts:', ...parts].join('\n')
}
