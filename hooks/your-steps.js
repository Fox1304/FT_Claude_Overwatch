"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterSteps = exports.FILTERS = exports.matchesSearch = exports.groupSteps = exports.markReminded = exports.reminderLine = exports.dueReminders = exports.sortSteps = exports.waitedText = exports.dueText = exports.dayName = exports.dayOf = exports.phoneLine = exports.labelFor = exports.readStored = exports.summarizeCall = exports.describeList = exports.noteFor = exports.markHeard = exports.adopt = exports.ticksFor = exports.unheard = exports.answerKind = exports.reply = exports.choose = exports.toggle = exports.prune = exports.restoreIn = exports.archiveIn = exports.archivedSteps = exports.activeSteps = exports.isArchived = exports.applyOps = exports.linksFor = exports.githubBase = exports.slugify = exports.isEmpty = exports.parseOps = exports.YOUR_STEPS_GUIDE = exports.YOUR_STEPS_SCHEMA = exports.YOUR_STEPS_DESCRIPTION = exports.STORE_PREFIX = exports.YOUR_STEPS_TOOL = void 0;
var routing_1 = require("./routing");
exports.YOUR_STEPS_TOOL = 'mcp__overview__your_steps';
exports.STORE_PREFIX = 'yourSteps:';
/** Confirmed steps stay this long, then leave the list. */
var DONE_KEPT_MS = 7 * 24 * 60 * 60 * 1000;
var DAY_MS = 24 * 60 * 60 * 1000;
var DATE = /^\d{4}-\d{2}-\d{2}$/;
exports.YOUR_STEPS_DESCRIPTION = [
    "Keeps the list of steps only the person can take (a sign-in, a payment, a decision, a check on their phone) in the Overview pane, per project and across sessions.",
    'The person ticks a step when it is done. "add" new steps, "confirm" ticked ones you have checked (saying how), "reopen" one that is not done yet with a note, "archive" one that is done or obsolete (kept, and the person can restore it).',
    'Every call answers the current list with ids; call it with nothing to read the list.',
].join(' ');
var MORE_DESCRIPTION = 'What it is about, opened from the pane: markdown, 50 to 140 words. What it is and why it matters now, "**How**" with 2 to 6 numbered actions (where, which menu, which values), for a decision what each option leads to, and "**Done when**" with how you will confirm it.';
var ASKS_DESCRIPTION = 'When you need words or numbers from the person (an address, a name, links): what to type, in a few words ("Your SIREN, postal address and phone"). The pane shows an answer box and you receive the reply. Not with "choices".';
var DEFAULT_DESCRIPTION = 'For a decision: the option that stands if the person does not answer, one of "choices" (usually the one that keeps things as they are). Shown on the card, never applied by itself.';
var DECIDE_BY_DESCRIPTION = 'For a decision: by when an answer is wanted, YYYY-MM-DD or YYYY-MM-DDTHH:MM.';
var SOURCES_SCHEMA = {
    type: 'array',
    description: 'Where to read more, most useful first: a web page ({ label, url }), or a section of a file in this repository ({ label, path, heading } with the heading copied exactly as written after its #s, or { label, path, line }); repository files link to its page on GitHub, on "ref" (default main).',
    items: {
        type: 'object',
        properties: {
            label: { type: 'string', description: 'A short name: "HANDOFF › Mail setup".' },
            url: { type: 'string' },
            path: { type: 'string', description: 'Relative to the repository root: "docs/HANDOFF.md".' },
            heading: { type: 'string' },
            line: { type: 'number' },
            ref: { type: 'string' },
        },
        required: ['label'],
    },
};
exports.YOUR_STEPS_SCHEMA = {
    type: 'object',
    properties: {
        add: {
            type: 'array',
            description: 'New steps for the person.',
            items: {
                type: 'object',
                properties: {
                    title: { type: 'string', description: 'The action, in plain words: "Approve the new Apple agreement".' },
                    detail: { type: 'string', description: 'Where or how, when useful: a link or the exact place.' },
                    choices: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'For a decision: 2 to 4 short options, drawn as buttons; the person picks one.',
                    },
                    due: { type: 'string', description: 'The day it is due by, YYYY-MM-DD, when there is a real deadline.' },
                    asks: { type: 'string', description: ASKS_DESCRIPTION },
                    defaultChoice: { type: 'string', description: DEFAULT_DESCRIPTION },
                    decideBy: { type: 'string', description: DECIDE_BY_DESCRIPTION },
                    more: { type: 'string', description: MORE_DESCRIPTION },
                    sources: SOURCES_SCHEMA,
                },
                required: ['title'],
            },
        },
        update: {
            type: 'array',
            description: 'Changes to existing steps: only the fields given change ("due": "none" removes the date).',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    title: { type: 'string' },
                    detail: { type: 'string' },
                    due: { type: 'string' },
                    choices: { type: 'array', items: { type: 'string' } },
                    asks: { type: 'string', description: ASKS_DESCRIPTION },
                    defaultChoice: { type: 'string', description: DEFAULT_DESCRIPTION },
                    decideBy: { type: 'string', description: DECIDE_BY_DESCRIPTION },
                    more: { type: 'string', description: MORE_DESCRIPTION },
                    sources: SOURCES_SCHEMA,
                },
                required: ['id'],
            },
        },
        confirm: {
            type: 'array',
            description: 'Steps you have checked are done.',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    checked: {
                        type: 'string',
                        description: 'How you checked it, in a few plain words: "Seen in TestFlight, build 42". "Your word" when you could not check.',
                    },
                },
                required: ['id', 'checked'],
            },
        },
        reopen: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    note: { type: 'string', description: 'What is still missing, in plain words.' },
                },
                required: ['id', 'note'],
            },
        },
        archive: {
            type: 'array',
            description: 'Steps to archive, kept and restorable by the person: only a confirmed step ("done"), or one that no longer applies ("obsolete", with "note" saying why).',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    why: { type: 'string', enum: ['done', 'obsolete'] },
                    note: { type: 'string', description: 'For "obsolete": what made it no longer needed, in plain words.' },
                },
                required: ['id', 'why'],
            },
        },
        remove: { type: 'array', items: { type: 'string' }, description: 'Ids of steps no longer needed: archived as obsolete, never deleted.' },
    },
};
exports.YOUR_STEPS_GUIDE = "\n## Steps only the person can take\n\nDo every step you can yourself. When one truly needs the person (a sign-in or 2FA, a password or payment, a decision only they can make, a check on their phone), add it with the ".concat(exports.YOUR_STEPS_TOOL, " tool (\"add\") rather than only writing it in a message: an action in plain words, with \"detail\" saying where when useful, and \"due\" (YYYY-MM-DD) when there is a real deadline. Their phone is told, and reminded once a day while a step waits. The list stays in the Overview pane for this project, across sessions, and the person ticks a step once done.\n- Each step is answered one way, and its \"more\" must say that way: the person ticks it when it is done (the default), picks one of its \"choices\", or types into its answer box (\"asks\"). One decision per step: never bundle several choices or questions into one step; add one step for each. Never ask the person to \"send Claude\" something without \"asks\".\n- A decision you can keep working around is a step with \"choices\" (2 to 4 short options): the person picks one in the pane, now or later, even from their phone. Go on with what does not depend on it. When you cannot go on at all without the answer, ask in the conversation instead.\n- A decision may name \"defaultChoice\" (what stands without an answer, usually what keeps things as they are) and \"decideBy\": the pane shows \u00AB no answer by \u2026 keeps: \u2026 \u00BB. It is never applied by itself: without an answer, nothing changes.\n- When you are told the person answered a step with \"asks\", use the answer, then \"confirm\" the step with \"checked\" saying what you did with it.\n- When you are told the person picked an option, act on it, then \"confirm\" the step with \"checked\" saying what you did.\n- When you are told the person ticked a step, or they say in a message that one is done, check it yourself when you can (the build now shows in TestFlight, the setting is on), then \"confirm\" it with \"checked\" saying how in a few plain words. If it is not done, \"reopen\" it with a short note saying what is missing. If you cannot check it, confirm it with \"checked\": \"Your word\".\n- Give each step \"more\" (what it is, why now, how, and how you will confirm it) and \"sources\" (the document sections or pages with the details), so the person can open it in the pane. Keep them current with \"update\" when things change.\n- The pane's \u00AB Your move \u00BB shows decisions, what is overdue or due within a week, and steps added in the last day; everything else folds under \u00AB Later \u00BB. Give \"due\" to any step that should happen soon, so it stays in front.\n- The person can archive a step they no longer need (\u00AB The person archived\u2026 \u00BB reaches you) and restore it later. Stop waiting on an archived step and do not add it again; the list you read shows the archive apart.\n- \"archive\" a step once it is confirmed done (\"why\": \"done\") or no longer applies (\"why\": \"obsolete\", with a \"note\" saying why); never any other step. Nothing is deleted: the person sees an undo and can restore it. Call the tool with nothing to read the list.");
var DECIDE_BY = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/;
/** A decision's default and deadline, kept only when the default is one of its choices. */
var parseDecision = function (row, choices) {
    var decision = {};
    var fallback = text(row.defaultChoice);
    if (fallback !== undefined && (choices === undefined || choices.includes(fallback)))
        decision.defaultChoice = fallback;
    var by = text(row.decideBy);
    if (by !== undefined && DECIDE_BY.test(by))
        decision.decideBy = by;
    return decision;
};
var text = function (value) { return (typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined); };
var MORE_LIMIT = 4000;
var parseSources = function (value) {
    if (!Array.isArray(value))
        return undefined;
    return value.flatMap(function (item) {
        var row = (item !== null && item !== void 0 ? item : {});
        var label = text(row.label);
        if (label === undefined)
            return [];
        var source = { label: label };
        for (var _i = 0, _a = ['url', 'path', 'heading', 'ref']; _i < _a.length; _i++) {
            var key = _a[_i];
            var value_1 = text(row[key]);
            if (value_1 !== undefined)
                source[key] = value_1;
        }
        if (typeof row.line === 'number' && Number.isInteger(row.line) && row.line > 0)
            source.line = row.line;
        return source.url !== undefined || source.path !== undefined ? [source] : [];
    });
};
var parseChoices = function (value) {
    var choices = (Array.isArray(value) ? value : []).flatMap(function (one) { return (text(one) === undefined ? [] : [text(one)]); });
    return choices.length >= 2 ? __spreadArray([], new Set(choices), true).slice(0, 4) : undefined;
};
var rows = function (value) {
    return (Array.isArray(value) ? value : []).map(function (item) { return (typeof item === 'string' ? { id: item } : (item !== null && item !== void 0 ? item : {})); });
};
/** Reads the model's operations loosely: rows without the needed text are dropped, bare ids accepted. */
var parseOps = function (raw) { return ({
    add: rows(raw.add).flatMap(function (row) {
        var title = text(row.title);
        if (title === undefined)
            return [];
        var step = { title: title };
        var detail = text(row.detail);
        if (detail !== undefined)
            step.detail = detail;
        var choices = parseChoices(row.choices);
        if (choices !== undefined)
            step.choices = choices;
        var due = text(row.due);
        if (due !== undefined && DATE.test(due))
            step.due = due;
        var more = text(row.more);
        if (more !== undefined)
            step.more = more.slice(0, MORE_LIMIT);
        var sources = parseSources(row.sources);
        if (sources !== undefined && sources.length > 0)
            step.sources = sources;
        if (step.choices !== undefined)
            Object.assign(step, parseDecision(row, step.choices));
        var asks = text(row.asks);
        if (asks !== undefined && step.choices === undefined)
            step.asks = asks.slice(0, 140);
        return [step];
    }),
    update: rows(raw.update).flatMap(function (row) {
        var id = text(row.id);
        if (id === undefined)
            return [];
        var change = { id: id };
        var title = text(row.title);
        if (title !== undefined)
            change.title = title;
        var detail = text(row.detail);
        if (detail !== undefined)
            change.detail = detail;
        var due = text(row.due);
        if (due === 'none')
            change.due = null;
        else if (due !== undefined && DATE.test(due))
            change.due = due;
        var choices = parseChoices(row.choices);
        if (choices !== undefined)
            change.choices = choices;
        var more = text(row.more);
        if (more !== undefined)
            change.more = more.slice(0, MORE_LIMIT);
        var sources = parseSources(row.sources);
        if (sources !== undefined)
            change.sources = sources;
        Object.assign(change, parseDecision(row, change.choices));
        var asks = text(row.asks);
        if (asks !== undefined)
            change.asks = asks.slice(0, 140);
        return [change];
    }),
    confirm: rows(raw.confirm).flatMap(function (row) {
        var id = text(row.id);
        if (id === undefined)
            return [];
        var checked = text(row.checked);
        return [checked === undefined ? { id: id } : { id: id, checked: checked }];
    }),
    reopen: rows(raw.reopen).flatMap(function (row) {
        var id = text(row.id);
        var note = text(row.note);
        return id === undefined || note === undefined ? [] : [{ id: id, note: note }];
    }),
    archive: __spreadArray(__spreadArray([], rows(raw.archive).flatMap(function (row) {
        var id = text(row.id);
        var why = row.why === 'done' || row.why === 'obsolete' ? row.why : undefined;
        var note = text(row.note);
        if (id === undefined || why === undefined)
            return [];
        return [note === undefined ? { id: id, why: why } : { id: id, why: why, note: note.slice(0, 200) }];
    }), true), rows(raw.remove).flatMap(function (row) {
        var id = text(row.id);
        return id === undefined ? [] : [{ id: id, why: 'obsolete', note: 'no longer needed' }];
    }), true),
}); };
exports.parseOps = parseOps;
var isEmpty = function (ops) {
    return ops.add.length + ops.update.length + ops.confirm.length + ops.reopen.length + ops.archive.length === 0;
};
exports.isEmpty = isEmpty;
/** GitHub's anchor for a heading: lower case, punctuation dropped, spaces as hyphens. */
var slugify = function (heading) {
    return heading
        .trim()
        .toLowerCase()
        .replace(/[^\p{L}\p{M}\p{N}_\- ]/gu, '')
        .replace(/ /g, '-');
};
exports.slugify = slugify;
/** The repository's web address on GitHub, from its remote; undefined for any other host. */
var githubBase = function (remote) {
    var match = /github\.com[/:]([^/\s]+)\/([^/\s]+?)(?:\.git)?\/?$/.exec(remote !== null && remote !== void 0 ? remote : '');
    return match ? "https://github.com/".concat(match[1], "/").concat(match[2]) : undefined;
};
exports.githubBase = githubBase;
var encodePath = function (path) { return path.replace(/^\.?\//, '').split('/').map(encodeURIComponent).join('/'); };
/** Turns sources into https links; a repository file needs the repository on GitHub. */
var linksFor = function (sources, base) {
    var _a;
    var links = [];
    var dropped = [];
    for (var _i = 0, sources_1 = sources; _i < sources_1.length; _i++) {
        var source = sources_1[_i];
        if (source.url !== undefined) {
            if (/^https:\/\/[^\s@]+$/.test(source.url))
                links.push({ label: source.label, url: source.url });
            else
                dropped.push(source.label);
            continue;
        }
        if (base === undefined || source.path === undefined) {
            dropped.push(source.label);
            continue;
        }
        var anchor = source.heading !== undefined ? "#".concat(encodeURIComponent((0, exports.slugify)(source.heading))) : source.line !== undefined ? "#L".concat(source.line) : '';
        links.push({ label: source.label, url: "".concat(base, "/blob/").concat(encodeURIComponent((_a = source.ref) !== null && _a !== void 0 ? _a : 'main'), "/").concat(encodePath(source.path)).concat(anchor) });
    }
    return { links: links, dropped: dropped };
};
exports.linksFor = linksFor;
/** Applies Claude's operations; ids it does not know are reported, never fatal. */
var applyOps = function (list, ops, now, newId, session) {
    var known = new Set(list.map(function (step) { return step.id; }));
    var unknown = __spreadArray(__spreadArray(__spreadArray(__spreadArray([], ops.update.map(function (one) { return one.id; }), true), ops.confirm.map(function (one) { return one.id; }), true), ops.reopen.map(function (one) { return one.id; }), true), ops.archive.map(function (one) { return one.id; }), true).filter(function (id) { return !known.has(id); });
    var confirmed = new Map(ops.confirm.map(function (one) { return [one.id, one.checked]; }));
    var reopened = new Map(ops.reopen.map(function (one) { return [one.id, one.note]; }));
    var changes = new Map(ops.update.map(function (one) { return [one.id, one]; }));
    // The session that touches a step with the tool is the one waiting on it now: it hears its ticks.
    var touched = new Set(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], ops.update, true), ops.confirm, true), ops.reopen, true), ops.archive, true).map(function (one) { return one.id; }));
    var owned = session === undefined ? list : list.map(function (step) { return (touched.has(step.id) ? __assign(__assign({}, step), { askedIn: session }) : step); });
    var changed = owned.map(function (step) {
        var change = changes.get(step.id);
        if (change === undefined)
            return step;
        var _id = change.id, _sources = change.sources, due = change.due, fields = __rest(change, ["id", "sources", "due"]);
        var next = __assign(__assign({}, step), fields);
        if (due === null)
            delete next.due;
        else if (due !== undefined)
            next.due = due;
        return next;
    });
    var kept = changed.flatMap(function (step) {
        if (confirmed.has(step.id)) {
            var _note = step.note, rest = __rest(step, ["note"]);
            var checked = confirmed.get(step.id);
            return [__assign(__assign(__assign({}, rest), (checked ? { checked: checked } : {})), { status: 'done', heard: 'done', doneAt: now })];
        }
        var note = reopened.get(step.id);
        if (note !== undefined) {
            var _doneAt = step.doneAt, _checked = step.checked, _answer = step.answer, _heard = step.heardAnswer, rest = __rest(step, ["doneAt", "checked", "answer", "heardAnswer"]);
            return [__assign(__assign({}, rest), { note: note, status: 'todo', heard: 'todo' })];
        }
        return [step];
    });
    // Claude archives only what is done (confirmed, in this call or before) or obsolete (with a reason); nothing is deleted.
    var refused = [];
    var archived = [];
    var wanted = new Map(ops.archive.map(function (one) { return [one.id, one]; }));
    var shelved = kept.map(function (step) {
        var _a;
        var ask = wanted.get(step.id);
        if (ask === undefined || (0, exports.isArchived)(step))
            return step;
        if (ask.why === 'done' && step.status !== 'done') {
            refused.push({ id: step.id, reason: 'not confirmed yet: confirm it first, or archive it as obsolete with a note' });
            return step;
        }
        if (ask.why === 'obsolete' && ask.note === undefined) {
            refused.push({ id: step.id, reason: 'an obsolete step needs a "note" saying why' });
            return step;
        }
        var next = __assign(__assign({}, step), { archivedAt: now, archivedBy: 'claude', archivedWhy: ask.why === 'done' ? 'done' : ((_a = ask.note) !== null && _a !== void 0 ? _a : 'obsolete'), heardArchived: true });
        archived.push(next);
        return next;
    });
    var added = ops.add
        .filter(function (one) { return !shelved.some(function (step) { return step.status !== 'done' && !(0, exports.isArchived)(step) && step.title.toLowerCase() === one.title.toLowerCase(); }); })
        .map(function (_a) {
        var _sources = _a.sources, one = __rest(_a, ["sources"]);
        return (__assign(__assign(__assign({}, one), { id: newId(), status: 'todo', heard: 'todo', createdAt: now }), (session === undefined ? {} : { askedIn: session })));
    });
    return { list: __spreadArray(__spreadArray([], shelved, true), added, true), unknown: unknown, added: added, archived: archived, refused: refused };
};
exports.applyOps = applyOps;
/** Whether the person archived the step: out of the active list until restored. */
var isArchived = function (step) { return step.archivedAt !== undefined; };
exports.isArchived = isArchived;
/** The steps that count: everything the person has not archived. */
var activeSteps = function (list) { return list.filter(function (step) { return !(0, exports.isArchived)(step); }); };
exports.activeSteps = activeSteps;
/** The person's archive, most recently archived first. */
var archivedSteps = function (list) {
    return list.filter(exports.isArchived).sort(function (a, b) { var _a, _b; return ((_a = b.archivedAt) !== null && _a !== void 0 ? _a : 0) - ((_b = a.archivedAt) !== null && _b !== void 0 ? _b : 0); });
};
exports.archivedSteps = archivedSteps;
/** Archives an open step the person no longer needs; nothing is deleted, so it can be restored. */
var archiveIn = function (list, id, session, from, now) {
    return list.map(function (step) {
        return step.id !== id || step.status === 'done' || (0, exports.isArchived)(step)
            ? step
            : __assign(__assign({}, step), { archivedAt: now, archivedBy: 'you', tickedIn: session, tickedFrom: from, tickedAt: now });
    });
};
exports.archiveIn = archiveIn;
/** Brings an archived step back to the active list, as it was. */
var restoreIn = function (list, id, session, from, now) {
    return list.map(function (step) {
        if (step.id !== id || !(0, exports.isArchived)(step))
            return step;
        var _archivedAt = step.archivedAt, _archivedBy = step.archivedBy, _archivedWhy = step.archivedWhy, rest = __rest(step, ["archivedAt", "archivedBy", "archivedWhy"]);
        return __assign(__assign({}, rest), { tickedIn: session, tickedFrom: from, tickedAt: now });
    });
};
exports.restoreIn = restoreIn;
/** Whether Claude has heard the step's archive state. */
var archiveHeard = function (step) { var _a; return (0, exports.isArchived)(step) === ((_a = step.heardArchived) !== null && _a !== void 0 ? _a : false); };
/** Moves confirmed steps to the archive once they are a week old. Nothing is ever deleted: every step stays restorable. */
var prune = function (list, now) {
    return list.map(function (step) {
        var _a;
        return step.status === 'done' && !(0, exports.isArchived)(step) && now - ((_a = step.doneAt) !== null && _a !== void 0 ? _a : now) >= DONE_KEPT_MS
            ? __assign(__assign({}, step), { archivedAt: now, archivedBy: 'auto', archivedWhy: 'done', heardArchived: true }) : step;
    });
};
exports.prune = prune;
/** Ticks a step, or unticks it; a confirmed step stays confirmed. */
var toggle = function (list, id, session, from, now) {
    return list.map(function (step) {
        if (step.id !== id || step.status === 'done')
            return step;
        var status = step.status === 'checked' ? 'todo' : 'checked';
        return __assign(__assign({}, step), { status: status, tickedIn: session, tickedFrom: from, tickedAt: now });
    });
};
exports.toggle = toggle;
/** Picks an option of a decision; picking the chosen one again takes the answer back. */
var choose = function (list, id, choice, session, from, now) {
    return list.map(function (step) {
        var _a;
        if (step.id !== id || step.status === 'done' || !((_a = step.choices) !== null && _a !== void 0 ? _a : []).includes(choice))
            return step;
        var tick = { tickedIn: session, tickedFrom: from, tickedAt: now };
        if (step.answer === choice) {
            var _answer = step.answer, rest = __rest(step, ["answer"]);
            return __assign(__assign(__assign({}, rest), tick), { status: 'todo' });
        }
        return __assign(__assign(__assign({}, step), tick), { answer: choice, status: 'checked' });
    });
};
exports.choose = choose;
/** Answers a step that asks for words; an empty answer takes it back. */
var reply = function (list, id, words, session, from, now) {
    return list.map(function (step) {
        if (step.id !== id || step.status === 'done' || step.asks === undefined)
            return step;
        var tick = { tickedIn: session, tickedFrom: from, tickedAt: now };
        var answer = words.trim().slice(0, 2000);
        if (answer === '') {
            var _answer = step.answer, rest = __rest(step, ["answer"]);
            return __assign(__assign(__assign({}, rest), tick), { status: 'todo' });
        }
        return __assign(__assign(__assign({}, step), tick), { answer: answer, status: 'checked' });
    });
};
exports.reply = reply;
/** How the person answers a step: tick it, pick an option, or type. */
var answerKind = function (step) { return (step.choices !== undefined ? 'pick' : step.asks !== undefined ? 'type' : 'tick'); };
exports.answerKind = answerKind;
/** Steps whose status, picked option or archive state Claude has not heard yet. */
var unheard = function (list) {
    return list.filter(function (step) {
        var _a, _b;
        return step.status !== 'done' &&
            (!archiveHeard(step) ||
                (!(0, exports.isArchived)(step) && (step.status !== step.heard || (step.status === 'checked' && ((_a = step.answer) !== null && _a !== void 0 ? _a : '') !== ((_b = step.heardAnswer) !== null && _b !== void 0 ? _b : '')))));
    });
};
exports.unheard = unheard;
/**
 * The unheard ticks session `session` of project `key` picks up: those of the steps it asked for,
 * and, once their session is closed, those made in its pane or, from another project's pane, by
 * the project's last-used session (`live`: the open sessions, this one included).
 */
var ticksFor = function (list, session, key, live) {
    return (0, exports.unheard)(list).filter(function (step) { return (0, routing_1.hearerOf)(step, key, live) === session; });
};
exports.ticksFor = ticksFor;
/** Makes `session` the one that hears these steps' ticks: it waits on them now. */
var adopt = function (list, ids, session) {
    return list.map(function (step) { return (ids.has(step.id) && step.askedIn !== session ? __assign(__assign({}, step), { askedIn: session }) : step); });
};
exports.adopt = adopt;
/** Records that Claude was told these steps' statuses; a step ticked again since stays unheard. */
var markHeard = function (list, told) {
    return list.map(function (step) {
        var said = told.find(function (one) { return one.id === step.id; });
        if (said === undefined || said.status !== step.status || said.answer !== step.answer || (0, exports.isArchived)(said) !== (0, exports.isArchived)(step))
            return step;
        var archived = (0, exports.isArchived)(step) ? { heardArchived: true } : {};
        var _heardArchived = step.heardArchived, rest = __rest(step, ["heardArchived"]);
        return step.answer === undefined ? __assign(__assign(__assign({}, rest), archived), { heard: step.status }) : __assign(__assign(__assign({}, rest), archived), { heard: step.status, heardAnswer: step.answer });
    });
};
exports.markHeard = markHeard;
/** What Claude reads when the person has ticked or unticked steps. */
var noteFor = function (all, goals) {
    if (goals === void 0) { goals = []; }
    var archivedNow = all.filter(function (step) { return (0, exports.isArchived)(step) && !archiveHeard(step); });
    var restored = all.filter(function (step) { return !(0, exports.isArchived)(step) && !archiveHeard(step); });
    var steps = (0, exports.activeSteps)(all).filter(archiveHeard);
    var ticked = steps.filter(function (step) { return step.status === 'checked' && step.answer === undefined; });
    var answered = steps.filter(function (step) { return step.status === 'checked' && step.answer !== undefined && step.asks !== undefined; });
    var decided = steps.filter(function (step) { return step.status === 'checked' && step.answer !== undefined && step.asks === undefined; });
    var unticked = steps.filter(function (step) { return step.status === 'todo'; });
    var unblocks = function (step) {
        var names = goals
            .filter(function (goal) { var _a; return goal.status === 'waiting' && ((_a = goal.waitingFor) !== null && _a !== void 0 ? _a : []).some(function (one) { return one === step.id || one.toLowerCase() === step.title.toLowerCase(); }); })
            .map(function (goal) { return "\"".concat(goal.title, "\""); });
        return names.length > 0 ? " (the goal ".concat(names.join(', '), " waits on it)") : '';
    };
    var line = function (step) { return "- ".concat(step.id, " \u00B7 ").concat(step.title).concat(unblocks(step)); };
    var pick = function (step) { return "- ".concat(step.id, " \u00B7 ").concat(step.title, " \u2192 \"").concat(step.answer, "\"").concat(unblocks(step)); };
    var words = function (step) { return "- ".concat(step.id, " \u00B7 ").concat(step.title, " (asked: ").concat(step.asks, ")").concat(unblocks(step), "\n  \u00AB ").concat(step.answer, " \u00BB"); };
    var parts = [
        answered.length > 0 &&
            "The person answered in the Overview pane:\n".concat(answered.map(words).join('\n'), "\nUse ").concat(answered.length === 1 ? 'the answer' : 'the answers', ", then confirm the step with ").concat(exports.YOUR_STEPS_TOOL, ", \"checked\" saying what you did with it."),
        decided.length > 0 &&
            "The person decided in the Overview pane:\n".concat(decided.map(pick).join('\n'), "\nAct on ").concat(decided.length === 1 ? 'it' : 'them', ", then confirm the step with ").concat(exports.YOUR_STEPS_TOOL, ", \"checked\" saying what you did."),
        ticked.length > 0 &&
            "The person ticked ".concat(ticked.length === 1 ? 'this step' : 'these steps', " as done in the Overview pane:\n").concat(ticked.map(line).join('\n'), "\nCheck each one yourself when you can, then confirm it with ").concat(exports.YOUR_STEPS_TOOL, " (saying how you checked), or reopen it with a short note saying what is missing. Then carry on with any goal that was waiting on it."),
        archivedNow.length > 0 &&
            "The person archived ".concat(archivedNow.length === 1 ? 'this step' : 'these steps', " in the Overview pane as no longer relevant:\n").concat(archivedNow.map(line).join('\n'), "\nStop waiting on ").concat(archivedNow.length === 1 ? 'it' : 'them', " and do not add ").concat(archivedNow.length === 1 ? 'it' : 'them', " again; the person can restore an archived step from the pane."),
        restored.length > 0 &&
            "The person restored ".concat(restored.length === 1 ? 'this step' : 'these steps', " from the archive; open again:\n").concat(restored.map(line).join('\n')),
        unticked.length > 0 &&
            "The person unticked ".concat(unticked.length === 1 ? 'this step' : 'these steps', " (or took back their pick or answer); not done after all:\n").concat(unticked.map(line).join('\n')),
    ].filter(Boolean);
    return parts.join('\n\n');
};
exports.noteFor = noteFor;
/** The list as the tool answers it to Claude. */
var describeList = function (list) {
    var open = (0, exports.activeSteps)(list).filter(function (step) { return step.status !== 'done'; });
    var shelved = (0, exports.archivedSteps)(list);
    var why = function (step) { return (step.archivedBy === 'you' || step.archivedBy === undefined ? 'by the person' : step.archivedWhy === 'done' ? 'done' : "obsolete: ".concat(step.archivedWhy)); };
    var archive = shelved.length > 0
        ? "\nArchived, kept and restorable by the person (do not add them again):\n".concat(shelved.slice(0, 20).map(function (step) { return "- ".concat(step.id, " \u00B7 ").concat(step.title, " (").concat(why(step), ")"); }).join('\n')).concat(shelved.length > 20 ? "\n\u2026 and ".concat(shelved.length - 20, " older") : '')
        : '';
    if (open.length === 0)
        return "No open steps for the person.".concat(archive);
    var word = function (step) {
        return step.status === 'checked'
            ? step.answer !== undefined
                ? step.asks !== undefined
                    ? "answered \u00AB ".concat(step.answer, " \u00BB, not confirmed yet")
                    : "decided \"".concat(step.answer, "\", not confirmed yet")
                : 'ticked by the person, not confirmed yet'
            : step.note
                ? "to do (reopened: ".concat(step.note, ")")
                : step.choices
                    ? "decision waiting (".concat(step.choices.join(' / '), ")")
                    : step.asks
                        ? "answer waiting (asks: ".concat(step.asks, ")")
                        : 'to do';
    };
    var due = function (step) { return (step.due ? " \u00B7 due ".concat(step.due) : ''); };
    return __spreadArray(['Open steps for the person:'], open.map(function (step) { return "- ".concat(step.id, " \u00B7 ").concat(word(step)).concat(due(step), " \u00B7 ").concat(step.title); }), true).join('\n') + archive;
};
exports.describeList = describeList;
/** The quiet transcript line for one call of the tool. */
var summarizeCall = function (input) {
    var ops = (0, exports.parseOps)((input !== null && input !== void 0 ? input : {}));
    var parts = [
        ops.add.length > 0 && "".concat(ops.add.length, " added"),
        ops.update.length > 0 && "".concat(ops.update.length, " updated"),
        ops.confirm.length > 0 && "".concat(ops.confirm.length, " confirmed"),
        ops.reopen.length > 0 && "".concat(ops.reopen.length, " reopened"),
        ops.archive.length > 0 && "".concat(ops.archive.length, " archived"),
    ].filter(Boolean);
    return "Your steps \u00B7 ".concat(parts.length > 0 ? parts.join(', ') : 'checked the list');
};
exports.summarizeCall = summarizeCall;
/** A project's steps as kept in the store: `{ label, steps }`, or a bare list from before labels. */
var readStored = function (stored) {
    if (Array.isArray(stored))
        return { steps: stored };
    if (typeof stored !== 'object' || stored === null)
        return { steps: [] };
    var _a = stored, label = _a.label, steps = _a.steps;
    return { label: typeof label === 'string' ? label : undefined, steps: Array.isArray(steps) ? steps : [] };
};
exports.readStored = readStored;
/** A project's short name: its git remote's repository name, else its folder's name. */
var labelFor = function (root, remote) {
    var fromRemote = remote === null || remote === void 0 ? void 0 : remote.replace(/\.git$/, '').split(/[/:]/).pop();
    var fromFolder = root.split('/').filter(Boolean).pop();
    return fromRemote || fromFolder || root;
};
exports.labelFor = labelFor;
/** The phone line when Claude adds or reopens steps, under 200 characters. */
var phoneLine = function (label, added, reopened) {
    var _a;
    var asks = function (step) { return ((step === null || step === void 0 ? void 0 : step.choices) ? 'needs a decision' : (step === null || step === void 0 ? void 0 : step.asks) ? 'needs an answer' : 'needs you'); };
    var parts = [
        added.length === 1 && "".concat(label, " ").concat(asks(added[0]), ": ").concat((_a = added[0]) === null || _a === void 0 ? void 0 : _a.title),
        added.length > 1 && "".concat(label, " needs you for ").concat(added.length, " steps: ").concat(added.map(function (step) { return step.title; }).join(' · ')),
        reopened.length > 0 && "Not done yet: ".concat(reopened.map(function (one) { return "".concat(one.title, " (").concat(one.note, ")"); }).join(' · ')),
    ].filter(Boolean);
    var line = parts.join(' — ');
    return line.length > 195 ? "".concat(line.slice(0, 194), "\u2026") : line;
};
exports.phoneLine = phoneLine;
var pad = function (n) { return String(n).padStart(2, '0'); };
/** The local day of a clock time, `YYYY-MM-DD`. */
var dayOf = function (ms) {
    var date = new Date(ms);
    return "".concat(date.getFullYear(), "-").concat(pad(date.getMonth() + 1), "-").concat(pad(date.getDate()));
};
exports.dayOf = dayOf;
var WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
/** "Mon 2 Nov" for `2026-11-02`. */
var dayName = function (day) {
    var _a = day.split('-').map(Number), year = _a[0], month = _a[1], date = _a[2];
    var at = new Date(year !== null && year !== void 0 ? year : 1970, (month !== null && month !== void 0 ? month : 1) - 1, date !== null && date !== void 0 ? date : 1);
    return "".concat(WEEKDAYS[at.getDay()], " ").concat(at.getDate(), " ").concat(MONTHS[at.getMonth()]);
};
exports.dayName = dayName;
var daysBetween = function (from, to) {
    var at = function (day) {
        var _a = day.split('-').map(Number), year = _a[0], month = _a[1], date = _a[2];
        return Date.UTC(year !== null && year !== void 0 ? year : 1970, (month !== null && month !== void 0 ? month : 1) - 1, date !== null && date !== void 0 ? date : 1);
    };
    return Math.round((at(to) - at(from)) / DAY_MS);
};
/** The deadline as the pane says it, and whether it is pressing (today, tomorrow or past). */
var dueText = function (due, now) {
    var left = daysBetween((0, exports.dayOf)(now), due);
    if (left < 0)
        return { text: "overdue since ".concat((0, exports.dayName)(due)), isPressing: true };
    if (left === 0)
        return { text: 'due today', isPressing: true };
    if (left === 1)
        return { text: 'due tomorrow', isPressing: true };
    return { text: "by ".concat((0, exports.dayName)(due)), isPressing: false };
};
exports.dueText = dueText;
/** How long a step has waited, once it is a day or more. */
var waitedText = function (step, now) {
    var days = Math.floor((now - step.createdAt) / DAY_MS);
    return days >= 1 ? "waiting ".concat(days === 1 ? '1 day' : "".concat(days, " days")) : undefined;
};
exports.waitedText = waitedText;
/** Open steps with a deadline first, soonest first, then the rest as they came. */
var sortSteps = function (steps) {
    return __spreadArray([], steps, true).sort(function (a, b) {
        if (a.due !== undefined && b.due !== undefined)
            return a.due.localeCompare(b.due);
        if (a.due !== undefined)
            return -1;
        if (b.due !== undefined)
            return 1;
        return a.createdAt - b.createdAt;
    });
};
exports.sortSteps = sortSteps;
/**
 * Steps the person's phone should be reminded of now: still to do, and either waiting a day or due
 * by tomorrow, with no reminder in the last day. Only between 9:00 and 21:00 local time.
 */
var dueReminders = function (list, now) {
    var hour = new Date(now).getHours();
    if (hour < 9 || hour >= 21)
        return [];
    return list.filter(function (step) {
        if (step.status !== 'todo' || (0, exports.isArchived)(step))
            return false;
        if (step.remindedAt !== undefined && now - step.remindedAt < DAY_MS)
            return false;
        var isOld = now - step.createdAt >= DAY_MS;
        var isNear = step.due !== undefined && daysBetween((0, exports.dayOf)(now), step.due) <= 1;
        return isOld || isNear;
    });
};
exports.dueReminders = dueReminders;
/** One phone line for the steps to be reminded of, under 200 characters. */
var reminderLine = function (label, steps, now) {
    var _a;
    var tag = function (step) { return (step.due ? " (".concat((0, exports.dueText)(step.due, now).text, ")") : ''); };
    var line = steps.length === 1
        ? "".concat(label, ": still waiting for you \u2014 ").concat((_a = steps[0]) === null || _a === void 0 ? void 0 : _a.title).concat(steps[0] ? tag(steps[0]) : '')
        : "".concat(label, ": ").concat(steps.length, " steps waiting for you \u2014 ").concat(steps.map(function (step) { return "".concat(step.title).concat(tag(step)); }).join(' · '));
    return line.length > 195 ? "".concat(line.slice(0, 194), "\u2026") : line;
};
exports.reminderLine = reminderLine;
var markReminded = function (list, reminded, now) {
    return list.map(function (step) { return (reminded.some(function (one) { return one.id === step.id; }) ? __assign(__assign({}, step), { remindedAt: now }) : step); });
};
exports.markReminded = markReminded;
/** Open steps by urgency: overdue, due within a week, later, and with no date; empty groups left out. */
var groupSteps = function (steps, now) {
    var _a;
    var today = (0, exports.dayOf)(now);
    var groups = [
        { id: 'overdue', label: 'Overdue', steps: [] },
        { id: 'soon', label: 'This week', steps: [] },
        { id: 'later', label: 'Later', steps: [] },
        { id: 'undated', label: 'No date', steps: [] },
    ];
    var _loop_1 = function (step) {
        var left = step.due === undefined ? undefined : daysBetween(today, step.due);
        var id = left === undefined ? 'undated' : left < 0 ? 'overdue' : left <= 7 ? 'soon' : 'later';
        (_a = groups.find(function (group) { return group.id === id; })) === null || _a === void 0 ? void 0 : _a.steps.push(step);
    };
    for (var _i = 0, _b = (0, exports.sortSteps)(steps); _i < _b.length; _i++) {
        var step = _b[_i];
        _loop_1(step);
    }
    return groups.filter(function (group) { return group.steps.length > 0; });
};
exports.groupSteps = groupSteps;
/** Lower case, accents off: how a search matches. */
var folded = function (text) { return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); };
/** Whether a step matches every word searched, in its title, details, answer, options or note. */
var matchesSearch = function (step, search) {
    var _a;
    var words = folded(search).split(/\s+/).filter(Boolean);
    if (words.length === 0)
        return true;
    var haystack = folded(__spreadArray([step.title, step.detail, step.more, step.answer, step.asks, step.note, step.checked, step.archivedWhy], ((_a = step.choices) !== null && _a !== void 0 ? _a : []), true).filter(Boolean).join(' '));
    return words.every(function (word) { return haystack.includes(word); });
};
exports.matchesSearch = matchesSearch;
/** The filters of Your move, in the order the pane shows them. */
exports.FILTERS = [
    { id: 'all', label: 'All' },
    { id: 'decide', label: 'Decisions' },
    { id: 'overdue', label: 'Overdue' },
    { id: 'week', label: 'This week' },
    { id: 'later', label: 'Later' },
    { id: 'ticked', label: 'Ticked' },
    { id: 'archived', label: 'Archived' },
];
/** The steps a filter and a search keep, soonest first: open ones, or the archive for "archived". */
var filterSteps = function (list, filter, search, now) {
    var today = (0, exports.dayOf)(now);
    var left = function (step) { return (step.due === undefined ? undefined : daysBetween(today, step.due)); };
    var pool = filter === 'archived' ? (0, exports.archivedSteps)(list) : (0, exports.sortSteps)((0, exports.activeSteps)(list).filter(function (step) { return step.status !== 'done'; }));
    var keep = function (step) {
        var days = left(step);
        switch (filter) {
            case 'decide':
                return step.choices !== undefined && step.status === 'todo';
            case 'overdue':
                return days !== undefined && days < 0;
            case 'week':
                return days !== undefined && days >= 0 && days <= 7;
            case 'later':
                return days === undefined || days > 7;
            case 'ticked':
                return step.status === 'checked';
            default:
                return true;
        }
    };
    return pool.filter(function (step) { return keep(step) && (0, exports.matchesSearch)(step, search); });
};
exports.filterSteps = filterSteps;
