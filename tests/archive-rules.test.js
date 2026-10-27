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
var AFTERNOON = new Date(2026, 9, 26, 15, 0).getTime();
var DAY = 24 * 60 * 60 * 1000;
var COMMAND = { origin: { kind: 'composer' }, presentation: { isFullscreen: false, columns: 100 } };
var addThree = function ($) {
    return $.tool.call({ tool: STEPS, add: [{ title: 'Approve the new Apple agreement' }, { title: 'Pay the Play Console fee' }, { title: 'Send the press kit' }] });
};
(0, testing_1.test)('Claude archives a step only once it is confirmed, or as obsolete with a reason', function ($, on) { return __awaiter(void 0, void 0, void 0, function () {
    var w, _a, apple, fee, kit, sent, _b;
    var _c, _d, _e, _f, _g, _h;
    return __generator(this, function (_j) {
        switch (_j.label) {
            case 0:
                w = (0, world_1.world)(on);
                testing_1.mock.clock(on, { now: AFTERNOON });
                return [4 /*yield*/, addThree($)];
            case 1:
                _j.sent();
                _a = w.steps(), apple = _a[0], fee = _a[1], kit = _a[2];
                return [4 /*yield*/, $.tool.call({ tool: STEPS, confirm: [{ id: (_c = apple === null || apple === void 0 ? void 0 : apple.id) !== null && _c !== void 0 ? _c : '', checked: 'Seen in App Store Connect' }] })];
            case 2:
                _j.sent();
                _b = String;
                return [4 /*yield*/, $.tool.call({
                        tool: STEPS,
                        archive: [
                            { id: (_d = apple === null || apple === void 0 ? void 0 : apple.id) !== null && _d !== void 0 ? _d : '', why: 'done' },
                            { id: (_e = fee === null || fee === void 0 ? void 0 : fee.id) !== null && _e !== void 0 ? _e : '', why: 'done' },
                            { id: (_f = kit === null || kit === void 0 ? void 0 : kit.id) !== null && _f !== void 0 ? _f : '', why: 'obsolete' },
                        ],
                    })];
            case 3:
                sent = _b.apply(void 0, [(_j.sent()).result]);
                (0, testing_1.expect)(sent).toContain("Not archived: ".concat(fee === null || fee === void 0 ? void 0 : fee.id, " (not confirmed yet"));
                (0, testing_1.expect)(sent).toContain("".concat(kit === null || kit === void 0 ? void 0 : kit.id, " (an obsolete step needs a \"note\" saying why)"));
                (0, testing_1.expect)(sent).toContain("Archived: ".concat(apple === null || apple === void 0 ? void 0 : apple.id, ". The person can undo it."));
                (0, testing_1.expect)(w.steps().find(function (step) { return step.id === (apple === null || apple === void 0 ? void 0 : apple.id); })).toMatchObject({ archivedBy: 'claude', archivedWhy: 'done', status: 'done' });
                (0, testing_1.expect)((_g = w.steps().find(function (step) { return step.id === (fee === null || fee === void 0 ? void 0 : fee.id); })) === null || _g === void 0 ? void 0 : _g.archivedAt).toBeUndefined();
                return [4 /*yield*/, $.tool.call({ tool: STEPS, archive: [{ id: (_h = kit === null || kit === void 0 ? void 0 : kit.id) !== null && _h !== void 0 ? _h : '', why: 'obsolete', note: 'the launch moved to print only' }] })];
            case 4:
                _j.sent();
                (0, testing_1.expect)(w.steps().find(function (step) { return step.id === (kit === null || kit === void 0 ? void 0 : kit.id); })).toMatchObject({ archivedBy: 'claude', archivedWhy: 'the launch moved to print only' });
                (0, testing_1.expect)(w.toasts.at(-1)).toBe('⊟ Claude archived « Send the press kit » · ↺ Undo in the Overview pane, or /overview undo');
                // Claude archived it itself: nothing is sent back to it.
                (0, testing_1.expect)(w.prompts).toHaveLength(0);
                return [2 /*return*/];
        }
    });
}); });
(0, testing_1.test)('"remove" archives as obsolete: nothing is ever deleted', function ($, on) { return __awaiter(void 0, void 0, void 0, function () {
    var w, _a, fee, listed, _b;
    var _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                w = (0, world_1.world)(on);
                testing_1.mock.clock(on, { now: AFTERNOON });
                return [4 /*yield*/, addThree($)];
            case 1:
                _d.sent();
                _a = w.steps(), fee = _a[1];
                return [4 /*yield*/, $.tool.call({ tool: STEPS, remove: [(_c = fee === null || fee === void 0 ? void 0 : fee.id) !== null && _c !== void 0 ? _c : ''] })];
            case 2:
                _d.sent();
                (0, testing_1.expect)(w.steps()).toHaveLength(3);
                (0, testing_1.expect)(w.steps().find(function (step) { return step.id === (fee === null || fee === void 0 ? void 0 : fee.id); })).toMatchObject({ archivedBy: 'claude', archivedWhy: 'no longer needed' });
                _b = String;
                return [4 /*yield*/, $.tool.call({ tool: STEPS })];
            case 3:
                listed = _b.apply(void 0, [(_d.sent()).result]);
                (0, testing_1.expect)(listed).toContain("- ".concat(fee === null || fee === void 0 ? void 0 : fee.id, " \u00B7 Pay the Play Console fee (obsolete: no longer needed)"));
                return [2 /*return*/];
        }
    });
}); });
(0, testing_1.test)('a confirmed step moves to the archive after a week instead of being deleted', function ($, on) { return __awaiter(void 0, void 0, void 0, function () {
    var w, apple, ui, _a, _b;
    var _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                w = (0, world_1.world)(on);
                testing_1.mock.clock(on, { now: AFTERNOON });
                return [4 /*yield*/, addThree($)];
            case 1:
                _d.sent();
                apple = w.steps()[0];
                return [4 /*yield*/, $.tool.call({ tool: STEPS, confirm: [{ id: (_c = apple === null || apple === void 0 ? void 0 : apple.id) !== null && _c !== void 0 ? _c : '', checked: 'Seen' }] })
                    // Confirmed eight days ago: the next change of the list moves it to the archive.
                ];
            case 2:
                _d.sent();
                // Confirmed eight days ago: the next change of the list moves it to the archive.
                w.stored[world_1.KEY] = { label: 'myapp', steps: w.steps().map(function (step) { return (step.id === (apple === null || apple === void 0 ? void 0 : apple.id) ? __assign(__assign({}, step), { doneAt: AFTERNOON - 8 * DAY }) : step); }) };
                return [4 /*yield*/, $.tool.call({ tool: STEPS, add: [{ title: 'Renew the domain' }] })];
            case 3:
                _d.sent();
                (0, testing_1.expect)(w.steps()).toHaveLength(4);
                (0, testing_1.expect)(w.steps().find(function (step) { return step.id === (apple === null || apple === void 0 ? void 0 : apple.id); })).toMatchObject({ status: 'done', archivedBy: 'auto', archivedWhy: 'done' });
                return [4 /*yield*/, $.ui.mount(__assign(__assign({}, world_1.PANE), { surface: 'desktop' }))];
            case 4:
                ui = _d.sent();
                _a = testing_1.expect;
                return [4 /*yield*/, ui.find({ key: 'fold:confirmed' })];
            case 5:
                _a.apply(void 0, [_d.sent()]).toBeUndefined();
                return [4 /*yield*/, (0, world_1.unfold)(ui, 'archived')];
            case 6:
                _d.sent();
                _b = testing_1.expect;
                return [4 /*yield*/, ui.find({ type: 'Text', text: /^Approve the new Apple agreement · confirmed, archived after a week/ })];
            case 7:
                _b.apply(void 0, [_d.sent()]).toBeDefined();
                return [4 /*yield*/, ui.unmount()];
            case 8:
                _d.sent();
                return [2 /*return*/];
        }
    });
}); });
(0, testing_1.test)("an archive is offered for undo: the pane's Undo, or /overview undo, brings it back", function ($, on) { return __awaiter(void 0, void 0, void 0, function () {
    var w, _a, apple, fee, ui, _b, _c, undone, _d, _e;
    var _f, _g, _h;
    return __generator(this, function (_j) {
        switch (_j.label) {
            case 0:
                w = (0, world_1.world)(on);
                testing_1.mock.clock(on, { now: AFTERNOON });
                return [4 /*yield*/, addThree($)];
            case 1:
                _j.sent();
                _a = w.steps(), apple = _a[0], fee = _a[1];
                return [4 /*yield*/, $.ui.mount(__assign(__assign({}, world_1.PANE), { surface: 'desktop' }))];
            case 2:
                ui = _j.sent();
                return [4 /*yield*/, ui.press({ key: "archive:move:".concat(apple === null || apple === void 0 ? void 0 : apple.id) })];
            case 3:
                _j.sent();
                (0, testing_1.expect)(w.toasts.at(-1)).toBe('⊟ Archived « Approve the new Apple agreement » · ↺ Undo in the Overview pane, or /overview undo');
                _b = testing_1.expect;
                return [4 /*yield*/, ui.find({ type: 'Text', text: '⊟ Archived: Approve the new Apple agreement' })];
            case 4:
                _b.apply(void 0, [_j.sent()]).toBeDefined();
                return [4 /*yield*/, ui.press({ key: 'undo-archive' })];
            case 5:
                _j.sent();
                (0, testing_1.expect)((_f = w.steps().find(function (step) { return step.id === (apple === null || apple === void 0 ? void 0 : apple.id); })) === null || _f === void 0 ? void 0 : _f.archivedAt).toBeUndefined();
                _c = testing_1.expect;
                return [4 /*yield*/, ui.find({ key: 'undo-archive' })];
            case 6:
                _c.apply(void 0, [_j.sent()]).toBeUndefined();
                (0, testing_1.expect)(w.toasts.at(-1)).toBe('↺ Restored « Approve the new Apple agreement »');
                return [4 /*yield*/, ui.unmount()];
            case 7:
                _j.sent();
                return [4 /*yield*/, $.tool.call({ tool: STEPS, archive: [{ id: (_g = fee === null || fee === void 0 ? void 0 : fee.id) !== null && _g !== void 0 ? _g : '', why: 'obsolete', note: 'paid by the agency' }] })];
            case 8:
                _j.sent();
                return [4 /*yield*/, $.command.run(__assign({ command: 'overview', args: 'undo' }, COMMAND))];
            case 9:
                undone = _j.sent();
                (0, testing_1.expect)(undone).toMatchObject({ text: 'Restored « Pay the Play Console fee ».' });
                (0, testing_1.expect)((_h = w.steps().find(function (step) { return step.id === (fee === null || fee === void 0 ? void 0 : fee.id); })) === null || _h === void 0 ? void 0 : _h.archivedAt).toBeUndefined();
                _d = testing_1.expect;
                _e = String;
                return [4 /*yield*/, $.command.run(__assign({ command: 'overview', args: 'undo' }, COMMAND))];
            case 10:
                _d.apply(void 0, [_e.apply(void 0, [(_j.sent()).text])]).toStartWith('Nothing to undo');
                return [2 /*return*/];
        }
    });
}); });
(0, testing_1.test)('the undo bar leaves the pane after two minutes; the archive stays restorable', function ($, on) { return __awaiter(void 0, void 0, void 0, function () {
    var w, clock, apple, ui, _a;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                w = (0, world_1.world)(on);
                clock = testing_1.mock.clock(on, { now: AFTERNOON });
                return [4 /*yield*/, addThree($)];
            case 1:
                _c.sent();
                apple = w.steps()[0];
                return [4 /*yield*/, $.ui.mount(__assign(__assign({}, world_1.PANE), { surface: 'desktop' }))];
            case 2:
                ui = _c.sent();
                return [4 /*yield*/, ui.press({ key: "archive:move:".concat(apple === null || apple === void 0 ? void 0 : apple.id) })];
            case 3:
                _c.sent();
                return [4 /*yield*/, ui.unmount()];
            case 4:
                _c.sent();
                return [4 /*yield*/, clock.advance(3 * 60000)];
            case 5:
                _c.sent();
                return [4 /*yield*/, $.ui.mount(__assign(__assign({}, world_1.PANE), { surface: 'desktop' }))];
            case 6:
                ui = _c.sent();
                _a = testing_1.expect;
                return [4 /*yield*/, ui.find({ key: 'undo-archive' })];
            case 7:
                _a.apply(void 0, [_c.sent()]).toBeUndefined();
                return [4 /*yield*/, (0, world_1.unfold)(ui, 'archived')];
            case 8:
                _c.sent();
                return [4 /*yield*/, ui.press({ key: "restore:".concat(apple === null || apple === void 0 ? void 0 : apple.id) })];
            case 9:
                _c.sent();
                (0, testing_1.expect)((_b = w.steps().find(function (step) { return step.id === (apple === null || apple === void 0 ? void 0 : apple.id); })) === null || _b === void 0 ? void 0 : _b.archivedAt).toBeUndefined();
                return [4 /*yield*/, ui.unmount()];
            case 10:
                _c.sent();
                return [2 /*return*/];
        }
    });
}); });
(0, testing_1.test)('Your move can be searched (accents ignored) and filtered, archive included', function ($, on) { return __awaiter(void 0, void 0, void 0, function () {
    var w, apple, ui, _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, phone, _p, _q;
    var _r, _s, _t;
    return __generator(this, function (_u) {
        switch (_u.label) {
            case 0:
                w = (0, world_1.world)(on);
                testing_1.mock.clock(on, { now: AFTERNOON });
                return [4 /*yield*/, $.tool.call({
                        tool: STEPS,
                        add: [
                            { title: 'Approve the new Apple agreement', detail: 'App Store Connect, Business' },
                            { title: 'Pay the Play Console fee', due: '2026-10-20' },
                            { title: 'Choose the launch market', choices: ['France', 'UK'] },
                            { title: 'Relire la fiche « Éveil »', due: '2026-12-01' },
                        ],
                    })];
            case 1:
                _u.sent();
                apple = w.steps()[0];
                return [4 /*yield*/, $.ui.mount(__assign(__assign({}, world_1.PANE), { surface: 'desktop' }))];
            case 2:
                ui = _u.sent();
                return [4 /*yield*/, ui.press({ key: "archive:move:".concat(apple === null || apple === void 0 ? void 0 : apple.id) })];
            case 3:
                _u.sent();
                _a = testing_1.expect;
                return [4 /*yield*/, ui.find({ key: 'filter:decide' })];
            case 4:
                _a.apply(void 0, [(_r = (_u.sent())) === null || _r === void 0 ? void 0 : _r.text]).toBe('○ Decisions · 1');
                _b = testing_1.expect;
                return [4 /*yield*/, ui.find({ key: 'filter:overdue' })];
            case 5:
                _b.apply(void 0, [(_s = (_u.sent())) === null || _s === void 0 ? void 0 : _s.text]).toBe('○ Overdue · 1');
                _c = testing_1.expect;
                return [4 /*yield*/, ui.find({ key: 'filter:archived' })];
            case 6:
                _c.apply(void 0, [(_t = (_u.sent())) === null || _t === void 0 ? void 0 : _t.text]).toBe('○ Archived · 1');
                _d = testing_1.expect;
                return [4 /*yield*/, ui.find({ key: 'filter:ticked' })];
            case 7:
                _d.apply(void 0, [_u.sent()]).toBeUndefined();
                return [4 /*yield*/, ui.input({ key: 'step-search', text: 'eveil', kind: 'change' })];
            case 8:
                _u.sent();
                _e = testing_1.expect;
                return [4 /*yield*/, ui.find({ type: 'Text', text: 'FOUND · 1 for « eveil »' })];
            case 9:
                _e.apply(void 0, [_u.sent()]).toBeDefined();
                _f = testing_1.expect;
                return [4 /*yield*/, ui.find({ type: 'Text', text: 'Relire la fiche « Éveil »' })];
            case 10:
                _f.apply(void 0, [_u.sent()]).toBeDefined();
                _g = testing_1.expect;
                return [4 /*yield*/, ui.find({ type: 'Text', text: 'Pay the Play Console fee' })];
            case 11:
                _g.apply(void 0, [_u.sent()]).toBeUndefined();
                return [4 /*yield*/, ui.input({ key: 'step-search', text: '', kind: 'change' })];
            case 12:
                _u.sent();
                return [4 /*yield*/, ui.press({ key: 'filter:decide' })];
            case 13:
                _u.sent();
                _h = testing_1.expect;
                return [4 /*yield*/, ui.find({ type: 'Text', text: 'FOUND · 1' })];
            case 14:
                _h.apply(void 0, [_u.sent()]).toBeDefined();
                _j = testing_1.expect;
                return [4 /*yield*/, ui.find({ type: 'Text', text: 'Choose the launch market' })];
            case 15:
                _j.apply(void 0, [_u.sent()]).toBeDefined();
                _k = testing_1.expect;
                return [4 /*yield*/, ui.find({ type: 'Text', text: 'NEEDS YOUR CALL · 1' })];
            case 16:
                _k.apply(void 0, [_u.sent()]).toBeUndefined();
                return [4 /*yield*/, ui.press({ key: 'filter:archived' })];
            case 17:
                _u.sent();
                _l = testing_1.expect;
                return [4 /*yield*/, ui.find({ key: "restore:".concat(apple === null || apple === void 0 ? void 0 : apple.id) })];
            case 18:
                _l.apply(void 0, [_u.sent()]).toBeDefined();
                return [4 /*yield*/, ui.input({ key: 'step-search', text: 'store connect', kind: 'change' })];
            case 19:
                _u.sent();
                _m = testing_1.expect;
                return [4 /*yield*/, ui.find({ type: 'Text', text: 'FOUND · 1 for « store connect »' })];
            case 20:
                _m.apply(void 0, [_u.sent()]).toBeDefined();
                return [4 /*yield*/, ui.press({ key: 'filter-clear' })];
            case 21:
                _u.sent();
                _o = testing_1.expect;
                return [4 /*yield*/, ui.find({ type: 'Text', text: 'NEEDS YOUR CALL · 1' })];
            case 22:
                _o.apply(void 0, [_u.sent()]).toBeDefined();
                return [4 /*yield*/, ui.unmount()
                    // The phone has no text box: the filters alone.
                ];
            case 23:
                _u.sent();
                return [4 /*yield*/, $.ui.mount(__assign(__assign({}, world_1.PANE), { surface: 'mobile' }))];
            case 24:
                phone = _u.sent();
                _p = testing_1.expect;
                return [4 /*yield*/, phone.find({ key: 'step-search' })];
            case 25:
                _p.apply(void 0, [_u.sent()]).toBeUndefined();
                _q = testing_1.expect;
                return [4 /*yield*/, phone.find({ key: 'filter:decide' })];
            case 26:
                _q.apply(void 0, [_u.sent()]).toBeDefined();
                return [4 /*yield*/, phone.unmount()];
            case 27:
                _u.sent();
                return [2 /*return*/];
        }
    });
}); });
