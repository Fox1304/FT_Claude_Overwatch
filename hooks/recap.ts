import type { Change, Recap, RecapEvent, RecapLine } from '../types'

/**
 * « What did you miss »: when the person comes back (each new interactive session), one short line
 * per project that moved since their last visit, newest first.
 *
 * What it reads, per project: the feed the pane already keeps (`changes:<root>`: steps done or
 * reopened, queue tasks, map moves; the person's own actions left out), the activity log below
 * (goals reached, helpers finished, the work a session took on, files changed: what nothing
 * else records, committed or not), and the repository's commits on every branch.
 */

/** When the person last saw the recap (or first ran the mod), for every session and project. */
export const LAST_SEEN_KEY = 'lastSeen'
/** `watched:<root>`: when the person last typed in a session of that project; what they watched there is not news. */
export const WATCHED_PREFIX = 'watched:'
/** `log:<root>`: a project's activity log, newest first. */
export const LOG_PREFIX = 'log:'
const LOG_KEPT = 200
const LOG_KEPT_MS = 30 * 24 * 60 * 60 * 1000
/** Commits read per project: the count shows "50+" past it. */
export const COMMITS_READ = 50

export const readLog = (stored: unknown): RecapEvent[] =>
  Array.isArray(stored) ? (stored as RecapEvent[]).filter(one => typeof one?.at === 'number' && typeof one?.kind === 'string') : []

/** Adds events to a log, newest first, keeping it bounded in length and age. */
export const addEvents = (log: readonly RecapEvent[], added: readonly RecapEvent[], now: number) =>
  [...[...added].reverse(), ...log].filter(one => now - one.at < LOG_KEPT_MS).slice(0, LOG_KEPT)

export type Commit = { at: number; subject: string }

/** `git log --format=%ct%x09%s` lines, as commits. */
export const parseCommits = (stdout: string): Commit[] =>
  stdout.split('\n').flatMap(line => {
    const tab = line.indexOf('\t')
    const seconds = Number(line.slice(0, tab))

    return tab > 0 && Number.isFinite(seconds) ? [{ at: seconds * 1000, subject: line.slice(tab + 1).trim() }] : []
  })

/** What is known of one project, for its line. */
export type ProjectActivity = {
  root: string
  label: string
  feed: readonly Change[]
  log: readonly RecapEvent[]
  commits: readonly Commit[]
  /** When the person last typed in one of its sessions. */
  watchedAt?: number
}

/** Whether there is a recap to make: never on the first run, which only records the time. */
export const sinceWhen = (lastSeen: unknown): number | undefined =>
  typeof lastSeen === 'number' && Number.isFinite(lastSeen) && lastSeen > 0 ? lastSeen : undefined

/** One project's line, or nothing when it did not move after `since` (nor after the person last watched it). */
export const summarize = (project: ProjectActivity, since: number): RecapLine | undefined => {
  const from = Math.max(since, project.watchedAt ?? 0)
  const feed = project.feed.filter(one => one.at > from && one.tone !== 'you')
  const log = project.log.filter(one => one.at > from)
  const commits = project.commits.filter(one => one.at > from)
  if (feed.length + log.length + commits.length === 0) return undefined
  const of = (kind: RecapEvent['kind']) => log.filter(one => one.kind === kind)
  const files = new Set(of('edit').flatMap(one => one.paths ?? []))
  const helpers = of('helper')
  // The headline: the newest thing reached or taken on, else the newest commit, else the newest feed line.
  const named = [...of('goal'), ...of('work')].map(one => ({ at: one.at, text: one.title ?? '' }))
  const headline =
    [...named, ...commits.map(one => ({ at: one.at, text: one.subject }))].filter(one => one.text !== '').sort((a, b) => b.at - a.at)[0]?.text ??
    feed[0]?.text ??
    ''

  return {
    root: project.root,
    label: project.label,
    at: Math.max(0, ...feed.map(one => one.at), ...log.map(one => one.at), ...commits.map(one => one.at)),
    commits: commits.length,
    goals: of('goal').length,
    done: feed.filter(one => one.tone === 'done').length,
    stuck: feed.filter(one => one.tone === 'stuck').length,
    helpers: helpers.length,
    failed: helpers.filter(one => one.isFailed === true).length,
    files: files.size,
    updates: feed.filter(one => one.tone === 'progress' || one.tone === 'info').length,
    headline,
  }
}

/** Every project that moved, newest first; the ones that did not are left out. */
export const recapOf = (projects: readonly ProjectActivity[], since: number): RecapLine[] =>
  projects.flatMap(project => summarize(project, since) ?? []).sort((a, b) => b.at - a.at)

/** "4 min", "3 h", "2 d": how long ago, short. */
export const agoText = (at: number, now: number) => {
  const minutes = Math.max(0, Math.round((now - at) / 60_000))
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} h ago`

  return `${Math.round(hours / 24)} d ago`
}

const plural = (count: number, one: string, many = `${one}s`) => `${count} ${count === 1 ? one : many}`

/** A line's counts as short chips, the most telling first; none that is zero. */
export const chipsOf = (line: RecapLine): { kind: 'commits' | 'goals' | 'done' | 'helpers' | 'files' | 'updates' | 'stuck'; text: string }[] => [
  ...(line.stuck > 0 ? [{ kind: 'stuck' as const, text: `${line.stuck} stuck` }] : []),
  ...(line.goals > 0 ? [{ kind: 'goals' as const, text: plural(line.goals, 'goal') }] : []),
  ...(line.commits > 0 ? [{ kind: 'commits' as const, text: line.commits >= COMMITS_READ ? `${COMMITS_READ}+ commits` : plural(line.commits, 'commit') }] : []),
  ...(line.done > 0 ? [{ kind: 'done' as const, text: `${line.done} done` }] : []),
  ...(line.helpers > 0 ? [{ kind: 'helpers' as const, text: plural(line.helpers, 'helper') + (line.failed > 0 ? ` (${line.failed} failed)` : '') }] : []),
  ...(line.files > 0 ? [{ kind: 'files' as const, text: plural(line.files, 'file') }] : []),
  ...(line.updates > 0 ? [{ kind: 'updates' as const, text: plural(line.updates, 'update') }] : []),
]

const cut = (text: string, room: number) => (text.length > room ? `${text.slice(0, room - 1).trimEnd()}…` : text)

/** One project as one short line: name, counts, the headline. */
export const lineText = (line: RecapLine, room = 120) => {
  const head = `${line.label} · ${chipsOf(line).map(chip => chip.text).join(' · ')}`
  if (line.headline === '' || head.length + 6 >= room) return cut(head, room)

  return `${head} — ${cut(line.headline, room - head.length - 3)}`
}

/** "14 h", "3 d": how long the person was away. */
export const awayText = (since: number, now: number) => {
  const ago = agoText(since, now)

  return ago === 'just now' ? 'a moment' : ago.replace(' ago', '')
}

/** "3 projects moved in 14 h". */
export const captionOf = (recap: Recap) =>
  `${recap.lines.length === 1 ? '1 project' : `${recap.lines.length} projects`} moved in ${awayText(recap.since, recap.at)}`

/** The notification: a title and one line per project (five at most, then how many more). */
export const notificationOf = (recap: Recap) => {
  const shown = recap.lines.slice(0, 5)
  const more = recap.lines.length - shown.length

  return {
    title: `While you were away · ${captionOf(recap)}`,
    text: [...shown.map(line => `• ${lineText(line, 90)}`), ...(more > 0 ? [`+ ${more} more in the Overview pane`] : [])].join('\n'),
  }
}
