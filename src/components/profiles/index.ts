import fs from "fs/promises"
import path from "path"
import { injectable, singleton } from "tsyringe"

import { LogHelper, StorageHelper } from "@root/utils"

import { LangManager } from "../langs"
import { ProfileConfig } from "./utils/ProfileConfig"

@singleton()
@injectable()
export class ProfilesManager {
private profiles: ProfileConfig[] = []
    constructor(private readonly langManager: LangManager) {
        this.loadProfiles()
    }

    async loadProfiles(): Promise<void> {
        const files = await fs.readdir(StorageHelper.profilesDir)

        if (files.length === 0) {
            LogHelper.info(this.langManager.getTranslate.ProfilesManager.syncSkip)
            return
        }

        LogHelper.info(this.langManager.getTranslate.ProfilesManager.sync)

        files.forEach(async file => {
            if (!file.endsWith(".json")) return

            try {
                const data = await fs.readFile(path.resolve(StorageHelper.profilesDir, file), "utf-8")
                this.profiles.push(ProfileConfig.fromJSON(data))
            } catch (e) {
                if (e instanceof SyntaxError) {
                    LogHelper.error(
                        this.langManager.getTranslate.ProfilesManager.loadingErr,
                        file
                    )
                } else {
                    LogHelper.debug(e)
                }
            }
        })
        LogHelper.info(this.langManager.getTranslate.ProfilesManager.syncEnd)
    }

    async reloadProfiles(): Promise<void> {
        this.profiles = []
        await this.loadProfiles()
    }

    async createProfile(parameters: ProfileConfig): Promise<string> {
        const profile = new ProfileConfig(parameters)
        this.profiles.push(profile)
        await fs.writeFile(
            path.resolve(StorageHelper.profilesDir, `${profile.clientDir}.json`),
            profile.toJSON()
        )
        return profile.uuid
    }

    async editProfile(uuid: string, parameters: ProfileConfig): Promise<void> {
        const profile = this.profiles.find((p) => p.uuid === uuid)
        Object.assign(profile, parameters)
        await fs.writeFile(
            path.resolve(StorageHelper.profilesDir, `${profile.clientDir}.json`),
            profile.toJSON()
        )
    }

    getProfiles(): ProfileConfig[] {
        return this.profiles
    }
}