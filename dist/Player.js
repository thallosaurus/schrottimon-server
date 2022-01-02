"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Direction = exports.Player = void 0;
class Player {
    constructor(socketId, client, socket, room, rm) {
        this.y = 0;
        this.x = 0;
        this.dir = Direction.DOWN;
        this.moveCooldown = null;
        this.id = socketId;
        this.socket = client;
        this.server = socket;
        this.roomManger = rm;
        this.room = room;
        client.on("moveTo", (x, y) => {
            if (this.moveCooldown === null) {
                console.log("move " + socketId + " to " + x + ", " + y + " in room " + this.room);
                this.x = x;
                this.y = y;
                this.moveCooldown = setTimeout(() => {
                    this.moveCooldown = null;
                }, 250);
                //socket.send(socketId, x, y);
                this.socket.rooms.forEach(e => {
                    this.server.to(e).emit("playermove", socketId, this.x, this.y, this.dir);
                });
            }
        });
    }
}
exports.Player = Player;
var Direction;
(function (Direction) {
    Direction[Direction["DOWN"] = 0] = "DOWN";
    Direction[Direction["UP"] = 1] = "UP";
    Direction[Direction["RIGHT"] = 2] = "RIGHT";
    Direction[Direction["LEFT"] = 3] = "LEFT";
})(Direction = exports.Direction || (exports.Direction = {}));
