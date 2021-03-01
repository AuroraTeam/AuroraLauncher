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

// TODO Ещё больше try/catch для отлова возможных ошибок
// TODO Перевод

import * as fs from "fs"
import * as path from "path"
import { URL } from "url"

import * as pMap from "p-map"

import { HttpHelper } from "../helpers/HttpHelper"
import { JsonHelper } from "../helpers/JsonHelper"
import { LogHelper } from "../helpers/LogHelper"
import { StorageHelper } from "../helpers/StorageHelper"
import { App } from "../LauncherServer"
import { ClientProfileConfig } from "../profiles/ProfileConfig"
import { MojangManager } from "./MojangManager"

export class FabricManager extends MojangManager {
    fabricLink = "https://maven.fabricmc.net/"

    /**
     * Скачивание клиента с зеркала Mojang + Fabric
     * @param clientVer - Версия клиента
     * @param dirName - Название конечной папки
     */
    async downloadClient(clientVer: string, dirName: string): Promise<void> {
        const fabricVersion: any = await this.getFabricVersionInfo(clientVer)
        if (fabricVersion === undefined) return

        const profileUUID = await super.downloadClient(clientVer, dirName, true)
        if (profileUUID === undefined) return

        const librariesDir = path.resolve(StorageHelper.updatesDir, dirName, "libraries")

        LogHelper.info("Download Fabric libraries, please wait...")
        const librariesList = new Set() as Set<string>
        fabricVersion.libraries.forEach((lib: any) => {
            librariesList.add(lib.name)
        })

        await pMap(
            librariesList,
            async (lib) => {
                const link = this.getLibPath(lib)
                const libPath = path.resolve(librariesDir, link)
                fs.mkdirSync(path.dirname(libPath), { recursive: true })
                await HttpHelper.downloadFile(new URL(link, this.fabricLink), libPath, { showProgress: false })
            },
            { concurrency: 4 }
        )

        //Profiles
        App.ProfilesManager.editProfile(profileUUID, {
            mainClass: fabricVersion.mainClass,
        } as ClientProfileConfig)
        LogHelper.info("Done")
    }

    async getFabricVersionInfo(version: string): Promise<any> {
        let loadersData
        try {
            loadersData = await HttpHelper.readFile(new URL(`https://meta.fabricmc.net/v2/versions/loader/${version}`))
        } catch (error) {
            LogHelper.debug(error)
            LogHelper.error("FabricMC site unavailable")
            return
        }

        let loaders: any[]
        try {
            loaders = JsonHelper.toJSON(loadersData)
        } catch (error) {
            LogHelper.debug(error)
            LogHelper.error("Error parsing JSON data")
            return
        }

        const data = loaders.find((data: any) => data.loader.stable === true)
        if (data === undefined) {
            LogHelper.error("Fabric version %s not found", version)
            return
        }

        let versionData
        try {
            versionData = await HttpHelper.readFile(
                new URL(`https://meta.fabricmc.net/v2/versions/loader/${version}/${data.loader.version}/profile/json`)
            )
        } catch (error) {
            LogHelper.debug(error)
            LogHelper.error("Client data not found")
            return
        }

        try {
            return JsonHelper.toJSON(versionData)
        } catch (error) {
            LogHelper.debug(error)
            return
        }
    }

    // Вынести в хелпер?
    getLibPath(name: string): string {
        const patterns = name.split(":")
        return `${patterns[0].replace(/\./g, "/")}/${patterns[1]}/${patterns[2]}/${patterns[1]}-${patterns[2]}.jar`
    }
}
