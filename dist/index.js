"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const RoomManager_1 = require("./RoomManager");
const app = (0, express_1.default)();
app.use(express_1.default.static("static"));
const httpServer = http_1.default.createServer(app);
const io = new socket_io_1.Server(httpServer);
const rm = new RoomManager_1.RoomManager(io, app);
io.on("connect", (socket) => {
    //socket.emit("joinroom", "hello world");
    console.log("A new connection from id " + socket.id);
    rm.addNewConnection(socket);
    // socket.on("room", (room: string) => {
    // console.log("room event");
    // });
    socket.on("message", message => {
        console.log("Message from " + socket.id + ": " + message);
        io.to(socket.lastroom).emit("message", socket.id, message);
    });
    socket.on("disconnect", (reason) => {
        console.log(socket.id + " Disconnected because " + reason);
        rm.userLeaveRooms(socket);
    });
});
httpServer.listen(9000, () => {
    console.log("Listening to port 9000");
});
