import * as fs from "fs"
import * as http from "http"
import * as https from "https"
import * as path from "path"

import { LogHelper } from "../helpers/LogHelper"
import { StorageHelper } from "../helpers/StorageHelper"
import { App } from "../LauncherServer"
import { WebRequestManager } from "./webserver/WebRequestManager"

export class WebServerManager {
    private webServer: http.Server | https.Server
    private requestsManager = new WebRequestManager()

    public createWebServer(): http.Server | https.Server {
        if (this.webServer) throw new Error("The web server has already been created")

        const { ssl, useSSL } = App.ConfigManager.getConfig().ws

        if (!useSSL) {
            this.webServer = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) =>
                this.requestListener(req, res)
            )
            return this.webServer
        }

        const certPath = path.resolve(StorageHelper.storageDir, ssl.cert)
        const keyPath = path.resolve(StorageHelper.storageDir, ssl.key)

        // TODO Translate
        if (!fs.existsSync(certPath)) {
            LogHelper.fatal("cert file nf")
        }
        if (!fs.existsSync(keyPath)) {
            LogHelper.fatal("key file nf")
        }

        this.webServer = https.createServer(
            {
                cert: fs.readFileSync(certPath),
                key: fs.readFileSync(keyPath),
            },
            (req: http.IncomingMessage, res: http.ServerResponse) => this.requestListener(req, res)
        )
        return this.webServer
    }

    private requestListener(req: http.IncomingMessage, res: http.ServerResponse): void {
        if (req.url.startsWith("/files")) return this.fileListing(req.url, res)
        this.requestsManager.getRequest(req, res)
    }

    private fileListing(url: string, res: http.ServerResponse): void {
        const { disableListing, hideListing } = App.ConfigManager.getConfig().ws
        if (disableListing) return res.writeHead(404).end("Not found!")

        if (url.includes("?")) url = url.split("?")[0]
        url = url.replace(/\/{2,}/g, "/").slice(6)
        if (url.endsWith("/")) url = url.slice(0, -1)

        const filePath = path.join(StorageHelper.updatesDir, url)

        // Защита от выхода из директории
        if (!filePath.startsWith(StorageHelper.updatesDir)) {
            return res.writeHead(400).end()
        }

        if (!fs.existsSync(filePath)) {
            return res.writeHead(404).end("Not found!")
        }

        const stats = fs.statSync(filePath)
        if (stats.isFile()) {
            fs.createReadStream(filePath).pipe(res)
            return
        }

        if (hideListing) return res.writeHead(404).end()

        fs.readdir(filePath, (err, files) => {
            if (err) {
                LogHelper.warn(err)
                return res.writeHead(500).end()
            }

            if (url.length !== 0) files.unshift("..")
            res.write("<style>*{font-family:monospace; font-size:14px}</style>")
            res.end(files.map((el) => `<a href="/files${url}/${el}">${el}</a>`).join("<br>"))
        })
    }
}
