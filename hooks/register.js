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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = void 0;
var claude_code_1 = require("claude-code");
var routing_1 = require("./routing");
var notes_1 = require("./notes");
var map_1 = require("./map");
var activity_1 = require("./activity");
var goals_1 = require("./goals");
var your_steps_1 = require("./your-steps");
var PANE = 'overview';
var TITLE = 'Overview';
var STEPS_KEY = 'showSteps';
/** How often ticks, other projects and helpers are looked at. */
var SWEEP_MS = 10000;
var PICKUP_DEFAULT_SECONDS = 30;
/** Tool calls without an Overview update before Claude is reminded. */
var NUDGE_AFTER = 12;
var board = (0, claude_code_1.atom)({ plugin: 'overview', key: 'board' }, goals_1.EMPTY);
var isWorking = (0, claude_code_1.atom)({ plugin: 'overview', key: 'isWorking' }, false);
var showSteps = (0, claude_code_1.atom)({ plugin: 'overview', key: 'showSteps' }, false);
var shownCalls = (0, claude_code_1.atom)({ plugin: 'overview', key: 'shownCalls' }, []);
var yourSteps = (0, claude_code_1.atom)({ plugin: 'overview', key: 'yourSteps' }, []);
var project = (0, claude_code_1.atom)({ plugin: 'overview', key: 'project' }, '');
var projectLabel = (0, claude_code_1.atom)({ plugin: 'overview', key: 'projectLabel' }, '');
var otherProjects = (0, claude_code_1.atom)({ plugin: 'overview', key: 'otherProjects' }, []);
var helpers = (0, claude_code_1.atom)({ plugin: 'overview', key: 'helpers' }, []);
var otherSessions = (0, claude_code_1.atom)({ plugin: 'overview', key: 'otherSessions' }, []);
var activity = (0, claude_code_1.atom)({ plugin: 'overview', key: 'activity' }, {});
var openGoals = (0, claude_code_1.atom)({ plugin: 'overview', key: 'openGoals' }, []);
var unfolded = (0, claude_code_1.atom)({ plugin: 'overview', key: 'unfolded' }, []);
var openedSteps = (0, claude_code_1.atom)({ plugin: 'overview', key: 'openSteps' }, []);
var projectMap = (0, claude_code_1.atom)({ plugin: 'overview', key: 'projectMap' }, map_1.EMPTY_MAP);
var changes = (0, claude_code_1.atom)({ plugin: 'overview', key: 'changes' }, []);
var editing = (0, claude_code_1.atom)({ plugin: 'overview', key: 'editing' }, '');
var editProblem = (0, claude_code_1.atom)({ plugin: 'overview', key: 'editProblem' }, '');
var notes = (0, claude_code_1.atom)({ plugin: 'overview', key: 'notes' }, []);
var lastArchive = (0, claude_code_1.atom)({ plugin: 'overview', key: 'lastArchive' }, null);
var stepSearch = (0, claude_code_1.atom)({ plugin: 'overview', key: 'stepSearch' }, '');
var stepFilter = (0, claude_code_1.atom)({ plugin: 'overview', key: 'stepFilter' }, 'all');
var activeAt = (0, claude_code_1.atom)({ plugin: 'overview', key: 'activeAt' }, 0);
/** How long the pane offers to undo the last archive; /overview undo works until the next one. */
var UNDO_MS = 2 * 60000;
/** Tools whose rows are for the person (files, widgets, plans, findings): never hidden. */
var FOR_THE_PERSON = new Set([
    'AskUserQuestion',
    'ExitPlanMode',
    'ReportFindings',
    'SendUserFile',
    'mcp__ccd_session__spawn_task',
]);
/** Prompts that are not the person asking for something new. */
var NOT_THE_PERSON = new Set(['plugin', 'task-notification', 'auto-continuation']);
var isForThePerson = function (tool, input) {
    if (FOR_THE_PERSON.has(tool) || tool.endsWith('__show_widget'))
        return true;
    if (tool !== 'Artifact')
        return false;
    var action = input === null || input === void 0 ? void 0 : input.action;
    return action === undefined || action === 'publish' || action === 'open';
};
var same = function (a, b) { return JSON.stringify(a) === JSON.stringify(b); };
/** Module variables: a reload drops timers, starts the count afresh and reads the options again. */
var sweeping;
var pickupMs = PICKUP_DEFAULT_SECONDS * 1000;
var phoneAlerts = true;
var callsSinceGoals = 0;
var lastCard = '';
var lastCardAt = 0;
/** Shows or hides the steps (flips them without a value) and remembers it across sessions. */
var setSteps = function ($, value) { return __awaiter(void 0, void 0, void 0, function () {
    var isShown;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, claude_code_1.update)($, showSteps, function (shown) { return value !== null && value !== void 0 ? value : !shown; })];
            case 1:
                isShown = _a.sent();
                return [4 /*yield*/, $.store.set(STEPS_KEY, isShown)];
            case 2:
                _a.sent();
                return [2 /*return*/, isShown];
        }
    });
}); };
/** The store key of this project's steps: the repository's main root, so worktrees share them. */
var projectKey = function ($) { return __awaiter(void 0, void 0, void 0, function () {
    var known, _a, repo, root, _b, key;
    var _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0: return [4 /*yield*/, (0, claude_code_1.read)($, project)];
            case 1:
                known = _d.sent();
                _a = known !== '';
                if (!_a) return [3 /*break*/, 3];
                return [4 /*yield*/, (0, claude_code_1.read)($, projectLabel)];
            case 2:
                _a = (_d.sent()) !== '';
                _d.label = 3;
            case 3:
                if (_a)
                    return [2 /*return*/, known];
                return [4 /*yield*/, $.session.repo()];
            case 4:
                repo = _d.sent();
                if (!((_c = repo === null || repo === void 0 ? void 0 : repo.root) !== null && _c !== void 0)) return [3 /*break*/, 5];
                _b = _c;
                return [3 /*break*/, 7];
            case 5: return [4 /*yield*/, $.session.root()];
            case 6:
                _b = (_d.sent());
                _d.label = 7;
            case 7:
                root = _b;
                key = "".concat(your_steps_1.STORE_PREFIX).concat(root);
                return [4 /*yield*/, (0, claude_code_1.update)($, projectLabel, function () { var _a; return (0, your_steps_1.labelFor)(root, (_a = repo === null || repo === void 0 ? void 0 : repo.remote) !== null && _a !== void 0 ? _a : null); })];
            case 8:
                _d.sent();
                return [4 /*yield*/, (0, claude_code_1.update)($, project, function () { return key; })];
            case 9:
                _d.sent();
                return [2 /*return*/, key];
        }
    });
}); };
/** Reads this project's steps back from the store (another session may have changed them). */
var loadYourSteps = function ($) { return __awaiter(void 0, void 0, void 0, function () {
    var steps, _a, _b, _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _a = your_steps_1.readStored;
                _c = (_b = $.store).get;
                return [4 /*yield*/, projectKey($)];
            case 1: return [4 /*yield*/, _c.apply(_b, [_e.sent()])];
            case 2:
                steps = _a.apply(void 0, [_e.sent()]).steps;
                _d = same;
                return [4 /*yield*/, (0, claude_code_1.read)($, yourSteps)];
            case 3:
                if (!!_d.apply(void 0, [_e.sent(), steps])) return [3 /*break*/, 5];
                return [4 /*yield*/, (0, claude_code_1.update)($, yourSteps, function () { return steps; })];
            case 4:
                _e.sent();
                _e.label = 5;
            case 5: return [2 /*return*/, steps];
        }
    });
}); };
/** Reads every other project's open steps. */
var loadOtherProjects = function ($) { return __awaiter(void 0, void 0, void 0, function () {
    var own, keys, found, _i, keys_1, key, _a, label, steps, _b, open_1, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0: return [4 /*yield*/, projectKey($)];
            case 1:
                own = _d.sent();
                return [4 /*yield*/, $.store.keys()];
            case 2:
                keys = (_d.sent()).filter(function (key) { return key.startsWith(your_steps_1.STORE_PREFIX) && key !== own; });
                found = [];
                _i = 0, keys_1 = keys;
                _d.label = 3;
            case 3:
                if (!(_i < keys_1.length)) return [3 /*break*/, 6];
                key = keys_1[_i];
                _b = your_steps_1.readStored;
                return [4 /*yield*/, $.store.get(key)];
            case 4:
                _a = _b.apply(void 0, [_d.sent()]), label = _a.label, steps = _a.steps;
                open_1 = (0, your_steps_1.activeSteps)(steps).filter(function (step) { return step.status !== 'done'; });
                if (open_1.length > 0)
                    found.push({ key: key, label: label !== null && label !== void 0 ? label : (0, your_steps_1.labelFor)(key.slice(your_steps_1.STORE_PREFIX.length), null), steps: open_1 });
                _d.label = 5;
            case 5:
                _i++;
                return [3 /*break*/, 3];
            case 6:
                _c = same;
                return [4 /*yield*/, (0, claude_code_1.read)($, otherProjects)];
            case 7:
                if (!!_c.apply(void 0, [_d.sent(), found])) return [3 /*break*/, 9];
                return [4 /*yield*/, (0, claude_code_1.update)($, otherProjects, function () { return found; })];
            case 8:
                _d.sent();
                _d.label = 9;
            case 9: return [2 /*return*/];
        }
    });
}); };
/** Applies a change to the freshest list of a project in the store, so parallel sessions keep each other's steps. */
var changeStepsAt = function ($, key, change) { return __awaiter(void 0, void 0, void 0, function () {
    var own, now, stored, _a, steps, label, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, projectKey($)];
            case 1:
                own = _c.sent();
                return [4 /*yield*/, $.clock.now()];
            case 2:
                now = _c.sent();
                _a = your_steps_1.readStored;
                return [4 /*yield*/, $.store.get(key)];
            case 3:
                stored = _a.apply(void 0, [_c.sent()]);
                steps = (0, your_steps_1.prune)(change(stored.steps), now);
                if (!(key === own)) return [3 /*break*/, 5];
                return [4 /*yield*/, (0, claude_code_1.read)($, projectLabel)];
            case 4:
                _b = _c.sent();
                return [3 /*break*/, 6];
            case 5:
                _b = stored.label;
                _c.label = 6;
            case 6:
                label = _b;
                return [4 /*yield*/, $.store.set(key, { label: label, steps: steps })];
            case 7:
                _c.sent();
                if (!(key === own)) return [3 /*break*/, 9];
                return [4 /*yield*/, (0, claude_code_1.update)($, yourSteps, function () { return steps; })];
            case 8:
                _c.sent();
                return [3 /*break*/, 11];
            case 9: return [4 /*yield*/, loadOtherProjects($)];
            case 10:
                _c.sent();
                _c.label = 11;
            case 11: return [2 /*return*/, steps];
        }
    });
}); };
/** The project's root, out of its steps' store key. */
var rootOf = function (key) { return key.slice(your_steps_1.STORE_PREFIX.length); };
/** Reads this project's map and feed back from the store (another session may have changed them). */
var loadMap = function ($) { return __awaiter(void 0, void 0, void 0, function () {
    var root, _a, map, _b, feed, _c, _d, _e;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0:
                _a = rootOf;
                return [4 /*yield*/, projectKey($)];
            case 1:
                root = _a.apply(void 0, [_f.sent()]);
                _b = map_1.readMap;
                return [4 /*yield*/, $.store.get("".concat(map_1.MAP_PREFIX).concat(root))];
            case 2:
                map = _b.apply(void 0, [_f.sent()]);
                _c = map_1.readChanges;
                return [4 /*yield*/, $.store.get("".concat(map_1.CHANGES_PREFIX).concat(root))];
            case 3:
                feed = _c.apply(void 0, [_f.sent()]);
                _d = same;
                return [4 /*yield*/, (0, claude_code_1.read)($, projectMap)];
            case 4:
                if (!!_d.apply(void 0, [_f.sent(), map])) return [3 /*break*/, 6];
                return [4 /*yield*/, (0, claude_code_1.update)($, projectMap, function () { return map; })];
            case 5:
                _f.sent();
                _f.label = 6;
            case 6:
                _e = same;
                return [4 /*yield*/, (0, claude_code_1.read)($, changes)];
            case 7:
                if (!!_e.apply(void 0, [_f.sent(), feed])) return [3 /*break*/, 9];
                return [4 /*yield*/, (0, claude_code_1.update)($, changes, function () { return feed; })];
            case 8:
                _f.sent();
                _f.label = 9;
            case 9: return [2 /*return*/, map];
        }
    });
}); };
/** Adds lines to a project's feed (this one, or the one whose step was ticked from here). */
var recordChanges = function ($, key, added) { return __awaiter(void 0, void 0, void 0, function () {
    var storeKey, feed, _a, _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                if (added.length === 0)
                    return [2 /*return*/];
                storeKey = "".concat(map_1.CHANGES_PREFIX).concat(rootOf(key));
                _a = map_1.addChanges;
                _b = map_1.readChanges;
                return [4 /*yield*/, $.store.get(storeKey)];
            case 1:
                feed = _a.apply(void 0, [_b.apply(void 0, [_d.sent()]), added]);
                return [4 /*yield*/, $.store.set(storeKey, feed)];
            case 2:
                _d.sent();
                _c = key;
                return [4 /*yield*/, projectKey($)];
            case 3:
                if (!(_c === (_d.sent()))) return [3 /*break*/, 5];
                return [4 /*yield*/, (0, claude_code_1.update)($, changes, function () { return feed; })];
            case 4:
                _d.sent();
                _d.label = 5;
            case 5: return [2 /*return*/];
        }
    });
}); };
/** Picks an option of a decision, in this project or another one. */
var chooseStep = function ($, key, id, choice) { return __awaiter(void 0, void 0, void 0, function () {
    var session, from, now, list, step;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                ensureSweep($);
                return [4 /*yield*/, $.session.id()];
            case 1:
                session = _a.sent();
                return [4 /*yield*/, projectKey($)];
            case 2:
                from = _a.sent();
                return [4 /*yield*/, $.clock.now()];
            case 3:
                now = _a.sent();
                return [4 /*yield*/, changeStepsAt($, key, function (steps) { return (0, your_steps_1.choose)(steps, id, choice, session, from, now); })];
            case 4:
                list = _a.sent();
                step = list.find(function (one) { return one.id === id; });
                if (!((step === null || step === void 0 ? void 0 : step.answer) !== undefined)) return [3 /*break*/, 6];
                return [4 /*yield*/, recordChanges($, key, [{ at: now, text: "You chose: ".concat(step.answer), tone: 'you' }])];
            case 5:
                _a.sent();
                _a.label = 6;
            case 6: return [4 /*yield*/, sayWhereItWent($, key, step)];
            case 7:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
/** Answers a step that asks for words, in this project or another one; an empty answer takes it back. */
var answerStep = function ($, key, id, words) { return __awaiter(void 0, void 0, void 0, function () {
    var session, from, now, list, step;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                ensureSweep($);
                return [4 /*yield*/, $.session.id()];
            case 1:
                session = _a.sent();
                return [4 /*yield*/, projectKey($)];
            case 2:
                from = _a.sent();
                return [4 /*yield*/, $.clock.now()];
            case 3:
                now = _a.sent();
                return [4 /*yield*/, changeStepsAt($, key, function (steps) { return (0, your_steps_1.reply)(steps, id, words, session, from, now); })];
            case 4:
                list = _a.sent();
                step = list.find(function (one) { return one.id === id; });
                if (!((step === null || step === void 0 ? void 0 : step.answer) !== undefined)) return [3 /*break*/, 6];
                return [4 /*yield*/, recordChanges($, key, [{ at: now, text: "You answered: ".concat(step.title), tone: 'you' }])];
            case 5:
                _a.sent();
                _a.label = 6;
            case 6: return [4 /*yield*/, sayWhereItWent($, key, step)];
            case 7:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
/** Publishes what this session is doing, when it changed or as a heartbeat; never fails its caller. */
var publishCard = function ($) { return __awaiter(void 0, void 0, void 0, function () {
    var error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, writeCard($)];
            case 1:
                _a.sent();
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                $.ui.log("overview: session card not published: ".concat(String(error_1)), { to: 'debug' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
var writeCard = function ($) { return __awaiter(void 0, void 0, void 0, function () {
    var id, now, card, _a, _b, _at, words, said;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, $.session.id()];
            case 1:
                id = _c.sent();
                return [4 /*yield*/, $.clock.now()];
            case 2:
                now = _c.sent();
                return [4 /*yield*/, projectKey($)];
            case 3:
                _c.sent();
                _a = activity_1.cardFor;
                _b = [id];
                return [4 /*yield*/, (0, claude_code_1.read)($, projectLabel)];
            case 4:
                _b = _b.concat([_c.sent()]);
                return [4 /*yield*/, (0, claude_code_1.read)($, board)];
            case 5:
                _b = _b.concat([_c.sent()]);
                return [4 /*yield*/, (0, claude_code_1.read)($, isWorking)];
            case 6:
                _b = _b.concat([_c.sent()]);
                return [4 /*yield*/, (0, claude_code_1.read)($, yourSteps)];
            case 7:
                _b = _b.concat([_c.sent(), now]);
                return [4 /*yield*/, projectKey($)];
            case 8:
                _b = _b.concat([_c.sent()]);
                return [4 /*yield*/, (0, claude_code_1.read)($, activeAt)];
            case 9:
                card = _a.apply(void 0, _b.concat([(_c.sent()) || undefined]));
                _at = card.updatedAt, words = __rest(card, ["updatedAt"]);
                said = JSON.stringify(words);
                if (said === lastCard && now - lastCardAt < activity_1.HEARTBEAT_MS)
                    return [2 /*return*/];
                lastCard = said;
                lastCardAt = now;
                return [4 /*yield*/, $.store.set("".concat(activity_1.SESSION_PREFIX).concat(id), card)];
            case 10:
                _c.sent();
                return [2 /*return*/];
        }
    });
}); };
/** Reads the other open sessions' cards, and forgets the ones gone for an hour. */
var loadOtherSessions = function ($) { return __awaiter(void 0, void 0, void 0, function () {
    var own, _a, _b, now, found, _i, _c, key, card, age, _d;
    var _e;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0:
                _b = (_a = "".concat(activity_1.SESSION_PREFIX)).concat;
                return [4 /*yield*/, $.session.id()];
            case 1:
                own = _b.apply(_a, [_f.sent()]);
                return [4 /*yield*/, $.clock.now()];
            case 2:
                now = _f.sent();
                found = [];
                _i = 0;
                return [4 /*yield*/, $.store.keys()];
            case 3:
                _c = (_f.sent()).filter(function (one) { return one.startsWith(activity_1.SESSION_PREFIX) && one !== own; });
                _f.label = 4;
            case 4:
                if (!(_i < _c.length)) return [3 /*break*/, 9];
                key = _c[_i];
                return [4 /*yield*/, $.store.get(key)];
            case 5:
                card = (_f.sent());
                age = now - ((_e = card === null || card === void 0 ? void 0 : card.updatedAt) !== null && _e !== void 0 ? _e : 0);
                if (!(age >= activity_1.SESSION_FORGET_MS)) return [3 /*break*/, 7];
                return [4 /*yield*/, $.store.delete(key)];
            case 6:
                _f.sent();
                return [3 /*break*/, 8];
            case 7:
                if (card !== undefined && age < activity_1.SESSION_STALE_MS)
                    found.push(card);
                _f.label = 8;
            case 8:
                _i++;
                return [3 /*break*/, 4];
            case 9:
                found.sort(function (a, b) { return a.project.localeCompare(b.project) || a.id.localeCompare(b.id); });
                _d = same;
                return [4 /*yield*/, (0, claude_code_1.read)($, otherSessions)];
            case 10:
                if (!!_d.apply(void 0, [_f.sent(), found])) return [3 /*break*/, 12];
                return [4 /*yield*/, (0, claude_code_1.update)($, otherSessions, function () { return found; })];
            case 11:
                _f.sent();
                _f.label = 12;
            case 12: return [2 /*return*/, found];
        }
    });
}); };
/** The open sessions as routing reads them: the others' cards, read fresh from the store, and this one. */
var liveSessions = function ($) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b;
    var _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _a = [[]];
                return [4 /*yield*/, loadOtherSessions($)];
            case 1:
                _b = [__spreadArray.apply(void 0, _a.concat([(_d.sent()), true]))];
                _c = {};
                return [4 /*yield*/, $.session.id()];
            case 2:
                _c.id = _d.sent();
                return [4 /*yield*/, projectKey($)];
            case 3:
                _c.key = _d.sent();
                return [4 /*yield*/, (0, claude_code_1.read)($, activeAt)];
            case 4:
                _c.activeAt = _d.sent();
                return [4 /*yield*/, (0, claude_code_1.read)($, projectLabel)];
            case 5:
                _c.project = _d.sent();
                return [4 /*yield*/, (0, claude_code_1.read)($, board)];
            case 6: return [2 /*return*/, __spreadArray.apply(void 0, _b.concat([[
                        (_c.summary = (_d.sent()).summary, _c)
                    ], false]))];
        }
    });
}); };
/** The short name of a project, this one or another one shown here. */
var labelOf = function ($, key) { return __awaiter(void 0, void 0, void 0, function () { var _a, _b; var _c, _d; return __generator(this, function (_e) {
    switch (_e.label) {
        case 0:
            _b = key;
            return [4 /*yield*/, projectKey($)];
        case 1:
            if (!(_b === (_e.sent()))) return [3 /*break*/, 3];
            return [4 /*yield*/, (0, claude_code_1.read)($, projectLabel)];
        case 2:
            _a = _e.sent();
            return [3 /*break*/, 5];
        case 3: return [4 /*yield*/, (0, claude_code_1.read)($, otherProjects)];
        case 4:
            _a = ((_d = (_c = (_e.sent()).find(function (one) { return one.key === key; })) === null || _c === void 0 ? void 0 : _c.label) !== null && _d !== void 0 ? _d : (0, your_steps_1.labelFor)(rootOf(key), null));
            _e.label = 5;
        case 5: return [2 /*return*/, _a];
    }
}); }); };
/**
 * Tells the person where what they did on a step went, when it is not this session's Claude that
 * asked for it: another open session, this one standing in for a closed one, or the project's next session.
 */
var sayWhereItWent = function ($, key, step) { return __awaiter(void 0, void 0, void 0, function () {
    var me, live, hearer, isClosedOwner, line, _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                if (step === undefined || (0, your_steps_1.unheard)([step]).length === 0)
                    return [2 /*return*/];
                return [4 /*yield*/, $.session.id()];
            case 1:
                me = _c.sent();
                return [4 /*yield*/, liveSessions($)];
            case 2:
                live = _c.sent();
                hearer = (0, routing_1.hearerOf)(step, key, live);
                isClosedOwner = step.askedIn !== undefined && step.askedIn !== hearer;
                if (hearer === me && !isClosedOwner)
                    return [2 /*return*/];
                _a = routing_1.pickupLine;
                _b = [hearer, me, live];
                return [4 /*yield*/, labelOf($, key)];
            case 3:
                line = _a.apply(void 0, _b.concat([_c.sent(), isClosedOwner]));
                $.ui.toast("\u2197 ".concat(line.charAt(0).toUpperCase()).concat(line.slice(1)), { timeoutMs: 6000 });
                return [2 /*return*/];
        }
    });
}); };
/** Reminds the person's phone of steps that have waited a day, or are due by tomorrow. */
var remind = function ($) { return __awaiter(void 0, void 0, void 0, function () {
    var now, due, _a, _b, _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                if (!phoneAlerts)
                    return [2 /*return*/];
                return [4 /*yield*/, $.clock.now()];
            case 1:
                now = _e.sent();
                _a = your_steps_1.dueReminders;
                return [4 /*yield*/, (0, claude_code_1.read)($, yourSteps)];
            case 2:
                due = _a.apply(void 0, [_e.sent(), now]);
                if (due.length === 0)
                    return [2 /*return*/];
                return [4 /*yield*/, changeYourSteps($, function (steps) { return (0, your_steps_1.markReminded)(steps, due, now); })];
            case 3:
                _e.sent();
                _b = notifyPhone;
                _c = [$];
                _d = your_steps_1.reminderLine;
                return [4 /*yield*/, (0, claude_code_1.read)($, projectLabel)];
            case 4: return [4 /*yield*/, _b.apply(void 0, _c.concat([_d.apply(void 0, [_e.sent(), (0, your_steps_1.sortSteps)(due), now])]))];
            case 5:
                _e.sent();
                return [2 /*return*/];
        }
    });
}); };
var toggleFold = function ($, part) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, claude_code_1.update)($, unfolded, function (open) { return ((open !== null && open !== void 0 ? open : []).includes(part) ? (open !== null && open !== void 0 ? open : []).filter(function (one) { return one !== part; }) : __spreadArray(__spreadArray([], (open !== null && open !== void 0 ? open : []), true), [part], false)); })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
var toggleStepOpen = function ($, id) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, claude_code_1.update)($, openedSteps, function (open) { return ((open !== null && open !== void 0 ? open : []).includes(id) ? (open !== null && open !== void 0 ? open : []).filter(function (one) { return one !== id; }) : __spreadArray(__spreadArray([], (open !== null && open !== void 0 ? open : []), true), [id], false)); })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
/** The repository's GitHub address, which links to its documents start from. */
var repoBase = function ($) { return __awaiter(void 0, void 0, void 0, function () { var _a; var _b, _c; return __generator(this, function (_d) {
    switch (_d.label) {
        case 0:
            _a = your_steps_1.githubBase;
            return [4 /*yield*/, $.session.repo()];
        case 1: return [2 /*return*/, _a.apply(void 0, [(_c = (_b = (_d.sent())) === null || _b === void 0 ? void 0 : _b.remote) !== null && _c !== void 0 ? _c : null])];
    }
}); }); };
var toggleGoalOpen = function ($, title) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, claude_code_1.update)($, openGoals, function (open) { return ((open !== null && open !== void 0 ? open : []).includes(title) ? (open !== null && open !== void 0 ? open : []).filter(function (one) { return one !== title; }) : __spreadArray(__spreadArray([], (open !== null && open !== void 0 ? open : []), true), [title], false)); })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
/** Notes what a tool call did, under the goal Claude is working on. */
var recordAction = function ($, tool, input, failed) { return __awaiter(void 0, void 0, void 0, function () {
    var label, active;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                label = (0, activity_1.describeAction)(tool, input);
                if (label === null)
                    return [2 /*return*/];
                return [4 /*yield*/, (0, claude_code_1.read)($, board)];
            case 1:
                active = (_b = (_a = (_c.sent()).goals.find(function (goal) { return goal.status === 'active'; })) === null || _a === void 0 ? void 0 : _a.title) !== null && _b !== void 0 ? _b : activity_1.BEFORE_PLAN;
                return [4 /*yield*/, (0, claude_code_1.update)($, activity, function (log) { return (0, activity_1.record)(log !== null && log !== void 0 ? log : {}, active, label, failed); })];
            case 2:
                _c.sent();
                return [2 /*return*/];
        }
    });
}); };
var tickStep = function ($, key, id) { return __awaiter(void 0, void 0, void 0, function () {
    var session, from, now, list, step;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                ensureSweep($);
                return [4 /*yield*/, $.session.id()];
            case 1:
                session = _a.sent();
                return [4 /*yield*/, projectKey($)];
            case 2:
                from = _a.sent();
                return [4 /*yield*/, $.clock.now()];
            case 3:
                now = _a.sent();
                return [4 /*yield*/, changeStepsAt($, key, function (steps) { return (0, your_steps_1.toggle)(steps, id, session, from, now); })];
            case 4:
                list = _a.sent();
                step = list.find(function (one) { return one.id === id; });
                if (!((step === null || step === void 0 ? void 0 : step.status) === 'checked')) return [3 /*break*/, 6];
                return [4 /*yield*/, recordChanges($, key, [{ at: now, text: "You ticked: ".concat(step.title), tone: 'you' }])];
            case 5:
                _a.sent();
                _a.label = 6;
            case 6: return [4 /*yield*/, sayWhereItWent($, key, step)];
            case 7:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
/** Archives a step the person no longer needs: it leaves the active list, and Claude hears of it like a tick. */
var archiveStep = function ($, key, id) { return __awaiter(void 0, void 0, void 0, function () {
    var session, from, now, list, step;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                ensureSweep($);
                return [4 /*yield*/, $.session.id()];
            case 1:
                session = _a.sent();
                return [4 /*yield*/, projectKey($)];
            case 2:
                from = _a.sent();
                return [4 /*yield*/, $.clock.now()];
            case 3:
                now = _a.sent();
                return [4 /*yield*/, changeStepsAt($, key, function (steps) { return (0, your_steps_1.archiveIn)(steps, id, session, from, now); })];
            case 4:
                list = _a.sent();
                step = list.find(function (one) { return one.id === id; });
                if ((step === null || step === void 0 ? void 0 : step.archivedAt) !== now)
                    return [2 /*return*/];
                return [4 /*yield*/, recordChanges($, key, [{ at: now, text: "You archived: ".concat(step.title), tone: 'you' }])];
            case 5:
                _a.sent();
                return [4 /*yield*/, offerUndo($, { key: key, ids: [id], titles: [step.title], by: 'you', at: now })];
            case 6:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
/** Keeps the last archive for its undo, and says so in a toast. */
var offerUndo = function ($, done) { return __awaiter(void 0, void 0, void 0, function () {
    var what;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, claude_code_1.update)($, lastArchive, function () { return done; })];
            case 1:
                _a.sent();
                what = done.titles.length === 1 ? "\u00AB ".concat(done.titles[0], " \u00BB") : "".concat(done.titles.length, " steps");
                $.ui.toast("\u229F ".concat(done.by === 'claude' ? 'Claude archived' : 'Archived', " ").concat(what, " \u00B7 \u21BA Undo in the Overview pane, or /overview undo"), { timeoutMs: 8000 });
                return [2 /*return*/];
        }
    });
}); };
/** Brings back every step of the last archive, as it was. */
var undoArchive = function ($) { return __awaiter(void 0, void 0, void 0, function () {
    var last, session, from, now, what;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, claude_code_1.read)($, lastArchive)];
            case 1:
                last = _a.sent();
                if (last === null)
                    return [2 /*return*/, 'Nothing to undo: no step was archived since this session started.'];
                return [4 /*yield*/, $.session.id()];
            case 2:
                session = _a.sent();
                return [4 /*yield*/, projectKey($)];
            case 3:
                from = _a.sent();
                return [4 /*yield*/, $.clock.now()];
            case 4:
                now = _a.sent();
                return [4 /*yield*/, changeStepsAt($, last.key, function (steps) { return last.ids.reduce(function (list, id) { return (0, your_steps_1.restoreIn)(list, id, session, from, now); }, steps); })];
            case 5:
                _a.sent();
                return [4 /*yield*/, (0, claude_code_1.update)($, lastArchive, function () { return null; })];
            case 6:
                _a.sent();
                return [4 /*yield*/, recordChanges($, last.key, last.titles.map(function (title) { return ({ at: now, text: "You restored: ".concat(title), tone: 'you' }); }))];
            case 7:
                _a.sent();
                what = last.titles.length === 1 ? "\u00AB ".concat(last.titles[0], " \u00BB") : "".concat(last.titles.length, " steps");
                $.ui.toast("\u21BA Restored ".concat(what));
                return [2 /*return*/, "Restored ".concat(what, ".")];
        }
    });
}); };
var dismissUndo = function ($) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, claude_code_1.update)($, lastArchive, function () { return null; })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
var setSearch = function ($, words) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, claude_code_1.update)($, stepSearch, function () { return words.slice(0, 120); })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
var setFilter = function ($, filter) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, claude_code_1.update)($, stepFilter, function (current) { return (current === filter ? 'all' : filter); })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
var clearSearch = function ($) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, claude_code_1.update)($, stepSearch, function () { return ''; })];
            case 1:
                _a.sent();
                return [4 /*yield*/, (0, claude_code_1.update)($, stepFilter, function () { return 'all'; })];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
/** Brings an archived step back to the active list. */
var restoreStep = function ($, key, id) { return __awaiter(void 0, void 0, void 0, function () {
    var session, from, now, list, step;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                ensureSweep($);
                return [4 /*yield*/, $.session.id()];
            case 1:
                session = _a.sent();
                return [4 /*yield*/, projectKey($)];
            case 2:
                from = _a.sent();
                return [4 /*yield*/, $.clock.now()];
            case 3:
                now = _a.sent();
                return [4 /*yield*/, changeStepsAt($, key, function (steps) { return (0, your_steps_1.restoreIn)(steps, id, session, from, now); })];
            case 4:
                list = _a.sent();
                step = list.find(function (one) { return one.id === id; });
                if (!(step !== undefined && step.archivedAt === undefined)) return [3 /*break*/, 6];
                return [4 /*yield*/, recordChanges($, key, [{ at: now, text: "You restored: ".concat(step.title), tone: 'you' }])];
            case 5:
                _a.sent();
                _a.label = 6;
            case 6: return [4 /*yield*/, sayWhereItWent($, key, step)];
            case 7:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
/** Running subagents, for the pane. */
var refreshHelpers = function ($) { return __awaiter(void 0, void 0, void 0, function () {
    var running, _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, $.agent.list()];
            case 1:
                running = (_b.sent())
                    .filter(function (agent) { return agent.status === 'running'; })
                    .map(function (agent) { return ({ id: agent.id, description: agent.description }); });
                _a = same;
                return [4 /*yield*/, (0, claude_code_1.read)($, helpers)];
            case 2:
                if (!!_a.apply(void 0, [_b.sent(), running])) return [3 /*break*/, 4];
                return [4 /*yield*/, (0, claude_code_1.update)($, helpers, function () { return running; })];
            case 3:
                _b.sent();
                _b.label = 4;
            case 4: return [2 /*return*/];
        }
    });
}); };
/** Tells the person's phone, through the app's own notifications (sent only when they are away). */
var notifyPhone = function ($, message) { return __awaiter(void 0, void 0, void 0, function () {
    var error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!phoneAlerts || message === '')
                    return [2 /*return*/];
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, $.tool.call({ tool: 'PushNotification', message: message, status: 'proactive' })];
            case 2:
                _a.sent();
                return [3 /*break*/, 4];
            case 3:
                error_2 = _a.sent();
                $.ui.log("overview: phone alert not sent: ".concat(String(error_2)), { to: 'debug' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
/**
 * Reads other sessions' changes back, and while Claude is idle tells it about the ticks this
 * session picks up in a turn of its own, once the person has stopped ticking for `pickupMs`
 * (never when it is 0). While Claude works, its next tool result carries them instead.
 */
var sweep = function ($) { return __awaiter(void 0, void 0, void 0, function () {
    var list, queued, _a, waiting, _b, _c, lastTick, _d, _e, _f, _g, _h;
    var _j;
    return __generator(this, function (_k) {
        switch (_k.label) {
            case 0: return [4 /*yield*/, loadYourSteps($)];
            case 1:
                list = _k.sent();
                return [4 /*yield*/, loadOtherProjects($)];
            case 2:
                _k.sent();
                return [4 /*yield*/, refreshHelpers($)];
            case 3:
                _k.sent();
                return [4 /*yield*/, publishCard($)];
            case 4:
                _k.sent();
                return [4 /*yield*/, loadOtherSessions($)];
            case 5:
                _k.sent();
                return [4 /*yield*/, loadMap($)];
            case 6:
                _k.sent();
                return [4 /*yield*/, remind($)];
            case 7:
                _k.sent();
                return [4 /*yield*/, settle($, function () { return false; })];
            case 8:
                _k.sent();
                return [4 /*yield*/, takeInbox($)];
            case 9:
                _k.sent();
                return [4 /*yield*/, (0, claude_code_1.read)($, isWorking)];
            case 10:
                if (!!(_k.sent())) return [3 /*break*/, 13];
                return [4 /*yield*/, (0, claude_code_1.read)($, notes)];
            case 11:
                queued = (_k.sent()).filter(function (note) { return note.status === 'queued'; });
                if (!(queued.length > 0)) return [3 /*break*/, 13];
                return [4 /*yield*/, deliverNotes($, queued.map(function (note) { return note.item; }))];
            case 12:
                _k.sent();
                _k.label = 13;
            case 13:
                _a = pickupMs <= 0 || (0, your_steps_1.unheard)(list).length === 0;
                if (_a) return [3 /*break*/, 15];
                return [4 /*yield*/, (0, claude_code_1.read)($, isWorking)];
            case 14:
                _a = (_k.sent());
                _k.label = 15;
            case 15:
                if (_a)
                    return [2 /*return*/];
                _b = your_steps_1.ticksFor;
                _c = [list];
                return [4 /*yield*/, $.session.id()];
            case 16:
                _c = _c.concat([_k.sent()]);
                return [4 /*yield*/, projectKey($)];
            case 17:
                _c = _c.concat([_k.sent()]);
                return [4 /*yield*/, liveSessions($)];
            case 18:
                waiting = _b.apply(void 0, _c.concat([_k.sent()]));
                lastTick = Math.max.apply(Math, __spreadArray([0], waiting.map(function (step) { var _a; return (_a = step.tickedAt) !== null && _a !== void 0 ? _a : 0; }), false));
                _d = waiting.length === 0;
                if (_d) return [3 /*break*/, 20];
                return [4 /*yield*/, $.clock.now()];
            case 19:
                _d = (_k.sent()) - lastTick < pickupMs;
                _k.label = 20;
            case 20:
                if (_d)
                    return [2 /*return*/];
                return [4 /*yield*/, changeYourSteps($, function (steps) { return (0, your_steps_1.markHeard)(steps, waiting); })];
            case 21:
                _k.sent();
                _f = (_e = $.prompt).submit;
                _j = {};
                _g = your_steps_1.noteFor;
                _h = [waiting];
                return [4 /*yield*/, (0, claude_code_1.read)($, board)];
            case 22:
                void _f.apply(_e, [(_j.text = _g.apply(void 0, _h.concat([(_k.sent()).goals])), _j)]);
                return [2 /*return*/];
        }
    });
}); };
var changeYourSteps = function ($, change) { return __awaiter(void 0, void 0, void 0, function () { var _a, _b; return __generator(this, function (_c) {
    switch (_c.label) {
        case 0:
            _a = changeStepsAt;
            _b = [$];
            return [4 /*yield*/, projectKey($)];
        case 1: return [2 /*return*/, _a.apply(void 0, _b.concat([_c.sent(), change]))
            /** The ticks this session picks up that Claude has not heard, marked heard as they are handed over. */
        ];
    }
}); }); };
/** The ticks this session picks up that Claude has not heard, marked heard as they are handed over. */
var takeTicks = function ($) { return __awaiter(void 0, void 0, void 0, function () {
    var list, waiting, _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, (0, claude_code_1.read)($, yourSteps)];
            case 1:
                list = _c.sent();
                if ((0, your_steps_1.unheard)(list).length === 0)
                    return [2 /*return*/, []];
                _a = your_steps_1.ticksFor;
                _b = [list];
                return [4 /*yield*/, $.session.id()];
            case 2:
                _b = _b.concat([_c.sent()]);
                return [4 /*yield*/, projectKey($)];
            case 3:
                _b = _b.concat([_c.sent()]);
                return [4 /*yield*/, liveSessions($)];
            case 4:
                waiting = _a.apply(void 0, _b.concat([_c.sent()]));
                if (!(waiting.length > 0)) return [3 /*break*/, 6];
                return [4 /*yield*/, changeYourSteps($, function (steps) { return (0, your_steps_1.markHeard)(steps, waiting); })];
            case 5:
                _c.sent();
                _c.label = 6;
            case 6: return [2 /*return*/, waiting];
        }
    });
}); };
/** Opens the edit box of an item (`where` tells apart the places one item is drawn), or closes it when open. */
var toggleEdit = function ($, box) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, claude_code_1.update)($, editProblem, function () { return ''; })];
            case 1:
                _a.sent();
                return [4 /*yield*/, (0, claude_code_1.update)($, editing, function (open) { return (open === box ? '' : box); })];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
var closeEdit = function ($) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, claude_code_1.update)($, editProblem, function () { return ''; })];
            case 1:
                _a.sent();
                return [4 /*yield*/, (0, claude_code_1.update)($, editing, function () { return ''; })];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
/** Sends the notes on these items to Claude: a turn of their own when it is idle, its next step when it works. */
var deliverNotes = function ($, items) { return __awaiter(void 0, void 0, void 0, function () {
    var waiting, keys, sent, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, claude_code_1.read)($, notes)];
            case 1:
                waiting = (_a.sent()).filter(function (note) { return items.includes(note.item) && note.status !== 'sent'; });
                if (waiting.length === 0)
                    return [2 /*return*/];
                keys = waiting.map(function (note) { return note.item; });
                return [4 /*yield*/, (0, claude_code_1.read)($, isWorking)];
            case 2:
                if (!_a.sent()) return [3 /*break*/, 4];
                return [4 /*yield*/, (0, claude_code_1.update)($, notes, function (list) { return (0, notes_1.setNoteStatus)(list !== null && list !== void 0 ? list : [], keys, 'queued'); })];
            case 3:
                _a.sent();
                return [2 /*return*/];
            case 4: return [4 /*yield*/, (0, claude_code_1.update)($, notes, function (list) { return (0, notes_1.setNoteStatus)(list !== null && list !== void 0 ? list : [], keys, 'sending'); })];
            case 5:
                _a.sent();
                _a.label = 6;
            case 6:
                _a.trys.push([6, 9, , 11]);
                return [4 /*yield*/, $.prompt.submit({ text: (0, notes_1.noteMessage)(waiting) })];
            case 7:
                sent = _a.sent();
                if (sent.drop !== undefined)
                    throw new Error(sent.drop);
                return [4 /*yield*/, (0, claude_code_1.update)($, notes, function (list) { return (0, notes_1.setNoteStatus)(list !== null && list !== void 0 ? list : [], keys, 'sent'); })];
            case 8:
                _a.sent();
                return [3 /*break*/, 11];
            case 9:
                error_3 = _a.sent();
                return [4 /*yield*/, (0, claude_code_1.update)($, notes, function (list) { return (0, notes_1.setNoteStatus)(list !== null && list !== void 0 ? list : [], keys, 'error', String(error_3 instanceof Error ? error_3.message : error_3).slice(0, 160)); })];
            case 10:
                _a.sent();
                return [3 /*break*/, 11];
            case 11: return [2 /*return*/];
        }
    });
}); };
/**
 * Who hears a note on an item, as for a tick made here: the session that owns it (the one that
 * asked for the step, or sent the map) while it is open; a goal is always this session's.
 */
var noteHearer = function ($, ref) { return __awaiter(void 0, void 0, void 0, function () {
    var me, own, live, key_1, list, _a, askedIn, _b;
    var _c, _d;
    var _e, _f, _g, _h;
    return __generator(this, function (_j) {
        switch (_j.label) {
            case 0: return [4 /*yield*/, $.session.id()];
            case 1:
                me = _j.sent();
                return [4 /*yield*/, projectKey($)];
            case 2:
                own = _j.sent();
                return [4 /*yield*/, liveSessions($)];
            case 3:
                live = _j.sent();
                if (ref.kind === 'goal')
                    return [2 /*return*/, { hearer: me, key: own, live: live }];
                if (!(ref.kind === 'step')) return [3 /*break*/, 8];
                key_1 = (_e = ref.stepKey) !== null && _e !== void 0 ? _e : own;
                if (!(key_1 === own)) return [3 /*break*/, 5];
                return [4 /*yield*/, (0, claude_code_1.read)($, yourSteps)];
            case 4:
                _a = _j.sent();
                return [3 /*break*/, 7];
            case 5: return [4 /*yield*/, (0, claude_code_1.read)($, otherProjects)];
            case 6:
                _a = ((_g = (_f = (_j.sent()).find(function (one) { return one.key === key_1; })) === null || _f === void 0 ? void 0 : _f.steps) !== null && _g !== void 0 ? _g : []);
                _j.label = 7;
            case 7:
                list = _a;
                askedIn = (_h = list.find(function (one) { return one.id === ref.stepId; })) === null || _h === void 0 ? void 0 : _h.askedIn;
                return [2 /*return*/, { hearer: (0, routing_1.hearerOf)({ askedIn: askedIn, tickedIn: me, tickedFrom: own }, key_1, live), key: key_1, live: live }];
            case 8:
                _c = {};
                _b = routing_1.hearerOf;
                _d = {};
                return [4 /*yield*/, (0, claude_code_1.read)($, projectMap)];
            case 9: return [2 /*return*/, (_c.hearer = _b.apply(void 0, [(_d.askedIn = (_j.sent()).updatedIn, _d.tickedIn = me, _d.tickedFrom = own, _d), own, live]), _c.key = own, _c.live = live, _c)];
        }
    });
}); };
/** Leaves a note in the store for the session that owns its item, or for its project's next session. */
var postNote = function ($, note, key, hearer, live) { return __awaiter(void 0, void 0, void 0, function () {
    var waiting, sentTo, _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                waiting = { note: note, key: key, target: hearer !== null && hearer !== void 0 ? hearer : '' };
                return [4 /*yield*/, $.store.set((0, routing_1.inboxKey)(hearer === undefined ? 'p' : 's', hearer !== null && hearer !== void 0 ? hearer : key, note.item), waiting)];
            case 1:
                _c.sent();
                if (!(hearer === undefined)) return [3 /*break*/, 3];
                _b = "Claude in ".concat;
                return [4 /*yield*/, labelOf($, key)];
            case 2:
                _a = _b.apply("Claude in ", [_c.sent(), ", at its next session"]);
                return [3 /*break*/, 4];
            case 3:
                _a = (0, routing_1.sessionName)(live.find(function (one) { return one.id === hearer; }));
                _c.label = 4;
            case 4:
                sentTo = _a;
                return [4 /*yield*/, (0, claude_code_1.update)($, notes, function (list) { return (0, notes_1.putNote)(list !== null && list !== void 0 ? list : [], __assign(__assign({}, note), { status: 'sent', sentTo: sentTo })); })];
            case 5:
                _c.sent();
                $.ui.toast("\u270E Note sent to ".concat(sentTo), { timeoutMs: 6000 });
                return [2 /*return*/];
        }
    });
}); };
/** Takes the notes other panes left for this session, and for this project's closed or next sessions when this one is its heir. */
var takeInbox = function ($) { return __awaiter(void 0, void 0, void 0, function () {
    var keys, me, own, live, isHeir, _loop_1, _i, keys_2, key;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, $.store.keys()];
            case 1:
                keys = (_b.sent()).filter(function (key) { return key.startsWith(routing_1.INBOX_PREFIX); });
                if (keys.length === 0)
                    return [2 /*return*/];
                return [4 /*yield*/, $.session.id()];
            case 2:
                me = _b.sent();
                return [4 /*yield*/, projectKey($)];
            case 3:
                own = _b.sent();
                return [4 /*yield*/, liveSessions($)];
            case 4:
                live = _b.sent();
                isHeir = ((_a = (0, routing_1.heirOf)(live, own)) === null || _a === void 0 ? void 0 : _a.id) === me;
                _loop_1 = function (key) {
                    var waiting, isMine, _c, _sentTo, note;
                    return __generator(this, function (_d) {
                        switch (_d.label) {
                            case 0: return [4 /*yield*/, $.store.get(key)];
                            case 1:
                                waiting = (_d.sent());
                                if ((waiting === null || waiting === void 0 ? void 0 : waiting.note) === undefined)
                                    return [2 /*return*/, "continue"];
                                isMine = waiting.target === me || (isHeir && waiting.key === own && !live.some(function (one) { return one.id === waiting.target; }));
                                if (!isMine)
                                    return [2 /*return*/, "continue"];
                                return [4 /*yield*/, $.store.delete(key)];
                            case 2:
                                _d.sent();
                                _c = waiting.note, _sentTo = _c.sentTo, note = __rest(_c, ["sentTo"]);
                                return [4 /*yield*/, (0, claude_code_1.update)($, notes, function (list) { return (0, notes_1.putNote)(list !== null && list !== void 0 ? list : [], __assign(__assign({}, note), { status: 'queued' })); })];
                            case 3:
                                _d.sent();
                                return [2 /*return*/];
                        }
                    });
                };
                _i = 0, keys_2 = keys;
                _b.label = 5;
            case 5:
                if (!(_i < keys_2.length)) return [3 /*break*/, 8];
                key = keys_2[_i];
                return [5 /*yield**/, _loop_1(key)];
            case 6:
                _b.sent();
                _b.label = 7;
            case 7:
                _i++;
                return [3 /*break*/, 5];
            case 8: return [2 /*return*/];
        }
    });
}); };
/** Takes the person's note on an item: empty, it asks for words; else it goes to Claude, here or in the session that owns the item. */
var sendNote = function ($, box, ref, words) { return __awaiter(void 0, void 0, void 0, function () {
    var text, now, route, _a, _b, _c, _d, _e, _f, _g;
    var _h, _j;
    return __generator(this, function (_k) {
        switch (_k.label) {
            case 0:
                text = (0, notes_1.noteText)(words);
                if (!(text === undefined)) return [3 /*break*/, 2];
                return [4 /*yield*/, (0, claude_code_1.update)($, editProblem, function () { return box; })];
            case 1:
                _k.sent();
                return [2 /*return*/];
            case 2: return [4 /*yield*/, $.clock.now()];
            case 3:
                now = _k.sent();
                return [4 /*yield*/, noteHearer($, ref)];
            case 4:
                route = _k.sent();
                _a = route.hearer;
                return [4 /*yield*/, $.session.id()];
            case 5:
                if (!(_a !== (_k.sent()))) return [3 /*break*/, 12];
                return [4 /*yield*/, closeEdit($)];
            case 6:
                _k.sent();
                _b = recordChanges;
                _c = [$];
                if (!((_h = ref.stepKey) !== null && _h !== void 0)) return [3 /*break*/, 7];
                _d = _h;
                return [3 /*break*/, 9];
            case 7: return [4 /*yield*/, projectKey($)];
            case 8:
                _d = (_k.sent());
                _k.label = 9;
            case 9: return [4 /*yield*/, _b.apply(void 0, _c.concat([_d, [{ at: now, text: "Your note on ".concat(ref.title), tone: 'you' }]]))];
            case 10:
                _k.sent();
                return [4 /*yield*/, postNote($, __assign(__assign({}, ref), { text: text, status: 'queued', at: now }), route.key, route.hearer, route.live)];
            case 11:
                _k.sent();
                return [2 /*return*/];
            case 12: return [4 /*yield*/, (0, claude_code_1.update)($, notes, function (list) { return (0, notes_1.putNote)(list !== null && list !== void 0 ? list : [], __assign(__assign({}, ref), { text: text, status: 'sending', at: now })); })];
            case 13:
                _k.sent();
                return [4 /*yield*/, closeEdit($)];
            case 14:
                _k.sent();
                _e = recordChanges;
                _f = [$];
                if (!((_j = ref.stepKey) !== null && _j !== void 0)) return [3 /*break*/, 15];
                _g = _j;
                return [3 /*break*/, 17];
            case 15: return [4 /*yield*/, projectKey($)];
            case 16:
                _g = (_k.sent());
                _k.label = 17;
            case 17: return [4 /*yield*/, _e.apply(void 0, _f.concat([_g, [{ at: now, text: "Your note on ".concat(ref.title), tone: 'you' }]]))];
            case 18:
                _k.sent();
                return [4 /*yield*/, deliverNotes($, [ref.item])];
            case 19:
                _k.sent();
                return [2 /*return*/];
        }
    });
}); };
var retryNote = function ($, item) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
    return [2 /*return*/, deliverNotes($, [item])];
}); }); };
var dropNote = function ($, item) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, claude_code_1.update)($, notes, function (list) { return (list !== null && list !== void 0 ? list : []).filter(function (note) { return note.item !== item; }); })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
/** The queued notes Claude has not read, marked sent as they ride on its next tool result. */
var takeNotes = function ($) { return __awaiter(void 0, void 0, void 0, function () {
    var queued;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, claude_code_1.read)($, notes)];
            case 1:
                queued = (_a.sent()).filter(function (note) { return note.status === 'queued'; });
                if (!(queued.length > 0)) return [3 /*break*/, 3];
                return [4 /*yield*/, (0, claude_code_1.update)($, notes, function (list) { return (0, notes_1.setNoteStatus)(list !== null && list !== void 0 ? list : [], queued.map(function (note) { return note.item; }), 'sent'); })];
            case 2:
                _a.sent();
                _a.label = 3;
            case 3: return [2 /*return*/, queued];
        }
    });
}); };
/** Drops delivered notes on the items Claude has just reworked. */
var settle = function ($, reworked) { return __awaiter(void 0, void 0, void 0, function () {
    var now, list, kept;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, $.clock.now()];
            case 1:
                now = _a.sent();
                return [4 /*yield*/, (0, claude_code_1.read)($, notes)];
            case 2:
                list = _a.sent();
                kept = (0, notes_1.settleNotes)(list, reworked, now);
                if (!(kept.length !== list.length)) return [3 /*break*/, 4];
                return [4 /*yield*/, (0, claude_code_1.update)($, notes, function () { return kept; })];
            case 3:
                _a.sent();
                _a.label = 4;
            case 4: return [2 /*return*/];
        }
    });
}); };
/** Starts the periodic look, once per load. */
var ensureSweep = function ($) {
    sweeping !== null && sweeping !== void 0 ? sweeping : (sweeping = $.clock.every(SWEEP_MS, function () {
        sweep($).catch(function (error) { return $.ui.log("overview: ".concat(String(error)), { to: 'debug' }); });
    }));
};
/** What rides on Claude's tool result: the person's ticks, and a reminder when the pane has gone stale. */
var contextFor = function ($, tool) { return __awaiter(void 0, void 0, void 0, function () {
    var notes, ticks, _a, _b, _c, _d, queued, hasGoals;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                notes = [];
                return [4 /*yield*/, takeTicks($)];
            case 1:
                ticks = _e.sent();
                if (!(ticks.length > 0)) return [3 /*break*/, 3];
                _b = (_a = notes).push;
                _c = your_steps_1.noteFor;
                _d = [ticks];
                return [4 /*yield*/, (0, claude_code_1.read)($, board)];
            case 2:
                _b.apply(_a, [_c.apply(void 0, _d.concat([(_e.sent()).goals]))]);
                _e.label = 3;
            case 3: return [4 /*yield*/, takeNotes($)];
            case 4:
                queued = _e.sent();
                if (queued.length > 0)
                    notes.push((0, notes_1.noteMessage)(queued));
                callsSinceGoals = tool === goals_1.GOALS_TOOL ? 0 : callsSinceGoals + 1;
                if (!(callsSinceGoals >= NUDGE_AFTER)) return [3 /*break*/, 6];
                callsSinceGoals = 0;
                return [4 /*yield*/, (0, claude_code_1.read)($, board)];
            case 5:
                hasGoals = (_e.sent()).goals.length > 0;
                notes.push(hasGoals
                    ? "The Overview pane has not changed for a while. Update it with ".concat(goals_1.GOALS_TOOL, ": mark reached goals done, set the active one and its progress.")
                    : "You have been working for a while and the person's Overview pane is empty. Send the top-level goals with ".concat(goals_1.GOALS_TOOL, ", as plain-word results."));
                _e.label = 6;
            case 6: return [2 /*return*/, notes];
        }
    });
}); };
var bar = function (done, total, width) {
    var filled = total === 0 ? 0 : Math.round((done / total) * width);
    return '█'.repeat(filled) + '░'.repeat(Math.max(0, width - filled));
};
var register = function (on, options) {
    var _a;
    var seconds = Number((_a = options.pickupAfterSeconds) !== null && _a !== void 0 ? _a : PICKUP_DEFAULT_SECONDS);
    pickupMs = Number.isFinite(seconds) ? Math.max(0, seconds) * 1000 : PICKUP_DEFAULT_SECONDS * 1000;
    phoneAlerts = options.phoneAlerts !== false;
    on('session.start', function ($, e, next) { return __awaiter(void 0, void 0, void 0, function () {
        var stored, started;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, $.tool.register({ name: 'goals', description: goals_1.GOALS_DESCRIPTION, inputSchema: goals_1.GOALS_SCHEMA })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, $.tool.register({ name: 'your_steps', description: your_steps_1.YOUR_STEPS_DESCRIPTION, inputSchema: your_steps_1.YOUR_STEPS_SCHEMA })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, $.tool.register({ name: 'project_map', description: map_1.MAP_DESCRIPTION, inputSchema: map_1.MAP_SCHEMA })];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, $.command.register({
                            name: 'overview',
                            description: 'Show what Claude is doing, will do and has finished; "steps" shows or hides the technical steps',
                            argumentHint: '[steps [on|off]]',
                            immediate: true,
                        })];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, $.store.get(STEPS_KEY)];
                case 5:
                    stored = _a.sent();
                    return [4 /*yield*/, (0, claude_code_1.update)($, showSteps, function () { return stored === true; })];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, $.clock.now()];
                case 7:
                    started = _a.sent();
                    return [4 /*yield*/, (0, claude_code_1.update)($, activeAt, function (at) { return (at ? at : started); })];
                case 8:
                    _a.sent();
                    return [4 /*yield*/, loadYourSteps($)];
                case 9:
                    _a.sent();
                    return [4 /*yield*/, loadOtherProjects($)];
                case 10:
                    _a.sent();
                    return [4 /*yield*/, loadMap($)];
                case 11:
                    _a.sent();
                    ensureSweep($);
                    void $.ui.open({ id: PANE, title: TITLE });
                    return [2 /*return*/, next(e)];
            }
        });
    }); });
    on('command.run', { command: 'overview' }, function ($, e) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, word, value, isShown;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _a = e.args.trim().toLowerCase().split(/\s+/), word = _a[0], value = _a[1];
                    if (!(word === 'undo')) return [3 /*break*/, 2];
                    _b = {};
                    return [4 /*yield*/, undoArchive($)];
                case 1: return [2 /*return*/, (_b.text = _c.sent(), _b)];
                case 2:
                    if (!(word === 'steps')) return [3 /*break*/, 4];
                    return [4 /*yield*/, setSteps($, value === 'on' ? true : value === 'off' ? false : undefined)];
                case 3:
                    isShown = _c.sent();
                    return [2 /*return*/, {
                            text: isShown
                                ? 'Technical steps are shown in the conversation.'
                                : 'Technical steps are hidden from the conversation.',
                        }];
                case 4: return [4 /*yield*/, $.ui.open({ id: PANE, title: TITLE })];
                case 5:
                    _c.sent();
                    return [2 /*return*/, { text: 'Overview pane opened. /overview steps shows or hides the technical steps.' }];
            }
        });
    }); });
    on('prompt.compose', function ($, e, next) { return __awaiter(void 0, void 0, void 0, function () {
        var composed, text;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, next(e)];
                case 1:
                    composed = _a.sent();
                    if (!e.tools.includes(goals_1.GOALS_TOOL))
                        return [2 /*return*/, composed];
                    return [4 /*yield*/, (0, claude_code_1.read)($, showSteps)];
                case 2:
                    text = ((_a.sent()) ? goals_1.GOALS_GUIDE : goals_1.GOALS_GUIDE + goals_1.HIDDEN_NOTE) +
                        (e.tools.includes(your_steps_1.YOUR_STEPS_TOOL) ? your_steps_1.YOUR_STEPS_GUIDE : '') +
                        (e.tools.includes(map_1.MAP_TOOL) ? map_1.MAP_GUIDE : '');
                    return [2 /*return*/, {
                            sections: __spreadArray(__spreadArray([], composed.sections, true), [{ id: 'overview:guide', text: text, scope: 'session' }], false),
                        }];
            }
        });
    }); });
    on('tool.describe', { tool: 'mcp__overview__goals' }, function ($, e, next) { return __awaiter(void 0, void 0, void 0, function () { var _a; return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = [{}];
                return [4 /*yield*/, next(e)];
            case 1: return [2 /*return*/, (__assign.apply(void 0, [__assign.apply(void 0, _a.concat([(_b.sent())])), { isDeferred: false }]))];
        }
    }); }); });
    on('tool.describe', { tool: 'mcp__overview__your_steps' }, function ($, e, next) { return __awaiter(void 0, void 0, void 0, function () { var _a; return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = [{}];
                return [4 /*yield*/, next(e)];
            case 1: return [2 /*return*/, (__assign.apply(void 0, [__assign.apply(void 0, _a.concat([(_b.sent())])), { isDeferred: false }]))];
        }
    }); }); });
    on('tool.check', { tool: 'mcp__overview__goals' }, function () { return ({ decision: 'allow' }); });
    on('tool.check', { tool: 'mcp__overview__your_steps' }, function () { return ({ decision: 'allow' }); });
    on('tool.describe', { tool: 'mcp__overview__project_map' }, function ($, e, next) { return __awaiter(void 0, void 0, void 0, function () { var _a; return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = [{}];
                return [4 /*yield*/, next(e)];
            case 1: return [2 /*return*/, (__assign.apply(void 0, [__assign.apply(void 0, _a.concat([(_b.sent())])), { isDeferred: false }]))];
        }
    }); }); });
    on('tool.check', { tool: 'mcp__overview__project_map' }, function () { return ({ decision: 'allow' }); });
    on('tool.call', { tool: 'mcp__overview__project_map' }, function ($, e) { return __awaiter(void 0, void 0, void 0, function () {
        var input, _a, root, _b, now, before, _c, after, _d, _e, _f, _g;
        var _h;
        return __generator(this, function (_j) {
            switch (_j.label) {
                case 0:
                    input = (0, map_1.parseMap)(e);
                    if (!(input.milestones === undefined && input.parts === undefined)) return [3 /*break*/, 2];
                    _h = {};
                    _a = map_1.describeMap;
                    return [4 /*yield*/, loadMap($)];
                case 1: return [2 /*return*/, (_h.result = _a.apply(void 0, [_j.sent()]), _h)];
                case 2:
                    _b = rootOf;
                    return [4 /*yield*/, projectKey($)];
                case 3:
                    root = _b.apply(void 0, [_j.sent()]);
                    return [4 /*yield*/, $.clock.now()];
                case 4:
                    now = _j.sent();
                    _c = map_1.readMap;
                    return [4 /*yield*/, $.store.get("".concat(map_1.MAP_PREFIX).concat(root))];
                case 5:
                    before = _c.apply(void 0, [_j.sent()]);
                    _d = map_1.applyMap;
                    _e = [before, input, now];
                    return [4 /*yield*/, $.session.id()];
                case 6:
                    after = _d.apply(void 0, _e.concat([_j.sent()]));
                    return [4 /*yield*/, $.store.set("".concat(map_1.MAP_PREFIX).concat(root), after)];
                case 7:
                    _j.sent();
                    return [4 /*yield*/, (0, claude_code_1.update)($, projectMap, function () { return after; })];
                case 8:
                    _j.sent();
                    return [4 /*yield*/, settle($, function (note) { return (note.kind === 'part' && input.parts !== undefined) || (note.kind === 'milestone' && input.milestones !== undefined); })];
                case 9:
                    _j.sent();
                    _f = recordChanges;
                    _g = [$];
                    return [4 /*yield*/, projectKey($)];
                case 10: return [4 /*yield*/, _f.apply(void 0, _g.concat([_j.sent(), (0, map_1.diffMaps)(before, after, now)]))];
                case 11:
                    _j.sent();
                    return [2 /*return*/, { result: "Map updated.\n\n".concat((0, map_1.describeMap)(after)) }];
            }
        });
    }); });
    on('tool.call', function ($, e, next) { return __awaiter(void 0, void 0, void 0, function () {
        var ran, notes_2, error_4;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    ensureSweep($);
                    if (!(String(e.tool) === 'Artifact' && isForThePerson('Artifact', e))) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, claude_code_1.update)($, shownCalls, function (ids) { return __spreadArray(__spreadArray([], (ids !== null && ids !== void 0 ? ids : []), true), [e.tool_use_id], false).slice(-100); })];
                case 1:
                    _b.sent();
                    _b.label = 2;
                case 2: return [4 /*yield*/, next(e)];
                case 3:
                    ran = _b.sent();
                    if (e.agentId !== undefined || ran.deny !== undefined)
                        return [2 /*return*/, ran];
                    _b.label = 4;
                case 4:
                    _b.trys.push([4, 9, , 10]);
                    return [4 /*yield*/, recordAction($, String(e.tool), e, ran.isError === true)];
                case 5:
                    _b.sent();
                    if (!(String(e.tool) === 'Agent')) return [3 /*break*/, 7];
                    return [4 /*yield*/, refreshHelpers($)];
                case 6:
                    _b.sent();
                    _b.label = 7;
                case 7: return [4 /*yield*/, contextFor($, String(e.tool))];
                case 8:
                    notes_2 = _b.sent();
                    return [2 /*return*/, notes_2.length === 0 ? ran : __assign(__assign({}, ran), { context: __spreadArray(__spreadArray([], ((_a = ran.context) !== null && _a !== void 0 ? _a : []), true), notes_2, true) })];
                case 9:
                    error_4 = _b.sent();
                    $.ui.log("overview: ".concat(String(error_4)), { to: 'debug' });
                    return [2 /*return*/, ran];
                case 10: return [2 /*return*/];
            }
        });
    }); });
    on('tool.call', { tool: 'mcp__overview__goals' }, function ($, e) { return __awaiter(void 0, void 0, void 0, function () {
        var args, goals, technical, summary, now, merged, firstActive, me, known, _a, waitedOn, done, steps, unmatched, hint;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (e.agentId !== undefined) {
                        return [2 /*return*/, { result: 'Only the main conversation keeps the overview; carry on with your task.' }];
                    }
                    args = e;
                    goals = (0, goals_1.parseGoals)(args.goals);
                    if (goals.length === 0) {
                        return [2 /*return*/, { deny: 'Give at least one goal, each with a title and a status.' }];
                    }
                    technical = (0, goals_1.technicalTitles)(goals);
                    if (technical.length > 0) {
                        return [2 /*return*/, {
                                deny: "These titles read as technical steps; rewrite them as results the person gets, in plain words, and send the list again: ".concat(technical.map(function (title) { return "\"".concat(title, "\""); }).join(', ')),
                            }];
                    }
                    summary = typeof args.summary === 'string' ? args.summary.trim() : '';
                    return [4 /*yield*/, $.clock.now()];
                case 1:
                    now = _c.sent();
                    return [4 /*yield*/, (0, claude_code_1.update)($, board, function (prev) { return (0, goals_1.merge)(prev !== null && prev !== void 0 ? prev : goals_1.EMPTY, goals, summary, now); })];
                case 2:
                    merged = _c.sent();
                    return [4 /*yield*/, settle($, function (note) { return note.kind === 'goal'; })];
                case 3:
                    _c.sent();
                    firstActive = (_b = goals.find(function (goal) { return goal.status === 'active'; })) === null || _b === void 0 ? void 0 : _b.title;
                    return [4 /*yield*/, (0, claude_code_1.update)($, activity, function (log) {
                            var _a, _b;
                            var _c = log !== null && log !== void 0 ? log : {}, _d = activity_1.BEFORE_PLAN, early = _c[_d], rest = __rest(_c, [typeof _d === "symbol" ? _d : _d + ""]);
                            var moved = early !== undefined && firstActive !== undefined && rest[firstActive] === undefined;
                            var kept = moved ? __assign(__assign({}, rest), (_a = {}, _a[firstActive] = early, _a)) : early === undefined ? rest : __assign(__assign({}, rest), (_b = {}, _b[activity_1.BEFORE_PLAN] = early, _b));
                            return (0, activity_1.forgetGone)(kept, merged);
                        })
                        // A session waiting on a step hears its tick, whoever asked for it first.
                    ];
                case 4:
                    _c.sent();
                    return [4 /*yield*/, $.session.id()];
                case 5:
                    me = _c.sent();
                    _a = your_steps_1.activeSteps;
                    return [4 /*yield*/, (0, claude_code_1.read)($, yourSteps)];
                case 6:
                    known = _a.apply(void 0, [_c.sent()]);
                    waitedOn = new Set(goals.filter(function (goal) { return goal.status === 'waiting'; }).flatMap(function (goal) { return (0, goals_1.stepsFor)(goal, known).map(function (step) { return step.id; }); }));
                    if (!known.some(function (step) { return waitedOn.has(step.id) && step.askedIn !== me; })) return [3 /*break*/, 8];
                    return [4 /*yield*/, changeYourSteps($, function (list) { return (0, your_steps_1.adopt)(list, waitedOn, me); })];
                case 7:
                    _c.sent();
                    _c.label = 8;
                case 8: return [4 /*yield*/, publishCard($)];
                case 9:
                    _c.sent();
                    done = goals.filter(function (goal) { return goal.status === 'done'; }).length;
                    return [4 /*yield*/, (0, claude_code_1.read)($, yourSteps)];
                case 10:
                    steps = _c.sent();
                    unmatched = goals.filter(function (goal) { return goal.status === 'waiting' && (0, goals_1.stepsFor)(goal, steps).length === 0; });
                    hint = unmatched.length > 0
                        ? "\n\n".concat(unmatched.map(function (goal) { return "\"".concat(goal.title, "\""); }).join(', '), " waits on no known step of the person: add the step with ").concat(your_steps_1.YOUR_STEPS_TOOL, " and name its id in \"waitingFor\".")
                        : '';
                    return [2 /*return*/, { result: "Overview updated: ".concat(done, " of ").concat(goals.length, " done.").concat(hint) }];
            }
        });
    }); });
    on('tool.call', { tool: 'mcp__overview__your_steps' }, function ($, e) { return __awaiter(void 0, void 0, void 0, function () {
        var ops, _a, base, dropped, _i, _b, step, made, now, unknown, added, archived, refused, before, session, touched, list, reopened, _c, _d, _e, titleOf, _f, _g, _h, _j, warning;
        var _k, _l;
        return __generator(this, function (_m) {
            switch (_m.label) {
                case 0:
                    ops = (0, your_steps_1.parseOps)(e);
                    if (!(0, your_steps_1.isEmpty)(ops)) return [3 /*break*/, 2];
                    _k = {};
                    _a = your_steps_1.describeList;
                    return [4 /*yield*/, loadYourSteps($)];
                case 1: return [2 /*return*/, (_k.result = _a.apply(void 0, [_m.sent()]), _k)];
                case 2: return [4 /*yield*/, repoBase($)];
                case 3:
                    base = _m.sent();
                    dropped = [];
                    for (_i = 0, _b = __spreadArray(__spreadArray([], ops.add, true), ops.update, true); _i < _b.length; _i++) {
                        step = _b[_i];
                        if (step.sources === undefined)
                            continue;
                        made = (0, your_steps_1.linksFor)(step.sources, base);
                        step.links = made.links;
                        dropped.push.apply(dropped, made.dropped);
                    }
                    return [4 /*yield*/, $.clock.now()];
                case 4:
                    now = _m.sent();
                    unknown = [];
                    added = [];
                    archived = [];
                    refused = [];
                    return [4 /*yield*/, loadYourSteps($)];
                case 5:
                    before = _m.sent();
                    return [4 /*yield*/, $.session.id()];
                case 6:
                    session = _m.sent();
                    touched = new Set(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], ops.update.map(function (one) { return one.id; }), true), ops.archive.map(function (one) { return one.id; }), true), ops.confirm.map(function (one) { return one.id; }), true), ops.reopen.map(function (one) { return one.id; }), true));
                    return [4 /*yield*/, settle($, function (note) { return note.kind === 'step' && note.stepId !== undefined && touched.has(note.stepId); })];
                case 7:
                    _m.sent();
                    return [4 /*yield*/, changeYourSteps($, function (steps) {
                            var applied = (0, your_steps_1.applyOps)(steps, ops, now, function () { return crypto.randomUUID().slice(0, 6); }, session);
                            unknown = applied.unknown;
                            added = applied.added;
                            archived = applied.archived;
                            refused = applied.refused;
                            return applied.list;
                        })];
                case 8:
                    list = _m.sent();
                    reopened = ops.reopen.flatMap(function (one) {
                        var step = before.find(function (found) { return found.id === one.id; });
                        return step === undefined ? [] : [{ title: step.title, note: one.note }];
                    });
                    _c = notifyPhone;
                    _d = [$];
                    _e = your_steps_1.phoneLine;
                    return [4 /*yield*/, (0, claude_code_1.read)($, projectLabel)];
                case 9: return [4 /*yield*/, _c.apply(void 0, _d.concat([_e.apply(void 0, [_m.sent(), added, reopened])]))];
                case 10:
                    _m.sent();
                    titleOf = function (id) { var _a; return (_a = before.find(function (step) { return step.id === id; })) === null || _a === void 0 ? void 0 : _a.title; };
                    _f = recordChanges;
                    _g = [$];
                    return [4 /*yield*/, projectKey($)];
                case 11: return [4 /*yield*/, _f.apply(void 0, _g.concat([_m.sent(), __spreadArray(__spreadArray(__spreadArray([], ops.confirm.flatMap(function (one) { return (titleOf(one.id) ? [{ at: now, text: "".concat(titleOf(one.id), " \u2192 Done"), tone: 'done' }] : []); }), true), reopened.map(function (one) { return ({ at: now, text: "".concat(one.title, " \u2192 Not done yet"), tone: 'stuck' }); }), true), archived.map(function (one) { return ({ at: now, text: "Claude archived: ".concat(one.title, " (").concat(one.archivedWhy === 'done' ? 'done' : 'obsolete', ")"), tone: 'info' }); }), true)]))];
                case 12:
                    _m.sent();
                    if (!(archived.length > 0)) return [3 /*break*/, 15];
                    _h = offerUndo;
                    _j = [$];
                    _l = {};
                    return [4 /*yield*/, projectKey($)];
                case 13: return [4 /*yield*/, _h.apply(void 0, _j.concat([(_l.key = _m.sent(), _l.ids = archived.map(function (one) { return one.id; }), _l.titles = archived.map(function (one) { return one.title; }), _l.by = 'claude', _l.at = now, _l)]))];
                case 14:
                    _m.sent();
                    _m.label = 15;
                case 15:
                    warning = (unknown.length > 0 ? "\n\nUnknown ids, nothing changed for them: ".concat(unknown.join(', '), ".") : '') +
                        (refused.length > 0 ? "\n\nNot archived: ".concat(refused.map(function (one) { return "".concat(one.id, " (").concat(one.reason, ")"); }).join('; '), ".") : '') +
                        (archived.length > 0 ? "\n\nArchived: ".concat(archived.map(function (one) { return one.id; }).join(', '), ". The person can undo it.") : '') +
                        (dropped.length > 0
                            ? "\n\nSources left out (not an https address, or a repository file outside GitHub): ".concat(dropped.join(', '), ".")
                            : '');
                    return [2 /*return*/, { result: (0, your_steps_1.describeList)(list) + warning }];
            }
        });
    }); });
    on('prompt.submit', function ($, e, next) { return __awaiter(void 0, void 0, void 0, function () {
        var typed_1, ticks, waiting_1, _a, _b, _c, _d, error_5, error_6;
        var _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    ensureSweep($);
                    return [4 /*yield*/, (0, claude_code_1.update)($, isWorking, function () { return true; })];
                case 1:
                    _f.sent();
                    callsSinceGoals = 0;
                    if (!!NOT_THE_PERSON.has(e.origin.kind)) return [3 /*break*/, 5];
                    return [4 /*yield*/, (0, claude_code_1.update)($, board, function (prev) { return (0, goals_1.archive)(prev !== null && prev !== void 0 ? prev : goals_1.EMPTY); })];
                case 2:
                    _f.sent();
                    return [4 /*yield*/, $.clock.now()];
                case 3:
                    typed_1 = _f.sent();
                    return [4 /*yield*/, (0, claude_code_1.update)($, activeAt, function () { return typed_1; })];
                case 4:
                    _f.sent();
                    _f.label = 5;
                case 5:
                    if (!!(e.origin.kind === 'plugin' && e.origin.name === 'overview')) return [3 /*break*/, 15];
                    _f.label = 6;
                case 6:
                    _f.trys.push([6, 14, , 15]);
                    _a = your_steps_1.ticksFor;
                    return [4 /*yield*/, loadYourSteps($)];
                case 7:
                    _b = [_f.sent()];
                    return [4 /*yield*/, $.session.id()];
                case 8:
                    _b = _b.concat([_f.sent()]);
                    return [4 /*yield*/, projectKey($)];
                case 9:
                    _b = _b.concat([_f.sent()]);
                    return [4 /*yield*/, liveSessions($)];
                case 10:
                    waiting_1 = _a.apply(void 0, _b.concat([_f.sent()]));
                    if (!(waiting_1.length > 0)) return [3 /*break*/, 13];
                    return [4 /*yield*/, changeYourSteps($, function (steps) { return (0, your_steps_1.markHeard)(steps, waiting_1); })];
                case 11:
                    _f.sent();
                    _c = your_steps_1.noteFor;
                    _d = [waiting_1];
                    return [4 /*yield*/, (0, claude_code_1.read)($, board)];
                case 12:
                    ticks = _c.apply(void 0, _d.concat([(_f.sent()).goals]));
                    _f.label = 13;
                case 13: return [3 /*break*/, 15];
                case 14:
                    error_5 = _f.sent();
                    $.ui.log("overview: ".concat(String(error_5)), { to: 'debug' });
                    return [3 /*break*/, 15];
                case 15:
                    _f.trys.push([15, 17, , 19]);
                    return [4 /*yield*/, next(ticks === undefined ? e : __assign(__assign({}, e), { context: __spreadArray(__spreadArray([], ((_e = e.context) !== null && _e !== void 0 ? _e : []), true), [ticks], false) }))];
                case 16: return [2 /*return*/, _f.sent()];
                case 17:
                    error_6 = _f.sent();
                    // The prompt never started a turn: Claude is not working after all.
                    return [4 /*yield*/, (0, claude_code_1.update)($, isWorking, function () { return false; })];
                case 18:
                    // The prompt never started a turn: Claude is not working after all.
                    _f.sent();
                    throw error_6;
                case 19: return [2 /*return*/];
            }
        });
    }); });
    on('turn.complete', function ($, e, next) { return __awaiter(void 0, void 0, void 0, function () {
        var queued;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(e.agentId === undefined)) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, claude_code_1.update)($, isWorking, function () { return false; })];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [4 /*yield*/, refreshHelpers($)];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, publishCard($)];
                case 4:
                    _a.sent();
                    if (!(e.agentId === undefined)) return [3 /*break*/, 7];
                    return [4 /*yield*/, (0, claude_code_1.read)($, notes)];
                case 5:
                    queued = (_a.sent()).filter(function (note) { return note.status === 'queued'; });
                    if (!(queued.length > 0)) return [3 /*break*/, 7];
                    return [4 /*yield*/, deliverNotes($, queued.map(function (note) { return note.item; }))];
                case 6:
                    _a.sent();
                    _a.label = 7;
                case 7: return [2 /*return*/, next(e)];
            }
        });
    }); });
    on('session.end', function ($, e, next) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, $.store.delete("".concat(activity_1.SESSION_PREFIX).concat(e.sessionId))];
                case 1:
                    _a.sent();
                    lastCard = '';
                    if (!(e.reason === 'clear')) return [3 /*break*/, 5];
                    return [4 /*yield*/, (0, claude_code_1.update)($, board, function () { return goals_1.EMPTY; })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, (0, claude_code_1.update)($, isWorking, function () { return false; })];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, (0, claude_code_1.update)($, activity, function () { return ({}); })];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5: return [2 /*return*/, next(e)];
            }
        });
    }); });
    on('ui.render', { component: 'ToolUse' }, function ($, e, next) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, Box, Text, isShown, goals, done, active, waits;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _a = $.ui.resolve(e), Box = _a.Box, Text = _a.Text;
                    if (e.props.tool === your_steps_1.YOUR_STEPS_TOOL) {
                        return [2 /*return*/, (<Box>
          <Text dimColor wrap="truncate-end">
            {(0, your_steps_1.summarizeCall)(e.props.input)}
          </Text>
        </Box>)];
                    }
                    if (!(e.props.tool !== goals_1.GOALS_TOOL)) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, claude_code_1.read)($, showSteps)];
                case 1:
                    isShown = (_c.sent()) || isForThePerson(e.props.tool, e.props.input);
                    return [2 /*return*/, isShown ? next(e) : <Box display="none"/>];
                case 2:
                    goals = (0, goals_1.parseGoals)((_b = e.props.input) === null || _b === void 0 ? void 0 : _b.goals);
                    done = goals.filter(function (goal) { return goal.status === 'done'; }).length;
                    active = goals.find(function (goal) { return goal.status === 'active'; });
                    waits = goals.some(function (goal) { return goal.status === 'waiting'; });
                    return [2 /*return*/, (<Box>
        <Text dimColor wrap="truncate-end">
          Overview · {done} of {goals.length} done{active ? " \u00B7 ".concat(active.title) : ''}
          {waits ? ' · waiting for you' : ''}
        </Text>
      </Box>)];
            }
        });
    }); });
    on('ui.render', { component: 'ToolResult' }, function ($, e, next) { return __awaiter(void 0, void 0, void 0, function () {
        var Box, _a, tool, id, isShown, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    Box = $.ui.resolve(e).Box;
                    _a = e.props, tool = _a.tool, id = _a.tool_use_id;
                    _b = tool !== goals_1.GOALS_TOOL &&
                        tool !== your_steps_1.YOUR_STEPS_TOOL;
                    if (!_b) return [3 /*break*/, 6];
                    return [4 /*yield*/, (0, claude_code_1.read)($, showSteps)];
                case 1:
                    _c = (_e.sent());
                    if (_c) return [3 /*break*/, 5];
                    if (!(tool === 'Artifact')) return [3 /*break*/, 3];
                    return [4 /*yield*/, (0, claude_code_1.read)($, shownCalls)];
                case 2:
                    _d = (_e.sent()).includes(id);
                    return [3 /*break*/, 4];
                case 3:
                    _d = isForThePerson(tool, null);
                    _e.label = 4;
                case 4:
                    _c = (_d);
                    _e.label = 5;
                case 5:
                    _b = (_c);
                    _e.label = 6;
                case 6:
                    isShown = _b;
                    return [2 /*return*/, isShown ? next(e) : <Box display="none"/>];
            }
        });
    }); });
    on('ui.render', { component: 'UserMessage', props: { origin: { kind: 'plugin' } } }, function ($, e, next) {
        var _a = e.props, origin = _a.origin, text = _a.text, isExpanded = _a.isExpanded;
        if (origin.kind !== 'plugin' || origin.name !== 'overview' || isExpanded)
            return next(e);
        var _b = $.ui.resolve(e), Box = _b.Box, Text = _b.Text;
        var titles = function (part) {
            return __spreadArray([], part.matchAll(/^- \S+ · (.+?)(?: \(asked: .*?\))?(?: \(the goal .*\))?$/gm), true).map(function (match) { var _a; return ((_a = match[1]) !== null && _a !== void 0 ? _a : '').replace(/ → ".*"$/, ''); });
        };
        var lines = text.split('\n\n').flatMap(function (part) {
            var names = titles(part).join(', ');
            if (part.startsWith('The person answered'))
                return ["\u270E You answered: ".concat(names, " \u00B7 Claude is on it")];
            if (part.startsWith('The person decided')) {
                var picks = __spreadArray([], part.matchAll(/→ "(.+)"/g), true).map(function (match) { return match[1]; }).join(', ');
                return ["\u25C6 You chose: ".concat(picks, " \u00B7 Claude is on it")];
            }
            if (part.startsWith('The person ticked'))
                return ["\u2611 You ticked: ".concat(names, " \u00B7 Claude is checking")];
            if (part.startsWith('The person unticked'))
                return ["\u2610 You took back: ".concat(names, " \u00B7 Claude knows")];
            if (part.startsWith('The person archived'))
                return ["\u229F You archived: ".concat(names, " \u00B7 Claude knows")];
            if (part.startsWith('The person restored'))
                return ["\u21BA You restored: ".concat(names, " \u00B7 Claude knows")];
            if (part.startsWith('The person left'))
                return [(0, notes_1.noteLine)(part)];
            return [];
        });
        return (<Box flexDirection="column">
        {lines.map(function (line, index) { return (<Text key={"said:".concat(index)} dimColor wrap="wrap">
            {line}
          </Text>); })}
      </Box>);
    });
    on('ui.render', { component: 'ToolGroup' }, function ($, e, next) { return __awaiter(void 0, void 0, void 0, function () {
        var Box;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    Box = $.ui.resolve(e).Box;
                    return [4 /*yield*/, (0, claude_code_1.read)($, showSteps)];
                case 1: return [2 /*return*/, (_a.sent()) ? next(e) : <Box display="none"/>];
            }
        });
    }); });
    on('ui.render', { component: 'ToolProgress' }, function ($, e, next) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, claude_code_1.read)($, showSteps)];
            case 1: return [2 /*return*/, (_a.sent()) ? next(e) : next(__assign(__assign({}, e), { props: __assign(__assign({}, e.props), { hint: '' }) }))];
        }
    }); }); });
    on('ui.render', { component: 'Spinner' }, function ($, e, next) { return __awaiter(void 0, void 0, void 0, function () {
        var active;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, claude_code_1.read)($, showSteps)];
                case 1:
                    if (_a.sent())
                        return [2 /*return*/, next(e)];
                    return [4 /*yield*/, (0, claude_code_1.read)($, board)];
                case 2:
                    active = (_a.sent()).goals.find(function (goal) { return goal.status === 'active'; });
                    if (active !== undefined)
                        return [2 /*return*/, next(__assign(__assign({}, e), { props: __assign(__assign({}, e.props), { message: active.title }) }))];
                    if (e.surface === 'desktop')
                        return [2 /*return*/, next(__assign(__assign({}, e), { props: __assign(__assign({}, e.props), { message: 'Working' }) }))];
                    return [2 /*return*/, next(e)];
            }
        });
    }); });
    on('ui.render', { component: 'Pane', requestId: PANE }, function ($, e) { return __awaiter(void 0, void 0, void 0, function () {
        var table, Box, Button, Link, Markdown, Text, Input, map, feed, projectName, _a, summary, goals, earlier, working, stepsShown, mine, others, helping, sessions, log, opened, open, expanded, editBox, problem, itemNotes, undoable, search, filter, own, clock, me, live, _b, pickupFor, inner, projectTitle, TONE, shelf, openSteps, groups, confirmed, overdue, planned, done, isAllDone, isBlockedOnYou, activeGoal, waitingGoal, percent, state, clockText, card, label, fold, itemLine, itemEdit, deadline, stepMore, stepAbout, stepItem, stepCard, goalActions, goalItem, barWidth, filled, recent, toneOfChange, plan, milestoneTone, nowCard, answerDay, fortnight, callsNow, actions, byUrgency, isNew, newSteps, nowGroups, laterSteps, nowCount, hotkeys, moveTone, archivedRow, undoShown, undoBar, isNarrowed, matches, counts, finder, found, yourCard, goalsPart, hasMap, planActive, partTone, partWord, columns, partWidth, partCard, mapPart, elsewhere, elsewhereCard;
        var _c;
        var _d, _e, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    table = $.ui.resolve(e);
                    Box = table.Box, Button = table.Button, Link = table.Link, Markdown = table.Markdown, Text = table.Text;
                    Input = e.surface !== 'mobile' && 'Input' in table ? table.Input : undefined;
                    return [4 /*yield*/, (0, claude_code_1.read)($, projectMap)];
                case 1:
                    map = _g.sent();
                    return [4 /*yield*/, (0, claude_code_1.read)($, changes)];
                case 2:
                    feed = _g.sent();
                    return [4 /*yield*/, (0, claude_code_1.read)($, projectLabel)];
                case 3:
                    projectName = _g.sent();
                    return [4 /*yield*/, (0, claude_code_1.read)($, board)];
                case 4:
                    _a = _g.sent(), summary = _a.summary, goals = _a.goals, earlier = _a.earlier;
                    return [4 /*yield*/, (0, claude_code_1.read)($, isWorking)];
                case 5:
                    working = _g.sent();
                    return [4 /*yield*/, (0, claude_code_1.read)($, showSteps)];
                case 6:
                    stepsShown = _g.sent();
                    return [4 /*yield*/, (0, claude_code_1.read)($, yourSteps)];
                case 7:
                    mine = _g.sent();
                    return [4 /*yield*/, (0, claude_code_1.read)($, otherProjects)];
                case 8:
                    others = _g.sent();
                    return [4 /*yield*/, (0, claude_code_1.read)($, helpers)];
                case 9:
                    helping = _g.sent();
                    return [4 /*yield*/, (0, claude_code_1.read)($, otherSessions)];
                case 10:
                    sessions = _g.sent();
                    return [4 /*yield*/, (0, claude_code_1.read)($, activity)];
                case 11:
                    log = _g.sent();
                    return [4 /*yield*/, (0, claude_code_1.read)($, openGoals)];
                case 12:
                    opened = _g.sent();
                    return [4 /*yield*/, (0, claude_code_1.read)($, unfolded)];
                case 13:
                    open = _g.sent();
                    return [4 /*yield*/, (0, claude_code_1.read)($, openedSteps)];
                case 14:
                    expanded = _g.sent();
                    return [4 /*yield*/, (0, claude_code_1.read)($, editing)];
                case 15:
                    editBox = _g.sent();
                    return [4 /*yield*/, (0, claude_code_1.read)($, editProblem)];
                case 16:
                    problem = _g.sent();
                    return [4 /*yield*/, (0, claude_code_1.read)($, notes)];
                case 17:
                    itemNotes = _g.sent();
                    return [4 /*yield*/, (0, claude_code_1.read)($, lastArchive)];
                case 18:
                    undoable = _g.sent();
                    return [4 /*yield*/, (0, claude_code_1.read)($, stepSearch)];
                case 19:
                    search = _g.sent();
                    return [4 /*yield*/, (0, claude_code_1.read)($, stepFilter)];
                case 20:
                    filter = _g.sent();
                    return [4 /*yield*/, (0, claude_code_1.read)($, project)];
                case 21:
                    own = _g.sent();
                    return [4 /*yield*/, $.clock.now()];
                case 22:
                    clock = _g.sent();
                    return [4 /*yield*/, $.session.id()];
                case 23:
                    me = _g.sent();
                    _b = [__spreadArray([], sessions, true)];
                    _c = { id: me, key: own };
                    return [4 /*yield*/, (0, claude_code_1.read)($, activeAt)];
                case 24:
                    live = __spreadArray.apply(void 0, _b.concat([[(_c.activeAt = _g.sent(), _c)], false]));
                    pickupFor = function (step, at) {
                        var _a, _b;
                        var hearer = (0, routing_1.hearerOf)(step, at, live);
                        var label = at === own ? projectName : ((_b = (_a = others.find(function (one) { return one.key === at; })) === null || _a === void 0 ? void 0 : _a.label) !== null && _b !== void 0 ? _b : 'its project');
                        return (0, routing_1.pickupLine)(hearer, me, live, label, step.askedIn !== undefined && step.askedIn !== hearer);
                    };
                    inner = Math.max(12, e.props.bodyColumns - 4);
                    projectTitle = projectName !== '' ? projectName.charAt(0).toUpperCase() + projectName.slice(1) : 'This project';
                    TONE = {
                        claude: { color: 'claude', icon: '●' },
                        call: { color: 'error', icon: '◆' },
                        overdue: { color: 'error', icon: '⚠' },
                        soon: { color: 'warning', icon: '⏱' },
                        waiting: { color: 'warning', icon: '◐' },
                        fresh: { color: 'suggestion', icon: '✦' },
                        later: { color: 'inactive', icon: '○' },
                        done: { color: 'success', icon: '✓' },
                        plan: { color: 'permission', icon: '◉' },
                        note: { color: 'suggestion', icon: '✎' },
                        elsewhere: { color: 'promptBorder', icon: '⋯' },
                    };
                    shelf = (0, your_steps_1.archivedSteps)(mine);
                    openSteps = (0, your_steps_1.activeSteps)(mine).filter(function (step) { return step.status !== 'done'; });
                    groups = (0, your_steps_1.groupSteps)(openSteps, clock);
                    confirmed = (0, your_steps_1.activeSteps)(mine)
                        .filter(function (step) { return step.status === 'done'; })
                        .sort(function (a, b) { var _a, _b; return ((_a = b.doneAt) !== null && _a !== void 0 ? _a : 0) - ((_b = a.doneAt) !== null && _b !== void 0 ? _b : 0); })
                        .slice(0, 3);
                    overdue = (_e = (_d = groups.find(function (group) { return group.id === 'overdue'; })) === null || _d === void 0 ? void 0 : _d.steps.length) !== null && _e !== void 0 ? _e : 0;
                    planned = goals.filter(function (goal) { return goal.status === 'planned'; });
                    done = goals
                        .filter(function (goal) { return goal.status === 'done'; })
                        .sort(function (a, b) { var _a, _b; return ((_a = b.doneAt) !== null && _a !== void 0 ? _a : 0) - ((_b = a.doneAt) !== null && _b !== void 0 ? _b : 0); });
                    isAllDone = goals.length > 0 && done.length === goals.length;
                    isBlockedOnYou = goals.some(function (goal) { return (0, goals_1.isBlocked)(goal, mine); });
                    activeGoal = goals.find(function (goal) { return goal.status === 'active'; });
                    waitingGoal = goals.find(function (goal) { return (0, goals_1.isBlocked)(goal, mine); });
                    percent = goals.length === 0 ? 0 : Math.round((((activeGoal === null || activeGoal === void 0 ? void 0 : activeGoal.progress) !== undefined ? done.length + activeGoal.progress / 100 : done.length) / goals.length) * 100);
                    state = isAllDone
                        ? { tone: 'done', text: 'ALL DONE' }
                        : working
                            ? { tone: 'claude', text: 'WORKING' }
                            : isBlockedOnYou
                                ? { tone: 'waiting', text: 'WAITING FOR YOU' }
                                : helping.length > 0
                                    ? { tone: 'elsewhere', text: 'HELPERS WORKING' }
                                    : goals.length > 0
                                        ? { tone: 'later', text: 'PAUSED · YOUR TURN' }
                                        : { tone: 'later', text: 'READY WHEN YOU ARE' };
                    clockText = function (at) {
                        var date = new Date(at);
                        var time = "".concat(String(date.getHours()).padStart(2, '0'), ":").concat(String(date.getMinutes()).padStart(2, '0'));
                        return (0, your_steps_1.dayOf)(at) === (0, your_steps_1.dayOf)(clock) ? time : "".concat((0, your_steps_1.dayName)((0, your_steps_1.dayOf)(at)).split(' ')[0], " ").concat(time);
                    };
                    card = function (key, tone, title, note, body) { return (<Box key={"card:".concat(key)} flexDirection="column" borderStyle="round" borderColor={TONE[tone].color} paddingX={1} marginTop={1}>
        <Box key={"head:".concat(key)} justifyContent="space-between">
          <Text bold color={TONE[tone].color} wrap="truncate-end">
            {TONE[tone].icon} {title}
          </Text>
          {note !== undefined && <Text dimColor> {note}</Text>}
        </Box>
        {body}
      </Box>); };
                    label = function (key, text, tone) { return (<Box key={"label:".concat(key)} marginTop={1}>
        <Text bold color={tone ? TONE[tone].color : undefined} dimColor={tone === undefined || tone === 'later'}>
          {tone ? "".concat(TONE[tone].icon, " ") : ''}
          {text}
        </Text>
      </Box>); };
                    fold = function (part, text) { return (<Box key={"fold:".concat(part)} marginTop={1}>
        <Button key={"fold:".concat(part)} plain dimColor label={"".concat(open.includes(part) ? '▾' : '▸', " ").concat(text)} onPress={function () { return toggleFold($, part); }}/>
      </Box>); };
                    itemLine = function (where, ref, lead, title, trail) { return (<Box key={"line:".concat(where, ":").concat(ref.item)} flexDirection="row">
        {lead}
        <Box key={"title:".concat(where, ":").concat(ref.item)} flexGrow={1} flexShrink={1}>
          {title}
        </Box>
        {trail}
        <Box key={"edit-at:".concat(where, ":").concat(ref.item)} marginLeft={1}>
          <Button key={"edit:".concat(where, ":").concat(ref.item)} plain dimColor={editBox !== "".concat(where, "::").concat(ref.item)} label="✎" onPress={function () { return toggleEdit($, "".concat(where, "::").concat(ref.item)); }}/>
        </Box>
      </Box>); };
                    itemEdit = function (where, ref) {
                        var box = "".concat(where, "::").concat(ref.item);
                        var note = itemNotes.find(function (one) { return one.item === ref.item; });
                        var isOpen = editBox === box;
                        var status = note === undefined
                            ? null
                            : note.status === 'sending'
                                ? <Text color={TONE.note.color} wrap="wrap">✎ Sending your note to Claude…</Text>
                                : note.status === 'queued'
                                    ? <Text color={TONE.note.color} wrap="wrap">✎ Note queued · Claude reads it at its next step</Text>
                                    : note.status === 'sent'
                                        ? <Text color={TONE.note.color} wrap="wrap">{note.sentTo !== undefined ? "\u270E Note sent to ".concat(note.sentTo) : '✎ Note sent · Claude is reworking this'}</Text>
                                        : (<Box key={"note-error:".concat(where, ":").concat(ref.item)} flexDirection="column">
                      <Text color="error" wrap="wrap">
                        ⚠ Your note was not sent{note.error ? ": ".concat(note.error) : ''}
                      </Text>
                      <Box key={"note-actions:".concat(where, ":").concat(ref.item)} columnGap={2}>
                        <Button key={"note-retry:".concat(where, ":").concat(ref.item)} plain label="↻ Retry" onPress={function () { return retryNote($, ref.item); }}/>
                        <Button key={"note-drop:".concat(where, ":").concat(ref.item)} plain dimColor label="✕ Discard" onPress={function () { return dropNote($, ref.item); }}/>
                      </Box>
                    </Box>);
                        return (<Box key={"edit-box:".concat(where, ":").concat(ref.item)} flexDirection="column" paddingLeft={2}>
          {note !== undefined && !isOpen && (<Box key={"note:".concat(where, ":").concat(ref.item)} flexDirection="column">
              {status}
              <Text dimColor wrap="wrap">
                « {note.text} »
              </Text>
            </Box>)}
          {isOpen && (<Box key={"editor:".concat(where, ":").concat(ref.item)} flexDirection="column" borderStyle="round" borderColor={TONE.note.color} paddingX={1}>
              <Box key={"editor-head:".concat(where, ":").concat(ref.item)} justifyContent="space-between">
                <Text bold color={TONE.note.color}>
                  ✎ Tell Claude what to change
                </Text>
                <Button key={"edit-close:".concat(where, ":").concat(ref.item)} plain dimColor role="dismiss" label="✕" onPress={function () { return closeEdit($); }}/>
              </Box>
              <Text dimColor wrap="wrap">
                No longer relevant, needs rework, wrong date… Claude reworks the item with your note.
              </Text>
              {Input !== undefined ? (<Input key={"note-input:".concat(where, ":").concat(ref.item)} placeholder="Your note for Claude…" value={(note === null || note === void 0 ? void 0 : note.status) === 'error' ? note.text : undefined} submitLabel="send to Claude" autoFocus onSubmit={function (words) { return sendNote($, box, ref, words); }}/>) : (<Text color="warning" wrap="wrap">
                  This app has no text box: write your note in the conversation.
                </Text>)}
              {problem === box && (<Text color="error" wrap="wrap">
                  ⚠ Type what should change first, or close the box with ✕.
                </Text>)}
            </Box>)}
        </Box>);
                    };
                    deadline = function (step) {
                        var _a, _b;
                        var day = (_a = step.due) !== null && _a !== void 0 ? _a : (_b = step.decideBy) === null || _b === void 0 ? void 0 : _b.slice(0, 10);
                        if (day === undefined || step.status !== 'todo')
                            return null;
                        var _c = (0, your_steps_1.dueText)(day, clock), text = _c.text, isPressing = _c.isPressing;
                        var tone = text.startsWith('overdue') ? 'overdue' : isPressing ? 'soon' : 'later';
                        return (<Text key={"due:".concat(step.id)} color={TONE[tone].color} dimColor={tone === 'later'} wrap="wrap">
          {tone === 'later' ? '⏱' : TONE[tone].icon} {text}
        </Text>);
                    };
                    stepMore = function (step) {
                        var _a;
                        var links = (_a = step.links) !== null && _a !== void 0 ? _a : [];
                        if (step.more === undefined && links.length === 0)
                            return null;
                        var isOpen = expanded.includes(step.id);
                        return (<Box key={"more:".concat(step.id)} flexDirection="column">
          <Button key={"more:".concat(step.id)} plain dimColor={!isOpen} label={isOpen ? '▾ Less' : links.length > 0 && step.more === undefined ? '▸ Where to read more' : '▸ More'} onPress={function () { return toggleStepOpen($, step.id); }}/>
          {isOpen && (<Box key={"more-card:".concat(step.id)} flexDirection="column" borderStyle="round" borderColor="subtle" paddingX={1}>
              {step.more !== undefined && <Markdown key={"more-text:".concat(step.id)} text={step.more}/>}
              {links.length > 0 && (<Box key={"more-links:".concat(step.id)} flexDirection="column" marginTop={step.more !== undefined ? 1 : 0}>
                  {links.map(function (link, index) { return (<Box key={"link:".concat(step.id, ":").concat(index)}>
                      <Text color="suggestion">↗ </Text>
                      <Link href={link.url} label={link.label}/>
                    </Box>); })}
                </Box>)}
            </Box>)}
        </Box>);
                    };
                    stepAbout = function (step, pickedUpBy, isBrief) {
                        var _a, _b;
                        // Another open session asked for it: what the person does here goes there.
                        var askedBy = step.askedIn !== undefined && step.askedIn !== me ? sessions.find(function (one) { return one.id === step.askedIn; }) : undefined;
                        var waited = step.due === undefined && step.status === 'todo' ? (0, your_steps_1.waitedText)(step, clock) : undefined;
                        var told = step.answer !== undefined ? 'Claude knows · acting on it' : 'Claude knows · confirming';
                        var isHeard = step.heard === 'checked' && ((_a = step.answer) !== null && _a !== void 0 ? _a : '') === ((_b = step.heardAnswer) !== null && _b !== void 0 ? _b : '');
                        return (<Box key={"about:".concat(step.id)} flexDirection="column" paddingLeft={2}>
          {deadline(step)}
          {askedBy !== undefined && step.status === 'todo' && (<Text key={"asked-in:".concat(step.id)} dimColor wrap="wrap">
              Asked by {(0, routing_1.sessionName)(askedBy)}
            </Text>)}
          {step.choices !== undefined && step.defaultChoice !== undefined && step.status === 'todo' && (<Text dimColor wrap="wrap">
              No answer keeps: {step.defaultChoice}
            </Text>)}
          {waited !== undefined && (<Text dimColor wrap="wrap">
              {waited}
            </Text>)}
          {!isBrief && step.detail !== undefined && step.status === 'todo' && (<Text dimColor wrap="wrap">
              {step.detail}
            </Text>)}
          {step.note !== undefined && step.status === 'todo' && (<Text color="warning" wrap="wrap">
              ↺ Claude: {step.note}
            </Text>)}
          {stepMore(step)}
          {step.status === 'checked' && (<Text color={isHeard ? TONE.done.color : TONE.note.color} wrap="wrap">
              {isHeard ? "\u2713 ".concat(told) : "".concat(step.answer === undefined ? 'Ticked' : step.asks !== undefined ? 'Answered' : 'Picked', " \u00B7 ").concat(pickedUpBy)}
            </Text>)}
        </Box>);
                    };
                    stepItem = function (step, at, where, hotkey, isBrief) {
                        var _a;
                        var ref = { item: "step:".concat(step.id), kind: 'step', title: step.title, stepId: step.id, stepKey: at };
                        var kind = (0, your_steps_1.answerKind)(step);
                        var isChecked = step.status === 'checked';
                        var lead = kind === 'tick' ? (<Box key={"tick-at:".concat(where, ":").concat(step.id)} marginRight={1}>
            <Button key={"".concat(where === 'other' ? 'other' : 'tick', ":").concat(step.id)} plain label={isChecked ? '☑' : '☐'} hotkey={hotkey} onPress={function () { return tickStep($, at, step.id); }}/>
          </Box>) : (<Text key={"icon:".concat(where, ":").concat(step.id)} color={isChecked ? TONE.done.color : kind === 'pick' ? TONE.call.color : TONE.note.color}>
            {isChecked ? '☑ ' : kind === 'pick' ? '◆ ' : '⌨ '}
          </Text>);
                        var title = (<Text bold={!isBrief} dimColor={isChecked} wrap="wrap">
          {step.title}
        </Text>);
                        var archiveButton = step.status === 'done' ? undefined : (<Box key={"archive-at:".concat(where, ":").concat(step.id)} marginLeft={1}>
            <Button key={"archive:".concat(where, ":").concat(step.id)} plain dimColor label="⊟" onPress={function () { return archiveStep($, at, step.id); }}/>
          </Box>);
                        return (<Box key={"row:".concat(where, ":").concat(step.id)} flexDirection="column" marginTop={isBrief ? 0 : 1}>
          {itemLine(where, ref, lead, title, archiveButton)}
          {kind === 'pick' && (<Box key={"choices:".concat(step.id)} flexDirection="row" flexWrap="wrap" columnGap={2} paddingLeft={2}>
              {((_a = step.choices) !== null && _a !== void 0 ? _a : []).map(function (choice, index) { return (<Button key={"".concat(where === 'other' ? 'other-pick' : 'pick', ":").concat(step.id, ":").concat(index)} plain label={"".concat(step.answer === choice ? '●' : '○', " ").concat(choice)} onPress={function () { return chooseStep($, at, step.id, choice); }}/>); })}
            </Box>)}
          {kind === 'type' && (<Box key={"answer-box:".concat(step.id)} flexDirection="column" paddingLeft={2}>
              {step.answer !== undefined && (<Text wrap="wrap">
                  <Text dimColor>Your answer: </Text>« {step.answer} »
                </Text>)}
              {Input !== undefined ? (<Input key={"".concat(where === 'other' ? 'other-answer' : 'answer', ":").concat(step.id)} placeholder={step.answer !== undefined ? 'Type to change your answer' : "".concat(step.asks, "\u2026")} submitLabel="send to Claude" onSubmit={function (words) { return answerStep($, at, step.id, words); }}/>) : (step.answer === undefined && (<Text dimColor wrap="wrap">
                    Answer in the conversation: {step.asks}
                  </Text>))}
            </Box>)}
          {itemEdit(where, ref)}
          {stepAbout(step, pickupFor(step, at), isBrief)}
        </Box>);
                    };
                    stepCard = function (step, tone, hotkey) { return (<Box key={"step-card:".concat(step.id)} flexDirection="column" borderStyle="round" borderColor={TONE[tone].color} borderDimColor paddingX={1} marginTop={1}>
        {stepItem(step, own, 'move', hotkey, false)}
      </Box>); };
                    goalActions = function (goal, where) {
                        var actions = log[goal.title];
                        var count = (0, activity_1.countOf)(actions);
                        if (count === 0)
                            return null;
                        var isOpen = opened.includes(goal.title);
                        return (<Box key={"acts:".concat(where, ":").concat(goal.title)} flexDirection="column" paddingLeft={2}>
          <Button key={"acts:".concat(where, ":").concat(goal.title)} plain dimColor label={"".concat(isOpen ? '▾' : '▸', " ").concat(count === 1 ? '1 thing done' : "".concat(count, " things done"))} onPress={function () { return toggleGoalOpen($, goal.title); }}/>
          {isOpen &&
                                (actions !== null && actions !== void 0 ? actions : []).map(function (action, index) { return (<Text key={"act:".concat(where, ":").concat(goal.title, ":").concat(index)} dimColor={!action.failed} color={action.failed ? 'warning' : undefined} wrap="wrap">
                {'  · '}
                {action.label}
                {action.count > 1 ? " (\u00D7".concat(action.count, ")") : ''}
                {action.failed ? ' — did not work' : ''}
              </Text>); })}
        </Box>);
                    };
                    goalItem = function (goal, where, withActions) {
                        var ref = { item: "goal:".concat(goal.title), kind: 'goal', title: goal.title };
                        var tone = goal.status === 'done' ? 'done' : goal.status === 'active' ? 'claude' : goal.status === 'waiting' ? 'waiting' : 'later';
                        var blocked = (0, goals_1.isBlocked)(goal, mine);
                        var named = (0, goals_1.stepsFor)(goal, mine);
                        return (<Box key={"goal:".concat(where, ":").concat(goal.title)} flexDirection="column">
          {itemLine(where, ref, <Text key={"goal-icon:".concat(where, ":").concat(goal.title)} color={TONE[tone].color}>
              {TONE[tone].icon}{' '}
            </Text>, <Text bold={goal.status === 'active'} dimColor={goal.status === 'done'} wrap="wrap">
              {goal.title}
            </Text>, goal.progress !== undefined && goal.status === 'active' ? (<Text key={"goal-progress:".concat(where, ":").concat(goal.title)} color={TONE.claude.color}>
                {' '}
                {goal.progress}%
              </Text>) : undefined)}
          {goal.status === 'waiting' && (<Box key={"wait:".concat(where, ":").concat(goal.title)} paddingLeft={2}>
              <Text color={blocked ? TONE.waiting.color : TONE.done.color} wrap="wrap">
                {blocked
                                    ? "\u21B3 Waiting for you".concat(named.length > 0 ? ": ".concat(named.filter(function (step) { return step.status === 'todo'; }).map(function (step) { return step.title; }).join(' · ')) : '')
                                    : '↳ You did your part · Claude carries on'}
              </Text>
            </Box>)}
          {itemEdit(where, ref)}
          {withActions && goalActions(goal, where)}
        </Box>);
                    };
                    barWidth = Math.max(8, Math.min(28, inner - 16));
                    filled = Math.round((percent / 100) * barWidth);
                    recent = feed.filter(function (change) { return clock - change.at < 3 * 24 * 60 * 60 * 1000; }).slice(0, 3);
                    toneOfChange = { done: 'done', stuck: 'overdue', progress: 'soon', you: 'note', info: 'plan' };
                    plan = map.milestones.filter(function (_, index) { return index >= Math.max(0, map.milestones.findIndex(function (one) { return one.status === 'active'; }) - 1); }).slice(0, 3);
                    milestoneTone = function (milestone) { return (milestone.status === 'done' ? 'done' : milestone.status === 'active' ? 'plan' : 'later'); };
                    nowCard = card('now', state.tone, state.text, projectTitle, __spreadArray(__spreadArray(__spreadArray(__spreadArray([
                        summary !== '' && summary !== (activeGoal === null || activeGoal === void 0 ? void 0 : activeGoal.title) && (<Box key="aim" marginTop={1}>
          <Text dimColor wrap="wrap">
            {summary}
          </Text>
        </Box>),
                        activeGoal !== undefined || waitingGoal !== undefined ? (<Box key="current" flexDirection="column" marginTop={summary !== '' ? 0 : 1}>
          {goalItem((activeGoal !== null && activeGoal !== void 0 ? activeGoal : waitingGoal), 'now', false)}
        </Box>) : (goals.length === 0 && (<Box key="empty" marginTop={1}>
            <Text dimColor wrap="wrap">
              Goals appear here when Claude starts a task.
            </Text>
          </Box>)),
                        goals.length > 0 && (<Box key="progress" marginTop={1}>
          <Text>
            <Text color={TONE.done.color}>{'█'.repeat(filled)}</Text>
            <Text color="subtle">{'░'.repeat(barWidth - filled)}</Text>
            <Text dimColor>
              {' '}
              {done.length} of {goals.length} done
            </Text>
          </Text>
        </Box>),
                        planned.length > 0 && label('next', 'NEXT', 'later')
                    ], planned.slice(0, 2).map(function (goal) { return goalItem(goal, 'next', false); }), true), [
                        helping.length > 0 && (<Box key="helpers-line" marginTop={1}>
          <Text color={TONE.elsewhere.color} wrap="wrap">
            {TONE.elsewhere.icon} {helping.length === 1 ? '1 helper' : "".concat(helping.length, " helpers")} working in the background
          </Text>
        </Box>),
                        recent.length > 0 && label('just', 'JUST NOW')
                    ], false), recent.map(function (change, index) { return (<Box key={"just:".concat(index)} justifyContent="space-between">
          <Box key={"just-text:".concat(index)} flexShrink={1}>
            <Text wrap="wrap">
              <Text color={TONE[toneOfChange[change.tone]].color}>{TONE[toneOfChange[change.tone]].icon} </Text>
              {change.text}
            </Text>
          </Box>
          <Text dimColor> {clockText(change.at)}</Text>
        </Box>); }), true), [
                        plan.length > 0 && (<Box key="plan" marginTop={1} flexWrap="wrap">
          <Text color={TONE.plan.color} bold>
            {TONE.plan.icon} PLAN{' '}
          </Text>
          {plan.map(function (milestone, index) { return (<Text key={"plan:".concat(index)} wrap="wrap">
              {index > 0 ? <Text color="subtle"> ─ </Text> : ''}
              <Text color={TONE[milestoneTone(milestone)].color}>{TONE[milestoneTone(milestone)].icon} </Text>
              <Text bold={milestone.status === 'active'} dimColor={milestone.status !== 'active'}>
                {milestone.title}
                {milestone.date && milestone.status !== 'done' ? " \u00B7 ".concat((0, your_steps_1.dayName)(milestone.date)) : ''}
              </Text>
            </Text>); })}
        </Box>),
                    ], false));
                    answerDay = function (step) { var _a, _b; return (_b = (_a = step.decideBy) === null || _a === void 0 ? void 0 : _a.slice(0, 10)) !== null && _b !== void 0 ? _b : step.due; };
                    fortnight = (0, your_steps_1.dayOf)(clock + 14 * 24 * 60 * 60 * 1000);
                    callsNow = openSteps
                        .filter(function (step) { return step.choices !== undefined && (answerDay(step) === undefined || answerDay(step) <= fortnight); })
                        .sort(function (a, b) { var _a, _b; return ((_a = answerDay(a)) !== null && _a !== void 0 ? _a : '9999').localeCompare((_b = answerDay(b)) !== null && _b !== void 0 ? _b : '9999'); });
                    actions = openSteps.filter(function (step) { return !callsNow.includes(step); });
                    byUrgency = (0, your_steps_1.groupSteps)(actions, clock);
                    isNew = function (step) { return clock - step.createdAt < 24 * 60 * 60 * 1000; };
                    newSteps = byUrgency.filter(function (group) { return group.id === 'undated'; }).flatMap(function (group) { return group.steps.filter(isNew); });
                    nowGroups = __spreadArray(__spreadArray(__spreadArray([], byUrgency.filter(function (group) { return group.id === 'overdue'; }).map(function (group) { return ({ id: group.id, label: 'OVERDUE', tone: 'overdue', steps: group.steps }); }), true), byUrgency.filter(function (group) { return group.id === 'soon'; }).map(function (group) { return ({ id: group.id, label: 'THIS WEEK', tone: 'soon', steps: group.steps }); }), true), (newSteps.length > 0 ? [{ id: 'undated', label: 'NEW', tone: 'fresh', steps: newSteps }] : []), true);
                    laterSteps = (0, your_steps_1.sortSteps)(byUrgency.flatMap(function (group) { return (group.id === 'later' ? group.steps : group.id === 'undated' ? group.steps.filter(function (step) { return !isNew(step); }) : []); }));
                    nowCount = callsNow.length + nowGroups.reduce(function (sum, group) { return sum + group.steps.length; }, 0);
                    hotkeys = 0;
                    moveTone = overdue > 0 ? 'overdue' : callsNow.length > 0 ? 'call' : nowCount > 0 ? 'soon' : 'done';
                    archivedRow = function (step) {
                        var _a;
                        return (<Box key={"archived:".concat(step.id)} flexDirection="row">
        <Box key={"archived-title:".concat(step.id)} flexGrow={1} flexShrink={1}>
          <Text dimColor wrap="wrap">
            {step.title} · {step.archivedBy === 'claude' ? "archived by Claude (".concat(step.archivedWhy === 'done' ? 'done' : step.archivedWhy, ")") : step.archivedBy === 'auto' ? 'confirmed, archived after a week' : 'archived'} {clockText((_a = step.archivedAt) !== null && _a !== void 0 ? _a : clock)}
          </Text>
        </Box>
        <Box key={"restore-at:".concat(step.id)} marginLeft={1}>
          <Button key={"restore:".concat(step.id)} plain label="↺ Restore" onPress={function () { return restoreStep($, own, step.id); }}/>
        </Box>
      </Box>);
                    };
                    undoShown = undoable !== null && clock - undoable.at < UNDO_MS;
                    undoBar = undoShown && undoable !== null && (<Box key="undo-bar" flexDirection="row" marginTop={1}>
        <Box key="undo-text" flexGrow={1} flexShrink={1}>
          <Text color={TONE.note.color} wrap="wrap">
            ⊟ {undoable.by === 'claude' ? 'Claude archived' : 'Archived'}: {undoable.titles.join(', ')}
          </Text>
        </Box>
        <Box key="undo-actions" marginLeft={1} columnGap={2}>
          <Button key="undo-archive" plain label="↺ Undo" onPress={function () { return void undoArchive($); }}/>
          <Button key="undo-dismiss" plain dimColor label="✕" onPress={function () { return dismissUndo($); }}/>
        </Box>
      </Box>);
                    isNarrowed = search.trim() !== '' || filter !== 'all';
                    matches = (0, your_steps_1.filterSteps)(mine, filter, search, clock);
                    counts = Object.fromEntries(your_steps_1.FILTERS.map(function (one) { return [one.id, (0, your_steps_1.filterSteps)(mine, one.id, '', clock).length]; }));
                    finder = openSteps.length + shelf.length < 2
                        ? []
                        : [
                            Input !== undefined && (<Box key="search" marginTop={1}>
                <Input key="step-search" placeholder="Search your steps…" value={search} onInput={function (words) { return setSearch($, words); }} onSubmit={function (words) { return setSearch($, words); }}/>
              </Box>),
                            <Box key="filters" flexDirection="row" flexWrap="wrap" columnGap={2} marginTop={Input !== undefined ? 0 : 1}>
              {your_steps_1.FILTERS.filter(function (one) { var _a; return one.id === 'all' || one.id === filter || ((_a = counts[one.id]) !== null && _a !== void 0 ? _a : 0) > 0; }).map(function (one) {
                                    var _a;
                                    return (<Button key={"filter:".concat(one.id)} plain dimColor={filter !== one.id} label={"".concat(filter === one.id ? '●' : '○', " ").concat(one.label).concat(one.id === 'all' ? '' : " \u00B7 ".concat((_a = counts[one.id]) !== null && _a !== void 0 ? _a : 0))} onPress={function () { return (one.id === 'all' ? clearSearch($) : setFilter($, one.id)); }}/>);
                                })}
            </Box>,
                        ];
                    found = __spreadArray(__spreadArray([
                        label('found', "FOUND \u00B7 ".concat(matches.length).concat(search.trim() ? " for \u00AB ".concat(search.trim(), " \u00BB") : ''), 'fresh')
                    ], (matches.length === 0
                        ? [
                            <Box key="found-none">
              <Text dimColor wrap="wrap">
                No step matches.
              </Text>
            </Box>,
                        ]
                        : filter === 'archived'
                            ? matches.map(archivedRow)
                            : matches.map(function (step) { return stepItem(step, own, 'found', undefined, true); })), true), [
                        <Box key="found-clear" marginTop={1}>
        <Button key="filter-clear" plain dimColor label="✕ Clear search and filter" onPress={function () { return clearSearch($); }}/>
      </Box>,
                    ], false);
                    yourCard = openSteps.length > 0 || confirmed.length > 0 || shelf.length > 0 || undoShown
                        ? card('yours', moveTone, 'YOUR MOVE', nowCount > 0
                            ? "".concat(nowCount, " now").concat(laterSteps.length > 0 ? " \u00B7 ".concat(laterSteps.length, " later") : '')
                            : laterSteps.length > 0
                                ? "".concat(laterSteps.length, " later")
                                : openSteps.length > 0
                                    ? 'all ticked'
                                    : 'nothing open', __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([
                            openSteps.length > 0 && (<Box key="how" marginTop={1}>
                  <Text dimColor wrap="wrap">
                    ☐ tick when done · ◆ pick one · ⌨ type your answer{Input !== undefined ? ', then Enter' : ' in the conversation'} · ✎ tell Claude what to change · ⊟ archive if no longer relevant
                  </Text>
                </Box>),
                            undoBar
                        ], finder, true), (isNarrowed ? found : []), true), [
                            !isNarrowed && callsNow.length > 0 && label('decide', "NEEDS YOUR CALL \u00B7 ".concat(callsNow.length), 'call')
                        ], false), (isNarrowed ? [] : callsNow.map(function (step) { return stepCard(step, 'call', undefined); })), true), (isNarrowed ? [] : nowGroups).flatMap(function (group) { return __spreadArray([
                            label("group:".concat(group.id), "".concat(group.label, " \u00B7 ").concat(group.steps.length), group.tone)
                        ], group.steps.map(function (step) {
                            hotkeys += 1;
                            return stepCard(step, group.tone, hotkeys <= 9 ? String(hotkeys) : undefined);
                        }), true); }), true), [
                            !isNarrowed && nowCount === 0 && (<Box key="calm" marginTop={1}>
                  <Text color={TONE.done.color} wrap="wrap">
                    {TONE.done.icon} Nothing needed from you this week.
                  </Text>
                </Box>),
                            !isNarrowed && laterSteps.length > 0 && fold('later', "".concat(TONE.later.icon, " Later \u00B7 ").concat(laterSteps.length))
                        ], false), (!isNarrowed && open.includes('later') ? laterSteps.map(function (step) { return stepItem(step, own, 'later', undefined, true); }) : []), true), [
                            !isNarrowed && confirmed.length > 0 && fold('confirmed', "".concat(TONE.done.icon, " Confirmed recently \u00B7 ").concat(confirmed.length))
                        ], false), (!isNarrowed && open.includes('confirmed')
                            ? confirmed.map(function (step) { return (<Box key={"confirmed:".concat(step.id)} flexDirection="column">
                      <Box key={"done-line:".concat(step.id)}>
                        <Text color={TONE.done.color}>{TONE.done.icon} </Text>
                        <Box flexGrow={1} flexShrink={1}>
                          <Text dimColor wrap="wrap">
                            {step.title}
                            {step.answer !== undefined ? " \u00B7 ".concat(step.answer) : ''} · confirmed
                          </Text>
                        </Box>
                      </Box>
                      {step.checked !== undefined && (<Box key={"checked:".concat(step.id)} paddingLeft={2}>
                          <Text dimColor italic wrap="wrap">
                            {step.checked}
                          </Text>
                        </Box>)}
                    </Box>); })
                            : []), true), [
                            !isNarrowed && shelf.length > 0 && fold('archived', "\u229F Archived \u00B7 ".concat(shelf.length))
                        ], false), (!isNarrowed && open.includes('archived') ? shelf.map(archivedRow) : []), true))
                        : null;
                    goalsPart = goals.length + earlier.length === 0
                        ? null
                        : !open.includes('goals')
                            ? fold('goals', goals.length > 0 ? "All goals \u00B7 ".concat(done.length, " of ").concat(goals.length, " done") : "Earlier goals \u00B7 ".concat(earlier.length))
                            : [
                                fold('goals', 'All goals'),
                                card('goals', 'claude', summary !== '' ? summary : 'GOALS', goals.length > 0 ? "".concat(done.length, "/").concat(goals.length) : undefined, __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], goals
                                    .filter(function (goal) { return goal.status !== 'done'; })
                                    .map(function (goal) { return (<Box key={"all:".concat(goal.title)} marginTop={1}>
                      {goalItem(goal, 'all', true)}
                    </Box>); }), true), [
                                    done.length > 0 && label('done', 'DONE', 'done')
                                ], false), done.map(function (goal) { return goalItem(goal, 'done', true); }), true), [
                                    earlier.length > 0 && fold('earlier', "Finished earlier \u00B7 ".concat(earlier.length))
                                ], false), (open.includes('earlier')
                                    ? earlier.map(function (goal, index) { return (<Box key={"earlier:".concat(index, ":").concat(goal.title)}>
                        <Text color={TONE.done.color}>{TONE.done.icon} </Text>
                        <Box flexGrow={1} flexShrink={1}>
                          <Text dimColor wrap="wrap">
                            {goal.title}
                          </Text>
                        </Box>
                      </Box>); })
                                    : []), true)),
                            ];
                    hasMap = map.milestones.length > 0 || map.parts.length > 0;
                    planActive = (_f = map.milestones.find(function (one) { return one.status === 'active'; })) !== null && _f !== void 0 ? _f : map.milestones.find(function (one) { return one.status === 'next'; });
                    partTone = { done: 'done', active: 'soon', stuck: 'overdue', waiting: 'waiting', todo: 'later' };
                    partWord = { done: 'Done', active: 'In progress', stuck: 'Stuck', waiting: 'Waiting on you', todo: 'Not started' };
                    columns = inner >= 60 ? 2 : 1;
                    partWidth = columns === 2 ? Math.floor((inner - 1) / 2) : inner;
                    partCard = function (part) {
                        var _a;
                        var tone = partTone[part.status];
                        var ref = { item: "part:".concat(part.title), kind: 'part', title: part.title };
                        var partBar = Math.max(6, partWidth - 12);
                        var partFilled = Math.round((((_a = part.progress) !== null && _a !== void 0 ? _a : 0) / 100) * partBar);
                        return (<Box key={"part:".concat(part.title)} flexDirection="column" width={partWidth} borderStyle="round" borderColor={TONE[tone].color} borderDimColor={part.status === 'todo' || part.status === 'done'} paddingX={1}>
          {itemLine('map', ref, <Text key={"part-icon:".concat(part.title)} color={TONE[tone].color}>
              {TONE[tone].icon}{' '}
            </Text>, <Text bold dimColor={part.status === 'todo'} wrap="wrap">
              {part.title}
            </Text>)}
          <Text color={TONE[tone].color} wrap="wrap">
            {partWord[part.status]}
            {part.status === 'active' && part.progress !== undefined ? " \u00B7 ".concat(part.progress, "%") : ''}
          </Text>
          {part.status === 'active' && part.progress !== undefined && (<Text>
              <Text color={TONE.soon.color}>{'█'.repeat(partFilled)}</Text>
              <Text color="subtle">{'░'.repeat(partBar - partFilled)}</Text>
            </Text>)}
          {part.note !== undefined && (<Text dimColor wrap="wrap">
              {part.note}
            </Text>)}
          {itemEdit('map', ref)}
        </Box>);
                    };
                    mapPart = !hasMap
                        ? null
                        : !open.includes('map')
                            ? fold('map', "".concat(TONE.plan.icon, " Project map").concat(planActive ? " \u00B7 ".concat(planActive.title) : ''))
                            : [
                                fold('map', "".concat(TONE.plan.icon, " Project map")),
                                card('map', 'plan', "".concat(projectTitle.toUpperCase(), " \u00B7 PROJECT MAP"), map.updatedAt > 0 ? "updated ".concat(clockText(map.updatedAt)) : undefined, __spreadArray(__spreadArray([
                                    map.milestones.length > 0 && label('milestones', 'MILESTONES', 'plan')
                                ], map.milestones.map(function (milestone) {
                                    var tone = milestoneTone(milestone);
                                    var ref = { item: "milestone:".concat(milestone.title), kind: 'milestone', title: milestone.title };
                                    return (<Box key={"milestone:".concat(milestone.title)} flexDirection="column">
                    {itemLine('map', ref, <Text key={"ms-icon:".concat(milestone.title)} color={TONE[tone].color}>
                        {TONE[tone].icon}{' '}
                      </Text>, <Text bold={milestone.status === 'active'} dimColor={milestone.status === 'later'} wrap="wrap">
                        {milestone.title}
                        {milestone.status === 'active' ? ' · you are here' : ''}
                      </Text>, milestone.date ? <Text key={"ms-date:".concat(milestone.title)} dimColor> {(0, your_steps_1.dayName)(milestone.date)}</Text> : undefined)}
                    {itemEdit('map', ref)}
                  </Box>);
                                }), true), [
                                    map.parts.length > 0 && label('parts', "PARTS \u00B7 ".concat(map.parts.filter(function (part) { return part.status === 'done'; }).length, " of ").concat(map.parts.length, " done"), 'plan'),
                                    map.parts.length > 0 && (<Box key="parts-grid" flexDirection="row" flexWrap="wrap" columnGap={1} rowGap={0}>
                  {map.parts.map(partCard)}
                </Box>),
                                ], false)),
                            ];
                    elsewhere = helping.length + sessions.length + others.length;
                    elsewhereCard = elsewhere > 0
                        ? card('elsewhere', 'elsewhere', 'ELSEWHERE', undefined, __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([
                            helping.length > 0 && label('helpers', "HELPERS \u00B7 ".concat(helping.length, " working"))
                        ], helping.map(function (helper) { return (<Text key={"helper:".concat(helper.id)} dimColor wrap="wrap">
                {TONE.elsewhere.icon} {helper.description}
              </Text>); }), true), [
                            sessions.length > 0 && label('sessions', "OTHER SESSIONS \u00B7 ".concat(sessions.length))
                        ], false), sessions.map(function (one) {
                            var tone = one.state === 'waiting' ? 'waiting' : one.state === 'working' ? 'claude' : one.state === 'done' ? 'done' : 'later';
                            return (<Box key={"session:".concat(one.id)} flexDirection="column">
                  <Text bold={one.state === 'waiting'}>
                    <Text color={TONE[tone].color}>{TONE[tone].icon} </Text>
                    {one.project}
                  </Text>
                  <Box key={"session-line:".concat(one.id)} paddingLeft={2}>
                    <Text dimColor wrap="wrap">
                      {(0, activity_1.cardLine)(one)}
                    </Text>
                  </Box>
                </Box>);
                        }), true), [
                            others.length > 0 && label('others', 'OTHER PROJECTS')
                        ], false), others.map(function (other) { return (<Box key={"project:".concat(other.key)} flexDirection="column">
                <Text bold>{other.label}</Text>
                {(0, your_steps_1.sortSteps)(other.steps).map(function (step) { return stepItem(step, other.key, 'other', undefined, true); })}
              </Box>); }), true))
                        : null;
                    return [2 /*return*/, (<Box flexDirection="column">
        {nowCard}
        {yourCard}
        {goalsPart}
        {mapPart}
        {elsewhereCard}
        <Box key="steps" marginTop={1} justifyContent="flex-end">
          <Button key="steps-toggle" label={stepsShown ? 'Hide technical steps' : 'Show technical steps'} hotkey="s" plain dimColor onPress={function () { return setSteps($); }}/>
        </Box>
      </Box>)];
            }
        });
    }); });
};
exports.register = register;
