"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inboxKey = exports.pickupLine = exports.sessionName = exports.hearerOf = exports.heirOf = exports.INBOX_PREFIX = void 0;
exports.INBOX_PREFIX = 'inbox#';
/** The open session of a project the person used last; ties go to the lower id, so every session agrees. */
var heirOf = function (live, key) {
    return live
        .filter(function (session) { return session.key === key; })
        .sort(function (a, b) { var _a, _b; return ((_a = b.activeAt) !== null && _a !== void 0 ? _a : 0) - ((_b = a.activeAt) !== null && _b !== void 0 ? _b : 0) || a.id.localeCompare(b.id); })[0];
};
exports.heirOf = heirOf;
/**
 * The session that hears what the person did on an item of project `key`: the session that asked
 * for it while it is open; else the session the person did it in, when that one is of the
 * project; else the project's last-used open session; undefined when none of its sessions is open
 * (the next one to open hears it).
 */
var hearerOf = function (trail, key, live) {
    var _a;
    var isOpen = function (id) { return id !== undefined && live.some(function (session) { return session.id === id; }); };
    if (isOpen(trail.askedIn))
        return trail.askedIn;
    if (trail.tickedFrom === key && isOpen(trail.tickedIn))
        return trail.tickedIn;
    return (_a = (0, exports.heirOf)(live, key)) === null || _a === void 0 ? void 0 : _a.id;
};
exports.hearerOf = hearerOf;
/** How the pane names another session: what it works on, else its project. */
var sessionName = function (session) {
    var what = (session === null || session === void 0 ? void 0 : session.summary) || (session === null || session === void 0 ? void 0 : session.active);
    return what ? "Claude in \u00AB ".concat(what, " \u00BB") : (session === null || session === void 0 ? void 0 : session.project) ? "Claude in another ".concat(session.project, " session") : 'Claude in another session';
};
exports.sessionName = sessionName;
/** Where an item's tick or note goes, in the pane's words; `label` names the item's project. */
var pickupLine = function (hearer, me, live, label, isClosedOwner) {
    if (hearer === me)
        return isClosedOwner ? 'its session is closed: Claude here will pick it up' : 'Claude will pick it up';
    if (hearer === undefined)
        return "Claude in ".concat(label, " will pick it up in its next session");
    return "".concat((0, exports.sessionName)(live.find(function (session) { return session.id === hearer; })), " will pick it up");
};
exports.pickupLine = pickupLine;
/** The store key of a note waiting for a session (`s`) or for a project's next session (`p`). */
var inboxKey = function (kind, target, item) { return "".concat(exports.INBOX_PREFIX).concat(kind, "#").concat(target, "#").concat(item); };
exports.inboxKey = inboxKey;
