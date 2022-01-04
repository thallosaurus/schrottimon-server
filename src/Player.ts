import { Server, Socket } from "socket.io";
import { getSystemErrorMap } from "util";
import { ClientToServerEvents, ServerToClientEvents, InterServerEvents } from ".";
import { Room } from "./Room";
import { RoomManager, RoomStructure } from "./RoomManager";

export class Player {
    // public readonly roomManger: RoomManager;
    public readonly room: Room;
    public readonly id: string;

    private readonly socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, any>;
    private readonly server: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, any>;

    public y: number = 0;
    public x: number = 0;
    public dir: Direction = Direction.DOWN;

    private moveCooldown: NodeJS.Timeout | null = null;

    constructor(socketId: string, client: Socket, socket: Server, room: Room) {
        this.id = socketId;
        this.socket = client;
        this.server = socket;
        this.room = room;

        client.on("moveTo", (x: number, y: number, run: boolean) => {
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

function findDirection(x1: number, y1: number, x2: number, y2: number): Direction {
    // return Direction.LEFT;

    if (x1 === x2 && y1 < y2) return Direction.DOWN;
    if (x1 === x2 && y1 > y2) return Direction.UP;
    if (x1 < x2 && y1 === y2) return Direction.RIGHT;
    if (x1 > x2 && y1 === y2) return Direction.LEFT;

    return Direction.UP;
}

export enum Direction {
    DOWN,
    UP,
    RIGHT,
    LEFT
}