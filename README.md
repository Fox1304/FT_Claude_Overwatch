# Claude Overwatch

A Claude Code mod that keeps a small dashboard beside the conversation: **what Claude is doing, what comes next, what needs you, and the ideas you queued for it**, in plain words. Claude's technical steps (commands, file reads, edits) are hidden from the conversation unless you ask to see them.

The mod's plugin name is `overview`.

## What it does

- **The head**: a drawn Claude whose face shows where things stand (working, needs you, all done, resting), named by what this session works on, with the project's badge, the goals as a trail of dots, and a progress ring. Under it, the current goal and the next ones in one line.
- **At work**: every worker in every open session, side by side, each named by its current task: each other session's Claude (with its progress as a ring and its mood), and every helper (subagent), here or in another session, with its own avatar (its colour, and a magnifier, pencil, book or spark by its kind), a spinning ring while it works, a badge when it ends, and how many steps it took and for how long. Finished helpers stay for 15 minutes.
- **Up next, your queue**: drop an idea, a feature or a task in the box (or type `/idea …`). Claude reads it: when something would change the result, it asks you a few questions, each with suggested answers (★ marks the likeliest, kept if you leave it); then it files the idea as a brief (goal, context, scope, done when). You order the queue with ↑ ↓, put a task on hold with ⏸, remove it with ⊟ (restorable) and read or change its brief.
- **Claude takes the next task alone**: once Claude has finished and nothing else is open (no goal left, no question to you, no helper running, nothing of yours waiting to be heard), the pane counts down for a minute, « ▶ Next at 15:01 », then starts the next ready task that is not on hold, as if you had asked. « ⏸ Not now » waits until you next type; « ● Auto » switches the countdown off; « ▶ Start now » starts a task at once (or puts it first while Claude is busy). When Claude finishes, the task moves to « Done » with one line on what was done. Only one session per project takes tasks: the one you used last.
- **Sections that fold**: At work, Your move, Up next, Goals, Recent, Project map and Other projects each have a drawn icon, a count in a coloured pill, and open or close with a click; the pane remembers which you keep open.
- **Your move**: the steps only you can take (a sign-in, a payment, a decision, a check on your phone). Each step is answered in one of three ways:
  - ☐ **tick** it when it is done,
  - ◆ **pick** one of its options (decisions),
  - ⌨ **type** an answer in its box and press Enter.

  Claude hears about it: at its next step while it works, or in a turn of its own about 30 seconds after you stop, while it is idle.
- **The right session hears it**: with several sessions open, a tick, a pick, an answer or a ✎ note goes to the session whose Claude asked for the step (or last changed it, or waits on it), not to the session whose pane you used. A step asked for elsewhere says « Asked by Claude in "…" », and a toast tells you where your tick went. When that session is closed, the session you ticked in hears it; a tick on another project's step goes to that project's last-used session, or waits for its next one. Notes on the project map go to the session that sent the map.
- **⊟ Archive a step**: a step that is no longer relevant can be archived with its ⊟ button. It leaves Your move and its count, and Claude is told. « Archived » (folded) lists archived steps, each with ↺ Restore to bring it back as it was.
- **Claude archives too, within rules**: only a step it has confirmed done, or one that no longer applies with a reason; anything else is refused. Confirmed steps move to the archive after a week. **Nothing is ever deleted**: every step stays restorable.
- **Undo**: every archive shows a toast and a « ↺ Undo » bar in Your move for two minutes; `/overview undo` undoes the last one at any time.
- **Search and filter** (« ⌕ Search » in Your move): a search box (accents ignored) and filters (Decisions, Overdue, This week, Later, Ticked, Archived), each with its count. The phone app has the filters. A step's « ▸ Details » holds who asked for it, what no answer keeps, how long it has waited, its explanation and its links.
- **✎ Notes on any item**: every goal, step, map part and milestone has an ✎ button. It opens a box where you tell Claude what to change ("no longer relevant", "split it in two", "wrong date"); Claude reworks the item with your note.
- **Recent** (folded): what changed in the last three days.
- **Project map** (folded): milestones and one card per part of the project, kept by Claude across sessions.
- **Other projects** (folded): open steps of your other projects, tickable from here.
- **Deadlines and reminders**: steps can carry a due date ("due tomorrow", "overdue since Mon 5 Oct"). With phone alerts on, new steps and once-a-day reminders reach your phone through Claude Code's own notifications (only when you are away from the session, between 9:00 and 21:00).
- **Quiet conversation**: tool calls are hidden; each goal update shows as one dim line. Rows meant for you (files sent to you, questions, plans to approve) stay visible.

Every title, step and note is plain text, so it can be selected and copied; the drawings hold shapes, a percentage and short labels only, each with a description for screen readers. They move gently (a breathing avatar, a spinning ring) and keep still when your system asks for reduced motion; they follow light and dark mode. The terminal shows the same pane in text and glyphs.

Claude drives the pane through four tools the mod adds: `mcp__overview__goals`, `mcp__overview__your_steps`, `mcp__overview__project_map` and `mcp__overview__queue`. The mod tells Claude how to use them in its system prompt; you do not call them yourself.

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
- `/idea let parents export the week as a PDF` drops an idea into Up next from the conversation (the phone app has no text box in the pane).
- `/overview steps` shows or hides Claude's technical steps in the conversation (also the « Show technical steps » link at the bottom of the pane). Your choice is remembered.
- Press a step's ☐ (or its number key while the pane has focus) to tick it; press it again to take the tick back before Claude has heard it.
- Press ⊟ on a step to archive it; « ↺ Undo » (or `/overview undo`) brings it straight back, and « Archived » at the bottom of Your move (or the Archived filter) has ↺ Restore for any archived step.
- Type in « Search your steps… » or press a filter; « ✕ Clear search and filter » brings the usual view back.
- Press ✎ on any item, type your note, press Enter. ✕ closes the box. A note that could not be sent shows ↻ Retry and ✕ Discard.
- Section headers and folded parts (« Later », « Archived », « Confirmed recently », « Done », « Removed ») open with a click.
- In Up next: ↑ ↓ reorder, ⏸ holds (▶ releases), ⊟ removes, « ▸ Brief » shows what Claude will run and « ✎ Change it » asks Claude to rewrite it.

### Options

Set them in `/config` (or under `pluginConfigs` in `~/.claude/settings.json`):

| Option | Default | What it does |
|---|---|---|
| `pickupAfterSeconds` | `30` | How long after your last tick an idle Claude starts a turn to pick it up. `0`: only with your next message. |
| `phoneAlerts` | `true` | Phone alerts for new or reopened steps, and daily reminders. |
| `autoStartSeconds` | `60` | How long the pane counts down before it starts the next queued task by itself. `0`: only with « Start now ». |

## Your data

Everything stays on your machine, in Claude Code's own plugin store (`~/.claude/plugins/store/`): your steps and your queue per repository, the project map, the recent-changes feed, the session cards that let your sessions see each other and their helpers, the sections you keep open, and the notes waiting for another session to read them. Nothing is sent anywhere except to Claude in your own sessions (reading a dropped idea is one Claude Sonnet call through your session, with the start of the project's `CLAUDE.md`, and counts toward your usage), and to your phone through Claude Code's notifications when you turn them on.

## Development

```
claude plugin validate .
claude plugin test .
```

`claude plugin test` runs the `tests/*.test.tsx` files against Claude Code's own engine (it needs mods enabled). Claude Code lays the API typings in `.claude-plugin/types/` the first time it loads the mod; `tsc -p .` type-checks it after that.

| Path | What it holds |
|---|---|
| `hooks/register.tsx` | the hooks: tools, prompt guide, pane, hidden rows, delivery to Claude, the queue's countdown |
| `hooks/goals.ts`, `your-steps.ts`, `map.ts`, `notes.ts`, `activity.ts`, `routing.ts` | pure logic for goals, steps, the map, notes, the per-goal history and which session hears what |
| `hooks/queue.ts` | the queue: reading an idea, its questions and brief, order, hold, Claude's queue tool |
| `hooks/draw.ts` | the drawings: Claude's avatar and progress ring, the helpers' avatars, the section icons |
| `types/index.d.ts` | the shapes of the mod's state |
| `tests/` | engine tests, with `world.ts` standing in for the store, the clock and Claude |

## Licence

MIT, see [LICENSE](LICENSE).
