import { BroadcastOperator, Server, Socket,  } from "socket.io";
import { isThisTypeNode } from "typescript";
import { threadId } from "worker_threads";
import { ClientToServerEvents, ServerToClientEvents, InterServerEvents } from ".";
import { Player } from "./Player";

export interface RoomStructure {
    users: Array<string>;
    players: Array<Player>;
/*     addUserToArray: (id: string) => void;
    removeUserFromArray: (id: string) => void;
    isUserInRoom: (id: string) => boolean; */
}

interface ObjectStruct1 {
    [key: string]: RoomStructure;
}

export class RoomManager {
    private readonly rooms: ObjectStruct1;
    private readonly server: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, any>;

    constructor(server: Server) {
        this.rooms = {};
        this.server = server;

        //this.addRoom("level-1");
    }

    static createEmptyRoom(): RoomStructure {
        let room: RoomStructure = {
            users: [],
            players: []
        }

        return room;
    }

    getUserInRoomAsPlayer(room: string, id: string) {

    }

    userLeaveRooms(user: Socket) {
        let room = (<any>user).lastroom;
        if (this.rooms[room]) {
            this.rooms[room].players = this.rooms[room].players.filter(e => {
                console.log(e.id, user.id);
                return e.id !== user.id
            });
        }
        console.log(user.id + " leaving");
        this.server.to(room).emit("playerleave", user.id);
        user.leave(room);
        console.log(user.rooms);
    }

    addUserToRoom(room: string, socket: Socket) {
        this.userLeaveRooms(socket);
        console.log("joining room", room);
        socket.join(room);
        socket.emit("loadlevel", room);
        console.log(socket.rooms);
        (<any>socket).lastroom = room;
        if (!this.rooms[room]) {
            this.rooms[room] = RoomManager.createEmptyRoom();
        }

        for (let players of this.rooms[room].players) {
            this.letEntitiesSpawn(socket, players.id, players.x, players.y);
        }

        // this.rooms[room].users.push(socket.id);
        this.rooms[room].players.push(new Player(socket.id, socket, this.server, room, this));
        this.server.to(room).emit("playerjoin", socket.id, 0, 0);
    }

    private letEntitiesSpawn(destSocket: Socket, socketId: string, x: number, y: number) {
        destSocket.emit("playerjoin", socketId, x , y);
    }

    addRoom(name: string) {
        this.addRoomStruct(name, RoomManager.createEmptyRoom());
    }

    broadcastToRoom(room: string): BroadcastOperator<ServerToClientEvents> {
        return this.server.to(room);
    }
    
    private addRoomStruct(name: string, room: RoomStructure) {
        this.rooms[name] = room;
    }

    getRoomNames(): Array<string> {
        return Object.keys(this.rooms);
    }

    roomExists(name: string): boolean {
        return this.getRoomNames().includes(name);
    }
}