import * as fs from "fs"
import * as path from "path"

import { LogHelper } from "../helpers/LogHelper"
import { StorageHelper } from "../helpers/StorageHelper"
import { App } from "../LauncherServer"
import { ProfileConfig } from "./ProfileConfig"

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

            try {
                const data = JSON.parse(fs.readFileSync(path.resolve(StorageHelper.profilesDir, file)).toString())
                this.profiles.push(data)
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
}
