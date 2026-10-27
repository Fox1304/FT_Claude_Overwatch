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
var routing_1 = require("../hooks/routing");
var world_1 = require("./world");
var STEPS = 'mcp__overview__your_steps';
var GOALS = 'mcp__overview__goals';
var MAP = 'mcp__overview__project_map';
var COMPOSER = { wait: false, origin: { kind: 'composer' } };
var AFTERNOON = new Date(2026, 9, 27, 15, 0).getTime();
var RELEASE = 'Release the beta';
/** Another session of myapp, open: it has just published its card. */
var openSession = function (w, id, now, extra) {
    if (extra === void 0) { extra = {}; }
    w.stored["session:".concat(id)] = __assign({ id: id, project: 'myapp', key: world_1.KEY, summary: RELEASE, done: 0, total: 2, state: 'working', updatedAt: now }, extra);
};
(0, testing_1.test)('who hears what the person did: the asking session while open, else the pane they used, else the last-used session', function () {
    var _a;
    var live = [
        { id: 'S1', key: world_1.KEY, activeAt: 10 },
        { id: 'S2', key: world_1.KEY, activeAt: 30 },
        { id: 'S3', key: world_1.OTHER_KEY, activeAt: 50 },
    ];
    (0, testing_1.expect)((0, routing_1.hearerOf)({ askedIn: 'S2', tickedIn: 'S1', tickedFrom: world_1.KEY }, world_1.KEY, live)).toBe('S2');
    (0, testing_1.expect)((0, routing_1.hearerOf)({ askedIn: 'S9', tickedIn: 'S1', tickedFrom: world_1.KEY }, world_1.KEY, live)).toBe('S1');
    // Ticked from otherapp's pane, its asking session closed: myapp's last-used session hears it.
    (0, testing_1.expect)((0, routing_1.hearerOf)({ askedIn: 'S9', tickedIn: 'S3', tickedFrom: world_1.OTHER_KEY }, world_1.KEY, live)).toBe('S2');
    (0, testing_1.expect)((0, routing_1.hearerOf)({ tickedIn: 'S3', tickedFrom: world_1.OTHER_KEY }, 'yourSteps:/work/closed', live)).toBeUndefined();
    // Every session agrees on one heir, ties going to the lower id.
    (0, testing_1.expect)((_a = (0, routing_1.heirOf)([{ id: 'S5', key: world_1.KEY }, { id: 'S4', key: world_1.KEY }], world_1.KEY)) === null || _a === void 0 ? void 0 : _a.id).toBe('S4');
});
(0, testing_1.test)('a tick goes to the session that asked for the step, not to the one it was ticked in', function ($, on) { return __awaiter(void 0, void 0, void 0, function () {
    var w, clock, step, ui, _a, _b;
    var _c, _d, _e;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0:
                w = (0, world_1.world)(on);
                clock = testing_1.mock.clock(on, { now: AFTERNOON });
                w.me.id = 'S2';
                return [4 /*yield*/, $.tool.call({ tool: STEPS, add: [{ title: 'Approve the new Apple agreement' }] })];
            case 1:
                _f.sent();
                step = w.steps()[0];
                (0, testing_1.expect)(step === null || step === void 0 ? void 0 : step.askedIn).toBe('S2');
                w.me.id = 'S1';
                openSession(w, 'S2', AFTERNOON);
                return [4 /*yield*/, clock.advance(10000)];
            case 2:
                _f.sent();
                return [4 /*yield*/, $.ui.mount(__assign(__assign({}, world_1.PANE), { surface: 'desktop' }))];
            case 3:
                ui = _f.sent();
                _a = testing_1.expect;
                return [4 /*yield*/, ui.find({ type: 'Text', text: "Asked by Claude in \u00AB ".concat(RELEASE, " \u00BB") })];
            case 4:
                _a.apply(void 0, [_f.sent()]).toBeDefined();
                return [4 /*yield*/, ui.press({ key: "tick:".concat(step === null || step === void 0 ? void 0 : step.id) })];
            case 5:
                _f.sent();
                (0, testing_1.expect)(w.toasts).toContain("\u2197 Claude in \u00AB ".concat(RELEASE, " \u00BB will pick it up"));
                _b = testing_1.expect;
                return [4 /*yield*/, ui.find({ type: 'Text', text: "Ticked \u00B7 Claude in \u00AB ".concat(RELEASE, " \u00BB will pick it up") })];
            case 6:
                _b.apply(void 0, [_f.sent()]).toBeDefined();
                return [4 /*yield*/, clock.advance(40000)];
            case 7:
                _f.sent();
                (0, testing_1.expect)(w.prompts).toHaveLength(0);
                (0, testing_1.expect)((_c = w.steps()[0]) === null || _c === void 0 ? void 0 : _c.heard).toBe('todo');
                w.me.id = 'S2';
                return [4 /*yield*/, clock.advance(10000)];
            case 8:
                _f.sent();
                (0, testing_1.expect)(w.prompts).toHaveLength(1);
                (0, testing_1.expect)((_d = w.prompts[0]) === null || _d === void 0 ? void 0 : _d.text).toContain('Approve the new Apple agreement');
                (0, testing_1.expect)((_e = w.steps()[0]) === null || _e === void 0 ? void 0 : _e.heard).toBe('checked');
                return [4 /*yield*/, ui.unmount()];
            case 9:
                _f.sent();
                return [2 /*return*/];
        }
    });
}); });
(0, testing_1.test)('the person typing in another session does not take the tick away from the asking one', function ($, on) { return __awaiter(void 0, void 0, void 0, function () {
    var w, clock, step, ui;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                w = (0, world_1.world)(on);
                clock = testing_1.mock.clock(on, { now: AFTERNOON });
                w.me.id = 'S2';
                return [4 /*yield*/, $.tool.call({ tool: STEPS, add: [{ title: 'Pay the Play Console fee' }] })];
            case 1:
                _c.sent();
                step = w.steps()[0];
                w.me.id = 'S1';
                openSession(w, 'S2', AFTERNOON);
                return [4 /*yield*/, clock.advance(10000)];
            case 2:
                _c.sent();
                return [4 /*yield*/, $.ui.mount(__assign(__assign({}, world_1.PANE), { surface: 'desktop' }))];
            case 3:
                ui = _c.sent();
                return [4 /*yield*/, ui.press({ key: "tick:".concat(step === null || step === void 0 ? void 0 : step.id) })];
            case 4:
                _c.sent();
                return [4 /*yield*/, ui.unmount()];
            case 5:
                _c.sent();
                return [4 /*yield*/, $.prompt.submit(__assign({ text: 'Fix the login screen' }, COMPOSER))];
            case 6:
                _c.sent();
                (0, testing_1.expect)((_b = (_a = w.prompts[0]) === null || _a === void 0 ? void 0 : _a.context.join('\n')) !== null && _b !== void 0 ? _b : '').not.toContain('Pay the Play Console fee');
                (0, testing_1.expect)(w.steps()[0]).toMatchObject({ status: 'checked', heard: 'todo' });
                return [2 /*return*/];
        }
    });
}); });
(0, testing_1.test)('when the asking session is closed, the session the person ticked in hears it', function ($, on) { return __awaiter(void 0, void 0, void 0, function () {
    var w, clock, step, ui, _a, _b;
    var _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                w = (0, world_1.world)(on);
                clock = testing_1.mock.clock(on, { now: AFTERNOON });
                w.me.id = 'S2';
                return [4 /*yield*/, $.tool.call({ tool: STEPS, add: [{ title: 'Approve the new Apple agreement' }] })];
            case 1:
                _d.sent();
                step = w.steps()[0];
                // S2 published a card three minutes ago and nothing since: it is closed.
                w.me.id = 'S1';
                openSession(w, 'S2', AFTERNOON - 3 * 60000);
                return [4 /*yield*/, clock.advance(10000)];
            case 2:
                _d.sent();
                return [4 /*yield*/, $.ui.mount(__assign(__assign({}, world_1.PANE), { surface: 'desktop' }))];
            case 3:
                ui = _d.sent();
                _a = testing_1.expect;
                return [4 /*yield*/, ui.find({ type: 'Text', text: "Asked by Claude in \u00AB ".concat(RELEASE, " \u00BB") })];
            case 4:
                _a.apply(void 0, [_d.sent()]).toBeUndefined();
                return [4 /*yield*/, ui.press({ key: "tick:".concat(step === null || step === void 0 ? void 0 : step.id) })];
            case 5:
                _d.sent();
                (0, testing_1.expect)(w.toasts).toContain('↗ Its session is closed: Claude here will pick it up');
                _b = testing_1.expect;
                return [4 /*yield*/, ui.find({ type: 'Text', text: 'Ticked · its session is closed: Claude here will pick it up' })];
            case 6:
                _b.apply(void 0, [_d.sent()]).toBeDefined();
                return [4 /*yield*/, clock.advance(40000)];
            case 7:
                _d.sent();
                (0, testing_1.expect)(w.prompts).toHaveLength(1);
                (0, testing_1.expect)((_c = w.prompts[0]) === null || _c === void 0 ? void 0 : _c.text).toContain('Approve the new Apple agreement');
                return [4 /*yield*/, ui.unmount()];
            case 8:
                _d.sent();
                return [2 /*return*/];
        }
    });
}); });
(0, testing_1.test)("a tick from another project's pane reaches one session of the project: the one used last", function ($, on) { return __awaiter(void 0, void 0, void 0, function () {
    var w, clock;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                w = (0, world_1.world)(on);
                clock = testing_1.mock.clock(on, { now: AFTERNOON });
                w.stored[world_1.KEY] = {
                    label: 'myapp',
                    steps: [
                        {
                            id: 'k1',
                            title: 'Renew the Apple certificate',
                            status: 'checked',
                            heard: 'todo',
                            askedIn: 'S9',
                            tickedIn: 'S-otherapp',
                            tickedFrom: world_1.OTHER_KEY,
                            tickedAt: AFTERNOON - 60000,
                            createdAt: 1,
                        },
                    ],
                };
                openSession(w, 'S2', AFTERNOON, { activeAt: AFTERNOON + 5000 });
                return [4 /*yield*/, $.tool.call({ tool: 'mcp__fake__build' })];
            case 1:
                _b.sent();
                return [4 /*yield*/, clock.advance(20000)];
            case 2:
                _b.sent();
                (0, testing_1.expect)(w.prompts).toHaveLength(0);
                // S2 closes: this session is now the project's last used, and hears it once.
                delete w.stored['session:S2'];
                return [4 /*yield*/, clock.advance(20000)];
            case 3:
                _b.sent();
                (0, testing_1.expect)(w.prompts).toHaveLength(1);
                (0, testing_1.expect)((_a = w.prompts[0]) === null || _a === void 0 ? void 0 : _a.text).toContain('Renew the Apple certificate');
                return [4 /*yield*/, clock.advance(30000)];
            case 4:
                _b.sent();
                (0, testing_1.expect)(w.prompts).toHaveLength(1);
                return [2 /*return*/];
        }
    });
}); });
(0, testing_1.test)('a note on a step goes to the session that asked for it', function ($, on) { return __awaiter(void 0, void 0, void 0, function () {
    var w, clock, step, ui, _a;
    var _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                w = (0, world_1.world)(on);
                clock = testing_1.mock.clock(on, { now: AFTERNOON });
                w.me.id = 'S2';
                return [4 /*yield*/, $.tool.call({ tool: STEPS, add: [{ title: 'Pay the Play Console fee', due: '2026-10-28' }] })];
            case 1:
                _d.sent();
                step = w.steps()[0];
                w.me.id = 'S1';
                openSession(w, 'S2', AFTERNOON);
                return [4 /*yield*/, clock.advance(10000)];
            case 2:
                _d.sent();
                return [4 /*yield*/, $.ui.mount(__assign(__assign({}, world_1.PANE), { surface: 'desktop' }))];
            case 3:
                ui = _d.sent();
                return [4 /*yield*/, ui.press({ key: "edit:move:step:".concat(step === null || step === void 0 ? void 0 : step.id) })];
            case 4:
                _d.sent();
                return [4 /*yield*/, ui.input({ key: "note-input:move:step:".concat(step === null || step === void 0 ? void 0 : step.id), text: 'Already paid last year.' })];
            case 5:
                _d.sent();
                (0, testing_1.expect)(w.prompts).toHaveLength(0);
                (0, testing_1.expect)(w.stored["inbox#s#S2#step:".concat(step === null || step === void 0 ? void 0 : step.id)]).toMatchObject({ target: 'S2', key: world_1.KEY, note: { text: 'Already paid last year.' } });
                (0, testing_1.expect)(w.toasts).toContain("\u270E Note sent to Claude in \u00AB ".concat(RELEASE, " \u00BB"));
                _a = testing_1.expect;
                return [4 /*yield*/, ui.find({ type: 'Text', text: "\u270E Note sent to Claude in \u00AB ".concat(RELEASE, " \u00BB") })];
            case 6:
                _a.apply(void 0, [_d.sent()]).toBeDefined();
                return [4 /*yield*/, clock.advance(20000)];
            case 7:
                _d.sent();
                (0, testing_1.expect)(w.prompts).toHaveLength(0);
                w.me.id = 'S2';
                return [4 /*yield*/, clock.advance(10000)];
            case 8:
                _d.sent();
                (0, testing_1.expect)(w.prompts).toHaveLength(1);
                (0, testing_1.expect)((_b = w.prompts[0]) === null || _b === void 0 ? void 0 : _b.text).toContain("the step \u00AB Pay the Play Console fee \u00BB (step ".concat(step === null || step === void 0 ? void 0 : step.id, ")"));
                (0, testing_1.expect)((_c = w.prompts[0]) === null || _c === void 0 ? void 0 : _c.text).toContain('« Already paid last year. »');
                (0, testing_1.expect)(w.stored["inbox#s#S2#step:".concat(step === null || step === void 0 ? void 0 : step.id)]).toBeUndefined();
                return [4 /*yield*/, ui.unmount()];
            case 9:
                _d.sent();
                return [2 /*return*/];
        }
    });
}); });
(0, testing_1.test)('a note on the map goes to the session that sent it, and waits for the heir once that one closes', function ($, on) { return __awaiter(void 0, void 0, void 0, function () {
    var w, clock, ui;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                w = (0, world_1.world)(on);
                clock = testing_1.mock.clock(on, { now: AFTERNOON });
                w.me.id = 'S2';
                return [4 /*yield*/, $.tool.call({ tool: MAP, milestones: [{ title: 'Public beta', status: 'active' }], parts: [{ title: 'Mail', status: 'waiting' }] })];
            case 1:
                _b.sent();
                w.me.id = 'S1';
                openSession(w, 'S2', AFTERNOON);
                return [4 /*yield*/, clock.advance(10000)];
            case 2:
                _b.sent();
                return [4 /*yield*/, $.ui.mount(__assign(__assign({}, world_1.PANE), { surface: 'desktop' }))];
            case 3:
                ui = _b.sent();
                return [4 /*yield*/, (0, world_1.unfold)(ui, 'map')];
            case 4:
                _b.sent();
                return [4 /*yield*/, ui.press({ key: 'edit:map:part:Mail' })];
            case 5:
                _b.sent();
                return [4 /*yield*/, ui.input({ key: 'note-input:map:part:Mail', text: 'Brevo is live since 7 Oct.' })];
            case 6:
                _b.sent();
                (0, testing_1.expect)(w.prompts).toHaveLength(0);
                (0, testing_1.expect)(w.stored['inbox#s#S2#part:Mail']).toBeDefined();
                // S2 closed before reading it: this session, the project's heir, takes it over.
                delete w.stored['session:S2'];
                return [4 /*yield*/, clock.advance(10000)];
            case 7:
                _b.sent();
                (0, testing_1.expect)(w.prompts).toHaveLength(1);
                (0, testing_1.expect)((_a = w.prompts[0]) === null || _a === void 0 ? void 0 : _a.text).toContain('the part of the project map « Mail »');
                return [4 /*yield*/, ui.unmount()];
            case 8:
                _b.sent();
                return [2 /*return*/];
        }
    });
}); });
(0, testing_1.test)("a note on another project's step waits for that project's next session", function ($, on) { return __awaiter(void 0, void 0, void 0, function () {
    var w, clock, ui, _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                w = (0, world_1.world)(on);
                clock = testing_1.mock.clock(on, { now: AFTERNOON });
                w.stored[world_1.OTHER_KEY] = {
                    label: 'otherapp',
                    steps: [{ id: 'n1', title: 'Renew the Apple certificate', status: 'todo', heard: 'todo', askedIn: 'S7', createdAt: 1 }],
                };
                return [4 /*yield*/, $.tool.call({ tool: 'mcp__fake__build' })];
            case 1:
                _b.sent();
                return [4 /*yield*/, clock.advance(10000)];
            case 2:
                _b.sent();
                return [4 /*yield*/, $.ui.mount(__assign(__assign({}, world_1.PANE), { surface: 'desktop' }))];
            case 3:
                ui = _b.sent();
                return [4 /*yield*/, ui.press({ key: 'edit:other:step:n1' })];
            case 4:
                _b.sent();
                return [4 /*yield*/, ui.input({ key: 'note-input:other:step:n1', text: 'Use the new team.' })];
            case 5:
                _b.sent();
                (0, testing_1.expect)(w.stored["inbox#p#".concat(world_1.OTHER_KEY, "#step:n1")]).toMatchObject({ target: '', key: world_1.OTHER_KEY });
                _a = testing_1.expect;
                return [4 /*yield*/, ui.find({ type: 'Text', text: '✎ Note sent to Claude in otherapp, at its next session' })];
            case 6:
                _a.apply(void 0, [_b.sent()]).toBeDefined();
                return [4 /*yield*/, clock.advance(60000)];
            case 7:
                _b.sent();
                (0, testing_1.expect)(w.prompts).toHaveLength(0);
                (0, testing_1.expect)(w.stored["inbox#p#".concat(world_1.OTHER_KEY, "#step:n1")]).toBeDefined();
                return [4 /*yield*/, ui.unmount()];
            case 8:
                _b.sent();
                return [2 /*return*/];
        }
    });
}); });
(0, testing_1.test)('the session that waits on a step, or changes it, becomes the one that hears it', function ($, on) { return __awaiter(void 0, void 0, void 0, function () {
    var w, _a, apple, fee;
    var _b, _c, _d, _e, _f;
    return __generator(this, function (_g) {
        switch (_g.label) {
            case 0:
                w = (0, world_1.world)(on);
                testing_1.mock.clock(on, { now: AFTERNOON });
                w.me.id = 'S2';
                return [4 /*yield*/, $.tool.call({ tool: STEPS, add: [{ title: 'Approve the new Apple agreement' }, { title: 'Pay the Play Console fee' }] })];
            case 1:
                _g.sent();
                _a = w.steps(), apple = _a[0], fee = _a[1];
                w.me.id = 'S1';
                return [4 /*yield*/, $.tool.call({ tool: GOALS, goals: [{ title: 'The app is on the App Store', status: 'waiting', waitingFor: [(_b = apple === null || apple === void 0 ? void 0 : apple.id) !== null && _b !== void 0 ? _b : ''] }] })];
            case 2:
                _g.sent();
                (0, testing_1.expect)((_c = w.steps().find(function (step) { return step.id === (apple === null || apple === void 0 ? void 0 : apple.id); })) === null || _c === void 0 ? void 0 : _c.askedIn).toBe('S1');
                (0, testing_1.expect)((_d = w.steps().find(function (step) { return step.id === (fee === null || fee === void 0 ? void 0 : fee.id); })) === null || _d === void 0 ? void 0 : _d.askedIn).toBe('S2');
                w.me.id = 'S3';
                return [4 /*yield*/, $.tool.call({ tool: STEPS, update: [{ id: (_e = fee === null || fee === void 0 ? void 0 : fee.id) !== null && _e !== void 0 ? _e : '', due: '2026-10-30' }] })];
            case 3:
                _g.sent();
                (0, testing_1.expect)((_f = w.steps().find(function (step) { return step.id === (fee === null || fee === void 0 ? void 0 : fee.id); })) === null || _f === void 0 ? void 0 : _f.askedIn).toBe('S3');
                return [2 /*return*/];
        }
    });
}); });
