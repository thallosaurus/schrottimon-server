import { Server, Socket } from "socket.io";
import { getSystemErrorMap } from "util";
import { ClientToServerEvents, ServerToClientEvents, InterServerEvents } from ".";
import { Entity } from "./Entity";
import { Room } from "./Room";
import { RoomManager, RoomStructure } from "./RoomManager";

export interface PlayerUpdate {
    dimmed: boolean;
}

export class Player extends Entity {
    // public readonly roomManger: RoomManager;
    // public readonly room: Room;
    public readonly id: string;

    private readonly socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, any>;
    private readonly server: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, any>;

    public y: number = 0;
    public x: number = 0;
    public dir: Direction = Direction.DOWN;
    public invincible: boolean = false;

    private moveCooldown: NodeJS.Timeout | null = null;

    private afkTimeout: NodeJS.Timeout | null;

    constructor(socketId: string, client: Socket, socket: Server, room: Room) {
        super(room);
        this.id = socketId;
        this.socket = client;
        this.server = socket;
        // this.room = room;
        this.x = room.getSpawnX();
        this.y = room.getSpawnY();

        this.afkTimeout = null;

        this.invincible = false;
        this.updateAfk();

        client.on("moveTo", (x: number, y: number, run: boolean) => {
            if (this.moveCooldown === null) {
                this.updateAfk();
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

    updateAfk() {
        this.setAFK(false);

        if (this.afkTimeout != null) clearTimeout(this.afkTimeout);

        this.afkTimeout = setTimeout(() => {
            this.setAFK(true);
        }, 5000);
    }

    public pushUpdate() {
        this.server.to(this.room.name).emit("playerupdate", this.id, this.getUpdate());
    }

    unload() {
        this.socket.removeAllListeners("moveTo");
    }

    setAFK(state: boolean) {
        this.invincible = state;
        this.pushUpdate();
    }

    getUpdate(): PlayerUpdate {
        return {
            dimmed: this.invincible
        }
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