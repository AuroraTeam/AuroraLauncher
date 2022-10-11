import fs from "fs"
import http from "http"
import https from "https"
import path from "path"

import { App } from "@root/app"
import { LogHelper, StorageHelper } from "@root/utils"

import { WebRequestManager } from "./WebRequestManager"

export class WebServerManager {
    private webServer: http.Server | https.Server
    private requestsManager = new WebRequestManager()

    /**
     * It creates a web server
     * @returns The web server
     */
    public createWebServer(): http.Server | https.Server {
        if (this.webServer) throw new Error("The web server has already been created")

        const { ssl, useSSL } = App.ConfigManager.config.api

        if (!useSSL) {
            this.webServer = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) =>
                this.requestListener(req, res)
            )
            return this.webServer
        }

        const certPath = path.resolve(StorageHelper.storageDir, ssl.cert)
        const keyPath = path.resolve(StorageHelper.storageDir, ssl.key)

        if (!fs.existsSync(certPath)) {
            LogHelper.fatal(App.LangManager.getTranslate.WebSocketManager.certNotFound)
        }
        if (!fs.existsSync(keyPath)) {
            LogHelper.fatal(App.LangManager.getTranslate.WebSocketManager.keyNotFound)
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

    /**
     * It takes a request and a response, and if the request is for a file, it returns a file listing,
     * otherwise it passes the request and response to the requests manager
     * @param req - http.IncomingMessage - This is the request object that the server receives.
     * @param res - http.ServerResponse - The response object that will be sent back to the client.
     * @returns The response object
     */
    private requestListener(req: http.IncomingMessage, res: http.ServerResponse): http.ServerResponse {
        if (req.url.startsWith("/files")) return this.fileListing(req.url, res)
        this.requestsManager.getRequest(req, res)
    }

    private fileListing(url: string, res: http.ServerResponse): http.ServerResponse {
        const { disableListing, hideListing } = App.ConfigManager.config.api
        if (disableListing) return res.writeHead(404).end("Not found!")

        if (url.includes("?")) url = url.split("?")[0]
        url = url.replace(/\/{2,}/g, "/").slice(6)
        if (url.endsWith("/")) url = url.slice(0, -1)

        const filePath = path.join(StorageHelper.instancesDir, url)

        // Защита от выхода из директории
        if (!filePath.startsWith(StorageHelper.instancesDir)) {
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
