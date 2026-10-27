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
exports.describeMap = exports.applyMap = exports.addChanges = exports.diffMaps = exports.readChanges = exports.readMap = exports.parseMap = exports.MAP_GUIDE = exports.MAP_SCHEMA = exports.MAP_DESCRIPTION = exports.EMPTY_MAP = exports.CHANGES_PREFIX = exports.MAP_PREFIX = exports.MAP_TOOL = void 0;
exports.MAP_TOOL = 'mcp__overview__project_map';
exports.MAP_PREFIX = 'map:';
exports.CHANGES_PREFIX = 'changes:';
exports.EMPTY_MAP = { milestones: [], parts: [], updatedAt: 0 };
var MILESTONE_STATUSES = ['done', 'active', 'next', 'later'];
var PART_STATUSES = ['done', 'active', 'stuck', 'waiting', 'todo'];
var CHANGES_KEPT = 40;
var DATE = /^\d{4}-\d{2}-\d{2}$/;
exports.MAP_DESCRIPTION = [
    "Keeps the project's map in the Overview pane, shared by every session of this project: its milestones (a timeline) and its parts (a grid of cards).",
    'Send "milestones" and/or "parts"; each list you send replaces the stored one, the other stays. Call it with nothing to read the map.',
    'Titles and notes in plain words a non-engineer understands, no file names or code.',
].join(' ');
exports.MAP_SCHEMA = {
    type: 'object',
    properties: {
        milestones: {
            type: 'array',
            description: 'The stages, in order, 3 to 7: exactly one "active" while work goes on.',
            items: {
                type: 'object',
                properties: {
                    title: { type: 'string', description: 'Short: "Public beta", "Launch".' },
                    status: { type: 'string', enum: MILESTONE_STATUSES },
                    date: { type: 'string', description: 'YYYY-MM-DD: when reached (done) or planned.' },
                },
                required: ['title', 'status'],
            },
        },
        parts: {
            type: 'array',
            description: 'The parts of the project, 4 to 12.',
            items: {
                type: 'object',
                properties: {
                    title: { type: 'string', description: 'Short: "iOS app", "Mail", "Store pages".' },
                    status: { type: 'string', enum: PART_STATUSES },
                    progress: { type: 'number', minimum: 0, maximum: 100 },
                    note: { type: 'string', description: 'One short line: what is left, what it waits on, when it shipped.' },
                    milestone: { type: 'string', description: 'The milestone it is needed for, by its title.' },
                },
                required: ['title', 'status'],
            },
        },
    },
};
exports.MAP_GUIDE = "\n## Project map\n\nFor a project with work that spans days, keep its map with the ".concat(exports.MAP_TOOL, " tool: the milestones (3 to 7, in order, one \"active\") and the parts (4 to 12 cards: status \"done\", \"active\" with \"progress\", \"stuck\", \"waiting\" on the person, or \"todo\"; a one-line \"note\"; the \"milestone\" it is needed for). Read it first when you start on the project (call it with nothing), and update it when a part or a milestone moves; the pane shows what changed. Plain words only.");
var text = function (value, limit) {
    if (limit === void 0) { limit = 120; }
    return typeof value === 'string' && value.trim() !== '' ? value.trim().slice(0, limit) : undefined;
};
/** Reads the model's map loosely: rows without a title go, unknown statuses fall back. */
var parseMap = function (raw) {
    var input = {};
    if (Array.isArray(raw.milestones)) {
        input.milestones = raw.milestones.slice(0, 9).flatMap(function (item) {
            var row = (item !== null && item !== void 0 ? item : {});
            var title = text(row.title, 40);
            if (title === undefined)
                return [];
            var status = MILESTONE_STATUSES.includes(row.status) ? row.status : 'later';
            var milestone = { title: title, status: status };
            var date = text(row.date);
            if (date !== undefined && DATE.test(date))
                milestone.date = date;
            return [milestone];
        });
    }
    if (Array.isArray(raw.parts)) {
        input.parts = raw.parts.slice(0, 16).flatMap(function (item) {
            var row = (item !== null && item !== void 0 ? item : {});
            var title = text(row.title, 40);
            if (title === undefined)
                return [];
            var status = PART_STATUSES.includes(row.status) ? row.status : 'todo';
            var part = { title: title, status: status };
            if (typeof row.progress === 'number' && Number.isFinite(row.progress) && status === 'active') {
                part.progress = Math.max(0, Math.min(100, Math.round(row.progress)));
            }
            var note = text(row.note, 90);
            if (note !== undefined)
                part.note = note;
            var milestone = text(row.milestone, 40);
            if (milestone !== undefined)
                part.milestone = milestone;
            return [part];
        });
    }
    return input;
};
exports.parseMap = parseMap;
var readMap = function (stored) {
    if (typeof stored !== 'object' || stored === null)
        return exports.EMPTY_MAP;
    var _a = stored, milestones = _a.milestones, parts = _a.parts, updatedAt = _a.updatedAt, updatedIn = _a.updatedIn;
    return __assign({ milestones: Array.isArray(milestones) ? milestones : [], parts: Array.isArray(parts) ? parts : [], updatedAt: typeof updatedAt === 'number' ? updatedAt : 0 }, (typeof updatedIn === 'string' ? { updatedIn: updatedIn } : {}));
};
exports.readMap = readMap;
var readChanges = function (stored) { return (Array.isArray(stored) ? stored : []); };
exports.readChanges = readChanges;
var same = function (a, b) { return a.trim().toLowerCase() === b.trim().toLowerCase(); };
var partWord = function (part) {
    return part.status === 'active'
        ? part.progress !== undefined
            ? "".concat(part.progress, "%")
            : 'In progress'
        : { done: 'Done', stuck: 'Stuck', waiting: 'Waiting on you', todo: 'Not started' }[part.status];
};
/** What moved between two maps, as feed lines: parts and milestones whose status (or progress) changed. */
var diffMaps = function (before, after, now) {
    var changes = [];
    var _loop_1 = function (part) {
        var was = before.parts.find(function (one) { return same(one.title, part.title); });
        if (was === undefined) {
            if (before.parts.length > 0)
                changes.push({ at: now, text: "".concat(part.title, " \u2192 ").concat(partWord(part)), tone: 'info' });
            return "continue";
        }
        if (was.status === part.status && was.progress === part.progress)
            return "continue";
        var tone = part.status === 'done' ? 'done' : part.status === 'stuck' ? 'stuck' : part.status === 'waiting' ? 'you' : 'progress';
        var from = was.status === 'active' && part.status === 'active' && was.progress !== undefined ? "".concat(was.progress, "% \u2192 ") : '→ ';
        changes.push({ at: now, text: "".concat(part.title, " ").concat(from).concat(partWord(part)), tone: tone });
    };
    for (var _i = 0, _a = after.parts; _i < _a.length; _i++) {
        var part = _a[_i];
        _loop_1(part);
    }
    var _loop_2 = function (milestone) {
        var was = before.milestones.find(function (one) { return same(one.title, milestone.title); });
        if (was === undefined || was.status === milestone.status)
            return "continue";
        if (milestone.status === 'done')
            changes.push({ at: now, text: "".concat(milestone.title, " reached"), tone: 'done' });
        else if (milestone.status === 'active')
            changes.push({ at: now, text: "Now on ".concat(milestone.title), tone: 'progress' });
    };
    for (var _b = 0, _c = after.milestones; _b < _c.length; _b++) {
        var milestone = _c[_b];
        _loop_2(milestone);
    }
    return changes;
};
exports.diffMaps = diffMaps;
/** Adds lines to the feed, newest first, keeping it bounded. */
var addChanges = function (feed, added) {
    return __spreadArray(__spreadArray([], __spreadArray([], added, true).reverse(), true), feed, true).slice(0, CHANGES_KEPT);
};
exports.addChanges = addChanges;
/** Applies a map input: each list sent replaces the stored one. */
var applyMap = function (map, input, now, session) {
    var _a, _b;
    return (__assign({ milestones: (_a = input.milestones) !== null && _a !== void 0 ? _a : map.milestones, parts: (_b = input.parts) !== null && _b !== void 0 ? _b : map.parts, updatedAt: now }, (session !== undefined ? { updatedIn: session } : map.updatedIn !== undefined ? { updatedIn: map.updatedIn } : {})));
};
exports.applyMap = applyMap;
/** The map as the tool answers it to Claude. */
var describeMap = function (map) {
    if (map.milestones.length === 0 && map.parts.length === 0)
        return 'No map for this project yet.';
    var milestones = map.milestones.map(function (one) { return "- ".concat(one.title, " \u00B7 ").concat(one.status).concat(one.date ? " \u00B7 ".concat(one.date) : ''); });
    var parts = map.parts.map(function (one) {
        return "- ".concat(one.title, " \u00B7 ").concat(partWord(one)).concat(one.note ? " \u00B7 ".concat(one.note) : '').concat(one.milestone ? " \u00B7 for ".concat(one.milestone) : '');
    });
    return __spreadArray(__spreadArray(__spreadArray(['Milestones:'], milestones, true), ['', 'Parts:'], false), parts, true).join('\n');
};
exports.describeMap = describeMap;
