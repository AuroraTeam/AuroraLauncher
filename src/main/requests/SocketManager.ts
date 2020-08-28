import * as http from "http"
import * as https from "https"
import * as path from "path"

import * as ws from "ws"

import { StorageHelper } from "../helpers/StorageHelper"
import { App } from "../LauncherServer"

export class SocketManager {
    webServer: http.Server | https.Server
    webSocketServer: ws.Server

    constructor() {
        this.serverInit()
    }

    serverInit() {
        if (App.ConfigManager.getProperty("ws.useSSL")) {
            this.webServer = https.createServer(
                {
                    cert: path.resolve(StorageHelper.storageDir, App.ConfigManager.getProperty("ws.ssl.cert")),
                    key: path.resolve(StorageHelper.storageDir, App.ConfigManager.getProperty("ws.ssl.key")),
                },
                this.requestListener
            )
        } else {
            this.webServer = http.createServer(this.requestListener)
        }
        this.webSocketServer = new ws.Server({
            server: this.webServer,
        })

        this.webSocketServer.on("connection", (ws: ws) => {
            ws.on("message", (message) => {
                console.log("received: %s", message)
            })
            ws.send("something")
        })

        this.webServer.listen(App.ConfigManager.getProperty("ws.port"))
    }

    requestListener(req: http.IncomingMessage, res: http.ServerResponse) {
        res.writeHead(200)
        res.end("Hello, World!")
    }
}
