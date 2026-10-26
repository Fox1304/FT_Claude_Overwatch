# Claude Overwatch

A Claude Code mod that shows **what Claude is doing, what comes next, and what needs you**, in plain words, in a pane beside the conversation. Claude's technical steps (commands, file reads, edits) are hidden from the conversation unless you ask to see them.

The mod's plugin name is `overview`.

## What it does

- **Now**: a card with Claude's current goal, a progress bar, the next goals, what changed in the last minutes, and the project plan as one line.
- **Your move**: the steps only you can take (a sign-in, a payment, a decision, a check on your phone). Each step is answered in one of three ways:
  - ☐ **tick** it when it is done,
  - ◆ **pick** one of its options (decisions),
  - ⌨ **type** an answer in its box and press Enter.

  Claude hears about it: at its next step while it works, or in a turn of its own about 30 seconds after you stop, while it is idle.
- **⊟ Archive a step**: a step that is no longer relevant can be archived with its ⊟ button. It leaves Your move and its count, and Claude is told; nothing is deleted. « Archived » (folded) lists archived steps, each with ↺ Restore to bring it back as it was.
- **✎ Notes on any item**: every goal, step, map part and milestone has an ✎ button. It opens a box where you tell Claude what to change ("no longer relevant", "split it in two", "wrong date"); Claude reworks the item with your note.
- **Project map** (folded): milestones and one card per part of the project, kept by Claude across sessions.
- **Elsewhere**: helpers working in the background, your other open sessions, and open steps of your other projects.
- **Deadlines and reminders**: steps can carry a due date ("due tomorrow", "overdue since Mon 5 Oct"). With phone alerts on, new steps and once-a-day reminders reach your phone through Claude Code's own notifications (only when you are away from the session, between 9:00 and 21:00).
- **Quiet conversation**: tool calls are hidden; each goal update shows as one dim line. Rows meant for you (files sent to you, questions, plans to approve) stay visible.

Everything in the pane is plain text, so any of it can be selected and copied.

Claude drives the pane through three tools the mod adds: `mcp__overview__goals`, `mcp__overview__your_steps` and `mcp__overview__project_map`. The mod tells Claude how to use them in its system prompt; you do not call them yourself.

## Requirements

- **Claude Code 2.1.288 or later** (terminal, or the desktop app's Code tab).
- **Mods (plugin hooks modules) enabled for your account.** They are an early-access feature that Anthropic switches on per account. When the switch is off, Claude Code still installs the mod but does not load it.
- No other dependency: no npm install, no build step. The engine runs the TypeScript sources directly.

## Install

In a **terminal** Claude Code session (the desktop app's Code tab does not offer this command), type:

```
/plugin install overview --marketplace Fox1304/FT_Claude_Overwatch
```

Answer `y` to add the marketplace, then pick the **user** scope so it loads in every project. The mod is active at once in that session, and in every session started afterwards, including the desktop app.

Or from a shell, with the same result:

```
claude plugin marketplace add Fox1304/FT_Claude_Overwatch
claude plugin install overview@claude-overwatch --scope user
```

To remove it: `/plugin uninstall overview`, or `claude plugin uninstall overview@claude-overwatch`.

### Run it from a clone instead

```
git clone https://github.com/Fox1304/FT_Claude_Overwatch.git
claude --plugin-dir ./FT_Claude_Overwatch
```

To load it in every session without installing it, add the clone's absolute path to `env.CLAUDE_CODE_PLUGIN_DIRS` in `~/.claude/settings.json`.

## Usage

- The pane opens by itself at the start of a session. `/overview` opens it again after you close it.
- `/overview steps` shows or hides Claude's technical steps in the conversation (also the « Show technical steps » link at the bottom of the pane). Your choice is remembered.
- Press a step's ☐ (or its number key while the pane has focus) to tick it; press it again to take the tick back before Claude has heard it.
- Press ⊟ on a step to archive it; open « Archived » at the bottom of Your move and press ↺ Restore to bring one back.
- Press ✎ on any item, type your note, press Enter. ✕ closes the box. A note that could not be sent shows ↻ Retry and ✕ Discard.
- Folded parts (« Later », « Archived », « All goals », « Project map », « Confirmed recently ») open with a click.

### Options

Set them in `/config` (or under `pluginConfigs` in `~/.claude/settings.json`):

| Option | Default | What it does |
|---|---|---|
| `pickupAfterSeconds` | `30` | How long after your last tick an idle Claude starts a turn to pick it up. `0`: only with your next message. |
| `phoneAlerts` | `true` | Phone alerts for new or reopened steps, and daily reminders. |

## Your data

Everything stays on your machine, in Claude Code's own plugin store (`~/.claude/plugins/store/`): your steps per repository, the project map, the recent-changes feed and the session cards that let your sessions see each other. Nothing is sent anywhere except to Claude in your own sessions, and to your phone through Claude Code's notifications when you turn them on.

## Development

```
claude plugin validate .
claude plugin test .
```

`claude plugin test` runs the `tests/*.test.tsx` files against Claude Code's own engine (it needs mods enabled). Claude Code lays the API typings in `.claude-plugin/types/` the first time it loads the mod; `tsc -p .` type-checks it after that.

| Path | What it holds |
|---|---|
| `hooks/register.tsx` | the hooks: tools, prompt guide, pane, hidden rows, delivery to Claude |
| `hooks/goals.ts`, `your-steps.ts`, `map.ts`, `notes.ts`, `activity.ts` | pure logic for goals, steps, the map, notes and the per-goal history |
| `types/index.d.ts` | the shapes of the mod's state |
| `tests/` | engine tests, with `world.ts` standing in for the store, the clock and Claude |

## Licence

MIT, see [LICENSE](LICENSE).
