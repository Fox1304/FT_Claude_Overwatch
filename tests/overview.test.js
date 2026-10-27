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
var TOOL = 'mcp__overview__goals';
var SURFACES = ['terminal', 'desktop'];
var PANE = {
    plugin: 'overview',
    component: 'Pane',
    requestId: 'overview',
    props: {
        title: 'Overview',
        isFocused: false,
        bodyColumns: 48,
        placement: 'dock',
        scroll: { offset: 0, bodyRows: 30 },
        view: {},
    },
};
(0, testing_1.test)('the pane shows the goals as now, next and done on every surface', function ($, on) { return __awaiter(void 0, void 0, void 0, function () {
    var sent, _i, SURFACES_1, surface, ui, _a, _b, _c, _d, _e, _f, _g;
    var _h;
    return __generator(this, function (_j) {
        switch (_j.label) {
            case 0:
                (0, world_1.world)(on);
                testing_1.mock.clock(on, { now: 1000 });
                return [4 /*yield*/, $.tool.call({
                        tool: TOOL,
                        summary: 'Drops replace coins for the beta',
                        goals: [
                            { title: 'Rewards give drops', status: 'done' },
                            { title: 'The shop shows drop prices', status: 'active', progress: 60 },
                            { title: 'Testers get the new build', status: 'planned' },
                        ],
                    })];
            case 1:
                sent = _j.sent();
                (0, testing_1.expect)((_h = sent.text) !== null && _h !== void 0 ? _h : sent.result).toContain('1 of 3 done');
                _i = 0, SURFACES_1 = SURFACES;
                _j.label = 2;
            case 2:
                if (!(_i < SURFACES_1.length)) return [3 /*break*/, 14];
                surface = SURFACES_1[_i];
                return [4 /*yield*/, $.ui.mount(__assign(__assign({}, PANE), { surface: surface }))];
            case 3:
                ui = _j.sent();
                return [4 /*yield*/, (0, world_1.unfold)(ui, 'goals')];
            case 4:
                _j.sent();
                _a = testing_1.expect;
                return [4 /*yield*/, ui.find({ type: 'Text', text: 'Drops replace coins for the beta' })];
            case 5:
                _a.apply(void 0, [_j.sent()]).toBeDefined();
                _b = testing_1.expect;
                return [4 /*yield*/, ui.find({ type: 'Text', text: '1/3' })];
            case 6:
                _b.apply(void 0, [_j.sent()]).toBeDefined();
                _c = testing_1.expect;
                return [4 /*yield*/, ui.find({ type: 'Text', text: 'The shop shows drop prices' })];
            case 7:
                _c.apply(void 0, [_j.sent()]).toBeDefined();
                _d = testing_1.expect;
                return [4 /*yield*/, ui.find({ type: 'Text', text: '60%' })];
            case 8:
                _d.apply(void 0, [_j.sent()]).toBeDefined();
                _e = testing_1.expect;
                return [4 /*yield*/, ui.find({ type: 'Text', text: 'NEXT' })];
            case 9:
                _e.apply(void 0, [_j.sent()]).toBeDefined();
                _f = testing_1.expect;
                return [4 /*yield*/, ui.find({ type: 'Text', text: 'DONE' })];
            case 10:
                _f.apply(void 0, [_j.sent()]).toBeDefined();
                _g = testing_1.expect;
                return [4 /*yield*/, ui.find({ type: 'Text', text: 'Rewards give drops' })];
            case 11:
                _g.apply(void 0, [_j.sent()]).toBeDefined();
                return [4 /*yield*/, ui.unmount()];
            case 12:
                _j.sent();
                _j.label = 13;
            case 13:
                _i++;
                return [3 /*break*/, 2];
            case 14: return [2 /*return*/];
        }
    });
}); });
(0, testing_1.test)('finished goals of an earlier request stay under done', function ($, on) { return __awaiter(void 0, void 0, void 0, function () {
    var _i, SURFACES_2, surface, ui, _a, _b, _c, _d, _e;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0:
                (0, world_1.world)(on);
                testing_1.mock.clock(on, { now: 1000 });
                return [4 /*yield*/, $.tool.call({
                        tool: TOOL,
                        goals: [
                            { title: 'Rewards give drops', status: 'done' },
                            { title: 'A plan that was dropped', status: 'planned' },
                        ],
                    })];
            case 1:
                _f.sent();
                return [4 /*yield*/, $.tool.call({
                        tool: TOOL,
                        goals: [{ title: 'The site shows the launch date', status: 'active' }],
                    })];
            case 2:
                _f.sent();
                _i = 0, SURFACES_2 = SURFACES;
                _f.label = 3;
            case 3:
                if (!(_i < SURFACES_2.length)) return [3 /*break*/, 15];
                surface = SURFACES_2[_i];
                return [4 /*yield*/, $.ui.mount(__assign(__assign({}, PANE), { surface: surface }))];
            case 4:
                ui = _f.sent();
                return [4 /*yield*/, (0, world_1.unfold)(ui, 'goals')];
            case 5:
                _f.sent();
                _a = testing_1.expect;
                return [4 /*yield*/, ui.find({ type: 'Text', text: 'Rewards give drops' })];
            case 6:
                _a.apply(void 0, [_f.sent()]).toBeUndefined();
                return [4 /*yield*/, ui.press({ key: 'fold:earlier' })];
            case 7:
                _f.sent();
                _b = testing_1.expect;
                return [4 /*yield*/, ui.find({ type: 'Text', text: 'Rewards give drops' })];
            case 8:
                _b.apply(void 0, [_f.sent()]).toBeDefined();
                return [4 /*yield*/, ui.press({ key: 'fold:earlier' })];
            case 9:
                _f.sent();
                _c = testing_1.expect;
                return [4 /*yield*/, ui.find({ type: 'Text', text: 'The site shows the launch date' })];
            case 10:
                _c.apply(void 0, [_f.sent()]).toBeDefined();
                _d = testing_1.expect;
                return [4 /*yield*/, ui.find({ type: 'Text', text: 'A plan that was dropped' })];
            case 11:
                _d.apply(void 0, [_f.sent()]).toBeUndefined();
                _e = testing_1.expect;
                return [4 /*yield*/, ui.find({ type: 'Text', text: '0/1' })];
            case 12:
                _e.apply(void 0, [_f.sent()]).toBeDefined();
                return [4 /*yield*/, ui.unmount()];
            case 13:
                _f.sent();
                _f.label = 14;
            case 14:
                _i++;
                return [3 /*break*/, 3];
            case 15: return [2 /*return*/];
        }
    });
}); });
(0, testing_1.test)('an empty list is refused and the pane invites a task', function ($, on) { return __awaiter(void 0, void 0, void 0, function () {
    var sent, ui, _a;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                (0, world_1.world)(on);
                testing_1.mock.clock(on);
                return [4 /*yield*/, $.tool.call({ tool: TOOL, goals: [] })];
            case 1:
                sent = _c.sent();
                (0, testing_1.expect)((_b = sent.text) !== null && _b !== void 0 ? _b : sent.deny).toMatch(/at least one goal/);
                return [4 /*yield*/, $.ui.mount(__assign(__assign({}, PANE), { surface: 'terminal' }))];
            case 2:
                ui = _c.sent();
                _a = testing_1.expect;
                return [4 /*yield*/, ui.find({ type: 'Text', text: /Goals appear here/ })];
            case 3:
                _a.apply(void 0, [_c.sent()]).toBeDefined();
                return [4 /*yield*/, ui.unmount()];
            case 4:
                _c.sent();
                return [2 /*return*/];
        }
    });
}); });
(0, testing_1.test)('the system prompt tells Claude to keep the overview in plain words', function ($, on) { return __awaiter(void 0, void 0, void 0, function () {
    var composed, guide;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                on('prompt.compose', function () { return ({ sections: [{ id: 'intro', text: 'base', scope: 'shared' }] }); });
                return [4 /*yield*/, $.prompt.compose({
                        model: 'claude-opus-5-5',
                        promptModel: 'claude-opus-5-5',
                        surfaces: ['desktop'],
                        tools: [TOOL],
                        outputStyle: null,
                        traits: [],
                    })];
            case 1:
                composed = _a.sent();
                guide = composed.sections.find(function (section) { return section.id === 'overview:guide'; });
                (0, testing_1.expect)(guide === null || guide === void 0 ? void 0 : guide.scope).toBe('session');
                (0, testing_1.expect)(guide === null || guide === void 0 ? void 0 : guide.text).toContain('No file names, commands');
                return [2 /*return*/];
        }
    });
}); });
(0, testing_1.test)('the conversation shows each update as one quiet line', function ($) { return __awaiter(void 0, void 0, void 0, function () {
    var input, _i, SURFACES_3, surface, row, _a, result, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                input = {
                    goals: [
                        { title: 'Rewards give drops', status: 'done' },
                        { title: 'The shop shows drop prices', status: 'active' },
                    ],
                };
                _i = 0, SURFACES_3 = SURFACES;
                _c.label = 1;
            case 1:
                if (!(_i < SURFACES_3.length)) return [3 /*break*/, 9];
                surface = SURFACES_3[_i];
                return [4 /*yield*/, $.ui.mount({
                        plugin: 'overview',
                        surface: surface,
                        component: 'ToolUse',
                        props: { tool_use_id: 't1', tool: TOOL, input: input, isRunning: false, isErrored: false, isInterrupted: false },
                    })];
            case 2:
                row = _c.sent();
                _a = testing_1.expect;
                return [4 /*yield*/, row.find({ type: 'Text', text: 'Overview · 1 of 2 done · The shop shows drop prices' })];
            case 3:
                _a.apply(void 0, [_c.sent()]).toBeDefined();
                return [4 /*yield*/, row.unmount()];
            case 4:
                _c.sent();
                return [4 /*yield*/, $.ui.mount({
                        plugin: 'overview',
                        surface: surface,
                        component: 'ToolResult',
                        props: { tool_use_id: 't1', tool: TOOL, output: 'Overview updated: 1 of 2 done.', isErrored: false },
                    })];
            case 5:
                result = _c.sent();
                _b = testing_1.expect;
                return [4 /*yield*/, result.find({ type: 'Text' })];
            case 6:
                _b.apply(void 0, [_c.sent()]).toBeUndefined();
                return [4 /*yield*/, result.unmount()];
            case 7:
                _c.sent();
                _c.label = 8;
            case 8:
                _i++;
                return [3 /*break*/, 1];
            case 9: return [2 /*return*/];
        }
    });
}); });
/** Stands for the engine's own drawing of a row, so a test sees whether the mod let it through. */
var engineDraws = function (on) {
    return on('ui.render', function ($, e) {
        var _a;
        var Text = $.ui.resolve(e).Text;
        var label = e.component === 'Spinner' ? ((_a = e.props.message) !== null && _a !== void 0 ? _a : e.props.word) : "engine ".concat(e.component);
        return <Text>{label}</Text>;
    });
};
var ROW = { isRunning: false, isErrored: false, isInterrupted: false };
(0, testing_1.test)('technical steps are hidden, rows meant for the person stay', function ($, on) { return __awaiter(void 0, void 0, void 0, function () {
    var _i, SURFACES_4, surface, bash, _a, group, _b, file, _c, widget, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                engineDraws(on);
                _i = 0, SURFACES_4 = SURFACES;
                _e.label = 1;
            case 1:
                if (!(_i < SURFACES_4.length)) return [3 /*break*/, 15];
                surface = SURFACES_4[_i];
                return [4 /*yield*/, $.ui.mount({
                        plugin: 'overview',
                        surface: surface,
                        component: 'ToolUse',
                        props: __assign(__assign({}, ROW), { tool_use_id: 'b1', tool: 'Bash', input: { command: 'ls' } }),
                    })];
            case 2:
                bash = _e.sent();
                _a = testing_1.expect;
                return [4 /*yield*/, bash.find({ type: 'Text' })];
            case 3:
                _a.apply(void 0, [_e.sent()]).toBeUndefined();
                return [4 /*yield*/, bash.unmount()];
            case 4:
                _e.sent();
                return [4 /*yield*/, $.ui.mount({
                        plugin: 'overview',
                        surface: surface,
                        component: 'ToolGroup',
                        props: { calls: [], isActive: false, isExpanded: false },
                    })];
            case 5:
                group = _e.sent();
                _b = testing_1.expect;
                return [4 /*yield*/, group.find({ type: 'Text' })];
            case 6:
                _b.apply(void 0, [_e.sent()]).toBeUndefined();
                return [4 /*yield*/, group.unmount()];
            case 7:
                _e.sent();
                return [4 /*yield*/, $.ui.mount({
                        plugin: 'overview',
                        surface: surface,
                        component: 'ToolUse',
                        props: __assign(__assign({}, ROW), { tool_use_id: 'f1', tool: 'SendUserFile', input: { files: ['a.png'] } }),
                    })];
            case 8:
                file = _e.sent();
                _c = testing_1.expect;
                return [4 /*yield*/, file.find({ type: 'Text', text: 'engine ToolUse' })];
            case 9:
                _c.apply(void 0, [_e.sent()]).toBeDefined();
                return [4 /*yield*/, file.unmount()];
            case 10:
                _e.sent();
                return [4 /*yield*/, $.ui.mount({
                        plugin: 'overview',
                        surface: surface,
                        component: 'ToolResult',
                        props: { tool_use_id: 'w1', tool: 'mcp__visualize__show_widget', output: 'ok', isErrored: false },
                    })];
            case 11:
                widget = _e.sent();
                _d = testing_1.expect;
                return [4 /*yield*/, widget.find({ type: 'Text', text: 'engine ToolResult' })];
            case 12:
                _d.apply(void 0, [_e.sent()]).toBeDefined();
                return [4 /*yield*/, widget.unmount()];
            case 13:
                _e.sent();
                _e.label = 14;
            case 14:
                _i++;
                return [3 /*break*/, 1];
            case 15: return [2 /*return*/];
        }
    });
}); });
(0, testing_1.test)('the pane switch shows the steps again and remembers it', function ($, on) { return __awaiter(void 0, void 0, void 0, function () {
    var stored, pane, _a, _b, bash, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                engineDraws(on);
                stored = (0, world_1.world)(on).stored;
                testing_1.mock.clock(on);
                return [4 /*yield*/, $.ui.mount(__assign(__assign({}, PANE), { surface: 'desktop' }))];
            case 1:
                pane = _d.sent();
                _a = testing_1.expect;
                return [4 /*yield*/, pane.find({ key: 'steps-toggle', text: 'Show technical steps' })];
            case 2:
                _a.apply(void 0, [_d.sent()]).toBeDefined();
                return [4 /*yield*/, pane.press({ key: 'steps-toggle' })];
            case 3:
                _d.sent();
                _b = testing_1.expect;
                return [4 /*yield*/, pane.find({ key: 'steps-toggle', text: 'Hide technical steps' })];
            case 4:
                _b.apply(void 0, [_d.sent()]).toBeDefined();
                (0, testing_1.expect)(stored.showSteps).toBe(true);
                return [4 /*yield*/, pane.unmount()];
            case 5:
                _d.sent();
                return [4 /*yield*/, $.ui.mount({
                        plugin: 'overview',
                        surface: 'desktop',
                        component: 'ToolUse',
                        props: __assign(__assign({}, ROW), { tool_use_id: 'b2', tool: 'Bash', input: { command: 'ls' } }),
                    })];
            case 6:
                bash = _d.sent();
                _c = testing_1.expect;
                return [4 /*yield*/, bash.find({ type: 'Text', text: 'engine ToolUse' })];
            case 7:
                _c.apply(void 0, [_d.sent()]).toBeDefined();
                return [4 /*yield*/, bash.unmount()];
            case 8:
                _d.sent();
                return [2 /*return*/];
        }
    });
}); });
(0, testing_1.test)('the working line names the current goal instead of the step', function ($, on) { return __awaiter(void 0, void 0, void 0, function () {
    var spinner, before, _a, _i, SURFACES_5, surface, during, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                engineDraws(on);
                (0, world_1.world)(on);
                testing_1.mock.clock(on);
                spinner = { word: 'Creating notes.md', message: null, suffix: '…', mode: 'tool-use' };
                return [4 /*yield*/, $.ui.mount({ plugin: 'overview', surface: 'desktop', component: 'Spinner', props: spinner })];
            case 1:
                before = _c.sent();
                _a = testing_1.expect;
                return [4 /*yield*/, before.find({ type: 'Text', text: 'Working' })];
            case 2:
                _a.apply(void 0, [_c.sent()]).toBeDefined();
                return [4 /*yield*/, before.unmount()];
            case 3:
                _c.sent();
                return [4 /*yield*/, $.tool.call({
                        tool: TOOL,
                        goals: [{ title: 'The shop shows drop prices', status: 'active' }],
                    })];
            case 4:
                _c.sent();
                _i = 0, SURFACES_5 = SURFACES;
                _c.label = 5;
            case 5:
                if (!(_i < SURFACES_5.length)) return [3 /*break*/, 10];
                surface = SURFACES_5[_i];
                return [4 /*yield*/, $.ui.mount({ plugin: 'overview', surface: surface, component: 'Spinner', props: spinner })];
            case 6:
                during = _c.sent();
                _b = testing_1.expect;
                return [4 /*yield*/, during.find({ type: 'Text', text: 'The shop shows drop prices' })];
            case 7:
                _b.apply(void 0, [_c.sent()]).toBeDefined();
                return [4 /*yield*/, during.unmount()];
            case 8:
                _c.sent();
                _c.label = 9;
            case 9:
                _i++;
                return [3 /*break*/, 5];
            case 10: return [2 /*return*/];
        }
    });
}); });
