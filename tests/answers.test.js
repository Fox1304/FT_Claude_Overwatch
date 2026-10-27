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
var STEPS = 'mcp__overview__your_steps';
var AFTERNOON = new Date(2026, 9, 6, 15, 0).getTime();
var ASKS = 'Your SIREN, postal address and phone';
(0, testing_1.test)('a step that asks for words gets an answer box, and Claude receives the answer', function ($, on) { return __awaiter(void 0, void 0, void 0, function () {
    var w, sent, step, ui, _a, _b, _c, _d, _e, _f, built, note, _g, list;
    var _h, _j, _k;
    return __generator(this, function (_l) {
        switch (_l.label) {
            case 0:
                w = (0, world_1.world)(on);
                testing_1.mock.clock(on, { now: AFTERNOON });
                return [4 /*yield*/, $.tool.call({ tool: STEPS, add: [{ title: 'Settle your publisher identity', asks: ASKS, due: '2026-10-09' }] })];
            case 1:
                sent = _l.sent();
                (0, testing_1.expect)(String(sent.result)).toContain("answer waiting (asks: ".concat(ASKS, ")"));
                (0, testing_1.expect)(w.phone).toEqual(['myapp needs an answer: Settle your publisher identity']);
                step = w.steps()[0];
                return [4 /*yield*/, $.ui.mount(__assign(__assign({}, world_1.PANE), { surface: 'desktop' }))];
            case 2:
                ui = _l.sent();
                _a = testing_1.expect;
                return [4 /*yield*/, ui.find({ type: 'Text', text: '⌨ ' })];
            case 3:
                _a.apply(void 0, [_l.sent()]).toBeDefined();
                _b = testing_1.expect;
                return [4 /*yield*/, ui.find({ type: 'Text', text: 'Settle your publisher identity' })];
            case 4:
                _b.apply(void 0, [_l.sent()]).toBeDefined();
                _c = testing_1.expect;
                return [4 /*yield*/, ui.find({ key: "answer:".concat(step === null || step === void 0 ? void 0 : step.id) })];
            case 5:
                _c.apply(void 0, [(_h = (_l.sent())) === null || _h === void 0 ? void 0 : _h.props.placeholder]).toBe("".concat(ASKS, "\u2026"));
                _d = testing_1.expect;
                return [4 /*yield*/, ui.find({ type: 'Text', text: /☐ tick when done · ◆ pick one · ⌨ type your answer, then Enter · ✎ tell Claude what to change/ })];
            case 6:
                _d.apply(void 0, [_l.sent()]).toBeDefined();
                return [4 /*yield*/, ui.input({ key: "answer:".concat(step === null || step === void 0 ? void 0 : step.id), text: 'Not registered · 3 rue Exemple, Lyon · 06 00 00 00 00' })];
            case 7:
                _l.sent();
                (0, testing_1.expect)(w.steps()[0]).toMatchObject({ status: 'checked', answer: 'Not registered · 3 rue Exemple, Lyon · 06 00 00 00 00' });
                _e = testing_1.expect;
                return [4 /*yield*/, ui.find({ type: 'Text', text: /Your answer: « Not registered/ })];
            case 8:
                _e.apply(void 0, [_l.sent()]).toBeDefined();
                _f = testing_1.expect;
                return [4 /*yield*/, ui.find({ type: 'Text', text: 'Answered · Claude will pick it up' })];
            case 9:
                _f.apply(void 0, [_l.sent()]).toBeDefined();
                return [4 /*yield*/, $.tool.call({ tool: 'mcp__fake__build' })];
            case 10:
                built = _l.sent();
                note = ((_j = built.context) !== null && _j !== void 0 ? _j : []).join('\n');
                (0, testing_1.expect)(note).toContain('The person answered in the Overview pane');
                (0, testing_1.expect)(note).toContain("(asked: ".concat(ASKS, ")"));
                (0, testing_1.expect)(note).toContain('« Not registered · 3 rue Exemple, Lyon · 06 00 00 00 00 »');
                _g = testing_1.expect;
                return [4 /*yield*/, ui.find({ type: 'Text', text: '✓ Claude knows · acting on it' })];
            case 11:
                _g.apply(void 0, [_l.sent()]).toBeDefined();
                return [4 /*yield*/, $.tool.call({ tool: STEPS })];
            case 12:
                list = _l.sent();
                (0, testing_1.expect)(String(list.result)).toContain('answered « Not registered');
                (0, testing_1.expect)((_k = w.stored['changes:/work/myapp'][0]) === null || _k === void 0 ? void 0 : _k.text).toBe('You answered: Settle your publisher identity');
                return [4 /*yield*/, ui.unmount()];
            case 13:
                _l.sent();
                return [2 /*return*/];
        }
    });
}); });
(0, testing_1.test)('an emptied answer is taken back', function ($, on) { return __awaiter(void 0, void 0, void 0, function () {
    var w, step, ui;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                w = (0, world_1.world)(on);
                testing_1.mock.clock(on, { now: AFTERNOON });
                return [4 /*yield*/, $.tool.call({ tool: STEPS, add: [{ title: 'Send the video links', asks: 'The three YouTube links' }] })];
            case 1:
                _b.sent();
                step = w.steps()[0];
                return [4 /*yield*/, $.ui.mount(__assign(__assign({}, world_1.PANE), { surface: 'terminal' }))];
            case 2:
                ui = _b.sent();
                return [4 /*yield*/, ui.input({ key: "answer:".concat(step === null || step === void 0 ? void 0 : step.id), text: 'https://youtu.be/a' })];
            case 3:
                _b.sent();
                return [4 /*yield*/, ui.input({ key: "answer:".concat(step === null || step === void 0 ? void 0 : step.id), text: '   ' })];
            case 4:
                _b.sent();
                (0, testing_1.expect)(w.steps()[0]).toMatchObject({ status: 'todo' });
                (0, testing_1.expect)((_a = w.steps()[0]) === null || _a === void 0 ? void 0 : _a.answer).toBeUndefined();
                return [4 /*yield*/, ui.unmount()];
            case 5:
                _b.sent();
                return [2 /*return*/];
        }
    });
}); });
(0, testing_1.test)('on the phone, where there is no box, the step says to answer in the conversation', function ($, on) { return __awaiter(void 0, void 0, void 0, function () {
    var ui, _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                (0, world_1.world)(on);
                testing_1.mock.clock(on, { now: AFTERNOON });
                return [4 /*yield*/, $.tool.call({ tool: STEPS, add: [{ title: 'Send the video links', asks: 'The three YouTube links' }] })];
            case 1:
                _c.sent();
                return [4 /*yield*/, $.ui.mount(__assign(__assign({}, world_1.PANE), { surface: 'mobile' }))];
            case 2:
                ui = _c.sent();
                _a = testing_1.expect;
                return [4 /*yield*/, ui.find({ type: 'Text', text: 'Answer in the conversation: The three YouTube links' })];
            case 3:
                _a.apply(void 0, [_c.sent()]).toBeDefined();
                _b = testing_1.expect;
                return [4 /*yield*/, ui.find({ type: 'Text', text: /⌨ type your answer in the conversation/ })];
            case 4:
                _b.apply(void 0, [_c.sent()]).toBeDefined();
                return [4 /*yield*/, ui.unmount()];
            case 5:
                _c.sent();
                return [2 /*return*/];
        }
    });
}); });
(0, testing_1.test)('a step cannot both offer choices and ask for words', function ($, on) { return __awaiter(void 0, void 0, void 0, function () {
    var w;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                w = (0, world_1.world)(on);
                testing_1.mock.clock(on);
                return [4 /*yield*/, $.tool.call({ tool: STEPS, add: [{ title: 'Pick a market', choices: ['France', 'UK'], asks: 'Which one' }] })];
            case 1:
                _b.sent();
                (0, testing_1.expect)((_a = w.steps()[0]) === null || _a === void 0 ? void 0 : _a.asks).toBeUndefined();
                return [2 /*return*/];
        }
    });
}); });
(0, testing_1.test)("the pane's own messages read as what the person did", function ($) { return __awaiter(void 0, void 0, void 0, function () {
    var cases, _i, cases_1, _a, text, line, row, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                cases = [
                    [
                        'The person decided in the Overview pane:\n- a1 · Choose the icon → "Keep the current icon"\nAct on it.',
                        '◆ You chose: Keep the current icon · Claude is on it',
                    ],
                    [
                        'The person answered in the Overview pane:\n- a2 · Settle your publisher identity (asked: Your SIREN)\n  « 123 »\nUse the answer.',
                        '✎ You answered: Settle your publisher identity · Claude is on it',
                    ],
                    ['The person unticked this step (or took back their pick or answer); not done after all:\n- a3 · Pay the fee', '☐ You took back: Pay the fee · Claude knows'],
                ];
                _i = 0, cases_1 = cases;
                _c.label = 1;
            case 1:
                if (!(_i < cases_1.length)) return [3 /*break*/, 6];
                _a = cases_1[_i], text = _a[0], line = _a[1];
                return [4 /*yield*/, $.ui.mount({
                        plugin: 'overview',
                        surface: 'desktop',
                        component: 'UserMessage',
                        props: { text: text, origin: { kind: 'plugin', name: 'overview' }, isExpanded: false },
                    })];
            case 2:
                row = _c.sent();
                _b = testing_1.expect;
                return [4 /*yield*/, row.find({ type: 'Text', text: line })];
            case 3:
                _b.apply(void 0, [_c.sent()]).toBeDefined();
                return [4 /*yield*/, row.unmount()];
            case 4:
                _c.sent();
                _c.label = 5;
            case 5:
                _i++;
                return [3 /*break*/, 1];
            case 6: return [2 /*return*/];
        }
    });
}); });
