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
var MAP = 'mcp__overview__project_map';
var STEPS = 'mcp__overview__your_steps';
var AFTERNOON = new Date(2026, 9, 6, 15, 0).getTime();
var MYAPP = {
    milestones: [
        { title: 'Public beta', status: 'done', date: '2026-10-06' },
        { title: 'iOS 1.0 to review', status: 'active', date: '2026-10-14' },
        { title: 'Launch decision', status: 'next', date: '2026-10-26' },
        { title: 'Launch in France', status: 'later', date: '2026-11-02' },
    ],
    parts: [
        { title: 'Backend', status: 'done', note: 'Live in Paris' },
        { title: 'iOS app', status: 'active', progress: 70, note: '1.0 ready to submit', milestone: 'Launch decision' },
        { title: 'Mail', status: 'waiting', note: 'Waiting on your Brevo account', milestone: 'Launch decision' },
        { title: 'Legal & privacy', status: 'todo' },
    ],
};
(0, testing_1.test)('the map stays folded under the plan line, and opens drawn in the app and written out in the terminal', function ($, on) { return __awaiter(void 0, void 0, void 0, function () {
    var w, sent, _i, _a, surface, ui_1, now, _b, _c, opened, _d, _e, words, _f, _g, ui, _h, _j, _k, _l, _m;
    return __generator(this, function (_o) {
        switch (_o.label) {
            case 0:
                w = (0, world_1.world)(on);
                testing_1.mock.clock(on, { now: AFTERNOON });
                return [4 /*yield*/, $.tool.call(__assign({ tool: MAP }, MYAPP))];
            case 1:
                sent = _o.sent();
                (0, testing_1.expect)(String(sent.result)).toContain('iOS app · 70%');
                (0, testing_1.expect)(w.stored['map:/work/myapp']).toMatchObject({ milestones: MYAPP.milestones });
                _i = 0, _a = ['desktop', 'mobile'];
                _o.label = 2;
            case 2:
                if (!(_i < _a.length)) return [3 /*break*/, 14];
                surface = _a[_i];
                return [4 /*yield*/, $.ui.mount(__assign(__assign({}, world_1.PANE), { surface: surface }))];
            case 3:
                ui_1 = _o.sent();
                return [4 /*yield*/, (0, world_1.allText)(ui_1)];
            case 4:
                now = _o.sent();
                (0, testing_1.expect)(now).toContain('◉ PLAN');
                (0, testing_1.expect)(now).toContain('iOS 1.0 to review · Wed 14 Oct');
                (0, testing_1.expect)(now).not.toContain('you are here');
                _b = testing_1.expect;
                return [4 /*yield*/, ui_1.find({ type: 'Svg' })];
            case 5:
                _b.apply(void 0, [_o.sent()]).toBeUndefined();
                _c = testing_1.expect;
                return [4 /*yield*/, ui_1.find({ type: 'Button', text: '▸ ◉ Project map · iOS 1.0 to review' })];
            case 6:
                _c.apply(void 0, [_o.sent()]).toBeDefined();
                return [4 /*yield*/, (0, world_1.unfold)(ui_1, 'map')];
            case 7:
                _o.sent();
                return [4 /*yield*/, (0, world_1.allText)(ui_1)];
            case 8:
                opened = _o.sent();
                for (_d = 0, _e = ['MYAPP · PROJECT MAP', 'iOS 1.0 to review · you are here', 'Waiting on you', 'In progress · 70%', 'PARTS · 1 of 4 done', 'Waiting on your Brevo account']; _d < _e.length; _d++) {
                    words = _e[_d];
                    (0, testing_1.expect)(opened).toContain(words);
                }
                _f = testing_1.expect;
                return [4 /*yield*/, ui_1.find({ key: 'card:map' })];
            case 9:
                _f.apply(void 0, [_o.sent()]).toMatchObject({ props: { borderColor: 'permission' } });
                _g = testing_1.expect;
                return [4 /*yield*/, ui_1.find({ key: 'edit:map:part:Mail' })];
            case 10:
                _g.apply(void 0, [_o.sent()]).toBeDefined();
                return [4 /*yield*/, ui_1.press({ key: 'fold:map' })];
            case 11:
                _o.sent();
                return [4 /*yield*/, ui_1.unmount()];
            case 12:
                _o.sent();
                _o.label = 13;
            case 13:
                _i++;
                return [3 /*break*/, 2];
            case 14: return [4 /*yield*/, $.ui.mount(__assign(__assign({}, world_1.PANE), { surface: 'terminal' }))];
            case 15:
                ui = _o.sent();
                _h = testing_1.expect;
                return [4 /*yield*/, ui.find({ type: 'Svg' })];
            case 16:
                _h.apply(void 0, [_o.sent()]).toBeUndefined();
                _j = testing_1.expect;
                return [4 /*yield*/, ui.find({ type: 'Text', text: 'MYAPP · PROJECT MAP' })];
            case 17:
                _j.apply(void 0, [_o.sent()]).toBeUndefined();
                return [4 /*yield*/, (0, world_1.unfold)(ui, 'map')];
            case 18:
                _o.sent();
                _k = testing_1.expect;
                return [4 /*yield*/, ui.find({ type: 'Text', text: 'MYAPP · PROJECT MAP' })];
            case 19:
                _k.apply(void 0, [_o.sent()]).toBeDefined();
                _l = testing_1.expect;
                return [4 /*yield*/, ui.find({ type: 'Text', text: 'PARTS · 1 of 4 done' })];
            case 20:
                _l.apply(void 0, [_o.sent()]).toBeDefined();
                _m = testing_1.expect;
                return [4 /*yield*/, ui.find({ type: 'Text', text: 'Waiting on your Brevo account' })];
            case 21:
                _m.apply(void 0, [_o.sent()]).toBeDefined();
                return [4 /*yield*/, ui.unmount()];
            case 22:
                _o.sent();
                return [2 /*return*/];
        }
    });
}); });
(0, testing_1.test)('what moved shows under Just now, and the part is outlined in the map', function ($, on) { return __awaiter(void 0, void 0, void 0, function () {
    var w, clock, feed, ui, now, _a, terminal, _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                w = (0, world_1.world)(on);
                clock = testing_1.mock.clock(on, { now: AFTERNOON });
                return [4 /*yield*/, $.tool.call(__assign({ tool: MAP }, MYAPP))];
            case 1:
                _d.sent();
                return [4 /*yield*/, clock.advance(60 * 60 * 1000)];
            case 2:
                _d.sent();
                return [4 /*yield*/, $.tool.call({
                        tool: MAP,
                        parts: [
                            { title: 'Backend', status: 'done' },
                            { title: 'iOS app', status: 'active', progress: 85 },
                            { title: 'Mail', status: 'done', note: 'Brevo ready' },
                            { title: 'Legal & privacy', status: 'stuck', note: 'Waiting on a lawyer' },
                        ],
                    })];
            case 3:
                _d.sent();
                return [4 /*yield*/, $.tool.call({ tool: MAP, milestones: [__assign({}, MYAPP.milestones[0]), { title: 'iOS 1.0 to review', status: 'done' }, { title: 'Launch decision', status: 'active' }] })];
            case 4:
                _d.sent();
                feed = w.stored['changes:/work/myapp'].map(function (one) { return one.text; });
                (0, testing_1.expect)(feed).toEqual(['Now on Launch decision', 'iOS 1.0 to review reached', 'Legal & privacy → Stuck', 'Mail → Done', 'iOS app 70% → 85%']);
                return [4 /*yield*/, $.ui.mount(__assign(__assign({}, world_1.PANE), { surface: 'desktop' }))];
            case 5:
                ui = _d.sent();
                return [4 /*yield*/, (0, world_1.allText)(ui)];
            case 6:
                now = _d.sent();
                (0, testing_1.expect)(now).toContain('JUST NOW');
                (0, testing_1.expect)(now).toContain('Now on Launch decision');
                (0, testing_1.expect)(now).toContain('Legal & privacy → Stuck');
                (0, testing_1.expect)(now).not.toContain('Mail → Done');
                (0, testing_1.expect)(now).toContain('16:00');
                return [4 /*yield*/, (0, world_1.unfold)(ui, 'map')];
            case 7:
                _d.sent();
                _a = testing_1.expect;
                return [4 /*yield*/, ui.find({ key: 'part:Legal & privacy' })];
            case 8:
                _a.apply(void 0, [_d.sent()]).toMatchObject({ props: { borderColor: 'error' } });
                return [4 /*yield*/, ui.unmount()];
            case 9:
                _d.sent();
                return [4 /*yield*/, $.ui.mount(__assign(__assign({}, world_1.PANE), { surface: 'terminal' }))];
            case 10:
                terminal = _d.sent();
                _b = testing_1.expect;
                return [4 /*yield*/, terminal.find({ type: 'Text', text: 'JUST NOW' })];
            case 11:
                _b.apply(void 0, [_d.sent()]).toBeDefined();
                _c = testing_1.expect;
                return [4 /*yield*/, terminal.find({ type: 'Text', text: /Legal & privacy → Stuck/ })];
            case 12:
                _c.apply(void 0, [_d.sent()]).toBeDefined();
                return [4 /*yield*/, terminal.unmount()];
            case 13:
                _d.sent();
                return [2 /*return*/];
        }
    });
}); });
(0, testing_1.test)('a decision shows as Needs your call, with the default it would keep, never applied', function ($, on) { return __awaiter(void 0, void 0, void 0, function () {
    var w, clock, _a, stripe, market, _i, _b, surface, ui, _c, _d, _e, _f, _g;
    var _h;
    return __generator(this, function (_j) {
        switch (_j.label) {
            case 0:
                w = (0, world_1.world)(on);
                clock = testing_1.mock.clock(on, { now: AFTERNOON });
                return [4 /*yield*/, $.tool.call({
                        tool: STEPS,
                        add: [
                            { title: 'Switch Stripe to live mode?', choices: ['Go live', 'Stay in test'], defaultChoice: 'Stay in test', decideBy: '2026-10-07T10:00' },
                            { title: 'Pick a launch market', choices: ['France', 'UK'], defaultChoice: 'Germany' },
                        ],
                    })];
            case 1:
                _j.sent();
                _a = w.steps(), stripe = _a[0], market = _a[1];
                (0, testing_1.expect)(stripe).toMatchObject({ defaultChoice: 'Stay in test', decideBy: '2026-10-07T10:00' });
                (0, testing_1.expect)(market === null || market === void 0 ? void 0 : market.defaultChoice).toBeUndefined();
                _i = 0, _b = ['terminal', 'desktop', 'mobile'];
                _j.label = 2;
            case 2:
                if (!(_i < _b.length)) return [3 /*break*/, 11];
                surface = _b[_i];
                return [4 /*yield*/, $.ui.mount(__assign(__assign({}, world_1.PANE), { surface: surface }))];
            case 3:
                ui = _j.sent();
                _c = testing_1.expect;
                return [4 /*yield*/, ui.find({ type: 'Text', text: 'NEEDS YOUR CALL · 2' })];
            case 4:
                _c.apply(void 0, [_j.sent()]).toBeDefined();
                _d = testing_1.expect;
                return [4 /*yield*/, ui.find({ type: 'Text', text: /Switch Stripe to live mode\?/ })];
            case 5:
                _d.apply(void 0, [_j.sent()]).toBeDefined();
                _e = testing_1.expect;
                return [4 /*yield*/, ui.find({ type: 'Text', text: '⏱ due tomorrow' })];
            case 6:
                _e.apply(void 0, [_j.sent()]).toBeDefined();
                _f = testing_1.expect;
                return [4 /*yield*/, ui.find({ type: 'Text', text: 'No answer keeps: Stay in test' })];
            case 7:
                _f.apply(void 0, [_j.sent()]).toBeDefined();
                _g = testing_1.expect;
                return [4 /*yield*/, ui.find({ key: 'card:yours' })];
            case 8:
                _g.apply(void 0, [_j.sent()]).toMatchObject({ props: { borderColor: 'error' } });
                return [4 /*yield*/, ui.unmount()];
            case 9:
                _j.sent();
                _j.label = 10;
            case 10:
                _i++;
                return [3 /*break*/, 2];
            case 11: return [4 /*yield*/, clock.advance(20 * 60 * 1000)];
            case 12:
                _j.sent();
                (0, testing_1.expect)(w.steps()[0]).toMatchObject({ status: 'todo' });
                (0, testing_1.expect)((_h = w.steps()[0]) === null || _h === void 0 ? void 0 : _h.answer).toBeUndefined();
                return [2 /*return*/];
        }
    });
}); });
(0, testing_1.test)('a tick and a pick land in the feed', function ($, on) { return __awaiter(void 0, void 0, void 0, function () {
    var w, _a, fee, pick, ui;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                w = (0, world_1.world)(on);
                testing_1.mock.clock(on, { now: AFTERNOON });
                return [4 /*yield*/, $.tool.call({ tool: STEPS, add: [{ title: 'Pay the fee' }, { title: 'Pick a market', choices: ['France', 'UK'] }] })];
            case 1:
                _c.sent();
                _a = w.steps(), fee = _a[0], pick = _a[1];
                return [4 /*yield*/, $.ui.mount(__assign(__assign({}, world_1.PANE), { surface: 'desktop' }))];
            case 2:
                ui = _c.sent();
                return [4 /*yield*/, ui.press({ key: "tick:".concat(fee === null || fee === void 0 ? void 0 : fee.id) })];
            case 3:
                _c.sent();
                return [4 /*yield*/, ui.press({ key: "pick:".concat(pick === null || pick === void 0 ? void 0 : pick.id, ":0") })];
            case 4:
                _c.sent();
                return [4 /*yield*/, $.tool.call({ tool: STEPS, confirm: [{ id: (_b = fee === null || fee === void 0 ? void 0 : fee.id) !== null && _b !== void 0 ? _b : '', checked: 'Seen' }] })];
            case 5:
                _c.sent();
                (0, testing_1.expect)(w.stored['changes:/work/myapp'].map(function (one) { return one.text; })).toEqual([
                    'Pay the fee → Done',
                    'You chose: France',
                    'You ticked: Pay the fee',
                ]);
                return [4 /*yield*/, ui.unmount()];
            case 6:
                _c.sent();
                return [2 /*return*/];
        }
    });
}); });
