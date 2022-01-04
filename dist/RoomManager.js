"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomManager = void 0;
const Room_1 = require("./Room");
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const DEFAULT_MAP = "real_map2_20x20.tmx";
class RoomManager {
    constructor(server, expressApp) {
        this.rooms = {};
        RoomManager.server = server;
        this.setupHttpRoute(expressApp);
    }
    setupHttpRoute(app) {
        const staticPath = path_1.default.resolve(__dirname + "/../static/levels/");
        app.use("/data/levels", express_1.default.static(staticPath));
    }
    static createEmptyRoom(name) {
        return new Room_1.Room(name, this.server);
    }
    userLeaveRooms(user) {
        let room = user.lastroom;
        if (this.roomExists(room)) {
            this.rooms[room].players = this.getRoom(room).players.filter(e => {
                console.log(e.id, user.id);
                if (e.id === user.id) {
                    e.unload();
                }
                return e.id !== user.id;
            });
        }
        console.log(user.id + " leaving");
        RoomManager.server.to(room).emit("playerleave", user.id);
        user.leave(room);
        console.log(user.rooms);
    }
    addSocketToRoom(room, socket) {
        this.userLeaveRooms(socket);
        if (!this.roomExists(room)) {
            this.addRoom(room);
        }
        this.rooms[room].addUser(socket);
        RoomManager.server.to(room).emit("playerjoin", socket.id, 0, 0);
    }
    /**
     * Call this only once for each session as it also sets up the room switch handler
     * @param socket
     */
    addNewConnection(socket) {
        socket.on("room", (room) => {
            console.log("room event");
            this.addSocketToRoom(room, socket);
        });
        this.addSocketToRoom(DEFAULT_MAP, socket);
    }
    addRoom(name) {
        this.addRoomStruct(name, RoomManager.createEmptyRoom(name));
    }
    /*     broadcastToRoom(room: string): BroadcastOperator<ServerToClientEvents> {
            return RoomManager.server.to(room);
        } */
    addRoomStruct(name, room) {
        this.rooms[name] = room;
    }
    getRoom(room) {
        return this.rooms[room];
    }
    getRoomNames() {
        return Object.keys(this.rooms);
    }
    roomExists(name) {
        return this.getRoomNames().includes(name);
    }
}
exports.RoomManager = RoomManager;
