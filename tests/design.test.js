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
var SURFACES = ['terminal', 'desktop', 'mobile'];
var COMPOSER = { wait: false, origin: { kind: 'composer' } };
var AFTERNOON = new Date(2026, 9, 6, 15, 0).getTime();
var borderOf = function (ui, key) { return __awaiter(void 0, void 0, void 0, function () { var _a; return __generator(this, function (_b) {
    switch (_b.label) {
        case 0: return [4 /*yield*/, ui.find({ key: "card:".concat(key) })];
        case 1: return [2 /*return*/, (_a = (_b.sent())) === null || _a === void 0 ? void 0 : _a.props];
    }
}); }); };
(0, testing_1.test)("the task card's frame takes the color of what is happening", function ($, on) { return __awaiter(void 0, void 0, void 0, function () {
    var w, _i, SURFACES_1, surface, ui_1, _a, _b, ui, _c, _d, finished, _e, _f, _g;
    return __generator(this, function (_h) {
        switch (_h.label) {
            case 0:
                w = (0, world_1.world)(on);
                testing_1.mock.clock(on, { now: AFTERNOON });
                return [4 /*yield*/, $.tool.call({ tool: GOALS, summary: 'The beta reaches testers', goals: [{ title: 'Testers get the new build', status: 'planned' }] })];
            case 1:
                _h.sent();
                _i = 0, SURFACES_1 = SURFACES;
                _h.label = 2;
            case 2:
                if (!(_i < SURFACES_1.length)) return [3 /*break*/, 8];
                surface = SURFACES_1[_i];
                return [4 /*yield*/, $.ui.mount(__assign(__assign({}, world_1.PANE), { surface: surface }))];
            case 3:
                ui_1 = _h.sent();
                _a = testing_1.expect;
                return [4 /*yield*/, borderOf(ui_1, 'now')];
            case 4:
                _a.apply(void 0, [_h.sent()]).toMatchObject({ borderStyle: 'round', borderColor: 'inactive' });
                _b = testing_1.expect;
                return [4 /*yield*/, (0, world_1.allText)(ui_1)];
            case 5:
                _b.apply(void 0, [_h.sent()]).toContain('PAUSED · YOUR TURN');
                return [4 /*yield*/, ui_1.unmount()];
            case 6:
                _h.sent();
                _h.label = 7;
            case 7:
                _i++;
                return [3 /*break*/, 2];
            case 8: return [4 /*yield*/, $.prompt.submit(__assign({ text: 'go' }, COMPOSER))];
            case 9:
                _h.sent();
                return [4 /*yield*/, $.ui.mount(__assign(__assign({}, world_1.PANE), { surface: 'desktop' }))];
            case 10:
                ui = _h.sent();
                _c = testing_1.expect;
                return [4 /*yield*/, (0, world_1.allText)(ui)];
            case 11:
                _c.apply(void 0, [_h.sent()]).toContain('● WORKING');
                _d = testing_1.expect;
                return [4 /*yield*/, borderOf(ui, 'now')];
            case 12:
                _d.apply(void 0, [_h.sent()]).toMatchObject({ borderColor: 'claude' });
                return [4 /*yield*/, ui.unmount()];
            case 13:
                _h.sent();
                return [4 /*yield*/, $.tool.call({ tool: GOALS, goals: [{ title: 'Testers get the new build', status: 'done' }] })];
            case 14:
                _h.sent();
                return [4 /*yield*/, $.ui.mount(__assign(__assign({}, world_1.PANE), { surface: 'terminal' }))];
            case 15:
                finished = _h.sent();
                _e = testing_1.expect;
                return [4 /*yield*/, borderOf(finished, 'now')];
            case 16:
                _e.apply(void 0, [_h.sent()]).toMatchObject({ borderColor: 'success' });
                _f = testing_1.expect;
                return [4 /*yield*/, finished.find({ type: 'Text', text: '✓ ALL DONE' })];
            case 17:
                _f.apply(void 0, [_h.sent()]).toBeDefined();
                return [4 /*yield*/, finished.unmount()];
            case 18:
                _h.sent();
                return [4 /*yield*/, $.ui.mount(__assign(__assign({}, world_1.PANE), { surface: 'desktop' }))];
            case 19:
                ui = _h.sent();
                _g = testing_1.expect;
                return [4 /*yield*/, (0, world_1.allText)(ui)];
            case 20:
                _g.apply(void 0, [_h.sent()]).toContain('ALL DONE');
                return [4 /*yield*/, ui.unmount()];
            case 21:
                _h.sent();
                (0, testing_1.expect)(w.logs).toEqual([]);
                return [2 /*return*/];
        }
    });
}); });
(0, testing_1.test)('your steps turn red-framed when one is overdue, blue otherwise', function ($, on) { return __awaiter(void 0, void 0, void 0, function () {
    var w, ui, _a, _b, _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                w = (0, world_1.world)(on);
                testing_1.mock.clock(on, { now: AFTERNOON });
                w.stored[world_1.KEY] = {
                    label: 'myapp',
                    steps: [{ id: 's1', title: 'Pay the Play Console fee', status: 'todo', heard: 'todo', due: '2026-10-09', createdAt: AFTERNOON }],
                };
                return [4 /*yield*/, $.tool.call({ tool: 'mcp__overview__your_steps' })];
            case 1:
                _e.sent();
                return [4 /*yield*/, $.ui.mount(__assign(__assign({}, world_1.PANE), { surface: 'desktop' }))];
            case 2:
                ui = _e.sent();
                _a = testing_1.expect;
                return [4 /*yield*/, borderOf(ui, 'yours')];
            case 3:
                _a.apply(void 0, [_e.sent()]).toMatchObject({ borderColor: 'warning' });
                _b = testing_1.expect;
                return [4 /*yield*/, ui.find({ type: 'Text', text: '1 now' })];
            case 4:
                _b.apply(void 0, [_e.sent()]).toBeDefined();
                return [4 /*yield*/, ui.unmount()];
            case 5:
                _e.sent();
                w.stored[world_1.KEY] = {
                    label: 'myapp',
                    steps: [{ id: 's1', title: 'Pay the Play Console fee', status: 'todo', heard: 'todo', due: '2026-10-05', createdAt: AFTERNOON }],
                };
                return [4 /*yield*/, $.tool.call({ tool: 'mcp__overview__your_steps' })];
            case 6:
                _e.sent();
                return [4 /*yield*/, $.ui.mount(__assign(__assign({}, world_1.PANE), { surface: 'desktop' }))];
            case 7:
                ui = _e.sent();
                _c = testing_1.expect;
                return [4 /*yield*/, borderOf(ui, 'yours')];
            case 8:
                _c.apply(void 0, [_e.sent()]).toMatchObject({ borderColor: 'error' });
                _d = testing_1.expect;
                return [4 /*yield*/, ui.find({ type: 'Text', text: '1 now' })];
            case 9:
                _d.apply(void 0, [_e.sent()]).toBeDefined();
                return [4 /*yield*/, ui.unmount()];
            case 10:
                _e.sent();
                return [2 /*return*/];
        }
    });
}); });
