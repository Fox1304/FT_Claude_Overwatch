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
var SURFACES = ['terminal', 'desktop', 'mobile'];
var AFTERNOON = new Date(2026, 9, 6, 15, 0).getTime();
var MORE = 'Your backups are encrypted with a passphrase that only lives on this Mac.\n\n**How**\n1. Open your password manager.\n2. Save it.';
(0, testing_1.test)('a step opens to its explanation and links to the right section on GitHub', function ($, on) { return __awaiter(void 0, void 0, void 0, function () {
    var w, sent, step, _i, SURFACES_1, surface, pane, _a, _b, _c, link;
    var _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                w = (0, world_1.world)(on);
                testing_1.mock.clock(on, { now: AFTERNOON });
                return [4 /*yield*/, $.tool.call({
                        tool: STEPS,
                        add: [
                            {
                                title: 'Save the backup passphrase in your vault',
                                more: MORE,
                                sources: [
                                    { label: 'HANDOFF › Backups', path: 'docs/HANDOFF.md', heading: '8.4 Backups and rollback' },
                                    { label: 'HANDOFF › This week', path: 'docs/HANDOFF.md', heading: 'This week (by Fri 9 Oct)' },
                                    { label: 'Line 42', path: 'docs/BUILD_LOG.md', line: 42, ref: 'feat/drops' },
                                    { label: 'Bad', url: 'http://example.com' },
                                ],
                            },
                        ],
                    })];
            case 1:
                sent = _e.sent();
                (0, testing_1.expect)(String(sent.result)).toContain('Sources left out');
                step = w.steps()[0];
                (0, testing_1.expect)(step === null || step === void 0 ? void 0 : step.links).toEqual([
                    { label: 'HANDOFF › Backups', url: 'https://github.com/octocat/myapp/blob/main/docs/HANDOFF.md#84-backups-and-rollback' },
                    { label: 'HANDOFF › This week', url: 'https://github.com/octocat/myapp/blob/main/docs/HANDOFF.md#this-week-by-fri-9-oct' },
                    { label: 'Line 42', url: 'https://github.com/octocat/myapp/blob/feat%2Fdrops/docs/BUILD_LOG.md#L42' },
                ]);
                _i = 0, SURFACES_1 = SURFACES;
                _e.label = 2;
            case 2:
                if (!(_i < SURFACES_1.length)) return [3 /*break*/, 12];
                surface = SURFACES_1[_i];
                return [4 /*yield*/, $.ui.mount(__assign(__assign({}, world_1.PANE), { surface: surface }))];
            case 3:
                pane = _e.sent();
                _a = testing_1.expect;
                return [4 /*yield*/, pane.find({ type: 'Markdown' })];
            case 4:
                _a.apply(void 0, [_e.sent()]).toBeUndefined();
                return [4 /*yield*/, pane.press({ key: "more:".concat(step === null || step === void 0 ? void 0 : step.id) })];
            case 5:
                _e.sent();
                _b = testing_1.expect;
                return [4 /*yield*/, pane.find({ type: 'Button', text: '▾ Less' })];
            case 6:
                _b.apply(void 0, [_e.sent()]).toBeDefined();
                _c = testing_1.expect;
                return [4 /*yield*/, pane.find({ type: 'Markdown' })];
            case 7:
                _c.apply(void 0, [(_d = (_e.sent())) === null || _d === void 0 ? void 0 : _d.text]).toContain('passphrase that only lives on this Mac');
                return [4 /*yield*/, pane.find({ type: 'Link', text: 'HANDOFF › Backups' })];
            case 8:
                link = _e.sent();
                (0, testing_1.expect)(link === null || link === void 0 ? void 0 : link.props.href).toBe('https://github.com/octocat/myapp/blob/main/docs/HANDOFF.md#84-backups-and-rollback');
                return [4 /*yield*/, pane.press({ key: "more:".concat(step === null || step === void 0 ? void 0 : step.id) })];
            case 9:
                _e.sent();
                return [4 /*yield*/, pane.unmount()];
            case 10:
                _e.sent();
                _e.label = 11;
            case 11:
                _i++;
                return [3 /*break*/, 2];
            case 12: return [2 /*return*/];
        }
    });
}); });
(0, testing_1.test)('Claude updates a step: new words, a moved date, more and links', function ($, on) { return __awaiter(void 0, void 0, void 0, function () {
    var w, step, sent, pane, _a;
    var _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                w = (0, world_1.world)(on);
                testing_1.mock.clock(on, { now: AFTERNOON });
                return [4 /*yield*/, $.tool.call({ tool: STEPS, add: [{ title: 'Pay the fee', due: '2026-10-09' }] })];
            case 1:
                _d.sent();
                step = w.steps()[0];
                return [4 /*yield*/, $.tool.call({
                        tool: STEPS,
                        update: [
                            {
                                id: (_b = step === null || step === void 0 ? void 0 : step.id) !== null && _b !== void 0 ? _b : '',
                                title: 'Pay the Play Console fee',
                                due: 'none',
                                more: 'Google asks a one-time fee.',
                                sources: [{ label: 'Play Console', url: 'https://play.google.com/console' }],
                            },
                        ],
                    })];
            case 2:
                sent = _d.sent();
                (0, testing_1.expect)(String(sent.result)).toContain('Pay the Play Console fee');
                (0, testing_1.expect)(w.steps()[0]).toMatchObject({
                    title: 'Pay the Play Console fee',
                    more: 'Google asks a one-time fee.',
                    links: [{ label: 'Play Console', url: 'https://play.google.com/console' }],
                });
                (0, testing_1.expect)((_c = w.steps()[0]) === null || _c === void 0 ? void 0 : _c.due).toBeUndefined();
                return [4 /*yield*/, $.ui.mount(__assign(__assign({}, world_1.PANE), { surface: 'desktop' }))];
            case 3:
                pane = _d.sent();
                _a = testing_1.expect;
                return [4 /*yield*/, pane.find({ type: 'Button', text: '▸ More' })];
            case 4:
                _a.apply(void 0, [_d.sent()]).toBeDefined();
                return [4 /*yield*/, pane.unmount()];
            case 5:
                _d.sent();
                return [2 /*return*/];
        }
    });
}); });
