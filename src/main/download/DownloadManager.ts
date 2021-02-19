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

import { randomBytes } from "crypto"
import * as fs from "fs"
import * as http from "http"
import * as https from "https"
import * as path from "path"
import { URL } from "url"

import { LogHelper } from "../helpers/LogHelper"
import { ProgressHelper } from "../helpers/ProgressHelper"
import { StorageHelper } from "../helpers/StorageHelper"

// А может стоит это вынести в какой-нибудь Helper?
export class DownloadManager {
    /**
     * Скачивание файла с зеркала
     * @param url - Объект Url, содержащий ссылку на файл
     * @param showProgress - отображать прогресс бар или нет, по умолчанию `true`
     * @returns Promise который вернёт название временного файла в случае успеха
     */
    downloadFile(url: URL, showProgress = true): Promise<string> {
        return new Promise((resolve, reject) => {
            const handler = url.protocol === "https:" ? https : http
            const tempFilename = path.resolve(StorageHelper.tempDir, randomBytes(16).toString("hex"))
            const tempFile = fs.createWriteStream(tempFilename)
            tempFile.on("close", () => {
                resolve(tempFilename)
            })

            handler
                .get(url, (res) => {
                    if (showProgress) {
                        res.pipe(
                            ProgressHelper.getDownloadProgressBar({
                                length: parseInt(res.headers["content-length"], 10),
                            })
                        ).pipe(tempFile)
                    } else {
                        res.pipe(tempFile)
                    }
                })
                .on("error", (err) => {
                    fs.unlinkSync(tempFilename)
                    reject(err)
                })
        })
    }

    /**
     * Проверка наличия файла на зеркале
     * @param url - Объект Url, содержащий ссылку на файл
     * @returns Promise который вернёт `true` в случае существования файла или `false` при его отсутствии или ошибке
     */
    existFile(url: URL): Promise<boolean> {
        return new Promise((resolve) => {
            const handler = url.protocol === "https:" ? https : http
            handler
                .request(url, { method: "HEAD" }, (res) => {
                    new RegExp(/2[\d]{2}/).test(res.statusCode.toString()) ? resolve(true) : resolve(false)
                })
                .on("error", (err) => {
                    LogHelper.error(err)
                    resolve(false)
                })
                .end()
        })
    }
}
