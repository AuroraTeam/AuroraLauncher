import * as fs from "fs"
import * as http from "http"
import * as https from "https"
import * as path from "path"

import * as ws from "ws"

import { StorageHelper } from "../helpers/StorageHelper"
import { App } from "../LauncherServer"

// TODO
// Возможность выключения файлового сервера (при использовании проксирования, например через nginx)
// Реализовать работу с вебсокетом

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
        if (App.ConfigManager.getProperty("ws.hideListing")) {
            res.writeHead(404)
            res.end()
            return
        }

        if (!fs.existsSync(path.resolve(StorageHelper.updatesDir, req.url.slice(1)))) {
            res.writeHead(404)
            res.end("Not found!")
            return
        }

        res.writeHead(200)
        let stats = fs.statSync(path.resolve(StorageHelper.updatesDir, req.url.slice(1)))
        if (stats.isDirectory()) {
            const list = fs.readdirSync(path.resolve(StorageHelper.updatesDir, req.url.slice(1)))
            const parent = req.url.slice(-1) == "/" ? req.url.slice(0, -1) : req.url
            res.end(list.map((el) => `<a href="${parent}/${el}">${el}</a>`).join("<br>"))
        } else {
            res.end(fs.readFileSync(path.resolve(StorageHelper.updatesDir, req.url.slice(1))))
        }
    }
}
