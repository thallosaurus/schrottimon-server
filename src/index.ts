import { Server } from 'socket.io';
import express from 'express';
import http from 'http';
import { RoomManager } from './RoomManager';
import { Direction } from './Player';

export interface ServerToClientEvents {
    joinroom: (rooms: Array<string>) => void;
    message: (from: string, msg: string) => void;
    playerleave: (socketid: string) => void;

    loadlevel: (levelId: string) => void;
    playerjoin: (socketid: string, x: number, y: number) => void;
    playermove: (socketid: string, x: number, y: number, direction: Direction) => void;
}

export interface ClientToServerEvents {
    room: (room: string) => void;
    message: (message: string) => void;

    moveTo: (x: number, y: number) => void;
}

export interface InterServerEvents {

}

const rooms = [];

const app = express();
app.use(express.static("static"));
const httpServer = http.createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents>(httpServer);

const rm: RoomManager = new RoomManager(io);

io.on("connect", (socket) => {
    //socket.emit("joinroom", "hello world");
    console.log("A new connection from id " + socket.id);

    socket.on("room", (room: string) => {
        console.log("room event");
        rm.addUserToRoom(room, socket);
    });

    socket.on("message", message => {
        console.log("Message from " + socket.id + ": " + message);
        io.to((<any>socket).lastroom).emit("message", socket.id, message);
    });

    socket.on("disconnect", (reason) => {
        console.log(socket.id + " Disconnected because " + reason);
        rm.userLeaveRooms(socket);
    });
})

httpServer.listen(9000, () => {
    console.log("Listening to port 9000");
});