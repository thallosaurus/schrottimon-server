"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Direction = exports.Player = void 0;
class Player {
    constructor(socketId, client, socket, room) {
        this.y = 0;
        this.x = 0;
        this.dir = Direction.DOWN;
        this.moveCooldown = null;
        this.id = socketId;
        this.socket = client;
        this.server = socket;
        this.room = room;
        client.on("moveTo", (x, y, run) => {
            if (this.moveCooldown === null) {
                if (this.room.canMoveThere(x, y)) {
                    console.log("move " + socketId + " to " + x + ", " + y + " in room " + this.room.name);
                    this.dir = findDirection(this.x, this.y, x, y);
                    this.x = x;
                    this.y = y;
                    this.moveCooldown = setTimeout(() => {
                        this.moveCooldown = null;
                    }, run ? 250 : 500);
                    this.server.to(this.room.name).emit("playermove", socketId, this.x, this.y, this.dir, run);
                }
            }
        });
    }
    unload() {
        this.socket.removeAllListeners("moveTo");
    }
}
exports.Player = Player;
function findDirection(x1, y1, x2, y2) {
    // return Direction.LEFT;
    if (x1 === x2 && y1 < y2)
        return Direction.DOWN;
    if (x1 === x2 && y1 > y2)
        return Direction.UP;
    if (x1 < x2 && y1 === y2)
        return Direction.RIGHT;
    if (x1 > x2 && y1 === y2)
        return Direction.LEFT;
    return Direction.UP;
}
var Direction;
(function (Direction) {
    Direction[Direction["DOWN"] = 0] = "DOWN";
    Direction[Direction["UP"] = 1] = "UP";
    Direction[Direction["RIGHT"] = 2] = "RIGHT";
    Direction[Direction["LEFT"] = 3] = "LEFT";
})(Direction = exports.Direction || (exports.Direction = {}));
