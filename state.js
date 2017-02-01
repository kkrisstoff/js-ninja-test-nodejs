module.exports =  {
    run: false,
    inited: false, //TODO: ?
    powerOffPos: 0,
    currentStateId: null,
    levers: {
        0: null,
        1: null,
        2: null,
        3: null
    },
    lever1: {
        num: 0,
        next: function () {
            return this.num < 3 ? this.num += 1 : 0
        }
    },
    lever2 : {
        num: 1,
        next: function () {
            return this.num < 3 ? this.num += 1 : 0
        }
    }
};
