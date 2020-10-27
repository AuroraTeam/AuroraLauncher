import * as fs from "fs"
import * as http from "http"
import * as https from "https"
import * as path from "path"

import { StorageHelper } from "../helpers/StorageHelper"
import { App } from "../LauncherServer"

export class WebServerManager {
    webServer: http.Server | https.Server

    webServerInit(): void {
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
    }

    requestListener(req: http.IncomingMessage, res: http.ServerResponse): void {
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
        const stats = fs.statSync(urlPath)
        if (stats.isDirectory()) {
            const list = fs.readdirSync(urlPath)
            const parent = req.url.slice(-1) == "/" ? req.url.slice(0, -1) : req.url
            res.write("<style>*{font-family:monospace; font-size:14px}</style>")
            if (parent.length !== 0) list.unshift("..")
            res.end(list.map((el) => `<a href="${parent}/${el}">${el}</a>`).join("<br>"))
        } else {
            res.end(fs.readFileSync(urlPath))
        }
    }
}
