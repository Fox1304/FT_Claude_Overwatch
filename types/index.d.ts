export type GoalStatus = 'planned' | 'active' | 'waiting' | 'done'

export type Goal = {
  title: string
  status: GoalStatus
  /** 0–100, the active goal's estimate when Claude gives one. */
  progress?: number
  /** For a waiting goal: the ids or titles of the person's steps it waits on. */
  waitingFor?: string[]
  /** Clock time it was first seen done; orders the Done list. */
  doneAt?: number
}

export type Board = {
  /** One line: the overall aim of the current request. */
  summary: string
  /** The current request's goals, in Claude's order. */
  goals: Goal[]
  /** Goals finished for earlier requests in this session, newest first. */
  earlier: Goal[]
}

/** `todo` until the person ticks it, `checked` once ticked, `done` once Claude confirms. */
export type YourStepStatus = 'todo' | 'checked' | 'done'

/** A step only the person can take (a sign-in, a payment, a decision), kept per project. */
export type YourStep = {
  id: string
  title: string
  /** Where or how, when Claude gave it: a link, the exact place. */
  detail?: string
  /** What Claude said was still missing when it reopened the step. */
  note?: string
  /** What it is about, in more depth (markdown): shown when the person opens the step. */
  more?: string
  /** Where to read more: web pages, or a document's section on the repository's site. */
  links?: StepLink[]
  /** How Claude checked it when it confirmed it ("Seen in TestFlight, build 42"). */
  checked?: string
  /** For a decision: the options, drawn as buttons; the person's pick is `answer`. */
  choices?: string[]
  /** When Claude needs words or numbers from the person: what to type. The pane shows an answer box; the reply is `answer`. */
  asks?: string
  /** For a decision: what stays if the person does not answer (shown, never applied). */
  defaultChoice?: string
  /** For a decision: by when an answer is wanted, `YYYY-MM-DD` or `YYYY-MM-DDTHH:MM`. */
  decideBy?: string
  answer?: string
  /** The answer Claude last heard. */
  heardAnswer?: string
  /** The day it is due by, `YYYY-MM-DD`. */
  due?: string
  /** When the person's phone was last reminded of it. */
  remindedAt?: number
  status: YourStepStatus
  /** The status Claude last heard; a step whose status differs is waiting to be told. */
  heard: YourStepStatus
  /** The session whose Claude asked for it, or last touched it with the tool or waited on it: that session hears its ticks while it is open. */
  askedIn?: string
  /** The session whose pane ticked it last. */
  tickedIn?: string
  /** The project (store key) whose pane ticked it last; another project's tick is picked up by any session here. */
  tickedFrom?: string
  tickedAt?: number
  doneAt?: number
  /** When it was archived: hidden from the active list, kept, restorable. Nothing is ever deleted. */
  archivedAt?: number
  /** Who archived it: the person, Claude (done or obsolete only), or the pane itself once a confirmed step is a week old. */
  archivedBy?: ArchivedBy
  /** Why, when Claude or the pane archived it: "done", or what made it obsolete. */
  archivedWhy?: string
  /** Whether Claude last heard it as archived; a step whose archive state differs is waiting to be told. */
  heardArchived?: boolean
  createdAt: number
}

export type ArchivedBy = 'you' | 'claude' | 'auto'

/** The last archive, for its undo: which steps, of which project, by whom. */
export type LastArchive = { key: string; ids: string[]; titles: string[]; by: 'you' | 'claude'; at: number }

/** What the Your move list is narrowed to. */
export type StepFilter = 'all' | 'decide' | 'overdue' | 'week' | 'later' | 'ticked' | 'archived'

/** A stage of the project, on the map's timeline. */
export type Milestone = {
  title: string
  status: 'done' | 'active' | 'next' | 'later'
  /** `YYYY-MM-DD`: when it was reached (done) or is planned. */
  date?: string
}

/** A part of the project, one card of the map's grid. */
export type Part = {
  title: string
  status: 'done' | 'active' | 'stuck' | 'waiting' | 'todo'
  /** 0–100, for an active part. */
  progress?: number
  /** One short line: what is left, what it waits on, when it shipped. */
  note?: string
  /** The milestone it is needed for, by title. */
  milestone?: string
}

/** The project's map, kept by Claude, shared by every session of the project. */
export type ProjectMap = {
  milestones: Milestone[]
  parts: Part[]
  updatedAt: number
  /** The session that sent the map last: notes on its items go there while it is open. */
  updatedIn?: string
}

/** One line of the "changed recently" feed. */
export type Change = { at: number; text: string; tone: 'done' | 'stuck' | 'progress' | 'you' | 'info' }

/** What an item of the pane is, for a note the person leaves on it. */
export type ItemKind = 'goal' | 'step' | 'part' | 'milestone'

/** A note the person left on one item of the pane, on its way to Claude. */
export type ItemNote = {
  /** The item's address: `goal:<title>`, `step:<id>`, `part:<title>`, `milestone:<title>`. */
  item: string
  kind: ItemKind
  title: string
  /** For a step: its id, and the store key of the project it belongs to. */
  stepId?: string
  stepKey?: string
  text: string
  /** `sending` while it goes out, `queued` until Claude's next step, `sent` once delivered, `error` when it failed. */
  status: 'sending' | 'queued' | 'sent' | 'error'
  error?: string
  at: number
  /** Where a note went when another session owns the item: « Claude in "…" », or the project's next session. */
  sentTo?: string
}

/** A note waiting in the store for the session that owns its item, or for the next session of its project. */
export type InboxNote = { note: ItemNote; key: string; target: string }

/** A link under a step, always an https address. */
export type StepLink = { label: string; url: string }

/** Another project's open steps, shown and tickable from any project's pane. */
export type OtherProject = { key: string; label: string; steps: YourStep[] }

/** A subagent working in the background. */
export type Helper = { id: string; description: string }

/** A subagent as the pane draws it: what it does, how far it went, and how it ended. */
export type CrewMember = {
  id: string
  description: string
  /** Its agent type (`Explore`, `general-purpose`…), which picks its avatar's accessory. */
  type: string
  status: 'running' | 'done' | 'failed'
  /** Tool calls it made so far. */
  steps: number
  startedAt: number
  endedAt?: number
}

/** Where a queued task stands. */
export type TaskStatus = 'reading' | 'asking' | 'ready' | 'running' | 'done' | 'failed'

/** A question Claude asks about a dropped idea before filing it, and the person's answer. */
export type TaskQuestion = { topic: string; question: string; options: string[]; recommended?: number; answer?: string }

/** One task of the person's queue: their words, the brief Claude works from, and where it stands. */
export type QueueTask = {
  id: string
  /** The person's words, as they dropped them. */
  raw: string
  /** A short plain title. */
  title: string
  /** The task as Claude will run it: goal, context, scope, done when. */
  brief?: string
  status: TaskStatus
  /** On hold: Claude never picks it alone. */
  isHeld?: boolean
  questions?: TaskQuestion[]
  /** Question rounds asked so far: after two, Claude files it with its assumptions. */
  rounds?: number
  /** Why reading or running it failed. */
  error?: string
  /** Who added it: the person in the pane, or Claude through its tool. */
  addedBy?: 'person' | 'claude'
  createdAt: number
  startedAt?: number
  /** The session that runs it. */
  startedIn?: string
  doneAt?: number
  /** Claude's one line on what it did, once finished. */
  outcome?: string
  /** Removed by the person: kept under « Removed », restorable. */
  removedAt?: number
}

/** A project's queue, kept in the store under `queue:<root>`. */
export type Queue = { tasks: QueueTask[]; autopilot: boolean }

/** What a session is doing, as it publishes it for the other sessions' panes. */
export type SessionCard = {
  id: string
  project: string
  summary: string
  active?: string
  done: number
  total: number
  state: 'working' | 'waiting' | 'paused' | 'done' | 'idle'
  updatedAt: number
  /** The store key of the session's project, so a tick can go to one of its sessions. */
  key?: string
  /** When the person last typed in the session (else when it started): the project's last-used session hears what a closed one would have. */
  activeAt?: number
  /** How far its task is, 0 to 100. */
  percent?: number
  /** Its helpers, running and recently finished, so every pane can draw them. */
  crew?: CrewMember[]
}

/** One line of what was done for a goal; repeats of the same line are counted. */
export type Action = { label: string; count: number; failed?: boolean }

declare module 'claude-code' {
  interface PluginState {
    overview: {
      board: Board
      isWorking: boolean
      /** Whether the conversation shows Claude's technical steps; kept in the store too. */
      showSteps: boolean
      /** Calls whose rows are for the person (an artifact published), shown even with steps hidden. */
      shownCalls: string[]
      /** This project's steps for the person, as last read from the store. */
      yourSteps: YourStep[]
      /** When the person last typed in this session, or when it started. */
      activeAt: number
      /** The store key of this project's steps, found once per session. */
      project: string
      /** This project's short name ("myapp"), shown in other projects' panes. */
      projectLabel: string
      /** Other projects with open steps. */
      otherProjects: OtherProject[]
      /** Subagents running in the background. */
      helpers: Helper[]
      /** The other sessions open now, as they last published themselves. */
      otherSessions: SessionCard[]
      /** What was done for each goal, by goal title. */
      activity: Record<string, Action[]>
      /** The goals whose "what was done" list is open in the pane. */
      openGoals: string[]
      /** The folded parts of the pane the person opened ("later", "earlier"). */
      unfolded: string[]
      /** The steps whose "more" the person opened. */
      openSteps: string[]
      /** The last archive, until it is undone or another replaces it. */
      lastArchive: LastArchive | null
      /** What the person searches Your move for. */
      stepSearch: string
      /** What Your move is narrowed to. */
      stepFilter: StepFilter
      /** This project's map, as last read from the store. */
      projectMap: ProjectMap
      /** This project's recent changes, newest first. */
      changes: Change[]
      /** The edit box open in the pane, as `<where>::<item>`, or empty. */
      editing: string
      /** The edit box whose last send was empty, as `<where>::<item>`, or empty. */
      editProblem: string
      /** Notes the person left on items, until Claude has reworked them. */
      notes: ItemNote[]
      /** This project's task queue, as last read from the store. */
      queue: Queue
      /** The subagents of this session, running and recently finished. */
      crew: CrewMember[]
      /** Which sections of the pane are open, by section; kept in the store too. */
      sections: Record<string, boolean>
      /** When the next queued task starts by itself (0: no countdown). */
      autoStartAt: number
      /** The person said « not now »: no task starts alone until they next type. */
      isSnoozed: boolean
      /** Claude's last answer ended on a question to the person: no task starts alone. */
      isAsking: boolean
      /** The queue tasks whose brief the person opened. */
      openTasks: string[]
      /** What the person is typing in the idea box, emptied once the idea is dropped. */
      ideaDraft: string
    }
  }
}
