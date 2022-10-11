import fs from "fs"
import path from "path"

import { LogHelper, StorageHelper } from "@root/utils"
import { App } from "@root/app"

import { ProfileConfig } from "./utils/ProfileConfig"

export class ProfilesManager {
    profiles: ProfileConfig[] = []

    constructor() {
        this.loadProfiles()
    }

    /**
     * It upload the profile to the launcher's memory
     */
    loadProfiles(): void {
        const files = fs.readdirSync(StorageHelper.profilesDir)

        if (files.length === 0) return LogHelper.info(App.LangManager.getTranslate.ProfilesManager.syncSkip)

        LogHelper.info(App.LangManager.getTranslate.ProfilesManager.sync)

        files.forEach((file) => {
            if (!file.endsWith(".json")) return

            const data = fs.readFileSync(path.resolve(StorageHelper.profilesDir, file)).toString()

            try {
                this.profiles.push(ProfileConfig.fromJSON(data))
            } catch (e) {
                if (e instanceof SyntaxError) {
                    LogHelper.error(App.LangManager.getTranslate.ProfilesManager.loadingErr, file)
                } else {
                    LogHelper.debug(e)
                }
            }
        })
        LogHelper.info(App.LangManager.getTranslate.ProfilesManager.syncEnd)
    }

    /**
     * It reload the profiles in the memory of the server launcher
     */
    reloadProfiles(): void {
        this.profiles = []
        this.loadProfiles()
    }

    /**
     * It creates a new profile, adds it to the list of profiles, and writes it to the file system
     * @param {ProfileConfig} parameters - ProfileConfig
     * @returns The uuid of the profile
     */
    createProfile(parameters: ProfileConfig): string {
        const profile = new ProfileConfig(parameters)
        this.profiles.push(profile)
        fs.writeFileSync(path.resolve(StorageHelper.profilesDir, `${profile.clientDir}.json`), profile.toJSON())
        return profile.uuid
    }

    /**
     * It takes a uuid and a ProfileConfig object, finds the profile with the given uuid, and then
     * updates the profile with the given ProfileConfig object
     * @param {string} uuid - The UUID of the profile you want to edit.
     * @param {ProfileConfig} parameters - ProfileConfig
     */
    editProfile(uuid: string, parameters: ProfileConfig): void {
        const profile = this.profiles.find((p) => p.uuid === uuid)
        Object.assign(profile, parameters)
        fs.writeFileSync(path.resolve(StorageHelper.profilesDir, `${profile.clientDir}.json`), profile.toJSON())
    }
}
