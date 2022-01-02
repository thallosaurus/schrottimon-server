"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
class Player {
    constructor(socketId, client, socket, room, rm) {
        this.y = 0;
        this.x = 0;
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
                    this.server.to(e).emit("playermove", socketId, this.x, this.y);
                });
            }
        });
    }
}
exports.Player = Player;
