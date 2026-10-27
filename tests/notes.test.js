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
var COMPOSER = { wait: false, origin: { kind: 'composer' } };
var AFTERNOON = new Date(2026, 9, 13, 15, 0).getTime();
var GOAL = 'Parents can pay in euros';
var BOX = "now::goal:".concat(GOAL);
(0, testing_1.test)('the edit box opens on an item, refuses an empty note, and sends a note to an idle Claude', function ($, on) { return __awaiter(void 0, void 0, void 0, function () {
    var w, _i, _a, surface, ui_1, _b, _c, ui, _d, _e, _f, _g, _h, _j, _k, _l;
    var _m, _o, _p, _q;
    return __generator(this, function (_r) {
        switch (_r.label) {
            case 0:
                w = (0, world_1.world)(on);
                testing_1.mock.clock(on, { now: AFTERNOON });
                return [4 /*yield*/, $.tool.call({ tool: GOALS, goals: [{ title: GOAL, status: 'active' }] })];
            case 1:
                _r.sent();
                _i = 0, _a = ['terminal', 'desktop'];
                _r.label = 2;
            case 2:
                if (!(_i < _a.length)) return [3 /*break*/, 8];
                surface = _a[_i];
                return [4 /*yield*/, $.ui.mount(__assign(__assign({}, world_1.PANE), { surface: surface }))];
            case 3:
                ui_1 = _r.sent();
                _b = testing_1.expect;
                return [4 /*yield*/, ui_1.find({ key: "edit:now:goal:".concat(GOAL), type: 'Button' })];
            case 4:
                _b.apply(void 0, [_r.sent()]).toMatchObject({ text: '✎' });
                _c = testing_1.expect;
                return [4 /*yield*/, ui_1.find({ type: 'Text', text: GOAL })];
            case 5:
                _c.apply(void 0, [_r.sent()]).toBeDefined();
                return [4 /*yield*/, ui_1.unmount()];
            case 6:
                _r.sent();
                _r.label = 7;
            case 7:
                _i++;
                return [3 /*break*/, 2];
            case 8: return [4 /*yield*/, $.ui.mount(__assign(__assign({}, world_1.PANE), { surface: 'desktop' }))];
            case 9:
                ui = _r.sent();
                _d = testing_1.expect;
                return [4 /*yield*/, ui.find({ key: "note-input:".concat(BOX.replace('::', ':')) })];
            case 10:
                _d.apply(void 0, [_r.sent()]).toBeUndefined();
                return [4 /*yield*/, ui.press({ key: "edit:now:goal:".concat(GOAL) })];
            case 11:
                _r.sent();
                _e = testing_1.expect;
                return [4 /*yield*/, ui.find({ type: 'Text', text: '✎ Tell Claude what to change' })];
            case 12:
                _e.apply(void 0, [_r.sent()]).toBeDefined();
                _f = testing_1.expect;
                return [4 /*yield*/, ui.find({ key: "note-input:now:goal:".concat(GOAL) })];
            case 13:
                _f.apply(void 0, [_r.sent()]).toMatchObject({ props: { placeholder: 'Your note for Claude…' } });
                return [4 /*yield*/, ui.input({ key: "note-input:now:goal:".concat(GOAL), text: '   ' })];
            case 14:
                _r.sent();
                _g = testing_1.expect;
                return [4 /*yield*/, ui.find({ type: 'Text', text: /Type what should change first/ })];
            case 15:
                _g.apply(void 0, [_r.sent()]).toBeDefined();
                (0, testing_1.expect)(w.prompts).toHaveLength(0);
                return [4 /*yield*/, ui.input({ key: "note-input:now:goal:".concat(GOAL), text: 'No longer relevant: we launch in France only.' })];
            case 16:
                _r.sent();
                (0, testing_1.expect)(w.prompts).toHaveLength(1);
                (0, testing_1.expect)((_m = w.prompts[0]) === null || _m === void 0 ? void 0 : _m.text).toContain("the goal \u00AB ".concat(GOAL, " \u00BB"));
                (0, testing_1.expect)((_o = w.prompts[0]) === null || _o === void 0 ? void 0 : _o.text).toContain('« No longer relevant: we launch in France only. »');
                (0, testing_1.expect)((_p = w.prompts[0]) === null || _p === void 0 ? void 0 : _p.text).toContain('mcp__overview__goals');
                _h = testing_1.expect;
                return [4 /*yield*/, ui.find({ key: "note-input:now:goal:".concat(GOAL) })];
            case 17:
                _h.apply(void 0, [_r.sent()]).toBeUndefined();
                _j = testing_1.expect;
                return [4 /*yield*/, ui.find({ type: 'Text', text: '✎ Note sent · Claude is reworking this' })];
            case 18:
                _j.apply(void 0, [_r.sent()]).toBeDefined();
                _k = testing_1.expect;
                return [4 /*yield*/, ui.find({ type: 'Text', text: '« No longer relevant: we launch in France only. »' })];
            case 19:
                _k.apply(void 0, [_r.sent()]).toBeDefined();
                (0, testing_1.expect)((_q = w.stored['changes:/work/myapp'][0]) === null || _q === void 0 ? void 0 : _q.text).toBe("Your note on ".concat(GOAL));
                return [4 /*yield*/, $.tool.call({ tool: GOALS, goals: [{ title: 'Parents in France can pay in euros', status: 'active' }] })];
            case 20:
                _r.sent();
                _l = testing_1.expect;
                return [4 /*yield*/, (0, world_1.allText)(ui)];
            case 21:
                _l.apply(void 0, [_r.sent()]).not.toContain('Note sent');
                return [4 /*yield*/, ui.unmount()];
            case 22:
                _r.sent();
                return [2 /*return*/];
        }
    });
}); });
(0, testing_1.test)('the box closes with ✕, and the edit button toggles it', function ($, on) { return __awaiter(void 0, void 0, void 0, function () {
    var ui, _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                (0, world_1.world)(on);
                testing_1.mock.clock(on, { now: AFTERNOON });
                return [4 /*yield*/, $.tool.call({ tool: GOALS, goals: [{ title: GOAL, status: 'active' }] })];
            case 1:
                _c.sent();
                return [4 /*yield*/, $.ui.mount(__assign(__assign({}, world_1.PANE), { surface: 'terminal' }))];
            case 2:
                ui = _c.sent();
                return [4 /*yield*/, ui.press({ key: "edit:now:goal:".concat(GOAL) })];
            case 3:
                _c.sent();
                return [4 /*yield*/, ui.press({ key: "edit-close:now:goal:".concat(GOAL) })];
            case 4:
                _c.sent();
                _a = testing_1.expect;
                return [4 /*yield*/, ui.find({ key: "note-input:now:goal:".concat(GOAL) })];
            case 5:
                _a.apply(void 0, [_c.sent()]).toBeUndefined();
                return [4 /*yield*/, ui.press({ key: "edit:now:goal:".concat(GOAL) })];
            case 6:
                _c.sent();
                return [4 /*yield*/, ui.press({ key: "edit:now:goal:".concat(GOAL) })];
            case 7:
                _c.sent();
                _b = testing_1.expect;
                return [4 /*yield*/, ui.find({ key: "note-input:now:goal:".concat(GOAL) })];
            case 8:
                _b.apply(void 0, [_c.sent()]).toBeUndefined();
                return [4 /*yield*/, ui.unmount()];
            case 9:
                _c.sent();
                return [2 /*return*/];
        }
    });
}); });
(0, testing_1.test)('while Claude works, a note waits for its next step', function ($, on) { return __awaiter(void 0, void 0, void 0, function () {
    var w, step, ui, _a, built, context, _b, _c;
    var _d, _e;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0:
                w = (0, world_1.world)(on);
                testing_1.mock.clock(on, { now: AFTERNOON });
                return [4 /*yield*/, $.prompt.submit(__assign({ text: 'Ship the beta' }, COMPOSER))];
            case 1:
                _f.sent();
                return [4 /*yield*/, $.tool.call({ tool: STEPS, add: [{ title: 'Pay the Play Console fee', due: '2026-10-14' }] })];
            case 2:
                _f.sent();
                step = w.steps()[0];
                return [4 /*yield*/, $.ui.mount(__assign(__assign({}, world_1.PANE), { surface: 'desktop' }))];
            case 3:
                ui = _f.sent();
                return [4 /*yield*/, ui.press({ key: "edit:move:step:".concat(step === null || step === void 0 ? void 0 : step.id) })];
            case 4:
                _f.sent();
                return [4 /*yield*/, ui.input({ key: "note-input:move:step:".concat(step === null || step === void 0 ? void 0 : step.id), text: 'Already paid last year, remove it.' })];
            case 5:
                _f.sent();
                _a = testing_1.expect;
                return [4 /*yield*/, ui.find({ type: 'Text', text: '✎ Note queued · Claude reads it at its next step' })];
            case 6:
                _a.apply(void 0, [_f.sent()]).toBeDefined();
                (0, testing_1.expect)(w.prompts).toHaveLength(1);
                return [4 /*yield*/, $.tool.call({ tool: 'mcp__fake__build' })];
            case 7:
                built = _f.sent();
                context = ((_d = built.context) !== null && _d !== void 0 ? _d : []).join('\n');
                (0, testing_1.expect)(context).toContain("the step \u00AB Pay the Play Console fee \u00BB (step ".concat(step === null || step === void 0 ? void 0 : step.id, ")"));
                (0, testing_1.expect)(context).toContain('« Already paid last year, remove it. »');
                _b = testing_1.expect;
                return [4 /*yield*/, ui.find({ type: 'Text', text: '✎ Note sent · Claude is reworking this' })];
            case 8:
                _b.apply(void 0, [_f.sent()]).toBeDefined();
                return [4 /*yield*/, $.tool.call({ tool: STEPS, remove: [(_e = step === null || step === void 0 ? void 0 : step.id) !== null && _e !== void 0 ? _e : ''] })];
            case 9:
                _f.sent();
                _c = testing_1.expect;
                return [4 /*yield*/, (0, world_1.allText)(ui)];
            case 10:
                _c.apply(void 0, [_f.sent()]).not.toContain('Already paid last year');
                return [4 /*yield*/, ui.unmount()];
            case 11:
                _f.sent();
                return [2 /*return*/];
        }
    });
}); });
(0, testing_1.test)('a note that fails to send says so, keeps its words, and can be retried or discarded', function ($, on) { return __awaiter(void 0, void 0, void 0, function () {
    var failing, w, ui, _a, _b, _c, _d, again, _e;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0:
                failing = { now: true };
                w = (0, world_1.world)(on, { failPrompts: failing });
                testing_1.mock.clock(on, { now: AFTERNOON });
                return [4 /*yield*/, $.tool.call({ tool: GOALS, goals: [{ title: GOAL, status: 'active' }] })];
            case 1:
                _f.sent();
                return [4 /*yield*/, $.ui.mount(__assign(__assign({}, world_1.PANE), { surface: 'desktop' }))];
            case 2:
                ui = _f.sent();
                return [4 /*yield*/, ui.press({ key: "edit:now:goal:".concat(GOAL) })];
            case 3:
                _f.sent();
                return [4 /*yield*/, ui.input({ key: "note-input:now:goal:".concat(GOAL), text: 'Split it in two.' })];
            case 4:
                _f.sent();
                _a = testing_1.expect;
                return [4 /*yield*/, ui.find({ type: 'Text', text: /⚠ Your note was not sent: .*offline/ })];
            case 5:
                _a.apply(void 0, [_f.sent()]).toBeDefined();
                _b = testing_1.expect;
                return [4 /*yield*/, ui.find({ type: 'Text', text: '« Split it in two. »' })];
            case 6:
                _b.apply(void 0, [_f.sent()]).toBeDefined();
                return [4 /*yield*/, ui.press({ key: "edit:now:goal:".concat(GOAL) })];
            case 7:
                _f.sent();
                _c = testing_1.expect;
                return [4 /*yield*/, ui.find({ key: "note-input:now:goal:".concat(GOAL) })];
            case 8:
                _c.apply(void 0, [_f.sent()]).toMatchObject({ props: { value: 'Split it in two.' } });
                return [4 /*yield*/, ui.press({ key: "edit-close:now:goal:".concat(GOAL) })];
            case 9:
                _f.sent();
                failing.now = false;
                return [4 /*yield*/, ui.press({ key: "note-retry:now:goal:".concat(GOAL) })];
            case 10:
                _f.sent();
                (0, testing_1.expect)(w.prompts).toHaveLength(1);
                _d = testing_1.expect;
                return [4 /*yield*/, ui.find({ type: 'Text', text: '✎ Note sent · Claude is reworking this' })];
            case 11:
                _d.apply(void 0, [_f.sent()]).toBeDefined();
                return [4 /*yield*/, ui.unmount()];
            case 12:
                _f.sent();
                failing.now = true;
                return [4 /*yield*/, $.ui.mount(__assign(__assign({}, world_1.PANE), { surface: 'desktop' }))];
            case 13:
                again = _f.sent();
                return [4 /*yield*/, again.press({ key: "edit:now:goal:".concat(GOAL) })];
            case 14:
                _f.sent();
                return [4 /*yield*/, again.input({ key: "note-input:now:goal:".concat(GOAL), text: 'Never mind.' })];
            case 15:
                _f.sent();
                return [4 /*yield*/, again.press({ key: "note-drop:now:goal:".concat(GOAL) })];
            case 16:
                _f.sent();
                _e = testing_1.expect;
                return [4 /*yield*/, (0, world_1.allText)(again)];
            case 17:
                _e.apply(void 0, [_f.sent()]).not.toContain('Never mind.');
                return [4 /*yield*/, again.unmount()];
            case 18:
                _f.sent();
                return [2 /*return*/];
        }
    });
}); });
(0, testing_1.test)('every kind of item has an edit button: goals, steps, map parts and milestones', function ($, on) { return __awaiter(void 0, void 0, void 0, function () {
    var w, _a, approve, later, ui, _i, _b, key, _c, _d, _e, _f;
    var _g, _h;
    return __generator(this, function (_j) {
        switch (_j.label) {
            case 0:
                w = (0, world_1.world)(on);
                testing_1.mock.clock(on, { now: AFTERNOON });
                return [4 /*yield*/, $.tool.call({ tool: GOALS, goals: [{ title: GOAL, status: 'active' }, { title: 'Invoices go out by mail', status: 'planned' }] })];
            case 1:
                _j.sent();
                return [4 /*yield*/, $.tool.call({ tool: STEPS, add: [{ title: 'Approve the agreement', due: '2026-10-14' }, { title: 'Later thing', due: '2026-12-01' }] })];
            case 2:
                _j.sent();
                return [4 /*yield*/, $.tool.call({
                        tool: 'mcp__overview__project_map',
                        milestones: [{ title: 'Public beta', status: 'active' }],
                        parts: [{ title: 'Mail', status: 'waiting', note: 'Your Brevo account' }],
                    })];
            case 3:
                _j.sent();
                _a = w.steps(), approve = _a[0], later = _a[1];
                return [4 /*yield*/, $.ui.mount(__assign(__assign({}, world_1.PANE), { surface: 'desktop' }))];
            case 4:
                ui = _j.sent();
                _i = 0, _b = ["edit:now:goal:".concat(GOAL), 'edit:next:goal:Invoices go out by mail', "edit:move:step:".concat(approve === null || approve === void 0 ? void 0 : approve.id)];
                _j.label = 5;
            case 5:
                if (!(_i < _b.length)) return [3 /*break*/, 8];
                key = _b[_i];
                _c = testing_1.expect;
                return [4 /*yield*/, ui.find({ key: key })];
            case 6:
                _c.apply(void 0, [_j.sent()]).toBeDefined();
                _j.label = 7;
            case 7:
                _i++;
                return [3 /*break*/, 5];
            case 8: return [4 /*yield*/, ui.press({ key: 'fold:later' })];
            case 9:
                _j.sent();
                _d = testing_1.expect;
                return [4 /*yield*/, ui.find({ key: "edit:later:step:".concat(later === null || later === void 0 ? void 0 : later.id) })];
            case 10:
                _d.apply(void 0, [_j.sent()]).toBeDefined();
                return [4 /*yield*/, ui.press({ key: 'fold:map' })];
            case 11:
                _j.sent();
                _e = testing_1.expect;
                return [4 /*yield*/, ui.find({ key: 'edit:map:part:Mail' })];
            case 12:
                _e.apply(void 0, [_j.sent()]).toBeDefined();
                _f = testing_1.expect;
                return [4 /*yield*/, ui.find({ key: 'edit:map:milestone:Public beta' })];
            case 13:
                _f.apply(void 0, [_j.sent()]).toBeDefined();
                return [4 /*yield*/, ui.press({ key: 'edit:map:part:Mail' })];
            case 14:
                _j.sent();
                return [4 /*yield*/, ui.input({ key: 'note-input:map:part:Mail', text: 'Brevo is live since 7 Oct.' })];
            case 15:
                _j.sent();
                (0, testing_1.expect)((_g = w.prompts[0]) === null || _g === void 0 ? void 0 : _g.text).toContain('the part of the project map « Mail »');
                (0, testing_1.expect)((_h = w.prompts[0]) === null || _h === void 0 ? void 0 : _h.text).toContain('mcp__overview__project_map ("parts")');
                return [4 /*yield*/, ui.unmount()];
            case 16:
                _j.sent();
                return [2 /*return*/];
        }
    });
}); });
(0, testing_1.test)('the pane draws only text and controls, no pictures, so any text can be selected', function ($, on) { return __awaiter(void 0, void 0, void 0, function () {
    var _i, _a, surface, ui, _b, buttons, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                (0, world_1.world)(on);
                testing_1.mock.clock(on, { now: AFTERNOON });
                return [4 /*yield*/, $.tool.call({ tool: GOALS, summary: 'Payments in euros', goals: [{ title: GOAL, status: 'active' }] })];
            case 1:
                _d.sent();
                return [4 /*yield*/, $.tool.call({ tool: 'mcp__overview__project_map', milestones: [{ title: 'Public beta', status: 'active' }], parts: [{ title: 'Mail', status: 'done' }] })];
            case 2:
                _d.sent();
                _i = 0, _a = ['desktop', 'mobile', 'vscode'];
                _d.label = 3;
            case 3:
                if (!(_i < _a.length)) return [3 /*break*/, 12];
                surface = _a[_i];
                return [4 /*yield*/, $.ui.mount(__assign(__assign({}, world_1.PANE), { surface: surface }))];
            case 4:
                ui = _d.sent();
                return [4 /*yield*/, ui.press({ key: 'fold:map' })];
            case 5:
                _d.sent();
                _b = testing_1.expect;
                return [4 /*yield*/, ui.find({ type: 'Svg' })];
            case 6:
                _b.apply(void 0, [_d.sent()]).toBeUndefined();
                return [4 /*yield*/, ui.findAll({ type: 'Button' })];
            case 7:
                buttons = _d.sent();
                (0, testing_1.expect)(buttons.some(function (button) { return button.text.includes(GOAL); })).toBe(false);
                _c = testing_1.expect;
                return [4 /*yield*/, ui.find({ type: 'Text', text: GOAL })];
            case 8:
                _c.apply(void 0, [_d.sent()]).toBeDefined();
                return [4 /*yield*/, ui.press({ key: 'fold:map' })];
            case 9:
                _d.sent();
                return [4 /*yield*/, ui.unmount()];
            case 10:
                _d.sent();
                _d.label = 11;
            case 11:
                _i++;
                return [3 /*break*/, 3];
            case 12: return [2 /*return*/];
        }
    });
}); });
(0, testing_1.test)('on the phone, the box says to write the note in the conversation', function ($, on) { return __awaiter(void 0, void 0, void 0, function () {
    var ui, _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                (0, world_1.world)(on);
                testing_1.mock.clock(on, { now: AFTERNOON });
                return [4 /*yield*/, $.tool.call({ tool: GOALS, goals: [{ title: GOAL, status: 'active' }] })];
            case 1:
                _b.sent();
                return [4 /*yield*/, $.ui.mount(__assign(__assign({}, world_1.PANE), { surface: 'mobile' }))];
            case 2:
                ui = _b.sent();
                return [4 /*yield*/, ui.press({ key: "edit:now:goal:".concat(GOAL) })];
            case 3:
                _b.sent();
                _a = testing_1.expect;
                return [4 /*yield*/, ui.find({ type: 'Text', text: 'This app has no text box: write your note in the conversation.' })];
            case 4:
                _a.apply(void 0, [_b.sent()]).toBeDefined();
                return [4 /*yield*/, ui.unmount()];
            case 5:
                _b.sent();
                return [2 /*return*/];
        }
    });
}); });
(0, testing_1.test)("the pane's note message reads as the person's note in the conversation", function ($) { return __awaiter(void 0, void 0, void 0, function () {
    var row, _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, $.ui.mount({
                    plugin: 'overview',
                    surface: 'desktop',
                    component: 'UserMessage',
                    props: {
                        text: "The person left a note on an item of the Overview pane:\n- the goal \u00AB ".concat(GOAL, " \u00BB:\n  \u00AB Drop it \u00BB\nTake it into account now."),
                        origin: { kind: 'plugin', name: 'overview' },
                        isExpanded: false,
                    },
                })];
            case 1:
                row = _b.sent();
                _a = testing_1.expect;
                return [4 /*yield*/, row.find({ type: 'Text', text: "\u270E Your note on \u00AB ".concat(GOAL, " \u00BB \u00B7 Claude is on it") })];
            case 2:
                _a.apply(void 0, [_b.sent()]).toBeDefined();
                return [4 /*yield*/, row.unmount()];
            case 3:
                _b.sent();
                return [2 /*return*/];
        }
    });
}); });
