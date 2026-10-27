import type { SessionCard } from '../types'

/** An open session as routing needs it: its id, its project's store key, when the person last used it. */
export type LiveSession = Pick<SessionCard, 'id'> & Partial<Pick<SessionCard, 'key' | 'activeAt' | 'project' | 'summary' | 'active'>>

/** Who touched an item last: the session that asked for it, and the pane (session and project) the person used. */
export type Trail = { askedIn?: string; tickedIn?: string; tickedFrom?: string }

export const INBOX_PREFIX = 'inbox#'

/** The open session of a project the person used last; ties go to the lower id, so every session agrees. */
export const heirOf = (live: readonly LiveSession[], key: string) =>
  live
    .filter(session => session.key === key)
    .sort((a, b) => (b.activeAt ?? 0) - (a.activeAt ?? 0) || a.id.localeCompare(b.id))[0]

/**
 * The session that hears what the person did on an item of project `key`: the session that asked
 * for it while it is open; else the session the person did it in, when that one is of the
 * project; else the project's last-used open session; undefined when none of its sessions is open
 * (the next one to open hears it).
 */
export const hearerOf = (trail: Trail, key: string, live: readonly LiveSession[]) => {
  const isOpen = (id: string | undefined) => id !== undefined && live.some(session => session.id === id)
  if (isOpen(trail.askedIn)) return trail.askedIn
  if (trail.tickedFrom === key && isOpen(trail.tickedIn)) return trail.tickedIn

  return heirOf(live, key)?.id
}

/** How the pane names another session: what it works on, else its project. */
export const sessionName = (session: LiveSession | undefined) => {
  const what = session?.summary || session?.active

  return what ? `Claude in « ${what} »` : session?.project ? `Claude in another ${session.project} session` : 'Claude in another session'
}

/** Where an item's tick or note goes, in the pane's words; `label` names the item's project. */
export const pickupLine = (hearer: string | undefined, me: string, live: readonly LiveSession[], label: string, isClosedOwner: boolean) => {
  if (hearer === me) return isClosedOwner ? 'its session is closed: Claude here will pick it up' : 'Claude will pick it up'
  if (hearer === undefined) return `Claude in ${label} will pick it up in its next session`

  return `${sessionName(live.find(session => session.id === hearer))} will pick it up`
}

/** The store key of a note waiting for a session (`s`) or for a project's next session (`p`). */
export const inboxKey = (kind: 's' | 'p', target: string, item: string) => `${INBOX_PREFIX}${kind}#${target}#${item}`
