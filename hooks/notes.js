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
exports.noteLine = exports.settleNotes = exports.setNoteStatus = exports.putNote = exports.noteText = exports.noteMessage = exports.NOTE_KEPT_MS = void 0;
/** How long a delivered note stays on its item when Claude has not reworked it. */
exports.NOTE_KEPT_MS = 2 * 60 * 60 * 1000;
var NOTE_LIMIT = 2000;
var KIND_WORD = { goal: 'goal', step: 'step', part: 'part of the project map', milestone: 'milestone' };
var TOOL_FOR = {
    goal: 'mcp__overview__goals (send the whole list again)',
    step: 'mcp__overview__your_steps ("update", "remove" or "add")',
    part: 'mcp__overview__project_map ("parts")',
    milestone: 'mcp__overview__project_map ("milestones")',
};
/** What Claude reads for the notes the person left on items of the pane. */
var noteMessage = function (notes) {
    var lines = notes.map(function (note) { return "- the ".concat(KIND_WORD[note.kind], " \u00AB ").concat(note.title, " \u00BB").concat(note.stepId ? " (step ".concat(note.stepId, ")") : '', ":\n  \u00AB ").concat(note.text, " \u00BB"); });
    var tools = __spreadArray([], new Set(notes.map(function (note) { return TOOL_FOR[note.kind]; })), true).join(', ');
    return __spreadArray(__spreadArray([
        "The person left ".concat(notes.length === 1 ? 'a note' : 'notes', " on ").concat(notes.length === 1 ? 'an item' : 'items', " of the Overview pane:")
    ], lines, true), [
        "Take ".concat(notes.length === 1 ? 'it' : 'them', " into account now: rework, reword, reorder or remove the item as the note asks, with ").concat(tools, ". Then say in one line what you changed."),
    ], false).join('\n');
};
exports.noteMessage = noteMessage;
/** The trimmed note text, or undefined when there is nothing to send. */
var noteText = function (words) {
    var text = words.trim();
    return text === '' ? undefined : text.slice(0, NOTE_LIMIT);
};
exports.noteText = noteText;
/** Replaces any earlier note on the same item. */
var putNote = function (list, note) { return __spreadArray(__spreadArray([], list.filter(function (one) { return one.item !== note.item; }), true), [note], false); };
exports.putNote = putNote;
var setNoteStatus = function (list, items, status, error) {
    return list.map(function (note) {
        if (!items.includes(note.item))
            return note;
        var _error = note.error, rest = __rest(note, ["error"]);
        return error === undefined ? __assign(__assign({}, rest), { status: status }) : __assign(__assign({}, rest), { status: status, error: error });
    });
};
exports.setNoteStatus = setNoteStatus;
/** Drops the delivered notes on items Claude has just reworked, and delivered notes past their time. */
var settleNotes = function (list, reworked, now) {
    return list.filter(function (note) { return !(note.status === 'sent' && (reworked(note) || now - note.at > exports.NOTE_KEPT_MS)); });
};
exports.settleNotes = settleNotes;
/** The conversation line for the pane's note message. */
var noteLine = function (message) {
    var titles = __spreadArray([], message.matchAll(/^- the .+? « (.+) »(?: \(step \S+\))?:$/gm), true).map(function (match) { return match[1]; });
    return "\u270E Your note on \u00AB ".concat(titles.join(' », « '), " \u00BB \u00B7 Claude is on it");
};
exports.noteLine = noteLine;
