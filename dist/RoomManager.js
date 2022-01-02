"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomManager = void 0;
const Player_1 = require("./Player");
class RoomManager {
    constructor(server) {
        this.rooms = {};
        this.server = server;
        //this.addRoom("level-1");
    }
    static createEmptyRoom() {
        let room = {
            users: [],
            players: []
        };
        return room;
    }
    getUserInRoomAsPlayer(room, id) {
    }
    userLeaveRooms(user) {
        let room = user.lastroom;
        if (this.rooms[room]) {
            this.rooms[room].players = this.rooms[room].players.filter(e => {
                console.log(e.id, user.id);
                return e.id !== user.id;
            });
        }
        console.log(user.id + " leaving");
        this.server.to(room).emit("playerleave", user.id);
        user.leave(room);
        console.log(user.rooms);
    }
    addUserToRoom(room, socket) {
        this.userLeaveRooms(socket);
        console.log("joining room", room);
        socket.join(room);
        socket.emit("loadlevel", room);
        console.log(socket.rooms);
        socket.lastroom = room;
        if (!this.rooms[room]) {
            this.rooms[room] = RoomManager.createEmptyRoom();
        }
        for (let players of this.rooms[room].players) {
            this.letEntitiesSpawn(socket, players.id, players.x, players.y);
        }
        // this.rooms[room].users.push(socket.id);
        this.rooms[room].players.push(new Player_1.Player(socket.id, socket, this.server, room, this));
        this.server.to(room).emit("playerjoin", socket.id, 0, 0);
    }
    letEntitiesSpawn(destSocket, socketId, x, y) {
        destSocket.emit("playerjoin", socketId, x, y);
    }
    addRoom(name) {
        this.addRoomStruct(name, RoomManager.createEmptyRoom());
    }
    broadcastToRoom(room) {
        return this.server.to(room);
    }
    addRoomStruct(name, room) {
        this.rooms[name] = room;
    }
    getRoomNames() {
        return Object.keys(this.rooms);
    }
    roomExists(name) {
        return this.getRoomNames().includes(name);
    }
}
exports.RoomManager = RoomManager;
