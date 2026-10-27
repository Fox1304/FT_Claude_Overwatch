import type { Queue, QueueTask, TaskQuestion } from '../types'

/** The store key prefix of a project's queue: `queue:<repository main root>`. */
export const QUEUE_PREFIX = 'queue:'
export const QUEUE_TOOL = 'mcp__overview__queue'
export const EMPTY_QUEUE: Queue = { tasks: [], autopilot: true }

/** Finished and removed tasks kept to look back on; tasks still to do are never dropped. */
const KEPT_FINISHED = 20
/** After this many question rounds, Claude files the idea with its assumptions. */
export const MAX_ROUNDS = 2
const TITLE_CHARS = 70

const isStatus = (value: unknown): value is QueueTask['status'] =>
  value === 'reading' || value === 'asking' || value === 'ready' || value === 'running' || value === 'done' || value === 'failed'

const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

/** A title out of the person's own words, until Claude has read them. */
export const titleFrom = (raw: string) => {
  const line = raw.trim().split('\n')[0]?.replace(/\s+/g, ' ') ?? ''

  return line.length > TITLE_CHARS ? `${line.slice(0, TITLE_CHARS - 1).trimEnd()}…` : line
}

const readQuestion = (value: unknown): TaskQuestion | undefined => {
  const one = value as Record<string, unknown> | null
  const question = text(one?.question)
  const options = Array.isArray(one?.options) ? one.options.map(text).filter(option => option !== '').slice(0, 4) : []
  if (question === '') return undefined
  const recommended = typeof one?.recommended === 'number' && one.recommended >= 0 && one.recommended < options.length ? one.recommended : undefined
  const answer = text(one?.answer)

  return {
    topic: text(one?.topic) || 'Question',
    question,
    options,
    ...(recommended !== undefined ? { recommended } : {}),
    ...(answer !== '' ? { answer } : {}),
  }
}

const readTask = (value: unknown): QueueTask | undefined => {
  const one = value as Record<string, unknown> | null
  const id = text(one?.id)
  const raw = text(one?.raw)
  if (id === '' || (raw === '' && text(one?.brief) === '')) return undefined
  const status = isStatus(one?.status) ? one.status : 'ready'
  const questions = Array.isArray(one?.questions) ? one.questions.map(readQuestion).filter(question => question !== undefined) : undefined
  const number = (key: string) => (typeof one?.[key] === 'number' ? (one[key] as number) : undefined)
  const optional = (key: string) => (text(one?.[key]) !== '' ? { [key]: text(one?.[key]) } : {})

  return {
    id,
    raw,
    title: text(one?.title) || titleFrom(raw),
    status,
    createdAt: number('createdAt') ?? 0,
    ...optional('brief'),
    ...optional('error'),
    ...optional('outcome'),
    ...optional('startedIn'),
    ...(one?.isHeld === true ? { isHeld: true } : {}),
    ...(questions !== undefined && questions.length > 0 ? { questions } : {}),
    ...(number('rounds') !== undefined ? { rounds: number('rounds') } : {}),
    ...(one?.addedBy === 'claude' || one?.addedBy === 'person' ? { addedBy: one.addedBy } : {}),
    ...(number('startedAt') !== undefined ? { startedAt: number('startedAt') } : {}),
    ...(number('doneAt') !== undefined ? { doneAt: number('doneAt') } : {}),
    ...(number('removedAt') !== undefined ? { removedAt: number('removedAt') } : {}),
  }
}

/** A project's queue as the store holds it, whatever was written there. */
export const readQueue = (value: unknown): Queue => {
  const stored = value as { tasks?: unknown; autopilot?: unknown } | null
  const tasks = Array.isArray(stored?.tasks) ? stored.tasks.map(readTask).filter(task => task !== undefined) : []

  return { tasks, autopilot: stored?.autopilot !== false }
}

/** Tasks still to do, in the person's order: being read, waiting on answers, ready, running, failed. */
export const pendingTasks = (tasks: readonly QueueTask[]) => tasks.filter(task => task.removedAt === undefined && task.status !== 'done')

/** Finished tasks, newest first. */
export const doneTasks = (tasks: readonly QueueTask[]) =>
  tasks.filter(task => task.removedAt === undefined && task.status === 'done').sort((a, b) => (b.doneAt ?? 0) - (a.doneAt ?? 0))

/** Tasks the person removed, newest first. */
export const removedTasks = (tasks: readonly QueueTask[]) => tasks.filter(task => task.removedAt !== undefined).sort((a, b) => (b.removedAt ?? 0) - (a.removedAt ?? 0))

/** The task Claude takes next by itself: the first ready one not on hold. */
export const nextTask = (tasks: readonly QueueTask[]) => pendingTasks(tasks).find(task => task.status === 'ready' && task.isHeld !== true)

/** Keeps every task still to do, and the latest finished and removed ones. */
export const pruneQueue = (tasks: readonly QueueTask[]) => {
  const keptDone = new Set(doneTasks(tasks).slice(0, KEPT_FINISHED).map(task => task.id))
  const keptRemoved = new Set(removedTasks(tasks).slice(0, KEPT_FINISHED).map(task => task.id))

  return tasks.filter(task => (task.removedAt !== undefined ? keptRemoved.has(task.id) : task.status !== 'done' || keptDone.has(task.id)))
}

export const changeTask = (tasks: readonly QueueTask[], id: string, change: (task: QueueTask) => QueueTask) =>
  tasks.map(task => (task.id === id ? change(task) : task))

/** Moves a task still to do one place up (-1) or down (+1) among the tasks still to do. */
export const moveTask = (tasks: readonly QueueTask[], id: string, by: -1 | 1) => {
  const pending = pendingTasks(tasks)
  const at = pending.findIndex(task => task.id === id)
  const to = at + by
  if (at < 0 || to < 0 || to >= pending.length) return [...tasks]
  const order = [...pending]
  const [moved] = order.splice(at, 1)
  if (moved !== undefined) order.splice(to, 0, moved)
  let next = 0

  // Tasks still to do take their new order; finished and removed ones keep their places.
  return tasks.map(task => (task.removedAt === undefined && task.status !== 'done' ? (order[next++] as QueueTask) : task))
}

/** A new task out of the person's words, to be read before it is ready. */
export const newTask = (raw: string, id: string, now: number): QueueTask => ({
  id,
  raw: raw.trim(),
  title: titleFrom(raw),
  status: 'reading',
  addedBy: 'person',
  createdAt: now,
})

/** The questions are answered: unanswered ones take the recommended option. */
export const settledAnswers = (task: QueueTask) =>
  (task.questions ?? []).map(question => ({
    ...question,
    answer: question.answer ?? (question.recommended !== undefined ? question.options[question.recommended] : undefined) ?? question.options[0] ?? 'No preference',
  }))

/** Every question has an answer the person gave. */
export const isAnswered = (task: QueueTask) => (task.questions ?? []).every(question => question.answer !== undefined)

export const READ_SYSTEM = (mustFile: boolean) => `You file an idea a developer dropped into their task queue, as a task that Claude Code (an agentic coding assistant that reads and edits the code itself) will later run alone, with nobody at hand to ask. Answer with JSON only.

1. clear: true only when Claude could carry it out to a result the developer would accept, with no decision left open. A vague wish, a new feature or redesign with several reasonable outcomes, or anything whose scope or "done" is unknown is NOT clear: ask. Never ask what Claude can find by reading the code or the project rules, nor what earlier answers settle.
2. When not clear, ask the questions whose answers would change the result (expected outcome, scope, constraints, approach, priority), most important first, at most 4. Each: "topic" (1-2 words, at most 12 characters), "question" (one short sentence ending in "?"), "options" (2 to 4 distinct answers of at most 48 characters, the likeliest first), "recommended" (index of the likeliest). In the idea's language.
3. title: the task in at most 8 plain words a non-engineer understands, in the idea's language, no file names or code.
4. When clear, "brief": the task as Claude will run it, in the idea's language, in markdown with bold labels and no headings. Open with **Goal**: one imperative sentence. Then only where they add something: **Context** (what Claude cannot find in the code), **Scope** (what to touch, what to leave alone), **Decisions** (what the answers settled), **Done when** (behaviour to see, tests to pass). Keep the developer's facts, names and words; add no requirement they did not state or choose; never restate the project rules. Short is better when nothing is lost.
${mustFile ? '5. The questions have been asked enough: file it now, clear true, and list what you had to assume under **Assumptions**.\n' : ''}
{"clear":true,"title":"...","brief":"...","questions":[]}
{"clear":false,"title":"...","questions":[{"topic":"Scope","question":"...?","options":["...","..."],"recommended":0}]}`

/** What Claude reads about the idea: the person's words, the answers so far, and the tasks already queued. */
export const readPrompt = (task: QueueTask, others: readonly QueueTask[], remark?: string) => {
  const answered = settledAnswers(task).filter(question => question.answer !== undefined)
  const answers = answered.length > 0 ? `\n\nAnswers so far:\n${answered.map(question => `- ${question.question} → ${question.answer}`).join('\n')}` : ''
  const brief = task.brief !== undefined && remark !== undefined ? `\n\nThe brief filed so far:\n${task.brief}` : ''
  const change = remark !== undefined ? `\n\nThe developer wants this changed: ${remark}` : ''
  const queued = others.length > 0 ? `\n\nAlready queued (do not repeat them): ${others.map(one => `« ${one.title} »`).join(', ')}` : ''

  return `Idea dropped into the queue:\n<<<\n${task.raw}\n>>>${answers}${brief}${change}${queued}`
}

export type TaskRead = { isClear: true; title: string; brief: string } | { isClear: false; title: string; questions: TaskQuestion[] }

/** Claude's reply about an idea, or undefined when it is not the expected JSON. */
export const parseRead = (reply: string): TaskRead | undefined => {
  const start = reply.indexOf('{')
  const end = reply.lastIndexOf('}')
  if (start < 0 || end <= start) return undefined
  let value: Record<string, unknown>
  try {
    value = JSON.parse(reply.slice(start, end + 1)) as Record<string, unknown>
  } catch {
    return undefined
  }
  const title = titleFrom(text(value.title))
  const brief = text(value.brief)
  const questions = Array.isArray(value.questions) ? value.questions.map(readQuestion).filter(question => question !== undefined && question.options.length >= 2).slice(0, 4) : []
  if (value.clear === true && brief !== '') return { isClear: true, title, brief }
  if (questions.length > 0) return { isClear: false, title, questions: questions as TaskQuestion[] }
  if (brief !== '') return { isClear: true, title, brief }

  return undefined
}

/** The task once Claude has read it: ready with its brief, or asking its questions. */
export const applyRead = (task: QueueTask, read: TaskRead): QueueTask => {
  const { error: _error, questions: _questions, ...rest } = task
  const title = read.title || task.title
  if (read.isClear) return { ...rest, title, brief: read.brief, status: 'ready' }

  return { ...rest, title, status: 'asking', questions: read.questions, rounds: (task.rounds ?? 0) + 1 }
}

/** The message that starts a queued task in a session, as if the person had asked. */
export const launchText = (task: QueueTask) =>
  `Next task from the person's queue (task ${task.id}, « ${task.title} »), started by the Overview pane now that the previous work is finished:

${task.brief ?? task.raw}

Work on it as if the person had just asked. When it is done, call ${QUEUE_TOOL} with finish: [{ "id": "${task.id}", "outcome": "<one plain line on what was done>" }].`

/** The title of the task a launch message starts, for its quiet line in the conversation. */
export const launchedTitle = (message: string) => message.match(/^Next task from the person's queue \(task \S+, « (.+?) »\)/)?.[1]

export const QUEUE_DESCRIPTION = `The person's task queue in the Overview pane (« Up next »): ideas they dropped, read and filed as briefs, in their order. The pane itself starts the next ready task when you are done; you never start one on your own, never reorder it, never change what is on hold.
- An empty call lists the queue.
- add: [{ title, brief }]: when the person asks you to keep something for later (« add it to the list », « later », « queue it »). title: at most 8 plain words; brief: the task as you would want to receive it (**Goal** first, then context, scope, decisions, **Done when**).
- update: [{ id, title?, brief? }]: rewrite a task's brief when the person asks you to.
- finish: [{ id, outcome }]: when a task the pane started is finished. outcome: one plain line on what was done.`

export const QUEUE_SCHEMA = {
  type: 'object',
  properties: {
    add: {
      type: 'array',
      items: {
        type: 'object',
        properties: { title: { type: 'string' }, brief: { type: 'string' } },
        required: ['title', 'brief'],
      },
    },
    update: {
      type: 'array',
      items: {
        type: 'object',
        properties: { id: { type: 'string' }, title: { type: 'string' }, brief: { type: 'string' } },
        required: ['id'],
      },
    },
    finish: {
      type: 'array',
      items: {
        type: 'object',
        properties: { id: { type: 'string' }, outcome: { type: 'string' } },
        required: ['id', 'outcome'],
      },
    },
  },
} as const

export const QUEUE_GUIDE = `

## The person's task queue
The person drops ideas and tasks into « Up next » in the Overview pane; each is read and filed as a brief, in their order, some on hold. When your work is finished and nothing else is open, the pane starts the next ready task itself, as a message from the overview: work on it as if the person had asked, with the usual goals. When it is done, call ${QUEUE_TOOL} with finish: [{ id, outcome }]. Never start a queued task on your own, never reorder the queue and never change what is on hold: those are the person's. When the person asks you to keep something for later, add it with ${QUEUE_TOOL} add.`

export type QueueOps = {
  add: { title: string; brief: string }[]
  update: { id: string; title?: string; brief?: string }[]
  finish: { id: string; outcome: string }[]
}

export const parseQueueOps = (args: Record<string, unknown>): QueueOps => {
  const list = (key: string) => (Array.isArray(args[key]) ? (args[key] as Record<string, unknown>[]) : [])

  return {
    add: list('add')
      .map(one => ({ title: titleFrom(text(one?.title)), brief: text(one?.brief) }))
      .filter(one => one.title !== '' && one.brief !== ''),
    update: list('update')
      .map(one => ({
        id: text(one?.id),
        ...(text(one?.title) !== '' ? { title: titleFrom(text(one?.title)) } : {}),
        ...(text(one?.brief) !== '' ? { brief: text(one?.brief) } : {}),
      }))
      .filter(one => one.id !== ''),
    finish: list('finish')
      .map(one => ({ id: text(one?.id), outcome: text(one?.outcome) }))
      .filter(one => one.id !== ''),
  }
}

/** Applies Claude's changes to the queue; ids it does not know come back apart. */
export const applyQueueOps = (tasks: readonly QueueTask[], ops: QueueOps, now: number, newId: () => string) => {
  const unknown: string[] = []
  const finished: QueueTask[] = []
  let list = [...tasks]
  for (const one of ops.update) {
    if (!list.some(task => task.id === one.id)) {
      unknown.push(one.id)
      continue
    }
    list = changeTask(list, one.id, task => ({ ...task, ...(one.title ? { title: one.title } : {}), ...(one.brief ? { brief: one.brief, status: task.status === 'asking' || task.status === 'failed' ? 'ready' : task.status } : {}) }))
  }
  for (const one of ops.finish) {
    const task = list.find(found => found.id === one.id)
    if (task === undefined) {
      unknown.push(one.id)
      continue
    }
    const done: QueueTask = { ...task, status: 'done', doneAt: now, ...(one.outcome !== '' ? { outcome: one.outcome } : {}) }
    finished.push(done)
    list = changeTask(list, one.id, () => done)
  }
  const added = ops.add.map((one): QueueTask => ({ id: newId(), raw: one.brief, title: one.title, brief: one.brief, status: 'ready', addedBy: 'claude', createdAt: now }))

  return { list: pruneQueue([...list, ...added]), unknown, added, finished }
}

const STATUS_WORD: Record<QueueTask['status'], string> = {
  reading: 'being read',
  asking: 'waiting on the person’s answers',
  ready: 'ready',
  running: 'running',
  done: 'done',
  failed: 'could not be read',
}

/** The queue as Claude reads it. */
export const describeQueue = (queue: Queue) => {
  const pending = pendingTasks(queue.tasks)
  const done = doneTasks(queue.tasks).slice(0, 5)
  if (pending.length === 0 && done.length === 0) return 'The queue is empty.'
  const lines = pending.map((task, index) => `${index + 1}. ${task.id} · ${task.title} — ${task.isHeld === true ? 'on hold' : STATUS_WORD[task.status]}`)
  const finished = done.map(task => `- ${task.id} · ${task.title}${task.outcome ? ` — ${task.outcome}` : ''}`)

  return [
    `Autopilot ${queue.autopilot ? 'on: the pane starts the next ready task when you are done' : 'off: tasks start only when the person presses Start'}.`,
    pending.length > 0 ? `Up next:\n${lines.join('\n')}` : 'Nothing left to do in the queue.',
    finished.length > 0 ? `Done recently:\n${finished.join('\n')}` : '',
  ]
    .filter(part => part !== '')
    .join('\n\n')
}
