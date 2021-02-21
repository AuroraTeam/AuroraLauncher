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
import * as path from "path"
import { URL } from "url"

import * as rimraf from "rimraf"

import { HttpHelper } from "../helpers/HttpHelper"
import { LogHelper } from "../helpers/LogHelper"
import { StorageHelper } from "../helpers/StorageHelper"
import { ZipHelper } from "../helpers/ZipHelper"
import { App } from "../LauncherServer"

export class MirrorManager {
    /**
     * Скачивание клиена с зеркала
     * @param clientName - Название архива с файлами клиента
     * @param dirName - Название конечной папки
     */
    async downloadClient(clientName: string, dirName: string): Promise<void> {
        const mirrors: string[] = App.ConfigManager.getProperty("updatesUrl")
        const clientDir = path.resolve(StorageHelper.updatesDir, dirName)
        if (fs.existsSync(clientDir)) return LogHelper.error(App.LangManager.getTranslate("MirrorManager.dirExist"))
        const existClients: Map<number, string> = new Map()

        await Promise.all(
            mirrors.map(async (mirror, i) => {
                if (
                    (await HttpHelper.existFile(new URL(`/clients/${clientName}.json`, mirror))) &&
                    (await HttpHelper.existFile(new URL(`/clients/${clientName}.zip`, mirror)))
                )
                    existClients.set(i, mirror)
            })
        )

        if (existClients.size == 0)
            return LogHelper.error(App.LangManager.getTranslate("MirrorManager.client.notFound"))

        const mirror = existClients.values().next().value
        let profile: string
        let client: string

        try {
            LogHelper.info(App.LangManager.getTranslate("MirrorManager.client.download"))
            profile = await HttpHelper.downloadFile(new URL(`/clients/${clientName}.json`, mirror))
            client = await HttpHelper.downloadFile(new URL(`/clients/${clientName}.zip`, mirror))
        } catch (error) {
            LogHelper.error(App.LangManager.getTranslate("MirrorManager.client.downloadErr"))
            LogHelper.debug(error)
            return
        }

        fs.copyFileSync(profile, path.resolve(StorageHelper.profilesDir, `${dirName}.json`))
        try {
            fs.mkdirSync(clientDir)
            LogHelper.info(App.LangManager.getTranslate("MirrorManager.client.unpacking"))
            await ZipHelper.unzipArchive(client, clientDir)
        } catch (error) {
            fs.rmdirSync(clientDir)
            LogHelper.error(App.LangManager.getTranslate("MirrorManager.client.unpackingErr"))
            LogHelper.debug(error)
            return
        } finally {
            rimraf(path.resolve(StorageHelper.tempDir, "*"), (e) => {
                if (e !== null) LogHelper.warn(e)
            })
        }

        LogHelper.info(App.LangManager.getTranslate("MirrorManager.client.success"))
    }

    /**
     * Скачивание ассетов с зеркала
     * @param assetsName - Название архива с файлами ассетов
     * @param dirName - Название конечной папки
     */
    async downloadAssets(assetsName: string, dirName: string): Promise<void> {
        const mirrors: string[] = App.ConfigManager.getProperty("updatesUrl")
        const assetsDir = path.resolve(StorageHelper.updatesDir, dirName)
        if (fs.existsSync(assetsDir)) return LogHelper.error(App.LangManager.getTranslate("MirrorManager.dirExist"))
        const existAssets: Map<number, string> = new Map()

        await Promise.all(
            mirrors.map(async (mirror, i) => {
                if (await HttpHelper.existFile(new URL(`/assets/${assetsName}.zip`, mirror))) existAssets.set(i, mirror)
            })
        )

        if (existAssets.size == 0) return LogHelper.error(App.LangManager.getTranslate("MirrorManager.assets.notFound"))

        const mirror = existAssets.values().next().value
        let assets: string

        try {
            LogHelper.info(App.LangManager.getTranslate("MirrorManager.assets.download"))
            assets = await HttpHelper.downloadFile(new URL(`/assets/${assetsName}.zip`, mirror))
        } catch (error) {
            LogHelper.error(App.LangManager.getTranslate("MirrorManager.assets.downloadErr"))
            LogHelper.debug(error)
            return
        }

        try {
            fs.mkdirSync(assetsDir)
            LogHelper.info(App.LangManager.getTranslate("MirrorManager.assets.unpacking"))
            await ZipHelper.unzipArchive(assets.toString(), assetsDir)
        } catch (error) {
            fs.rmdirSync(assetsDir)
            LogHelper.error(App.LangManager.getTranslate("MirrorManager.assets.unpackingErr"))
            LogHelper.debug(error)
            return
        } finally {
            rimraf(path.resolve(StorageHelper.tempDir, "*"), (e) => {
                if (e !== null) LogHelper.warn(e)
            })
        }

        LogHelper.info(App.LangManager.getTranslate("MirrorManager.assets.success"))
    }
}
