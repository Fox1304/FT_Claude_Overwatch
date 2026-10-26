import type { AgentStatus, On } from 'claude-code'

import type { YourStep } from '../types'

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

/** The engine beneath the mod: a store, a session in a worktree of myapp, the phone, helpers, and what reaches Claude. */
export const world = (on: On, options: { failPrompts?: { now: boolean } } = {}) => {
  const stored: Record<string, unknown> = {}
  const prompts: { text: string; context: readonly string[] }[] = []
  const phone: string[] = []
  const toasts: string[] = []
  const logs: string[] = []
  const agents: Agent[] = []
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
  on('session.id', () => ({ value: 'S1' }))
  on('session.root', () => ({ value: '/work/myapp-worktree' }))
  on('session.repo', () => ({
    value: { root: '/work/myapp', remote: 'git@github.com:octocat/myapp.git', internal: false, name: null },
  }))
  on('agent.list', () => ({ value: agents }))
  on('prompt.submit', ($, e) => {
    if (options.failPrompts?.now) return { drop: 'the session is offline' }
    prompts.push({ text: e.text, context: e.context ?? [] })

    return { text: e.text }
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

  return { stored, prompts, phone, toasts, logs, agents, steps: () => stepsAt(KEY), stepsAt }
}
