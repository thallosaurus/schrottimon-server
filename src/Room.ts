import { BroadcastOperator, Server, Socket } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents, InterServerEvents } from ".";
import { Player } from "./Player";

import tmx = require("tmx-parser");
import path = require("path");
import process = require("process");

export class Room {
    players: Array<Player> = [];
    name: string;
    private server: Server;
    private map: any = null;

    constructor(n: string, server: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, any>) {
        this.name = n;
        this.server = server;

        console.log("Creating new Room for level id " + n);

        const staticPath = path.resolve(__dirname + "/../static/levels/" + n);
        const tilesetPath = path.resolve(__dirname + "/../static/tilesets");

        /*process.once("SIGUSR2", () => {
            console.log("Goodbye");
            this.players.forEach(e => {
                this.server.to(this.name).emit("playerleave", e.id);
            });
        });*/

        tmx.parseFile(staticPath, (err: any, map: any) => {
            if (err) throw err;
            //console.log(map);
            this.map = map;
        });
    }

    isMapLoaded(): boolean {
        return this.map !== null;
    }

    addUser(socket: Socket) {
        console.log("joining room", this.name);
        socket.join(this.name);
        socket.emit("loadlevel", this.name);
        //console.log(socket.rooms);
        (<any>socket).lastroom = this.name;

        for (let players of this.players) {
            //console.log(players);
            this.letEntitiesSpawn(socket, players.id, players.x, players.y);
        }

        this.players.push(new Player(socket.id, socket, this.server, this));
    }

    private letEntitiesSpawn(destSocket: Socket, socketId: string, x: number, y: number) {
        destSocket.emit("playerjoin", socketId, x, y);
    }

    private getRootMap(): any {
        let hit = null;

        // let f = this.map.layers.filter((e: any) => {
        for (let i = 0; i < this.map.layers.length; i++) {
            if (this.map.layers[i].name === "root" && this.map.layers[i].type === "tile") {                
                hit = this.map.layers[i];
            }
            if (hit !== null) break;
        }

        return hit;
    }

    //checks if the tile at room layer is null, if it is you cannot move on the requested tile
    private canMoveOnMap(x: number, y: number): boolean {
        let rm = this.getRootMap();
        if (rm !== null) {
            let tile = rm.tileAt(x, y);
            // console.log(tile);
            return tile !== undefined;
        } else {  
            return true;
        }
    }

    canMoveThere(x: number, y: number) {
        // if (this.)
        let hit = false;
        for (let e of this.players) {
            hit = e.x === x && e.y === y;
            if (hit) 
            {
                break;
            }
        }

        return this.canMoveOnMap(x, y) && !hit;
    }

    broadcastToRoom(room: string): BroadcastOperator<ServerToClientEvents> {
        return this.server.to(room);
    }
}