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
var SURFACES = ['terminal', 'desktop', 'mobile'];
var addTwo = function ($) {
    return $.tool.call({
        tool: STEPS_TOOL,
        add: [
            { title: 'Approve the new Apple agreement', detail: 'App Store Connect, Business' },
            { title: 'Pay the Play Console fee' },
        ],
    });
};
(0, testing_1.test)('steps for the person show in the pane, shared by the whole repository', function ($, on) { return __awaiter(void 0, void 0, void 0, function () {
    var w, sent, _i, SURFACES_1, surface, pane, _a, _b, _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                w = (0, world_1.world)(on);
                testing_1.mock.clock(on, { now: 1000 });
                return [4 /*yield*/, addTwo($)];
            case 1:
                sent = _e.sent();
                (0, testing_1.expect)(String(sent.result)).toContain('Approve the new Apple agreement');
                (0, testing_1.expect)(w.steps().map(function (step) { return step.status; })).toEqual(['todo', 'todo']);
                _i = 0, SURFACES_1 = SURFACES;
                _e.label = 2;
            case 2:
                if (!(_i < SURFACES_1.length)) return [3 /*break*/, 10];
                surface = SURFACES_1[_i];
                return [4 /*yield*/, $.ui.mount(__assign(__assign({}, world_1.PANE), { surface: surface }))];
            case 3:
                pane = _e.sent();
                _a = testing_1.expect;
                return [4 /*yield*/, pane.find({ type: 'Text', text: '2 now' })];
            case 4:
                _a.apply(void 0, [_e.sent()]).toBeDefined();
                _b = testing_1.expect;
                return [4 /*yield*/, pane.find({ type: 'Text', text: 'Approve the new Apple agreement' })];
            case 5:
                _b.apply(void 0, [_e.sent()]).toBeDefined();
                _c = testing_1.expect;
                return [4 /*yield*/, pane.find({ type: 'Button', text: '☐' })];
            case 6:
                _c.apply(void 0, [_e.sent()]).toBeDefined();
                _d = testing_1.expect;
                return [4 /*yield*/, pane.find({ type: 'Text', text: 'App Store Connect, Business' })];
            case 7:
                _d.apply(void 0, [_e.sent()]).toBeDefined();
                return [4 /*yield*/, pane.unmount()];
            case 8:
                _e.sent();
                _e.label = 9;
            case 9:
                _i++;
                return [3 /*break*/, 2];
            case 10: return [2 /*return*/];
        }
    });
}); });
(0, testing_1.test)('a tick waits, then an idle Claude picks it up once the person stops ticking', function ($, on) { return __awaiter(void 0, void 0, void 0, function () {
    var w, clock, first, pane, _a, _b, _c;
    var _d, _e;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0:
                w = (0, world_1.world)(on);
                clock = testing_1.mock.clock(on, { now: 1000 });
                return [4 /*yield*/, addTwo($)];
            case 1:
                _f.sent();
                first = w.steps()[0];
                return [4 /*yield*/, $.ui.mount(__assign(__assign({}, world_1.PANE), { surface: 'desktop' }))];
            case 2:
                pane = _f.sent();
                return [4 /*yield*/, pane.press({ key: "tick:".concat(first === null || first === void 0 ? void 0 : first.id) })];
            case 3:
                _f.sent();
                _a = testing_1.expect;
                return [4 /*yield*/, pane.find({ key: "tick:".concat(first === null || first === void 0 ? void 0 : first.id), type: 'Button' })];
            case 4:
                _a.apply(void 0, [_f.sent()]).toMatchObject({ text: '☑' });
                _b = testing_1.expect;
                return [4 /*yield*/, pane.find({ type: 'Text', text: 'Ticked · Claude will pick it up' })];
            case 5:
                _b.apply(void 0, [_f.sent()]).toBeDefined();
                return [4 /*yield*/, clock.advance(20000)];
            case 6:
                _f.sent();
                (0, testing_1.expect)(w.prompts).toHaveLength(0);
                return [4 /*yield*/, clock.advance(20000)];
            case 7:
                _f.sent();
                (0, testing_1.expect)(w.prompts).toHaveLength(1);
                (0, testing_1.expect)((_d = w.prompts[0]) === null || _d === void 0 ? void 0 : _d.text).toContain('Approve the new Apple agreement');
                (0, testing_1.expect)((_e = w.prompts[0]) === null || _e === void 0 ? void 0 : _e.text).not.toContain('Pay the Play Console fee');
                _c = testing_1.expect;
                return [4 /*yield*/, pane.find({ type: 'Text', text: 'Claude knows · confirming' })];
            case 8:
                _c.apply(void 0, [_f.sent()]).toBeDefined();
                return [4 /*yield*/, clock.advance(60000)];
            case 9:
                _f.sent();
                (0, testing_1.expect)(w.prompts).toHaveLength(1);
                return [4 /*yield*/, pane.unmount()];
            case 10:
                _f.sent();
                return [2 /*return*/];
        }
    });
}); });
(0, testing_1.test)("while Claude works, a tick reaches it with its next tool result", function ($, on) { return __awaiter(void 0, void 0, void 0, function () {
    var w, clock, _a, second, pane, built, _b, again;
    var _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                w = (0, world_1.world)(on);
                clock = testing_1.mock.clock(on, { now: 1000 });
                return [4 /*yield*/, $.prompt.submit({ text: 'Ship the beta', wait: false, origin: { kind: 'composer' } })];
            case 1:
                _e.sent();
                return [4 /*yield*/, addTwo($)];
            case 2:
                _e.sent();
                _a = w.steps(), second = _a[1];
                return [4 /*yield*/, $.ui.mount(__assign(__assign({}, world_1.PANE), { surface: 'terminal' }))];
            case 3:
                pane = _e.sent();
                return [4 /*yield*/, pane.press({ key: "tick:".concat(second === null || second === void 0 ? void 0 : second.id) })];
            case 4:
                _e.sent();
                return [4 /*yield*/, $.tool.call({ tool: 'mcp__fake__build' })];
            case 5:
                built = _e.sent();
                (0, testing_1.expect)(w.logs).toEqual([]);
                (0, testing_1.expect)(((_c = built.context) !== null && _c !== void 0 ? _c : []).join('\n')).toContain('Pay the Play Console fee');
                _b = testing_1.expect;
                return [4 /*yield*/, pane.find({ type: 'Text', text: 'Claude knows · confirming' })];
            case 6:
                _b.apply(void 0, [_e.sent()]).toBeDefined();
                return [4 /*yield*/, $.tool.call({ tool: 'mcp__fake__build' })];
            case 7:
                again = _e.sent();
                (0, testing_1.expect)((_d = again.context) !== null && _d !== void 0 ? _d : []).toEqual([]);
                return [4 /*yield*/, clock.advance(120000)];
            case 8:
                _e.sent();
                (0, testing_1.expect)(w.prompts).toHaveLength(1);
                return [4 /*yield*/, pane.unmount()];
            case 9:
                _e.sent();
                return [2 /*return*/];
        }
    });
}); });
(0, testing_1.test)('with pickup off, the next message carries the tick', { options: { pickupAfterSeconds: 0 } }, function ($, on) { return __awaiter(void 0, void 0, void 0, function () {
    var w, clock, first, pane;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                w = (0, world_1.world)(on);
                clock = testing_1.mock.clock(on, { now: 1000 });
                return [4 /*yield*/, addTwo($)];
            case 1:
                _c.sent();
                first = w.steps()[0];
                return [4 /*yield*/, $.ui.mount(__assign(__assign({}, world_1.PANE), { surface: 'desktop' }))];
            case 2:
                pane = _c.sent();
                return [4 /*yield*/, pane.press({ key: "tick:".concat(first === null || first === void 0 ? void 0 : first.id) })];
            case 3:
                _c.sent();
                return [4 /*yield*/, clock.advance(120000)];
            case 4:
                _c.sent();
                (0, testing_1.expect)(w.prompts).toHaveLength(0);
                return [4 /*yield*/, $.prompt.submit({ text: 'What is left?', wait: false, origin: { kind: 'composer' } })];
            case 5:
                _c.sent();
                (0, testing_1.expect)(w.prompts).toHaveLength(1);
                (0, testing_1.expect)((_a = w.prompts[0]) === null || _a === void 0 ? void 0 : _a.context.join('\n')).toContain('Approve the new Apple agreement');
                (0, testing_1.expect)((_b = w.steps()[0]) === null || _b === void 0 ? void 0 : _b.heard).toBe('checked');
                return [4 /*yield*/, pane.unmount()];
            case 6:
                _c.sent();
                return [2 /*return*/];
        }
    });
}); });
(0, testing_1.test)('a tick undone before Claude hears it tells Claude nothing', function ($, on) { return __awaiter(void 0, void 0, void 0, function () {
    var w, clock, first, pane, _a;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                w = (0, world_1.world)(on);
                clock = testing_1.mock.clock(on, { now: 1000 });
                return [4 /*yield*/, addTwo($)];
            case 1:
                _c.sent();
                first = w.steps()[0];
                return [4 /*yield*/, $.ui.mount(__assign(__assign({}, world_1.PANE), { surface: 'desktop' }))];
            case 2:
                pane = _c.sent();
                return [4 /*yield*/, pane.press({ key: "tick:".concat(first === null || first === void 0 ? void 0 : first.id) })];
            case 3:
                _c.sent();
                return [4 /*yield*/, pane.press({ key: "tick:".concat(first === null || first === void 0 ? void 0 : first.id) })];
            case 4:
                _c.sent();
                return [4 /*yield*/, clock.advance(120000)];
            case 5:
                _c.sent();
                (0, testing_1.expect)(w.prompts).toHaveLength(0);
                _a = testing_1.expect;
                return [4 /*yield*/, $.tool.call({ tool: 'mcp__fake__build' })];
            case 6:
                _a.apply(void 0, [(_b = (_c.sent()).context) !== null && _b !== void 0 ? _b : []]).toEqual([]);
                return [4 /*yield*/, pane.unmount()];
            case 7:
                _c.sent();
                return [2 /*return*/];
        }
    });
}); });
(0, testing_1.test)('Claude confirms a step or reopens it with what is missing', function ($, on) { return __awaiter(void 0, void 0, void 0, function () {
    var w, _a, first, second, sent, _i, SURFACES_2, surface, pane, _b, _c, _d, _e;
    var _f, _g;
    return __generator(this, function (_h) {
        switch (_h.label) {
            case 0:
                w = (0, world_1.world)(on);
                testing_1.mock.clock(on, { now: 1000 });
                return [4 /*yield*/, addTwo($)];
            case 1:
                _h.sent();
                _a = w.steps(), first = _a[0], second = _a[1];
                return [4 /*yield*/, $.tool.call({
                        tool: STEPS_TOOL,
                        confirm: [{ id: (_f = first === null || first === void 0 ? void 0 : first.id) !== null && _f !== void 0 ? _f : '', checked: 'Seen in App Store Connect, agreement active' }],
                        reopen: [{ id: (_g = second === null || second === void 0 ? void 0 : second.id) !== null && _g !== void 0 ? _g : '', note: 'The payment still shows as pending' }],
                        remove: ['nope00'],
                    })];
            case 2:
                sent = _h.sent();
                (0, testing_1.expect)(String(sent.result)).toContain('Unknown ids, nothing changed for them: nope00');
                _i = 0, SURFACES_2 = SURFACES;
                _h.label = 3;
            case 3:
                if (!(_i < SURFACES_2.length)) return [3 /*break*/, 12];
                surface = SURFACES_2[_i];
                return [4 /*yield*/, $.ui.mount(__assign(__assign({}, world_1.PANE), { surface: surface }))];
            case 4:
                pane = _h.sent();
                return [4 /*yield*/, (0, world_1.unfold)(pane, 'confirmed')];
            case 5:
                _h.sent();
                _b = testing_1.expect;
                return [4 /*yield*/, pane.find({ type: 'Text', text: 'Approve the new Apple agreement · confirmed' })];
            case 6:
                _b.apply(void 0, [_h.sent()]).toBeDefined();
                _c = testing_1.expect;
                return [4 /*yield*/, pane.find({ type: 'Text', text: 'Seen in App Store Connect, agreement active' })];
            case 7:
                _c.apply(void 0, [_h.sent()]).toBeDefined();
                _d = testing_1.expect;
                return [4 /*yield*/, pane.find({ type: 'Text', text: 'Claude: The payment still shows as pending' })];
            case 8:
                _d.apply(void 0, [_h.sent()]).toBeDefined();
                _e = testing_1.expect;
                return [4 /*yield*/, pane.find({ type: 'Text', text: '1 now' })];
            case 9:
                _e.apply(void 0, [_h.sent()]).toBeDefined();
                return [4 /*yield*/, pane.unmount()];
            case 10:
                _h.sent();
                _h.label = 11;
            case 11:
                _i++;
                return [3 /*break*/, 3];
            case 12: return [2 /*return*/];
        }
    });
}); });
(0, testing_1.test)("the mod's own message shows as one quiet line", function ($) { return __awaiter(void 0, void 0, void 0, function () {
    var text, _i, SURFACES_3, surface, row, _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                text = 'The person ticked this step as done in the Overview pane:\n- a1b2c3 · Approve the new Apple agreement\nCheck each one yourself.';
                _i = 0, SURFACES_3 = SURFACES;
                _b.label = 1;
            case 1:
                if (!(_i < SURFACES_3.length)) return [3 /*break*/, 6];
                surface = SURFACES_3[_i];
                return [4 /*yield*/, $.ui.mount({
                        plugin: 'overview',
                        surface: surface,
                        component: 'UserMessage',
                        props: { text: text, origin: { kind: 'plugin', name: 'overview' }, isExpanded: false },
                    })];
            case 2:
                row = _b.sent();
                _a = testing_1.expect;
                return [4 /*yield*/, row.find({ type: 'Text', text: '☑ You ticked: Approve the new Apple agreement · Claude is checking' })];
            case 3:
                _a.apply(void 0, [_b.sent()]).toBeDefined();
                return [4 /*yield*/, row.unmount()];
            case 4:
                _b.sent();
                _b.label = 5;
            case 5:
                _i++;
                return [3 /*break*/, 1];
            case 6: return [2 /*return*/];
        }
    });
}); });
