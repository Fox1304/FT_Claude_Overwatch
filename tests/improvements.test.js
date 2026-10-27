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
var GOALS = 'mcp__overview__goals';
var STEPS = 'mcp__overview__your_steps';
var SURFACES = ['terminal', 'desktop', 'mobile'];
var COMPOSER = { wait: false, origin: { kind: 'composer' } };
(0, testing_1.test)('a goal waiting on the person says so, and lets go once they tick', function ($, on) { return __awaiter(void 0, void 0, void 0, function () {
    var w, fee, _i, SURFACES_1, surface, pane_1, _a, _b, pane, _c, _d, built;
    var _e, _f;
    return __generator(this, function (_g) {
        switch (_g.label) {
            case 0:
                w = (0, world_1.world)(on);
                testing_1.mock.clock(on, { now: 1000 });
                return [4 /*yield*/, $.tool.call({ tool: STEPS, add: [{ title: 'Pay the Play Console fee' }] })];
            case 1:
                _g.sent();
                fee = w.steps()[0];
                return [4 /*yield*/, $.tool.call({
                        tool: GOALS,
                        goals: [
                            { title: 'The app is on the Play Store', status: 'waiting', waitingFor: [(_e = fee === null || fee === void 0 ? void 0 : fee.id) !== null && _e !== void 0 ? _e : ''] },
                            { title: 'Testers get the new build', status: 'planned' },
                        ],
                    })];
            case 2:
                _g.sent();
                _i = 0, SURFACES_1 = SURFACES;
                _g.label = 3;
            case 3:
                if (!(_i < SURFACES_1.length)) return [3 /*break*/, 10];
                surface = SURFACES_1[_i];
                return [4 /*yield*/, $.ui.mount(__assign(__assign({}, world_1.PANE), { surface: surface }))];
            case 4:
                pane_1 = _g.sent();
                return [4 /*yield*/, (0, world_1.unfold)(pane_1, 'goals')];
            case 5:
                _g.sent();
                _a = testing_1.expect;
                return [4 /*yield*/, pane_1.find({ type: 'Text', text: 'Waiting for you' })];
            case 6:
                _a.apply(void 0, [_g.sent()]).toBeDefined();
                _b = testing_1.expect;
                return [4 /*yield*/, pane_1.find({ type: 'Text', text: 'Waiting for you: Pay the Play Console fee' })];
            case 7:
                _b.apply(void 0, [_g.sent()]).toBeDefined();
                return [4 /*yield*/, pane_1.unmount()];
            case 8:
                _g.sent();
                _g.label = 9;
            case 9:
                _i++;
                return [3 /*break*/, 3];
            case 10: return [4 /*yield*/, $.ui.mount(__assign(__assign({}, world_1.PANE), { surface: 'desktop' }))];
            case 11:
                pane = _g.sent();
                _c = testing_1.expect;
                return [4 /*yield*/, (0, world_1.allText)(pane)];
            case 12:
                _c.apply(void 0, [_g.sent()]).toContain('Waiting for you: Pay the Play Console fee');
                return [4 /*yield*/, pane.press({ key: "tick:".concat(fee === null || fee === void 0 ? void 0 : fee.id) })];
            case 13:
                _g.sent();
                _d = testing_1.expect;
                return [4 /*yield*/, pane.find({ type: 'Text', text: 'You did your part · Claude carries on' })];
            case 14:
                _d.apply(void 0, [_g.sent()]).toBeDefined();
                return [4 /*yield*/, $.tool.call({ tool: 'mcp__fake__build' })];
            case 15:
                built = _g.sent();
                (0, testing_1.expect)(((_f = built.context) !== null && _f !== void 0 ? _f : []).join('\n')).toContain('the goal "The app is on the Play Store" waits on it');
                return [4 /*yield*/, pane.unmount()];
            case 16:
                _g.sent();
                return [2 /*return*/];
        }
    });
}); });
(0, testing_1.test)('a waiting goal naming no known step is pointed back to the steps tool', function ($, on) { return __awaiter(void 0, void 0, void 0, function () {
    var sent;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                (0, world_1.world)(on);
                testing_1.mock.clock(on);
                return [4 /*yield*/, $.tool.call({
                        tool: GOALS,
                        goals: [{ title: 'The app is on the Play Store', status: 'waiting', waitingFor: ['zzz999'] }],
                    })];
            case 1:
                sent = _a.sent();
                (0, testing_1.expect)(String(sent.result)).toContain('waits on no known step');
                return [2 /*return*/];
        }
    });
}); });
(0, testing_1.test)("the person's phone hears about new and reopened steps", function ($, on) { return __awaiter(void 0, void 0, void 0, function () {
    var w, step;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                w = (0, world_1.world)(on);
                testing_1.mock.clock(on);
                return [4 /*yield*/, $.tool.call({ tool: STEPS, add: [{ title: 'Approve the new Apple agreement' }] })];
            case 1:
                _c.sent();
                (0, testing_1.expect)(w.phone).toEqual(['myapp needs you: Approve the new Apple agreement']);
                step = w.steps()[0];
                return [4 /*yield*/, $.tool.call({ tool: STEPS, reopen: [{ id: (_a = step === null || step === void 0 ? void 0 : step.id) !== null && _a !== void 0 ? _a : '', note: 'still pending' }] })];
            case 2:
                _c.sent();
                (0, testing_1.expect)(w.phone[1]).toBe('Not done yet: Approve the new Apple agreement (still pending)');
                return [4 /*yield*/, $.tool.call({ tool: STEPS, confirm: [{ id: (_b = step === null || step === void 0 ? void 0 : step.id) !== null && _b !== void 0 ? _b : '', checked: 'Your word' }] })];
            case 3:
                _c.sent();
                (0, testing_1.expect)(w.phone).toHaveLength(2);
                return [2 /*return*/];
        }
    });
}); });
(0, testing_1.test)('phone alerts can be turned off', { options: { phoneAlerts: false } }, function ($, on) { return __awaiter(void 0, void 0, void 0, function () {
    var w;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                w = (0, world_1.world)(on);
                testing_1.mock.clock(on);
                return [4 /*yield*/, $.tool.call({ tool: STEPS, add: [{ title: 'Approve the new Apple agreement' }] })];
            case 1:
                _a.sent();
                (0, testing_1.expect)(w.phone).toEqual([]);
                return [2 /*return*/];
        }
    });
}); });
(0, testing_1.test)("other projects' steps show and can be ticked from here", function ($, on) { return __awaiter(void 0, void 0, void 0, function () {
    var w, clock, _i, SURFACES_2, surface, pane_2, _a, _b, _c, _d, pane, _e;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0:
                w = (0, world_1.world)(on);
                clock = testing_1.mock.clock(on, { now: 1000 });
                w.stored[world_1.OTHER_KEY] = {
                    label: 'otherapp',
                    steps: [{ id: 'n1', title: 'Renew the Apple certificate', status: 'todo', heard: 'todo', createdAt: 1 }],
                };
                return [4 /*yield*/, $.tool.call({ tool: STEPS, add: [{ title: 'Pay the Play Console fee' }] })];
            case 1:
                _f.sent();
                return [4 /*yield*/, clock.advance(10000)];
            case 2:
                _f.sent();
                _i = 0, SURFACES_2 = SURFACES;
                _f.label = 3;
            case 3:
                if (!(_i < SURFACES_2.length)) return [3 /*break*/, 11];
                surface = SURFACES_2[_i];
                return [4 /*yield*/, $.ui.mount(__assign(__assign({}, world_1.PANE), { surface: surface }))];
            case 4:
                pane_2 = _f.sent();
                _a = testing_1.expect;
                return [4 /*yield*/, pane_2.find({ type: 'Text', text: 'OTHER PROJECTS' })];
            case 5:
                _a.apply(void 0, [_f.sent()]).toBeDefined();
                _b = testing_1.expect;
                return [4 /*yield*/, pane_2.find({ type: 'Text', text: 'otherapp' })];
            case 6:
                _b.apply(void 0, [_f.sent()]).toBeDefined();
                _c = testing_1.expect;
                return [4 /*yield*/, pane_2.find({ type: 'Text', text: 'Renew the Apple certificate' })];
            case 7:
                _c.apply(void 0, [_f.sent()]).toBeDefined();
                _d = testing_1.expect;
                return [4 /*yield*/, pane_2.find({ key: 'other:n1' })];
            case 8:
                _d.apply(void 0, [_f.sent()]).toMatchObject({ text: '☐' });
                return [4 /*yield*/, pane_2.unmount()];
            case 9:
                _f.sent();
                _f.label = 10;
            case 10:
                _i++;
                return [3 /*break*/, 3];
            case 11: return [4 /*yield*/, $.ui.mount(__assign(__assign({}, world_1.PANE), { surface: 'desktop' }))];
            case 12:
                pane = _f.sent();
                return [4 /*yield*/, pane.press({ key: 'other:n1' })];
            case 13:
                _f.sent();
                (0, testing_1.expect)(w.stepsAt(world_1.OTHER_KEY)[0]).toMatchObject({ status: 'checked', tickedFrom: 'yourSteps:/work/myapp' });
                _e = testing_1.expect;
                return [4 /*yield*/, pane.find({ type: 'Text', text: 'Ticked · Claude in otherapp will pick it up in its next session' })];
            case 14:
                _e.apply(void 0, [_f.sent()]).toBeDefined();
                return [4 /*yield*/, clock.advance(60000)];
            case 15:
                _f.sent();
                (0, testing_1.expect)(w.prompts).toHaveLength(0);
                return [4 /*yield*/, pane.unmount()];
            case 16:
                _f.sent();
                return [2 /*return*/];
        }
    });
}); });
(0, testing_1.test)('a step ticked from another project is picked up here', function ($, on) { return __awaiter(void 0, void 0, void 0, function () {
    var w, clock;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                w = (0, world_1.world)(on);
                clock = testing_1.mock.clock(on, { now: 100000 });
                w.stored['yourSteps:/work/myapp'] = {
                    label: 'myapp',
                    steps: [
                        {
                            id: 'k1',
                            title: 'Approve the new Apple agreement',
                            status: 'checked',
                            heard: 'todo',
                            tickedIn: 'S-elsewhere',
                            tickedFrom: world_1.OTHER_KEY,
                            tickedAt: 50000,
                            createdAt: 1,
                        },
                    ],
                };
                return [4 /*yield*/, $.tool.call({ tool: 'mcp__fake__build' })];
            case 1:
                _b.sent();
                return [4 /*yield*/, clock.advance(10000)];
            case 2:
                _b.sent();
                (0, testing_1.expect)(w.prompts).toHaveLength(1);
                (0, testing_1.expect)((_a = w.prompts[0]) === null || _a === void 0 ? void 0 : _a.text).toContain('Approve the new Apple agreement');
                return [2 /*return*/];
        }
    });
}); });
(0, testing_1.test)('Claude is reminded when the pane goes stale, and not before', function ($, on) { return __awaiter(void 0, void 0, void 0, function () {
    var call, _a, twelfth, call, stale;
    var _b, _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                (0, world_1.world)(on);
                testing_1.mock.clock(on);
                return [4 /*yield*/, $.prompt.submit(__assign({ text: 'Ship the beta' }, COMPOSER))];
            case 1:
                _e.sent();
                call = 1;
                _e.label = 2;
            case 2:
                if (!(call < 12)) return [3 /*break*/, 5];
                _a = testing_1.expect;
                return [4 /*yield*/, $.tool.call({ tool: 'mcp__fake__build' })];
            case 3:
                _a.apply(void 0, [(_b = (_e.sent()).context) !== null && _b !== void 0 ? _b : []]).toEqual([]);
                _e.label = 4;
            case 4:
                call += 1;
                return [3 /*break*/, 2];
            case 5: return [4 /*yield*/, $.tool.call({ tool: 'mcp__fake__build' })];
            case 6:
                twelfth = _e.sent();
                (0, testing_1.expect)(((_c = twelfth.context) !== null && _c !== void 0 ? _c : []).join('\n')).toContain('Overview pane is empty');
                return [4 /*yield*/, $.tool.call({ tool: GOALS, goals: [{ title: 'Testers get the new build', status: 'active' }] })];
            case 7:
                _e.sent();
                call = 1;
                _e.label = 8;
            case 8:
                if (!(call < 12)) return [3 /*break*/, 11];
                return [4 /*yield*/, $.tool.call({ tool: 'mcp__fake__build' })];
            case 9:
                _e.sent();
                _e.label = 10;
            case 10:
                call += 1;
                return [3 /*break*/, 8];
            case 11: return [4 /*yield*/, $.tool.call({ tool: 'mcp__fake__build' })];
            case 12:
                stale = _e.sent();
                (0, testing_1.expect)(((_d = stale.context) !== null && _d !== void 0 ? _d : []).join('\n')).toContain('has not changed for a while');
                return [2 /*return*/];
        }
    });
}); });
(0, testing_1.test)('technical goal titles are sent back, plain ones pass', function ($, on) { return __awaiter(void 0, void 0, void 0, function () {
    var _i, _a, title, sent, plain;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                (0, world_1.world)(on);
                testing_1.mock.clock(on);
                _i = 0, _a = ['Edit PaywallStore.swift', 'Run xcodebuild tests', 'Set beta_premium_until', 'Call fetchPrices()'];
                _c.label = 1;
            case 1:
                if (!(_i < _a.length)) return [3 /*break*/, 4];
                title = _a[_i];
                return [4 /*yield*/, $.tool.call({ tool: GOALS, goals: [{ title: title, status: 'active' }] })];
            case 2:
                sent = _c.sent();
                (0, testing_1.expect)((_b = sent.text) !== null && _b !== void 0 ? _b : sent.deny).toContain('read as technical steps');
                _c.label = 3;
            case 3:
                _i++;
                return [3 /*break*/, 1];
            case 4: return [4 /*yield*/, $.tool.call({
                    tool: GOALS,
                    goals: [
                        { title: 'Parents can pay in euros', status: 'active' },
                        { title: 'The macOS and iOS builds reach TestFlight', status: 'planned' },
                    ],
                })];
            case 5:
                plain = _c.sent();
                (0, testing_1.expect)(String(plain.result)).toContain('0 of 2 done');
                return [2 /*return*/];
        }
    });
}); });
(0, testing_1.test)('background helpers show in the pane', function ($, on) { return __awaiter(void 0, void 0, void 0, function () {
    var w, clock, pane, _a, _b, _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                w = (0, world_1.world)(on);
                clock = testing_1.mock.clock(on);
                w.agents.push({ id: 'a1', description: 'Check the store listing', type: 'general-purpose', status: 'running' }, { id: 'a2', description: 'Finished earlier', type: 'Explore', status: 'completed' });
                return [4 /*yield*/, $.tool.call({ tool: STEPS })];
            case 1:
                _e.sent();
                return [4 /*yield*/, $.ui.mount(__assign(__assign({}, world_1.PANE), { surface: 'desktop' }))];
            case 2:
                pane = _e.sent();
                return [4 /*yield*/, clock.advance(10000)];
            case 3:
                _e.sent();
                _a = testing_1.expect;
                return [4 /*yield*/, pane.find({ type: 'Text', text: 'HELPERS · 1 working' })];
            case 4:
                _a.apply(void 0, [_e.sent()]).toBeDefined();
                _b = testing_1.expect;
                return [4 /*yield*/, pane.find({ type: 'Text', text: '⋯ Check the store listing' })];
            case 5:
                _b.apply(void 0, [_e.sent()]).toBeDefined();
                _c = testing_1.expect;
                return [4 /*yield*/, (0, world_1.allText)(pane)];
            case 6:
                _c.apply(void 0, [_e.sent()]).toContain('1 helper working in the background');
                _d = testing_1.expect;
                return [4 /*yield*/, pane.find({ type: 'Text', text: /Finished earlier/ })];
            case 7:
                _d.apply(void 0, [_e.sent()]).toBeUndefined();
                return [4 /*yield*/, pane.unmount()];
            case 8:
                _e.sent();
                return [2 /*return*/];
        }
    });
}); });
(0, testing_1.test)("a finished task's goals clear away when the person asks for something new", function ($, on) { return __awaiter(void 0, void 0, void 0, function () {
    var pane, _a, _b, _c, _d, _e;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0:
                (0, world_1.world)(on);
                testing_1.mock.clock(on);
                return [4 /*yield*/, $.tool.call({ tool: GOALS, summary: 'Drops for the beta', goals: [{ title: 'Rewards give drops', status: 'done' }] })];
            case 1:
                _f.sent();
                return [4 /*yield*/, $.prompt.submit({ text: 'noted', wait: false, origin: { kind: 'task-notification' } })];
            case 2:
                _f.sent();
                return [4 /*yield*/, $.ui.mount(__assign(__assign({}, world_1.PANE), { surface: 'desktop' }))];
            case 3:
                pane = _f.sent();
                return [4 /*yield*/, (0, world_1.unfold)(pane, 'goals')];
            case 4:
                _f.sent();
                _a = testing_1.expect;
                return [4 /*yield*/, pane.find({ type: 'Text', text: 'Drops for the beta' })];
            case 5:
                _a.apply(void 0, [_f.sent()]).toBeDefined();
                return [4 /*yield*/, pane.unmount()];
            case 6:
                _f.sent();
                return [4 /*yield*/, $.prompt.submit(__assign({ text: 'Now the site' }, COMPOSER))];
            case 7:
                _f.sent();
                return [4 /*yield*/, $.ui.mount(__assign(__assign({}, world_1.PANE), { surface: 'desktop' }))];
            case 8:
                pane = _f.sent();
                return [4 /*yield*/, (0, world_1.unfold)(pane, 'goals')];
            case 9:
                _f.sent();
                _b = testing_1.expect;
                return [4 /*yield*/, pane.find({ type: 'Text', text: 'Drops for the beta' })];
            case 10:
                _b.apply(void 0, [_f.sent()]).toBeUndefined();
                _c = testing_1.expect;
                return [4 /*yield*/, pane.find({ type: 'Button', text: '▸ Finished earlier · 1' })];
            case 11:
                _c.apply(void 0, [_f.sent()]).toBeDefined();
                return [4 /*yield*/, pane.press({ key: 'fold:earlier' })];
            case 12:
                _f.sent();
                _d = testing_1.expect;
                return [4 /*yield*/, pane.find({ type: 'Text', text: 'Rewards give drops' })];
            case 13:
                _d.apply(void 0, [_f.sent()]).toBeDefined();
                _e = testing_1.expect;
                return [4 /*yield*/, pane.find({ type: 'Text', text: /\d\/1$/ })];
            case 14:
                _e.apply(void 0, [_f.sent()]).toBeUndefined();
                return [4 /*yield*/, pane.unmount()];
            case 15:
                _f.sent();
                return [2 /*return*/];
        }
    });
}); });
(0, testing_1.test)('an unfinished task stays when the person writes', function ($, on) { return __awaiter(void 0, void 0, void 0, function () {
    var pane, _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                (0, world_1.world)(on);
                testing_1.mock.clock(on);
                return [4 /*yield*/, $.tool.call({ tool: GOALS, goals: [{ title: 'Rewards give drops', status: 'active' }] })];
            case 1:
                _c.sent();
                return [4 /*yield*/, $.prompt.submit(__assign({ text: 'How is it going?' }, COMPOSER))];
            case 2:
                _c.sent();
                return [4 /*yield*/, $.ui.mount(__assign(__assign({}, world_1.PANE), { surface: 'desktop' }))];
            case 3:
                pane = _c.sent();
                _a = testing_1.expect;
                return [4 /*yield*/, pane.find({ type: 'Button', text: '▸ All goals · 0 of 1 done' })];
            case 4:
                _a.apply(void 0, [_c.sent()]).toBeDefined();
                return [4 /*yield*/, (0, world_1.unfold)(pane, 'goals')];
            case 5:
                _c.sent();
                _b = testing_1.expect;
                return [4 /*yield*/, pane.find({ type: 'Text', text: '0/1' })];
            case 6:
                _b.apply(void 0, [_c.sent()]).toBeDefined();
                return [4 /*yield*/, pane.unmount()];
            case 7:
                _c.sent();
                return [2 /*return*/];
        }
    });
}); });
