import * as fs from "fs"
import * as http from "http"
import * as https from "https"
import * as path from "path"

import * as ws from "ws"

import { StorageHelper } from "../helpers/StorageHelper"
import { App } from "../LauncherServer"

// TODO
// Реализовать работу с вебсокетом

export class SocketManager {
    webServer: http.Server | https.Server
    webSocketServer: ws.Server

    constructor() {
        this.serverInit()
    }

    serverInit() {
        if (App.ConfigManager.getProperty("ws.enableListing")) {
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
            this.webSocketServer.on("connection", (ws: ws) => this.wsListener(ws))
            this.webServer.listen(App.ConfigManager.getProperty("ws.port"))
        } else {
            this.webSocketServer = new ws.Server({
                port: App.ConfigManager.getProperty("ws.port"),
            })
            this.webSocketServer.on("connection", (ws: ws) => this.wsListener(ws))
        }
    }

    wsListener(ws: ws) {
        ws.on("message", (message) => {
            console.log("received: %s", message)
        })
        ws.send("something")
    }

    requestListener(req: http.IncomingMessage, res: http.ServerResponse) {
        const urlPath = path.resolve(StorageHelper.updatesDir, req.url.slice(1))
        if (App.ConfigManager.getProperty("ws.hideListing")) {
            res.writeHead(404)
            res.end()
            return
        }

        if (!fs.existsSync(urlPath)) {
            res.writeHead(404)
            res.end("Not found!")
            return
        }

        res.writeHead(200)
        let stats = fs.statSync(urlPath)
        if (stats.isDirectory()) {
            const list = fs.readdirSync(urlPath)
            const parent = req.url.slice(-1) == "/" ? req.url.slice(0, -1) : req.url
            res.write("<style>*{font-family:monospace; font-size:14px}</style>")
            if (parent.length !== 0) {
                // list.unshift('..') // Рабочее решeние в одну строку
                let root = parent.split("/").slice(0, -1).join("/")
                res.write(SocketUtils.getLink(root || "/", "..") + "<br>")
            }
            res.end(list.map((el) => SocketUtils.getLink(`${parent}/${el}`, el)).join("<br>"))
        } else {
            res.end(fs.readFileSync(urlPath))
        }
    }
}

export class SocketUtils {
    static getLink(link: string, el: string) {
        return `<a href="${link}">${el}</a>`
    }
}
