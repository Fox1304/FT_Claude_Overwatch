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
var testing_1 = require("claude-code/testing");
var world_1 = require("./world");
var GOALS = 'mcp__overview__goals';
var STEPS = 'mcp__overview__your_steps';
var SURFACES = ['terminal', 'desktop', 'mobile'];
var COMPOSER = { wait: false, origin: { kind: 'composer' } };
/** Tue 6 Oct 2026, 15:00 on the machine's clock. */
var AFTERNOON = new Date(2026, 9, 6, 15, 0).getTime();
var HOUR = 60 * 60 * 1000;
(0, testing_1.test)('other open sessions show at a glance; gone ones are hidden, then forgotten', function ($, on) { return __awaiter(void 0, void 0, void 0, function () {
    var w, clock, _i, SURFACES_1, surface, pane, _a, _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                w = (0, world_1.world)(on);
                clock = testing_1.mock.clock(on, { now: AFTERNOON });
                w.stored['session:S2'] = {
                    id: 'S2', project: 'otherapp', summary: 'Daily puzzle streaks', active: 'Streaks survive a missed day',
                    done: 1, total: 3, state: 'working', updatedAt: AFTERNOON - 5000,
                };
                w.stored['session:S3'] = { id: 'S3', project: 'myapp', summary: 'Old', done: 0, total: 0, state: 'idle', updatedAt: AFTERNOON - 5 * 60000 };
                w.stored['session:S4'] = { id: 'S4', project: 'myapp', summary: 'Older', done: 0, total: 0, state: 'idle', updatedAt: AFTERNOON - 2 * HOUR };
                return [4 /*yield*/, $.tool.call({ tool: 'mcp__fake__build' })];
            case 1:
                _d.sent();
                return [4 /*yield*/, clock.advance(10000)];
            case 2:
                _d.sent();
                _i = 0, SURFACES_1 = SURFACES;
                _d.label = 3;
            case 3:
                if (!(_i < SURFACES_1.length)) return [3 /*break*/, 10];
                surface = SURFACES_1[_i];
                return [4 /*yield*/, $.ui.mount(__assign(__assign({}, world_1.PANE), { surface: surface }))];
            case 4:
                pane = _d.sent();
                _a = testing_1.expect;
                return [4 /*yield*/, pane.find({ type: 'Text', text: 'OTHER SESSIONS · 1' })];
            case 5:
                _a.apply(void 0, [_d.sent()]).toBeDefined();
                _b = testing_1.expect;
                return [4 /*yield*/, pane.find({ type: 'Text', text: 'Daily puzzle streaks · 1 of 3 done · working' })];
            case 6:
                _b.apply(void 0, [_d.sent()]).toBeDefined();
                _c = testing_1.expect;
                return [4 /*yield*/, pane.find({ type: 'Text', text: /Older|^Old/ })];
            case 7:
                _c.apply(void 0, [_d.sent()]).toBeUndefined();
                return [4 /*yield*/, pane.unmount()];
            case 8:
                _d.sent();
                _d.label = 9;
            case 9:
                _i++;
                return [3 /*break*/, 3];
            case 10:
                (0, testing_1.expect)(w.stored['session:S4']).toBeUndefined();
                (0, testing_1.expect)(w.stored['session:S3']).toBeDefined();
                (0, testing_1.expect)(w.stored['session:S1']).toMatchObject({ project: 'myapp', state: 'idle' });
                return [2 /*return*/];
        }
    });
}); });
(0, testing_1.test)("this session's card follows its goals", function ($, on) { return __awaiter(void 0, void 0, void 0, function () {
    var w;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                w = (0, world_1.world)(on);
                testing_1.mock.clock(on, { now: AFTERNOON });
                return [4 /*yield*/, $.prompt.submit(__assign({ text: 'Ship the beta' }, COMPOSER))];
            case 1:
                _a.sent();
                return [4 /*yield*/, $.tool.call({
                        tool: GOALS,
                        summary: 'The beta reaches testers',
                        goals: [
                            { title: 'Rewards give drops', status: 'done' },
                            { title: 'Testers get the new build', status: 'active' },
                        ],
                    })];
            case 2:
                _a.sent();
                (0, testing_1.expect)(w.stored['session:S1']).toMatchObject({
                    summary: 'The beta reaches testers', active: 'Testers get the new build', done: 1, total: 2, state: 'working',
                });
                return [2 /*return*/];
        }
    });
}); });
(0, testing_1.test)('a decision is answered with buttons, and Claude hears each pick', function ($, on) { return __awaiter(void 0, void 0, void 0, function () {
    var w, step, _i, SURFACES_2, surface, pane_1, _a, _b, _c, pane, _d, _e, first, _f, second, _g;
    var _h, _j, _k;
    return __generator(this, function (_l) {
        switch (_l.label) {
            case 0:
                w = (0, world_1.world)(on);
                testing_1.mock.clock(on, { now: AFTERNOON });
                return [4 /*yield*/, $.tool.call({
                        tool: STEPS,
                        add: [{ title: "Choose Play's target audience", choices: ['18 and over', 'Mixed ages'] }],
                    })];
            case 1:
                _l.sent();
                (0, testing_1.expect)(w.phone).toEqual(["myapp needs a decision: Choose Play's target audience"]);
                step = w.steps()[0];
                _i = 0, SURFACES_2 = SURFACES;
                _l.label = 2;
            case 2:
                if (!(_i < SURFACES_2.length)) return [3 /*break*/, 9];
                surface = SURFACES_2[_i];
                return [4 /*yield*/, $.ui.mount(__assign(__assign({}, world_1.PANE), { surface: surface }))];
            case 3:
                pane_1 = _l.sent();
                _a = testing_1.expect;
                return [4 /*yield*/, pane_1.find({ type: 'Text', text: "Choose Play's target audience" })];
            case 4:
                _a.apply(void 0, [_l.sent()]).toBeDefined();
                _b = testing_1.expect;
                return [4 /*yield*/, pane_1.find({ type: 'Button', text: '○ 18 and over' })];
            case 5:
                _b.apply(void 0, [_l.sent()]).toBeDefined();
                _c = testing_1.expect;
                return [4 /*yield*/, pane_1.find({ type: 'Button', text: '○ Mixed ages' })];
            case 6:
                _c.apply(void 0, [_l.sent()]).toBeDefined();
                return [4 /*yield*/, pane_1.unmount()];
            case 7:
                _l.sent();
                _l.label = 8;
            case 8:
                _i++;
                return [3 /*break*/, 2];
            case 9: return [4 /*yield*/, $.ui.mount(__assign(__assign({}, world_1.PANE), { surface: 'desktop' }))];
            case 10:
                pane = _l.sent();
                return [4 /*yield*/, pane.press({ key: "pick:".concat(step === null || step === void 0 ? void 0 : step.id, ":0") })];
            case 11:
                _l.sent();
                _d = testing_1.expect;
                return [4 /*yield*/, pane.find({ type: 'Button', text: '● 18 and over' })];
            case 12:
                _d.apply(void 0, [_l.sent()]).toBeDefined();
                _e = testing_1.expect;
                return [4 /*yield*/, pane.find({ type: 'Text', text: 'Picked · Claude will pick it up' })];
            case 13:
                _e.apply(void 0, [_l.sent()]).toBeDefined();
                return [4 /*yield*/, $.tool.call({ tool: 'mcp__fake__build' })];
            case 14:
                first = _l.sent();
                (0, testing_1.expect)(((_h = first.context) !== null && _h !== void 0 ? _h : []).join('\n')).toContain("".concat(step === null || step === void 0 ? void 0 : step.id, " \u00B7 Choose Play's target audience \u2192 \"18 and over\""));
                _f = testing_1.expect;
                return [4 /*yield*/, pane.find({ type: 'Text', text: 'Claude knows · acting on it' })];
            case 15:
                _f.apply(void 0, [_l.sent()]).toBeDefined();
                return [4 /*yield*/, pane.press({ key: "pick:".concat(step === null || step === void 0 ? void 0 : step.id, ":1") })];
            case 16:
                _l.sent();
                return [4 /*yield*/, $.tool.call({ tool: 'mcp__fake__build' })];
            case 17:
                second = _l.sent();
                (0, testing_1.expect)(((_j = second.context) !== null && _j !== void 0 ? _j : []).join('\n')).toContain('→ "Mixed ages"');
                return [4 /*yield*/, $.tool.call({ tool: STEPS, confirm: [{ id: (_k = step === null || step === void 0 ? void 0 : step.id) !== null && _k !== void 0 ? _k : '', checked: 'Saved as mixed ages in Play Console' }] })];
            case 18:
                _l.sent();
                return [4 /*yield*/, (0, world_1.unfold)(pane, 'confirmed')];
            case 19:
                _l.sent();
                _g = testing_1.expect;
                return [4 /*yield*/, pane.find({ type: 'Text', text: "Choose Play's target audience · Mixed ages · confirmed" })];
            case 20:
                _g.apply(void 0, [_l.sent()]).toBeDefined();
                return [4 /*yield*/, pane.unmount()];
            case 21:
                _l.sent();
                return [2 /*return*/];
        }
    });
}); });
(0, testing_1.test)('picking the chosen option again takes it back', function ($, on) { return __awaiter(void 0, void 0, void 0, function () {
    var w, step, pane, _a;
    var _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                w = (0, world_1.world)(on);
                testing_1.mock.clock(on, { now: AFTERNOON });
                return [4 /*yield*/, $.tool.call({ tool: STEPS, add: [{ title: 'Pick a launch market', choices: ['France', 'UK'] }] })];
            case 1:
                _d.sent();
                step = w.steps()[0];
                return [4 /*yield*/, $.ui.mount(__assign(__assign({}, world_1.PANE), { surface: 'desktop' }))];
            case 2:
                pane = _d.sent();
                return [4 /*yield*/, pane.press({ key: "pick:".concat(step === null || step === void 0 ? void 0 : step.id, ":1") })];
            case 3:
                _d.sent();
                return [4 /*yield*/, pane.press({ key: "pick:".concat(step === null || step === void 0 ? void 0 : step.id, ":1") })];
            case 4:
                _d.sent();
                (0, testing_1.expect)(w.steps()[0]).toMatchObject({ status: 'todo' });
                (0, testing_1.expect)((_b = w.steps()[0]) === null || _b === void 0 ? void 0 : _b.answer).toBeUndefined();
                _a = testing_1.expect;
                return [4 /*yield*/, $.tool.call({ tool: 'mcp__fake__build' })];
            case 5:
                _a.apply(void 0, [(_c = (_d.sent()).context) !== null && _c !== void 0 ? _c : []]).toEqual([]);
                return [4 /*yield*/, pane.unmount()];
            case 6:
                _d.sent();
                return [2 /*return*/];
        }
    });
}); });
(0, testing_1.test)('each goal opens to what was done for it', function ($, on) { return __awaiter(void 0, void 0, void 0, function () {
    var _i, SURFACES_3, surface, pane, _a, _b, _c, _d, _e;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0:
                (0, world_1.world)(on);
                testing_1.mock.clock(on, { now: AFTERNOON });
                on('tool.call', { tool: 'mcp__fake__deploy' }, function () { return ({ result: 'deployed' }); });
                return [4 /*yield*/, $.tool.call({ tool: 'mcp__fake__build' })];
            case 1:
                _f.sent();
                return [4 /*yield*/, $.tool.call({ tool: GOALS, goals: [{ title: 'Testers get the new build', status: 'active' }] })];
            case 2:
                _f.sent();
                return [4 /*yield*/, $.tool.call({ tool: 'mcp__fake__build' })];
            case 3:
                _f.sent();
                return [4 /*yield*/, $.tool.call({ tool: 'mcp__fake__deploy' })];
            case 4:
                _f.sent();
                _i = 0, SURFACES_3 = SURFACES;
                _f.label = 5;
            case 5:
                if (!(_i < SURFACES_3.length)) return [3 /*break*/, 17];
                surface = SURFACES_3[_i];
                return [4 /*yield*/, $.ui.mount(__assign(__assign({}, world_1.PANE), { surface: surface }))];
            case 6:
                pane = _f.sent();
                return [4 /*yield*/, (0, world_1.unfold)(pane, 'goals')];
            case 7:
                _f.sent();
                _a = testing_1.expect;
                return [4 /*yield*/, pane.find({ type: 'Button', text: '▸ 3 things done' })];
            case 8:
                _a.apply(void 0, [_f.sent()]).toBeDefined();
                _b = testing_1.expect;
                return [4 /*yield*/, pane.find({ type: 'Text', text: 'Used build (×2)' })];
            case 9:
                _b.apply(void 0, [_f.sent()]).toBeUndefined();
                return [4 /*yield*/, pane.press({ key: 'acts:all:Testers get the new build' })];
            case 10:
                _f.sent();
                _c = testing_1.expect;
                return [4 /*yield*/, pane.find({ type: 'Button', text: '▾ 3 things done' })];
            case 11:
                _c.apply(void 0, [_f.sent()]).toBeDefined();
                _d = testing_1.expect;
                return [4 /*yield*/, pane.find({ type: 'Text', text: 'Used build (×2)' })];
            case 12:
                _d.apply(void 0, [_f.sent()]).toBeDefined();
                _e = testing_1.expect;
                return [4 /*yield*/, pane.find({ type: 'Text', text: 'Used deploy' })];
            case 13:
                _e.apply(void 0, [_f.sent()]).toBeDefined();
                return [4 /*yield*/, pane.press({ key: 'acts:all:Testers get the new build' })];
            case 14:
                _f.sent();
                return [4 /*yield*/, pane.unmount()];
            case 15:
                _f.sent();
                _f.label = 16;
            case 16:
                _i++;
                return [3 /*break*/, 5];
            case 17: return [2 /*return*/];
        }
    });
}); });
(0, testing_1.test)('deadlines show in plain words, soonest first', function ($, on) { return __awaiter(void 0, void 0, void 0, function () {
    var w, _loop_1, _i, SURFACES_4, surface;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                w = (0, world_1.world)(on);
                testing_1.mock.clock(on, { now: AFTERNOON });
                return [4 /*yield*/, $.tool.call({
                        tool: STEPS,
                        add: [
                            { title: 'Send the press release', due: '2026-10-16' },
                            { title: 'Set the spend limits', due: '2026-10-05' },
                            { title: 'Recruit the testers', due: '2026-10-07' },
                            { title: 'Proofread the site' },
                        ],
                    })];
            case 1:
                _a.sent();
                (0, testing_1.expect)(w.steps().map(function (step) { var _a; return (_a = step.due) !== null && _a !== void 0 ? _a : '-'; })).toEqual(['2026-10-16', '2026-10-05', '2026-10-07', '-']);
                _loop_1 = function (surface) {
                    var pane, _b, _c, _d, _e, _f, _g, titles, order, _h;
                    return __generator(this, function (_j) {
                        switch (_j.label) {
                            case 0: return [4 /*yield*/, $.ui.mount(__assign(__assign({}, world_1.PANE), { surface: surface }))];
                            case 1:
                                pane = _j.sent();
                                _b = testing_1.expect;
                                return [4 /*yield*/, pane.find({ type: 'Text', text: 'OVERDUE · 1' })];
                            case 2:
                                _b.apply(void 0, [_j.sent()]).toBeDefined();
                                _c = testing_1.expect;
                                return [4 /*yield*/, pane.find({ type: 'Text', text: 'THIS WEEK · 1' })];
                            case 3:
                                _c.apply(void 0, [_j.sent()]).toBeDefined();
                                _d = testing_1.expect;
                                return [4 /*yield*/, pane.find({ type: 'Text', text: 'by Fri 16 Oct' })];
                            case 4:
                                _d.apply(void 0, [_j.sent()]).toBeUndefined();
                                return [4 /*yield*/, pane.press({ key: 'fold:later' })];
                            case 5:
                                _j.sent();
                                _e = testing_1.expect;
                                return [4 /*yield*/, pane.find({ type: 'Text', text: 'overdue since Mon 5 Oct' })];
                            case 6:
                                _e.apply(void 0, [_j.sent()]).toBeDefined();
                                _f = testing_1.expect;
                                return [4 /*yield*/, pane.find({ type: 'Text', text: 'due tomorrow' })];
                            case 7:
                                _f.apply(void 0, [_j.sent()]).toBeDefined();
                                _g = testing_1.expect;
                                return [4 /*yield*/, pane.find({ type: 'Text', text: 'by Fri 16 Oct' })];
                            case 8:
                                _g.apply(void 0, [_j.sent()]).toBeDefined();
                                return [4 /*yield*/, pane.findAll({ type: 'Text' })];
                            case 9:
                                titles = (_j.sent()).map(function (one) { return one.text; });
                                order = ['Set the spend limits', 'Recruit the testers', 'Proofread the site', 'Send the press release'].map(function (title) { return titles.indexOf(title); });
                                (0, testing_1.expect)(order.every(function (index) { return index >= 0; })).toBe(true);
                                (0, testing_1.expect)(__spreadArray([], order, true).sort(function (a, b) { return a - b; })).toEqual(order);
                                _h = testing_1.expect;
                                return [4 /*yield*/, pane.findAll({ type: 'Button', text: '☐' })];
                            case 10:
                                _h.apply(void 0, [(_j.sent()).length]).toBe(4);
                                return [4 /*yield*/, pane.press({ key: 'fold:later' })];
                            case 11:
                                _j.sent();
                                return [4 /*yield*/, pane.unmount()];
                            case 12:
                                _j.sent();
                                return [2 /*return*/];
                        }
                    });
                };
                _i = 0, SURFACES_4 = SURFACES;
                _a.label = 2;
            case 2:
                if (!(_i < SURFACES_4.length)) return [3 /*break*/, 5];
                surface = SURFACES_4[_i];
                return [5 /*yield**/, _loop_1(surface)];
            case 3:
                _a.sent();
                _a.label = 4;
            case 4:
                _i++;
                return [3 /*break*/, 2];
            case 5: return [2 /*return*/];
        }
    });
}); });
(0, testing_1.test)('a step waiting a day, or due by tomorrow, reminds the phone once a day', function ($, on) { return __awaiter(void 0, void 0, void 0, function () {
    var w, clock, pane, _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                w = (0, world_1.world)(on);
                clock = testing_1.mock.clock(on, { now: AFTERNOON });
                w.stored[world_1.KEY] = {
                    label: 'myapp',
                    steps: [
                        { id: 'o1', title: 'Create the Brevo account', status: 'todo', heard: 'todo', createdAt: AFTERNOON - 26 * HOUR },
                        { id: 'n1', title: 'Fresh step', status: 'todo', heard: 'todo', createdAt: AFTERNOON - HOUR },
                    ],
                };
                return [4 /*yield*/, $.tool.call({ tool: 'mcp__fake__build' })];
            case 1:
                _c.sent();
                return [4 /*yield*/, clock.advance(10000)];
            case 2:
                _c.sent();
                (0, testing_1.expect)(w.phone).toEqual(['myapp: still waiting for you — Create the Brevo account']);
                return [4 /*yield*/, clock.advance(2 * HOUR)];
            case 3:
                _c.sent();
                (0, testing_1.expect)(w.phone).toHaveLength(1);
                return [4 /*yield*/, $.ui.mount(__assign(__assign({}, world_1.PANE), { surface: 'desktop' }))];
            case 4:
                pane = _c.sent();
                _a = testing_1.expect;
                return [4 /*yield*/, pane.find({ type: 'Text', text: 'waiting 1 day' })];
            case 5:
                _a.apply(void 0, [_c.sent()]).toBeUndefined();
                return [4 /*yield*/, (0, world_1.unfold)(pane, 'later')];
            case 6:
                _c.sent();
                _b = testing_1.expect;
                return [4 /*yield*/, pane.find({ type: 'Text', text: 'waiting 1 day' })];
            case 7:
                _b.apply(void 0, [_c.sent()]).toBeDefined();
                return [4 /*yield*/, pane.unmount()];
            case 8:
                _c.sent();
                return [2 /*return*/];
        }
    });
}); });
(0, testing_1.test)('no reminders at night', function ($, on) { return __awaiter(void 0, void 0, void 0, function () {
    var w, clock;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                w = (0, world_1.world)(on);
                clock = testing_1.mock.clock(on, { now: new Date(2026, 9, 6, 23, 0).getTime() });
                w.stored[world_1.KEY] = {
                    label: 'myapp',
                    steps: [{ id: 'o1', title: 'Create the Brevo account', status: 'todo', heard: 'todo', due: '2026-10-07', createdAt: 0 }],
                };
                return [4 /*yield*/, $.tool.call({ tool: 'mcp__fake__build' })];
            case 1:
                _a.sent();
                return [4 /*yield*/, clock.advance(10000)];
            case 2:
                _a.sent();
                (0, testing_1.expect)(w.phone).toEqual([]);
                return [2 /*return*/];
        }
    });
}); });
