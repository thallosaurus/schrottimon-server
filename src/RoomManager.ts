import { BroadcastOperator, Server, Socket, } from "socket.io";
import { isThisTypeNode } from "typescript";
import { threadId } from "worker_threads";
import { ClientToServerEvents, ServerToClientEvents, InterServerEvents } from ".";
import { Player } from "./Player";
import { Room } from "./Room";
import express, { Router, Application } from 'express';
import path from "path";

const DEFAULT_MAP = "real_map2_20x20.tmx";

export interface RoomStructure {
    users: Array<string>;
    players: Array<Player>;
    name: string;
    /*     addUserToArray: (id: string) => void;
        removeUserFromArray: (id: string) => void;
        isUserInRoom: (id: string) => boolean; */
}

interface ObjectStruct1 {
    [key: string]: Room;
}

export class RoomManager {
    private readonly rooms: ObjectStruct1;
    static server: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, any>;

    constructor(server: Server, expressApp: Application) {
        this.rooms = {};
        RoomManager.server = server;
        this.setupHttpRoute(expressApp);
    }

    private setupHttpRoute(app: Router) {
        const staticPath = path.resolve(__dirname + "/../static/levels/");
        app.use("/data/levels", express.static(staticPath));
    }

    static createEmptyRoom(name: string): Room {
        return new Room(name, this.server);
    }

    userLeaveRooms(user: Socket) {
        let room = (<any>user).lastroom;
        if (this.roomExists(room)) {
            this.rooms[room].players = this.getRoom(room).players.filter(e => {
                console.log(e.id, user.id);
                if (e.id === user.id) {
                    e.unload();
                    // user.emit("playerleave", user.id);
                }
                return e.id !== user.id
            });
        }
        console.log(user.id + " leaving");
        RoomManager.server.to(room).emit("playerleave", user.id);
        user.leave(room);
        console.log(user.rooms);
    }

    addSocketToRoom(room: string, socket: Socket) {
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
    addNewConnection(socket: Socket) {
        socket.on("room", (room: string) => {
            console.log("room event");
            this.addSocketToRoom(room, socket);
        });

        this.addSocketToRoom(DEFAULT_MAP, socket);
    }

    addRoom(name: string) {
        this.addRoomStruct(name, RoomManager.createEmptyRoom(name));
    }

    /*     broadcastToRoom(room: string): BroadcastOperator<ServerToClientEvents> {
            return RoomManager.server.to(room);
        } */

    private addRoomStruct(name: string, room: Room) {
        this.rooms[name] = room;
    }

    getRoom(room: string) {
        return this.rooms[room];
    }

    getRoomNames(): Array<string> {
        return Object.keys(this.rooms);
    }

    roomExists(name: string): boolean {
        return this.getRoomNames().includes(name);
    }
}