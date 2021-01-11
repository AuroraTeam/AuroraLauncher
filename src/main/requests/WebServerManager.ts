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

import { StorageHelper } from "../helpers/StorageHelper"
import { App } from "../LauncherServer"

export class WebServerManager {
    webServer: http.Server | https.Server

    webServerInit(): void {
        if (App.ConfigManager.getProperty("ws.useSSL")) {
            // TODO Проверка на отсутствие файлов
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

        if (!fs.existsSync(urlPath)) {
            res.writeHead(404)
            if (App.ConfigManager.getProperty("ws.hideListing")) {
                res.end()
            } else {
                res.end("Not found!")
            }
            return
        }

        const stats = fs.statSync(urlPath)
        if (App.ConfigManager.getProperty("ws.hideListing")) {
            if (!stats.isFile()) {
                res.writeHead(404)
                res.end()
                return
            }
        }

        res.writeHead(200)
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
