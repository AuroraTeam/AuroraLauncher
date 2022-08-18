import fs from "fs"
import path from "path"

import { LogHelper, StorageHelper } from "@root/helpers"
import { App } from "@root/LauncherServer"

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

        if (files.length === 0) return LogHelper.info(App.LangManager.getTranslate().ProfilesManager.syncSkip)

        LogHelper.info(App.LangManager.getTranslate().ProfilesManager.sync)

        files.forEach((file) => {
            if (!file.endsWith(".json")) return

            const data = fs.readFileSync(path.resolve(StorageHelper.profilesDir, file)).toString()

            try {
                this.profiles.push(ProfileConfig.fromJSON(data))
            } catch (e) {
                if (e instanceof SyntaxError) {
                    LogHelper.error(App.LangManager.getTranslate().ProfilesManager.loadingErr, file)
                } else {
                    LogHelper.error(e)
                }
            }
        })
        LogHelper.info(App.LangManager.getTranslate().ProfilesManager.syncEnd)
    }

    /**
     * Перезагрузка профилей в памяти лаунчер-сервера
     */
    reloadProfiles(): void {
        this.profiles = []
        this.loadProfiles()
    }

    createProfile(parameters: ProfileConfig): string {
        const profile = new ProfileConfig(parameters)
        this.profiles.push(profile)
        fs.writeFileSync(path.resolve(StorageHelper.profilesDir, `${profile.clientDir}.json`), profile.toJSON())
        return profile.uuid
    }

    editProfile(uuid: string, parameters: ProfileConfig): void {
        const profile = this.profiles.find((p) => p.uuid === uuid)
        Object.assign(profile, parameters)
        fs.writeFileSync(path.resolve(StorageHelper.profilesDir, `${profile.clientDir}.json`), profile.toJSON())
    }
}
