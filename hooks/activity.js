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
exports.cardLine = exports.cardFor = exports.countOf = exports.forgetGone = exports.record = exports.describeAction = exports.BEFORE_PLAN = exports.HEARTBEAT_MS = exports.SESSION_FORGET_MS = exports.SESSION_STALE_MS = exports.SESSION_PREFIX = void 0;
var goals_1 = require("./goals");
exports.SESSION_PREFIX = 'session:';
/** A session that has not published for this long is gone (it crashed or was closed hard). */
exports.SESSION_STALE_MS = 90000;
/** Gone sessions' cards are deleted after this long. */
exports.SESSION_FORGET_MS = 60 * 60 * 1000;
/** A session republishes an unchanged card this often, as a heartbeat. */
exports.HEARTBEAT_MS = 30000;
/** The bucket for actions taken before Claude set any active goal. */
exports.BEFORE_PLAN = 'Getting started';
var ACTIONS_PER_GOAL = 30;
var GOALS_WITH_ACTIVITY = 40;
var base = function (path) { var _a; return (typeof path === 'string' ? ((_a = path.split('/').pop()) !== null && _a !== void 0 ? _a : path) : 'a file'); };
var host = function (url) {
    var _a;
    if (typeof url !== 'string')
        return 'a page';
    var match = /^https?:\/\/([^/]+)/.exec(url);
    return (_a = match === null || match === void 0 ? void 0 : match[1]) !== null && _a !== void 0 ? _a : url;
};
var humanize = function (name) { return name.replace(/[_-]+/g, ' ').trim(); };
/**
 * One line for what a tool call did, as a reader of the pane wants it; null for calls that are
 * bookkeeping (loading a tool, the overview's own tools).
 */
var describeAction = function (tool, input) {
    var _a, _b, _c, _d;
    var args = (input !== null && input !== void 0 ? input : {});
    var text = function (value) { return (typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined); };
    if (tool.startsWith('mcp__overview__') || tool === 'ToolSearch' || tool === 'TodoWrite')
        return null;
    switch (tool) {
        case 'Bash':
        case 'PowerShell':
            return (_a = text(args.description)) !== null && _a !== void 0 ? _a : 'Ran a command';
        case 'Read':
            return "Read ".concat(base(args.file_path));
        case 'Write':
            return "Wrote ".concat(base(args.file_path));
        case 'Edit':
        case 'MultiEdit':
        case 'NotebookEdit':
            return "Changed ".concat(base((_b = args.file_path) !== null && _b !== void 0 ? _b : args.notebook_path));
        case 'Grep':
        case 'Glob':
            return 'Searched the code';
        case 'WebFetch':
            return "Read ".concat(host(args.url));
        case 'WebSearch':
            return "Searched the web".concat(text(args.query) ? ": ".concat(text(args.query)) : '');
        case 'Agent':
        case 'Task':
            return "Asked a helper".concat(text(args.description) ? ": ".concat(text(args.description)) : '');
        case 'Skill':
            return "Used the ".concat((_c = text(args.skill)) !== null && _c !== void 0 ? _c : '', " skill").replace('  ', ' ');
        case 'Artifact':
            return 'Worked on a published page';
        case 'AskUserQuestion':
            return 'Asked you a question';
        case 'SendUserFile':
            return 'Sent you a file';
    }
    if (tool.startsWith('mcp__Claude_Browser__') || tool.startsWith('mcp__claude-in-chrome__'))
        return 'Used the browser';
    if (tool.startsWith('mcp__computer-use__'))
        return 'Used the computer';
    if (tool.startsWith('mcp__Claude_Code_iOS_Simulator__'))
        return 'Used the iPhone simulator';
    var mcp = /^mcp__([^_]+(?:_[^_]+)*?)__(.+)$/.exec(tool);
    if (mcp)
        return "Used ".concat(humanize((_d = mcp[2]) !== null && _d !== void 0 ? _d : tool));
    return humanize(tool);
};
exports.describeAction = describeAction;
/** Adds one action to a goal's list, counting a repeat of the last line instead of adding it. */
var record = function (activity, goal, label, failed) {
    var _a;
    var _b;
    var list = (_b = activity[goal]) !== null && _b !== void 0 ? _b : [];
    var last = list[list.length - 1];
    var next = last !== undefined && last.label === label && Boolean(last.failed) === failed
        ? __spreadArray(__spreadArray([], list.slice(0, -1), true), [__assign(__assign({}, last), { count: last.count + 1 })], false) : __spreadArray(__spreadArray([], list, true), [failed ? { label: label, count: 1, failed: failed } : { label: label, count: 1 }], false).slice(-ACTIONS_PER_GOAL);
    var kept = Object.entries(__assign(__assign({}, activity), (_a = {}, _a[goal] = next, _a))).slice(-GOALS_WITH_ACTIVITY);
    return Object.fromEntries(kept);
};
exports.record = record;
/** Keeps only the goals the pane can still show. */
var forgetGone = function (activity, board) {
    var titles = new Set(__spreadArray(__spreadArray([exports.BEFORE_PLAN], board.goals.map(function (goal) { return goal.title; }), true), board.earlier.map(function (goal) { return goal.title; }), true));
    return Object.fromEntries(Object.entries(activity).filter(function (_a) {
        var title = _a[0];
        return titles.has(title);
    }));
};
exports.forgetGone = forgetGone;
var countOf = function (actions) {
    return (actions !== null && actions !== void 0 ? actions : []).reduce(function (sum, action) { return sum + action.count; }, 0);
};
exports.countOf = countOf;
/** What this session publishes about itself for the other sessions' panes. */
var cardFor = function (id, project, board, working, steps, now, key, activeAt) {
    var _a;
    var summary = board.summary, goals = board.goals;
    var done = goals.filter(function (goal) { return goal.status === 'done'; }).length;
    var active = (_a = goals.find(function (goal) { return goal.status === 'active'; })) === null || _a === void 0 ? void 0 : _a.title;
    var state = goals.length > 0 && done === goals.length
        ? 'done'
        : working
            ? 'working'
            : goals.some(function (goal) { return (0, goals_1.isBlocked)(goal, steps); })
                ? 'waiting'
                : goals.length > 0
                    ? 'paused'
                    : 'idle';
    return __assign(__assign(__assign(__assign({ id: id, project: project, summary: summary }, (active ? { active: active } : {})), { done: done, total: goals.length, state: state, updatedAt: now }), (key !== undefined ? { key: key } : {})), (activeAt !== undefined ? { activeAt: activeAt } : {}));
};
exports.cardFor = cardFor;
/** The card's words in another session's pane. */
var cardLine = function (card) {
    var what = card.summary || card.active || (card.state === 'idle' ? 'No task right now' : 'A task');
    var progress = card.total > 0 ? " \u00B7 ".concat(card.done, " of ").concat(card.total, " done") : '';
    var state = { working: 'working', waiting: 'waiting for you', paused: 'paused', done: 'all done', idle: 'idle' }[card.state];
    return "".concat(what).concat(progress, " \u00B7 ").concat(state);
};
exports.cardLine = cardLine;
