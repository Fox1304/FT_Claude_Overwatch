"use strict";
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
exports.world = exports.allText = exports.unfold = exports.PANE = exports.OTHER_KEY = exports.KEY = void 0;
exports.KEY = 'yourSteps:/work/myapp';
exports.OTHER_KEY = 'yourSteps:/work/otherapp';
exports.PANE = {
    plugin: 'overview',
    component: 'Pane',
    requestId: 'overview',
    props: {
        title: 'Overview',
        isFocused: false,
        bodyColumns: 56,
        placement: 'dock',
        scroll: { offset: 0, bodyRows: 40 },
        view: {},
    },
};
/** Opens folded parts of the pane ("goals", "map", "later", "confirmed") that are drawn and closed. */
var unfold = function (ui) {
    var parts = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        parts[_i - 1] = arguments[_i];
    }
    return __awaiter(void 0, void 0, void 0, function () {
        var _a, parts_1, part, button;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = 0, parts_1 = parts;
                    _b.label = 1;
                case 1:
                    if (!(_a < parts_1.length)) return [3 /*break*/, 5];
                    part = parts_1[_a];
                    return [4 /*yield*/, ui.find({ key: "fold:".concat(part) })];
                case 2:
                    button = _b.sent();
                    if (!(button === null || button === void 0 ? void 0 : button.text.startsWith('▸'))) return [3 /*break*/, 4];
                    return [4 /*yield*/, ui.press({ key: "fold:".concat(part) })];
                case 3:
                    _b.sent();
                    _b.label = 4;
                case 4:
                    _a++;
                    return [3 /*break*/, 1];
                case 5: return [2 /*return*/];
            }
        });
    });
};
exports.unfold = unfold;
/** Every text the pane draws, as one string: what a person can select and copy. */
var allText = function (ui) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
    switch (_a.label) {
        case 0: return [4 /*yield*/, ui.findAll({ type: 'Text' })];
        case 1: return [2 /*return*/, (_a.sent()).map(function (one) { return one.text; }).join('\n')];
    }
}); }); };
exports.allText = allText;
/** The engine beneath the mod: a store, a session in a worktree of myapp (`me`), the phone, helpers, and what reaches Claude. */
var world = function (on, options) {
    if (options === void 0) { options = {}; }
    /** Which session the engine says it is; a test switches it to play another session on the same store. */
    var me = { id: 'S1' };
    var stored = {};
    var prompts = [];
    var phone = [];
    var toasts = [];
    var logs = [];
    var agents = [];
    on('store.get', function ($, e) { return ({ value: stored[e.key] }); });
    on('store.set', function ($, e) {
        stored[e.key] = e.value;
        return { value: undefined };
    });
    on('store.keys', function () { return ({ value: Object.keys(stored) }); });
    on('store.delete', function ($, e) {
        delete stored[e.key];
        return { value: undefined };
    });
    on('ui.log', function ($, e) {
        logs.push(e.text);
        return { value: undefined };
    });
    on('ui.toast', function ($, e) {
        toasts.push(e.text);
        return { value: undefined };
    });
    on('session.id', function () { return ({ value: me.id }); });
    on('session.root', function () { return ({ value: '/work/myapp-worktree' }); });
    on('session.repo', function () { return ({
        value: { root: '/work/myapp', remote: 'git@github.com:octocat/myapp.git', internal: false, name: null },
    }); });
    on('agent.list', function () { return ({ value: agents }); });
    on('prompt.submit', function ($, e) {
        var _a, _b;
        if ((_a = options.failPrompts) === null || _a === void 0 ? void 0 : _a.now)
            return { drop: 'the session is offline' };
        prompts.push({ text: e.text, context: (_b = e.context) !== null && _b !== void 0 ? _b : [] });
        return { text: e.text };
    });
    on('tool.call', { tool: 'mcp__fake__build' }, function () { return ({ result: 'built' }); });
    on('tool.call', { tool: 'PushNotification' }, function ($, e) {
        phone.push(e.message);
        return { result: { message: e.message } };
    });
    var stepsAt = function (key) {
        var _a;
        var value = stored[key];
        return (Array.isArray(value) ? value : ((_a = value === null || value === void 0 ? void 0 : value.steps) !== null && _a !== void 0 ? _a : []));
    };
    return { stored: stored, prompts: prompts, phone: phone, toasts: toasts, logs: logs, agents: agents, me: me, steps: function () { return stepsAt(exports.KEY); }, stepsAt: stepsAt };
};
exports.world = world;
