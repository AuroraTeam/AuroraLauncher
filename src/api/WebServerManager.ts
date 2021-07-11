import * as fs from "fs"
import * as http from "http"
import * as https from "https"
import * as path from "path"

import { LogHelper } from "../helpers/LogHelper"
import { StorageHelper } from "../helpers/StorageHelper"
import { App } from "../LauncherServer"
import { ExtendedIncomingMessage, ExtendedServerResponse, WebRequestManager } from "./webserver/WebRequestManager"

export class WebServerManager {
    public webServer: http.Server | https.Server
    requestsManager = new WebRequestManager()
    private readonly config = App.ConfigManager.getConfig().ws

    public webServerInit(): void {
        if (!this.config.useSSL) {
            this.webServer = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) =>
                this.requestListener(req, res)
            )
            return
        }

        const certPath = path.resolve(StorageHelper.storageDir, this.config.ssl.cert)
        const keyPath = path.resolve(StorageHelper.storageDir, this.config.ssl.key)

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
    }

    private requestListener(req: http.IncomingMessage, res: http.ServerResponse): void {
        if (req.url.startsWith("/files")) return this.fileListing(req.url, res)
        this.requestsManager.getRequest(req as ExtendedIncomingMessage, res as ExtendedServerResponse)
    }

    private fileListing(url: string, res: http.ServerResponse): void {
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

        if (this.config.hideListing) return res.writeHead(404).end()

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
