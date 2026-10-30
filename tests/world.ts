import type { AgentStatus, On } from 'claude-code'

import type { QueueTask, YourStep } from '../types'

export const KEY = 'yourSteps:/work/myapp'
export const OTHER_KEY = 'yourSteps:/work/otherapp'
export const PANE = {
  plugin: 'overview',
  component: 'Pane',
  requestId: 'overview',
  props: {
    title: 'Overview',
    isFocused: false,
    bodyColumns: 56,
    placement: 'dock',
    scroll: { offset: 0, bodyRows: 40 },
    view: {},
  },
} as const

type Drawing = {
  find: (query: { key?: string; type?: string }) => Promise<{ text: string; props: Record<string, unknown> } | undefined>
  findAll: (query: { type: string }) => Promise<{ props: Record<string, unknown> }[]>
  press: (target: { key: string }) => Promise<unknown>
}

/** Opens folded parts of the pane ("goals", "map", "later", "confirmed") that are drawn and closed. */
export const unfold = async (ui: Drawing, ...parts: string[]) => {
  for (const part of parts) {
    const button = await ui.find({ key: `fold:${part}` })
    if (button?.text.startsWith('▸')) await ui.press({ key: `fold:${part}` })
  }
}

/** Every text the pane draws, as one string: what a person can select and copy. */
export const allText = async (ui: Drawing) =>
  (await ui.findAll({ type: 'Text' })).map(one => (one as unknown as { text: string }).text).join('\n')

export type Agent = { id: string; description: string; type: string; status: AgentStatus }

/** The engine beneath the mod: a store, a session in a worktree of myapp (`me`), the phone, helpers, and what reaches Claude. */
export const world = (on: On, options: { failPrompts?: { now: boolean } } = {}) => {
  /** Which session the engine says it is; a test switches it to play another session on the same store. */
  const me = { id: 'S1' }
  const stored: Record<string, unknown> = {}
  const prompts: { text: string; context: readonly string[] }[] = []
  const phone: string[] = []
  const toasts: string[] = []
  const logs: string[] = []
  const agents: Agent[] = []
  /** What Claude answers when the mod reads an idea, one reply per call; and what it was asked. */
  const replies: string[] = []
  const reads: { model: string; prompt: string }[] = []
  /** Each repository's `git log` lines (`<seconds>\t<subject>`), by root; a root left out is no repository. */
  const git: Record<string, string> = {}
  /** OS notifications raised, and whether the terminal has a channel for them. */
  const notified: { title?: string; text: string }[] = []
  const os = { canNotify: true }
  on('store.get', ($, e) => ({ value: stored[e.key] }))
  on('store.set', ($, e) => {
    stored[e.key] = e.value

    return { value: undefined }
  })
  on('store.keys', () => ({ value: Object.keys(stored) }))
  on('store.delete', ($, e) => {
    delete stored[e.key]

    return { value: undefined }
  })
  on('ui.log', ($, e) => {
    logs.push(e.text)

    return { value: undefined }
  })
  on('ui.toast', ($, e) => {
    toasts.push(e.text)

    return { value: undefined }
  })
  on('session.id', () => ({ value: me.id }))
  on('session.root', () => ({ value: '/work/myapp-worktree' }))
  on('session.repo', () => ({
    value: { root: '/work/myapp', remote: 'git@github.com:octocat/myapp.git', internal: false, name: null },
  }))
  on('agent.list', () => ({ value: agents }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('turn.complete', ($, e) => ({ text: e.answer }))
  on('fs.read', () => ({ value: '' }))
  on('model.complete', ($, e) => {
    const prompt = String(e.prompt)
    reads.push({ model: e.model, prompt })
    const text = replies.shift()
    const usage = { input_tokens: 1, output_tokens: 1, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 }

    return { value: text === undefined ? { isAnswered: false, reason: 'empty-reply', usage } : { isAnswered: true, text, usage } }
  })
  on('prompt.submit', ($, e) => {
    if (options.failPrompts?.now) return { drop: 'the session is offline' }
    prompts.push({ text: e.text, context: e.context ?? [] })

    return { text: e.text }
  })
  on('process.run', ($, e) => {
    const root = e.argv[0] === 'git' && e.argv[1] === '-C' ? String(e.argv[2]) : ''
    const stdout = git[root]

    return { value: { exitCode: stdout === undefined ? 128 : 0, stdout: stdout ?? '', stderr: '', isStdoutTruncated: false, isStderrTruncated: false } }
  })
  on('ui.notify', ($, e) => {
    if (!os.canNotify) return { value: { isSent: false, reason: 'no-surface' } }
    notified.push({ title: e.title, text: e.text })

    return { value: { isSent: true, channel: 'iterm2' } }
  })
  on('tool.call', { tool: 'mcp__fake__build' }, () => ({ result: 'built' }))
  on('tool.call', { tool: 'PushNotification' }, ($, e) => {
    phone.push(e.message)

    return { result: { message: e.message } }
  })

  const stepsAt = (key: string) => {
    const value = stored[key] as { steps?: YourStep[] } | YourStep[] | undefined

    return (Array.isArray(value) ? value : (value?.steps ?? [])) as YourStep[]
  }

  const queued = () => ((stored['queue:/work/myapp'] as { tasks?: QueueTask[] } | undefined)?.tasks ?? []) as QueueTask[]

  return { stored, prompts, phone, toasts, logs, agents, me, replies, reads, git, notified, os, queued, steps: () => stepsAt(KEY), stepsAt }
}
