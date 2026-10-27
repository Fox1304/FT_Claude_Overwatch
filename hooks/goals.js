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
exports.isBlocked = exports.stepsFor = exports.archive = exports.merge = exports.parseGoals = exports.technicalTitles = exports.HIDDEN_NOTE = exports.GOALS_GUIDE = exports.GOALS_SCHEMA = exports.GOALS_DESCRIPTION = exports.EMPTY = exports.STATUSES = exports.GOALS_TOOL = void 0;
exports.GOALS_TOOL = 'mcp__overview__goals';
exports.STATUSES = ['planned', 'active', 'waiting', 'done'];
var EARLIER_KEPT = 30;
exports.EMPTY = { summary: '', goals: [], earlier: [] };
exports.GOALS_DESCRIPTION = [
    'Updates the Overview pane: the person sees only these goals, never your steps.',
    'Send the whole list each time; it replaces the previous one.',
    'Each title is a result the person gets, in plain words, without file names, commands, tools or code.',
].join(' ');
exports.GOALS_SCHEMA = {
    type: 'object',
    properties: {
        summary: { type: 'string', description: 'One short line: the overall aim, as a result.' },
        goals: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    title: { type: 'string', description: 'The result, in plain words.' },
                    status: { type: 'string', enum: exports.STATUSES },
                    progress: { type: 'number', minimum: 0, maximum: 100 },
                    waitingFor: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'For a "waiting" goal: the ids of the person\'s steps it waits on.',
                    },
                },
                required: ['title', 'status'],
            },
        },
    },
    required: ['goals'],
};
exports.GOALS_GUIDE = "# Overview pane\n\nThe person follows your work in an Overview pane that shows outcomes only. Keep it current with the ".concat(exports.GOALS_TOOL, " tool.\n\n- When a request needs more than a couple of steps, call it before starting, with the top-level goals (usually 2 to 6).\n- Write each goal as the result the person will get, in plain words a non-engineer understands, in the language they write in. No file names, commands, tool names, code identifiers, test names or technical steps. Good: \"Parents can pay in euros\". Bad: \"Add EUR price to PaywallStore.swift and run xcodebuild\". Titles that read as technical steps are sent back.\n- Exactly one goal is \"active\" while you work; the rest are \"planned\", \"waiting\" or \"done\". Mark a goal \"done\" as soon as its result is reached, and set \"progress\" (0 to 100) on the active goal when you can estimate it.\n- A goal that cannot go on until the person does something is \"waiting\", with \"waitingFor\" naming the ids of their steps (add those first with the steps tool). Go on with other goals meanwhile, or tell the person you are waiting.\n- Send the whole list every time, finished goals included; it replaces the previous list. A new request starts a new list.\n- \"summary\" is one short line naming the overall aim.\n- The person can leave a note on any goal, step or map item from the pane (its \u270E button). It reaches you as \u00AB The person left a note\u2026 \u00BB: rework, reword, reorder or remove that item as asked, then say in one line what you changed.\n- Before your final answer, mark every reached goal \"done\". Skip the tool for quick answers and questions.");
exports.HIDDEN_NOTE = "\n- The person does not see your tool calls, only this pane and your messages. When you write to them mid-task, say what changed for them, not which files or commands you used.";
/** The engine's own names that look like code but are plain words. */
var BRANDS = /^(macOS|iPadOS|watchOS|tvOS|visionOS)$/;
var TECHNICAL = [
    /`/,
    /\b[\w-]+\.(swift|kts?|tsx?|jsx?|mjs|json|md|ya?ml|sh|py|sql|xml|gradle|plist|html|css|toml|lock|env|xcodeproj|pbxproj)\b/i,
    /(^|\s)(~|\.{1,2})?\/[\w.-]+\//,
    /\b(xcodebuild|gradlew|npm|npx|pnpm|yarn|git|supabase|fastlane|deno|curl|grep|sed|jq|tsc|swiftlint|simctl|adb)\b/i,
    /(^|\s)--?[a-z][\w-]*/,
    /\w\(\)/,
    /\b[a-z0-9]+_[a-z0-9_]+\b/,
];
var isCamel = function (word) { return /^[a-z]{2,}[A-Z][A-Za-z]*$/.test(word) && !BRANDS.test(word); };
/** The goal titles that read as technical steps rather than results. */
var technicalTitles = function (goals) {
    return goals
        .map(function (goal) { return goal.title; })
        .filter(function (title) { return TECHNICAL.some(function (pattern) { return pattern.test(title); }) || title.split(/[^\w]+/).some(isCamel); });
};
exports.technicalTitles = technicalTitles;
var sameTitle = function (a, b) { return a.trim().toLowerCase() === b.trim().toLowerCase(); };
/** Reads the model's goals loosely: unknown statuses become planned, bad rows go. */
var parseGoals = function (raw) {
    return (Array.isArray(raw) ? raw : []).flatMap(function (item) {
        if (typeof item !== 'object' || item === null)
            return [];
        var _a = item, title = _a.title, status = _a.status, progress = _a.progress, waitingFor = _a.waitingFor;
        if (typeof title !== 'string' || title.trim() === '')
            return [];
        var goal = {
            title: title.trim(),
            status: exports.STATUSES.includes(status) ? status : 'planned',
        };
        if (typeof progress === 'number' && Number.isFinite(progress) && goal.status === 'active') {
            goal.progress = Math.max(0, Math.min(100, Math.round(progress)));
        }
        if (goal.status === 'waiting' && Array.isArray(waitingFor)) {
            var named = waitingFor.filter(function (one) { return typeof one === 'string' && one.trim() !== ''; });
            if (named.length > 0)
                goal.waitingFor = named.map(function (one) { return one.trim(); });
        }
        return [goal];
    });
};
exports.parseGoals = parseGoals;
/** The new list wins; finished goals it dropped move to `earlier`. */
var merge = function (prev, goals, summary, now) {
    var stamped = goals.map(function (goal) {
        var _a;
        if (goal.status !== 'done')
            return goal;
        var before = prev.goals.find(function (one) { return sameTitle(one.title, goal.title); });
        return __assign(__assign({}, goal), { doneAt: (_a = before === null || before === void 0 ? void 0 : before.doneAt) !== null && _a !== void 0 ? _a : now });
    });
    var kept = function (one) { return !stamped.some(function (goal) { return sameTitle(goal.title, one.title); }); };
    var leftDone = prev.goals
        .filter(function (one) { return one.status === 'done' && kept(one); })
        .sort(function (a, b) { var _a, _b; return ((_a = b.doneAt) !== null && _a !== void 0 ? _a : 0) - ((_b = a.doneAt) !== null && _b !== void 0 ? _b : 0); });
    var earlier = __spreadArray(__spreadArray([], leftDone, true), prev.earlier.filter(kept), true).slice(0, EARLIER_KEPT);
    return { summary: summary, goals: stamped, earlier: earlier };
};
exports.merge = merge;
/** A finished request's goals move to the done list when the person asks for something new. */
var archive = function (prev) {
    var isFinished = prev.goals.length > 0 && prev.goals.every(function (goal) { return goal.status === 'done'; });
    if (!isFinished)
        return prev;
    var done = __spreadArray([], prev.goals, true).sort(function (a, b) { var _a, _b; return ((_a = b.doneAt) !== null && _a !== void 0 ? _a : 0) - ((_b = a.doneAt) !== null && _b !== void 0 ? _b : 0); });
    return { summary: '', goals: [], earlier: __spreadArray(__spreadArray([], done, true), prev.earlier, true).slice(0, EARLIER_KEPT) };
};
exports.archive = archive;
/** The person's steps a waiting goal names, by id or by title. */
var stepsFor = function (goal, steps) {
    var _a;
    return ((_a = goal.waitingFor) !== null && _a !== void 0 ? _a : []).flatMap(function (name) {
        var found = steps.find(function (step) { return step.id === name || sameTitle(step.title, name); });
        return found === undefined ? [] : [found];
    });
};
exports.stepsFor = stepsFor;
/** Whether a waiting goal still waits on the person: some of its steps are not ticked yet. */
var isBlocked = function (goal, steps) {
    if (goal.status !== 'waiting')
        return false;
    var named = (0, exports.stepsFor)(goal, steps);
    // A step the person archived no longer holds the goal back.
    return named.length === 0 || named.some(function (step) { return step.status === 'todo' && step.archivedAt === undefined; });
};
exports.isBlocked = isBlocked;
