/**
 * AuroraLauncher LauncherServer - Server for AuroraLauncher
 * Copyright (C) 2020 - 2021 AuroraTeam

 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.

 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.

 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import * as fs from "fs"
import * as http from "http"
import * as https from "https"
import * as path from "path"

import { LogHelper } from "../helpers/LogHelper"
import { StorageHelper } from "../helpers/StorageHelper"
import { App } from "../LauncherServer"

export class WebServerManager {
    public webServer: http.Server | https.Server
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
                cert: certPath,
                key: keyPath,
            },
            (req: http.IncomingMessage, res: http.ServerResponse) => this.requestListener(req, res)
        )
    }

    private requestListener(req: http.IncomingMessage, res: http.ServerResponse): void {
        const url = this.parseURLPath(req.url)

        if (url.path.startsWith("/authlib")) {
            this.authlibListener(url, res)
        } else {
            this.fileListing(url, res)
        }
    }

    private fileListing(url: ParsedPath, res: http.ServerResponse): void {
        const filePath = path.join(StorageHelper.updatesDir, url.path)

        if (!fs.existsSync(filePath)) {
            res.writeHead(404)
            if (this.config.hideListing) {
                res.end()
            } else {
                res.end("Not found!")
            }
            return
        }

        const stats = fs.statSync(filePath)
        res.writeHead(200)
        if (stats.isDirectory()) {
            if (this.config.hideListing) {
                res.writeHead(404)
                res.end()
                return
            }

            const list = fs.readdirSync(filePath)
            const parent = url.path.slice(-1) == "/" ? url.path.slice(0, -1) : url.path
            res.write("<style>*{font-family:monospace; font-size:14px}</style>")
            if (parent.length !== 0) list.unshift("..")
            res.end(list.map((el) => `<a href="${parent}/${el}">${el}</a>`).join("<br>"))
        } else {
            // TODO Стримы, нужны ли?)
            res.end(fs.readFileSync(filePath))
        }
    }

    private authlibListener(url: ParsedPath, res: http.ServerResponse) {
        res.end() // TODO
    }

    private parseURLPath(url: string): ParsedPath {
        if (!url.includes("?")) {
            return {
                path: url,
            }
        }
        const _url = url.split("?")

        return {
            path: _url[0],
            query: new URLSearchParams(_url[1]),
        }
    }
}

interface ParsedPath {
    path: string
    query?: URLSearchParams
}
