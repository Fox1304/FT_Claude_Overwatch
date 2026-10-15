import type { ItemKind, ItemNote } from '../types'

/** How long a delivered note stays on its item when Claude has not reworked it. */
export const NOTE_KEPT_MS = 2 * 60 * 60 * 1000
const NOTE_LIMIT = 2000

const KIND_WORD: Record<ItemKind, string> = { goal: 'goal', step: 'step', part: 'part of the project map', milestone: 'milestone' }

const TOOL_FOR: Record<ItemKind, string> = {
  goal: 'mcp__overview__goals (send the whole list again)',
  step: 'mcp__overview__your_steps ("update", "remove" or "add")',
  part: 'mcp__overview__project_map ("parts")',
  milestone: 'mcp__overview__project_map ("milestones")',
}

/** What Claude reads for the notes the person left on items of the pane. */
export const noteMessage = (notes: readonly ItemNote[]) => {
  const lines = notes.map(
    note => `- the ${KIND_WORD[note.kind]} « ${note.title} »${note.stepId ? ` (step ${note.stepId})` : ''}:\n  « ${note.text} »`,
  )
  const tools = [...new Set(notes.map(note => TOOL_FOR[note.kind]))].join(', ')

  return [
    `The person left ${notes.length === 1 ? 'a note' : 'notes'} on ${notes.length === 1 ? 'an item' : 'items'} of the Overview pane:`,
    ...lines,
    `Take ${notes.length === 1 ? 'it' : 'them'} into account now: rework, reword, reorder or remove the item as the note asks, with ${tools}. Then say in one line what you changed.`,
  ].join('\n')
}

/** The trimmed note text, or undefined when there is nothing to send. */
export const noteText = (words: string) => {
  const text = words.trim()

  return text === '' ? undefined : text.slice(0, NOTE_LIMIT)
}

/** Replaces any earlier note on the same item. */
export const putNote = (list: readonly ItemNote[], note: ItemNote) => [...list.filter(one => one.item !== note.item), note]

export const setNoteStatus = (list: readonly ItemNote[], items: readonly string[], status: ItemNote['status'], error?: string) =>
  list.map(note => {
    if (!items.includes(note.item)) return note
    const { error: _error, ...rest } = note

    return error === undefined ? { ...rest, status } : { ...rest, status, error }
  })

/** Drops the delivered notes on items Claude has just reworked, and delivered notes past their time. */
export const settleNotes = (list: readonly ItemNote[], reworked: (note: ItemNote) => boolean, now: number) =>
  list.filter(note => !(note.status === 'sent' && (reworked(note) || now - note.at > NOTE_KEPT_MS)))

/** The conversation line for the pane's note message. */
export const noteLine = (message: string) => {
  const titles = [...message.matchAll(/^- the .+? « (.+) »(?: \(step \S+\))?:$/gm)].map(match => match[1])

  return `✎ Your note on « ${titles.join(' », « ')} » · Claude is on it`
}
