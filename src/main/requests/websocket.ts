// import WebSocket = require("ws")
// import { IncomingMessage } from "http"
// import { LauncherServer } from "../LauncherServer"

// export class LauncherSocket {
//     ls: LauncherServer
//     socket: WebSocket.Server
//     clients: object

//     constructor(ls: LauncherServer) {
//         this.ls = ls
//         this.socket = new WebSocket.Server({
//             host: ls.config.socket.ip,
//             port: ls.config.socket.port
//         })

//         this.socket.on("connection", this.newConnection)
//     }

//     newConnection(socket: WebSocket, request: IncomingMessage): void {

//     }

//     connect() {

//     }
// }
