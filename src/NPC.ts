import { Server, Socket } from "socket.io";
import { Player } from "./Player";
import { Room } from "./Room";
import { RoomManager } from "./RoomManager";

export class NPC extends Player {
    constructor(client: Socket, room: Room, x: number, y: number) {
        super("npc", client, RoomManager.server, room);
    }
}