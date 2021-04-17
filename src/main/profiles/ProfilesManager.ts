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

import { LogHelper } from "../helpers/LogHelper"
import { StorageHelper } from "../helpers/StorageHelper"
import { App } from "../LauncherServer"
import { ProfileConfig } from "./types/ProfileConfig"

export class ProfilesManager {
    profiles: ProfileConfig[] = []

    constructor() {
        this.loadProfiles()
    }

    /**
     * Загрузка профилей в память лаунчер-сервера
     */
    loadProfiles(): void {
        const files = fs.readdirSync(StorageHelper.profilesDir)

        if (files.length === 0) return LogHelper.info(App.LangManager.getTranslate("ProfilesManager.syncSkip"))
        else LogHelper.info(App.LangManager.getTranslate("ProfilesManager.sync"))

        files.forEach((file) => {
            if (!file.endsWith(".json")) return

            const data = fs.readFileSync(path.resolve(StorageHelper.profilesDir, file)).toString()
            try {
                this.profiles.push(ProfileConfig.fromJSON(data))
            } catch (e) {
                if (e instanceof SyntaxError)
                    LogHelper.error(App.LangManager.getTranslate("ProfilesManager.loadingErr"), file)
                else LogHelper.error(e)
            }
        })
        LogHelper.info(App.LangManager.getTranslate("ProfilesManager.syncEnd"))
    }

    /**
     * Перезагрузка профилей в памяти лаунчер-сервера
     */
    reloadProfiles(): void {
        this.profiles = []
        this.loadProfiles()
    }

    createProfile(parametrs: ProfileConfig): string {
        const profile = new ProfileConfig(parametrs)
        this.profiles.push(profile)
        fs.writeFileSync(path.resolve(StorageHelper.profilesDir, `${profile.clientDir}.json`), profile.toJSON())
        return profile.uuid
    }

    editProfile(uuid: string, parametrs: ProfileConfig): void {
        const profile = this.profiles.find((p) => (p.uuid === uuid))
        Object.assign(profile, parametrs)
        fs.writeFileSync(path.resolve(StorageHelper.profilesDir, `${profile.clientDir}.json`), profile.toJSON())
    }
}
