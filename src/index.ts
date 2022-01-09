import { Server } from 'socket.io';
import express from 'express';
import session from 'express-session';
import http from 'http';
import { RoomManager } from './RoomManager';
import { Direction, PlayerUpdate } from './Player';
import bodyParser from 'body-parser';
import { isValidUser } from './Authentication';

export interface ServerToClientEvents {
    joinroom: (rooms: Array<string>) => void;
    message: (from: string, msg: string) => void;
    playerleave: (socketid: string) => void;

    loadlevel: (levelId: string) => void;
    playerjoin: (socketid: string, x: number, y: number) => void;
    playermove: (socketid: string, x: number, y: number, direction: Direction, running: boolean) => void;
    playerupdate: (socketid: string, update: PlayerUpdate) => void;
}

export interface ClientToServerEvents {
    room: (room: string) => void;
    message: (message: string) => void;

    moveTo: (x: number, y: number) => void;
}

export interface InterServerEvents {

}

const app = express();
app.use(express.static("static"));
app.use(bodyParser.urlencoded({
    extended: true
}));

const sessionMiddleware = session({
    secret: "keyboard cat",
    resave: true,
    saveUninitialized: true
});

app.use(sessionMiddleware);

const wrap = (middleware: any) => (socket: any, next: any) => middleware(socket.request, {}, next);

app.post("/login", (req: express.Request, res: express.Response) => {
    const { user, password } = req.body;
    (<any>req.session).user = user;
    (<any>req.session).password = password;
    (<any>req.session).loggedIn = isValidUser(user, password);
    res.send("ok");
});

const httpServer = http.createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents>(httpServer);
io.use(wrap(sessionMiddleware));

const rm: RoomManager = new RoomManager(io, app);

io.on("connect", (socket) => {
    console.log("A new connection from id " + socket.id);
    console.log((<any>socket.request).session);
    rm.addNewConnection(socket);

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