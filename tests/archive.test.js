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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var testing_1 = require("claude-code/testing");
var world_1 = require("./world");
var STEPS_TOOL = 'mcp__overview__your_steps';
var GOALS = 'mcp__overview__goals';
var SURFACES = ['terminal', 'desktop', 'mobile'];
var AFTERNOON = new Date(2026, 9, 26, 15, 0).getTime();
var addTwo = function ($) {
    return $.tool.call({
        tool: STEPS_TOOL,
        add: [{ title: 'Approve the new Apple agreement' }, { title: 'Pay the Play Console fee' }],
    });
};
(0, testing_1.test)('an archived step leaves the active list and its count, and shows under Archived', function ($, on) { return __awaiter(void 0, void 0, void 0, function () {
    var w, _a, apple, play, _i, SURFACES_1, surface, ui_1, _b, _c, ui, _d, _e, _f, SURFACES_2, surface, pane, _g, _h, _j, _k, _l, _m;
    var _o, _p;
    return __generator(this, function (_q) {
        switch (_q.label) {
            case 0:
                w = (0, world_1.world)(on);
                testing_1.mock.clock(on, { now: AFTERNOON });
                return [4 /*yield*/, addTwo($)];
            case 1:
                _q.sent();
                _a = w.steps(), apple = _a[0], play = _a[1];
                _i = 0, SURFACES_1 = SURFACES;
                _q.label = 2;
            case 2:
                if (!(_i < SURFACES_1.length)) return [3 /*break*/, 8];
                surface = SURFACES_1[_i];
                return [4 /*yield*/, $.ui.mount(__assign(__assign({}, world_1.PANE), { surface: surface }))];
            case 3:
                ui_1 = _q.sent();
                _b = testing_1.expect;
                return [4 /*yield*/, ui_1.find({ type: 'Text', text: '2 now' })];
            case 4:
                _b.apply(void 0, [_q.sent()]).toBeDefined();
                _c = testing_1.expect;
                return [4 /*yield*/, ui_1.find({ key: "archive:move:".concat(apple === null || apple === void 0 ? void 0 : apple.id) })];
            case 5:
                _c.apply(void 0, [_q.sent()]).toBeDefined();
                return [4 /*yield*/, ui_1.unmount()];
            case 6:
                _q.sent();
                _q.label = 7;
            case 7:
                _i++;
                return [3 /*break*/, 2];
            case 8: return [4 /*yield*/, $.ui.mount(__assign(__assign({}, world_1.PANE), { surface: 'desktop' }))];
            case 9:
                ui = _q.sent();
                return [4 /*yield*/, ui.press({ key: "archive:move:".concat(apple === null || apple === void 0 ? void 0 : apple.id) })];
            case 10:
                _q.sent();
                (0, testing_1.expect)(w.steps().find(function (step) { return step.id === (apple === null || apple === void 0 ? void 0 : apple.id); })).toMatchObject({ archivedAt: AFTERNOON, status: 'todo' });
                (0, testing_1.expect)(w.steps()).toHaveLength(2);
                // Folded at first: the restore buttons show only once Archived is opened.
                _d = testing_1.expect;
                return [4 /*yield*/, ui.find({ key: 'fold:archived' })];
            case 11:
                // Folded at first: the restore buttons show only once Archived is opened.
                _d.apply(void 0, [(_o = (_q.sent())) === null || _o === void 0 ? void 0 : _o.text]).toBe('▸ ⊟ Archived · 1');
                _e = testing_1.expect;
                return [4 /*yield*/, ui.find({ key: "restore:".concat(apple === null || apple === void 0 ? void 0 : apple.id) })];
            case 12:
                _e.apply(void 0, [_q.sent()]).toBeUndefined();
                return [4 /*yield*/, ui.unmount()];
            case 13:
                _q.sent();
                _f = 0, SURFACES_2 = SURFACES;
                _q.label = 14;
            case 14:
                if (!(_f < SURFACES_2.length)) return [3 /*break*/, 25];
                surface = SURFACES_2[_f];
                return [4 /*yield*/, $.ui.mount(__assign(__assign({}, world_1.PANE), { surface: surface }))];
            case 15:
                pane = _q.sent();
                _g = testing_1.expect;
                return [4 /*yield*/, pane.find({ type: 'Text', text: '1 now' })];
            case 16:
                _g.apply(void 0, [_q.sent()]).toBeDefined();
                _h = testing_1.expect;
                return [4 /*yield*/, pane.find({ key: "tick:".concat(apple === null || apple === void 0 ? void 0 : apple.id) })];
            case 17:
                _h.apply(void 0, [_q.sent()]).toBeUndefined();
                _j = testing_1.expect;
                return [4 /*yield*/, pane.find({ key: "tick:".concat(play === null || play === void 0 ? void 0 : play.id) })];
            case 18:
                _j.apply(void 0, [_q.sent()]).toBeDefined();
                _k = testing_1.expect;
                return [4 /*yield*/, pane.find({ key: 'fold:archived' })];
            case 19:
                _k.apply(void 0, [(_p = (_q.sent())) === null || _p === void 0 ? void 0 : _p.text]).toEndWith('⊟ Archived · 1');
                return [4 /*yield*/, (0, world_1.unfold)(pane, 'archived')];
            case 20:
                _q.sent();
                _l = testing_1.expect;
                return [4 /*yield*/, pane.find({ type: 'Text', text: 'Approve the new Apple agreement · archived 15:00' })];
            case 21:
                _l.apply(void 0, [_q.sent()]).toBeDefined();
                _m = testing_1.expect;
                return [4 /*yield*/, pane.find({ key: "restore:".concat(apple === null || apple === void 0 ? void 0 : apple.id) })];
            case 22:
                _m.apply(void 0, [_q.sent()]).toBeDefined();
                return [4 /*yield*/, pane.unmount()];
            case 23:
                _q.sent();
                _q.label = 24;
            case 24:
                _f++;
                return [3 /*break*/, 14];
            case 25: return [2 /*return*/];
        }
    });
}); });
(0, testing_1.test)('a restored step comes back as it was, and Claude hears both moves', function ($, on) { return __awaiter(void 0, void 0, void 0, function () {
    var w, clock, apple, ui, listed, _a, _b, _c, _d;
    var _e, _f, _g, _h, _j, _k;
    return __generator(this, function (_l) {
        switch (_l.label) {
            case 0:
                w = (0, world_1.world)(on);
                clock = testing_1.mock.clock(on, { now: AFTERNOON });
                return [4 /*yield*/, addTwo($)];
            case 1:
                _l.sent();
                apple = w.steps()[0];
                return [4 /*yield*/, $.ui.mount(__assign(__assign({}, world_1.PANE), { surface: 'desktop' }))];
            case 2:
                ui = _l.sent();
                return [4 /*yield*/, ui.press({ key: "archive:move:".concat(apple === null || apple === void 0 ? void 0 : apple.id) })];
            case 3:
                _l.sent();
                return [4 /*yield*/, clock.advance(40000)];
            case 4:
                _l.sent();
                (0, testing_1.expect)(w.prompts).toHaveLength(1);
                (0, testing_1.expect)((_e = w.prompts[0]) === null || _e === void 0 ? void 0 : _e.text).toContain('The person archived this step in the Overview pane as no longer relevant');
                (0, testing_1.expect)((_f = w.prompts[0]) === null || _f === void 0 ? void 0 : _f.text).toContain('Approve the new Apple agreement');
                (0, testing_1.expect)((_g = w.prompts[0]) === null || _g === void 0 ? void 0 : _g.text).not.toContain('Pay the Play Console fee');
                _a = String;
                return [4 /*yield*/, $.tool.call({ tool: STEPS_TOOL })];
            case 5:
                listed = _a.apply(void 0, [(_l.sent()).result]);
                (0, testing_1.expect)(listed).toContain('Archived, kept and restorable by the person');
                (0, testing_1.expect)(listed.split('Archived, kept')[0]).not.toContain('Approve the new Apple agreement');
                return [4 /*yield*/, (0, world_1.unfold)(ui, 'archived')];
            case 6:
                _l.sent();
                return [4 /*yield*/, ui.press({ key: "restore:".concat(apple === null || apple === void 0 ? void 0 : apple.id) })];
            case 7:
                _l.sent();
                (0, testing_1.expect)((_h = w.steps().find(function (step) { return step.id === (apple === null || apple === void 0 ? void 0 : apple.id); })) === null || _h === void 0 ? void 0 : _h.archivedAt).toBeUndefined();
                _b = testing_1.expect;
                return [4 /*yield*/, ui.find({ key: "tick:".concat(apple === null || apple === void 0 ? void 0 : apple.id) })];
            case 8:
                _b.apply(void 0, [_l.sent()]).toBeDefined();
                _c = testing_1.expect;
                return [4 /*yield*/, ui.find({ type: 'Text', text: '2 now' })];
            case 9:
                _c.apply(void 0, [_l.sent()]).toBeDefined();
                _d = testing_1.expect;
                return [4 /*yield*/, ui.find({ key: 'fold:archived' })];
            case 10:
                _d.apply(void 0, [_l.sent()]).toBeUndefined();
                return [4 /*yield*/, clock.advance(40000)];
            case 11:
                _l.sent();
                (0, testing_1.expect)(w.prompts).toHaveLength(2);
                (0, testing_1.expect)((_j = w.prompts[1]) === null || _j === void 0 ? void 0 : _j.text).toContain('The person restored this step from the archive');
                (0, testing_1.expect)((_k = w.prompts[1]) === null || _k === void 0 ? void 0 : _k.text).not.toContain('unticked');
                return [4 /*yield*/, clock.advance(60000)];
            case 12:
                _l.sent();
                (0, testing_1.expect)(w.prompts).toHaveLength(2);
                return [4 /*yield*/, ui.unmount()];
            case 13:
                _l.sent();
                return [2 /*return*/];
        }
    });
}); });
(0, testing_1.test)('an archived step no longer holds a waiting goal back, nor reminds the phone', function ($, on) { return __awaiter(void 0, void 0, void 0, function () {
    var w, clock, fee, ui, _a, _b, _c, before;
    var _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                w = (0, world_1.world)(on);
                clock = testing_1.mock.clock(on, { now: AFTERNOON });
                return [4 /*yield*/, $.tool.call({ tool: STEPS_TOOL, add: [{ title: 'Pay the Play Console fee', due: '2026-10-27' }] })];
            case 1:
                _e.sent();
                fee = w.steps()[0];
                return [4 /*yield*/, $.tool.call({ tool: GOALS, goals: [{ title: 'The app is on Google Play', status: 'waiting', waitingFor: [(_d = fee === null || fee === void 0 ? void 0 : fee.id) !== null && _d !== void 0 ? _d : ''] }] })];
            case 2:
                _e.sent();
                return [4 /*yield*/, $.ui.mount(__assign(__assign({}, world_1.PANE), { surface: 'desktop' }))];
            case 3:
                ui = _e.sent();
                _a = testing_1.expect;
                return [4 /*yield*/, ui.find({ type: 'Text', text: 'WAITING FOR YOU' })];
            case 4:
                _a.apply(void 0, [_e.sent()]).toBeDefined();
                return [4 /*yield*/, ui.press({ key: "archive:move:".concat(fee === null || fee === void 0 ? void 0 : fee.id) })];
            case 5:
                _e.sent();
                _b = testing_1.expect;
                return [4 /*yield*/, ui.find({ type: 'Text', text: 'WAITING FOR YOU' })];
            case 6:
                _b.apply(void 0, [_e.sent()]).toBeUndefined();
                _c = testing_1.expect;
                return [4 /*yield*/, ui.find({ type: 'Text', text: 'nothing open' })];
            case 7:
                _c.apply(void 0, [_e.sent()]).toBeDefined();
                return [4 /*yield*/, ui.unmount()];
            case 8:
                _e.sent();
                before = w.phone.length;
                // Due tomorrow: a step still open would remind the phone at the next sweep.
                return [4 /*yield*/, clock.advance(60000)];
            case 9:
                // Due tomorrow: a step still open would remind the phone at the next sweep.
                _e.sent();
                (0, testing_1.expect)(w.phone.slice(before).some(function (line) { return line.includes('Pay the Play Console fee'); })).toBe(false);
                return [2 /*return*/];
        }
    });
}); });
(0, testing_1.test)("Claude adding the same step again makes a new one, and the archived one stays archived", function ($, on) { return __awaiter(void 0, void 0, void 0, function () {
    var w, apple, ui, same;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                w = (0, world_1.world)(on);
                testing_1.mock.clock(on, { now: AFTERNOON });
                return [4 /*yield*/, addTwo($)];
            case 1:
                _a.sent();
                apple = w.steps()[0];
                return [4 /*yield*/, $.ui.mount(__assign(__assign({}, world_1.PANE), { surface: 'desktop' }))];
            case 2:
                ui = _a.sent();
                return [4 /*yield*/, ui.press({ key: "archive:move:".concat(apple === null || apple === void 0 ? void 0 : apple.id) })];
            case 3:
                _a.sent();
                return [4 /*yield*/, ui.unmount()];
            case 4:
                _a.sent();
                return [4 /*yield*/, $.tool.call({ tool: STEPS_TOOL, add: [{ title: 'Approve the new Apple agreement' }] })];
            case 5:
                _a.sent();
                same = w.steps().filter(function (step) { return step.title === 'Approve the new Apple agreement'; });
                (0, testing_1.expect)(same).toHaveLength(2);
                (0, testing_1.expect)(same.filter(function (step) { return step.archivedAt !== undefined; })).toHaveLength(1);
                return [2 /*return*/];
        }
    });
}); });
