import { Server, Socket } from "socket.io";
import { getSystemErrorMap } from "util";
import { ClientToServerEvents, ServerToClientEvents, InterServerEvents } from ".";
import { RoomManager, RoomStructure } from "./RoomManager";

export class Player {
    public readonly roomManger: RoomManager;
    public readonly room: string;
    public readonly id: string;

    private readonly socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, any>;
    private readonly server: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, any>;

    public y: number = 0;
    public x: number = 0;
    public dir: Direction = Direction.DOWN;

    private moveCooldown: NodeJS.Timeout|null = null;

    constructor(socketId: string, client: Socket, socket: Server, room: string, rm: RoomManager) {
        this.id = socketId;
        this.socket = client;
        this.server = socket;
        this.roomManger = rm;
        this.room = room;

        client.on("moveTo", (x: number, y: number) =>{
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

export enum Direction {
    DOWN,
    UP,
    RIGHT,
    LEFT
}