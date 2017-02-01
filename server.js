var WebSocket = require('ws');
var state = require('./state');

var ws = new WebSocket('ws://nuclear.t.javascript.ninja');

ws.on('open', function open() {

});
ws.on('close', function close() {

});
ws.on('error', function error() {

});
ws.on('message', function incoming(msg) {
    onMessage(JSON.parse(msg));
});

// Callbacks
function onMessage(data) {
    //pull liver
    if (!state.run) return false;
    if ('pulled' in data) {
        onStateChanged(data);
        onLeversUpdate(data.pulled);
        pingSocket(null, state.lever1.next(), state.lever2.next());
        tryPoweredOff();
        return false;
    }
    //check livers
    if (data.action && data.action == 'check') {
        onLeversChecked(data.lever1, data.lever2, data.same);
        return false;
    }
    //power off
    if (data.newState && data.newState == 'poweredOff') {
        state.run = false;
        printMessage(">>> poweredOff");
        printMessage(JSON.stringify(data));
        return false;
    }
    //else
    const msg = 'Received Message ' + JSON.stringify(data);
    printMessage(msg)
}
function onLeversChecked(l1, l2, isSame) {
    //console.log("onLeversChecked", l1, l2, isSame);
    setLeversState(l1, l2, isSame)
}

// Stream
function onStateChanged(newState) {
    var stateId = newState.stateId;
    //console.log('onStateChanged: ', stateId);

    state.currentStateId = stateId;
}
function onLeversUpdate(id) {
    if (!isNull(state.levers[id])) {
        state.levers[id] = state.levers[id] == 0 ? 1 : 0;
    }
}
function pingSocket(id, l1, l2) {
    var id = id || state.currentStateId;
    var l1 = l1 || 0;
    var l2 = l2 || 3;

    var msg = {action: "check", "lever1": l1, "lever2": l2, stateId: id };

    sendMessage(msg);
}
function tryPoweredOff() {
    if (isLeversReady()) {
        poweredOffMashine();
        state.powerOffPos = state.powerOffPos == 0 ? 1 : 0;
    }
}

// Helpers
function sendMessage(data) {
    var msg;
    if (typeof data == 'string') {
        msg = data;
    } else {
        msg = JSON.stringify(data);
    }

    ws.send(msg);
}
function printMessage(msg) {
    console.log(">> New message: ", msg);
}
function isNull(n) {
    return n === null;
}
function isLeversReady() {
    return !isNull(state.levers[0]) &&
        (state.levers[0] == state.powerOffPos) &&
        (state.levers[0] == state.levers[1]) &&
        (state.levers[1] == state.levers[2]) &&
        (state.levers[2] == state.levers[3]);
}
function setLeversState(l1, l2, isSame) {
    if (!state.inited ) {
        if (isSame) {
            state.levers[l1] = 0;
            state.levers[l2] = 0;
        } else {
            state.levers[l1] = 0;
            state.levers[l2] = 1;
        }
        state.inited = true;
    } else if (isNull(state.levers[l1])) {
        if (isSame) {
            state.levers[l1] = state.levers[l2] == 0 ? 0 : 1;
        } else {
            state.levers[l1] = state.levers[l2] == 0 ? 1 : 0;
        }
    } else if (isNull(state.levers[l2])) {
        if (isSame) {
            state.levers[l2] = state.levers[l1] == 0 ? 0 : 1;
        } else {
            state.levers[l2] = state.levers[l1] == 0 ? 1 : 0;
        }
    }
}
function poweredOffMashine() {
    var msg = {action: "powerOff", stateId: state.currentStateId};

    printMessage('BOOM!!');
    ws.send(JSON.stringify(msg));
}

state.run = true;
//{"newState":"poweredOff","token":"33c755a8ca0cd30ef4b32c0eca00986c0f4e0eb8857c255347d9337f7b9641e10c4bbc22ec6759315de93249a581e9575cb907628080191449162380d95c4c8e39d4eff454"}