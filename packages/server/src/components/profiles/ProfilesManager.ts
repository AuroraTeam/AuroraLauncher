import fs from "fs/promises";

import { LogHelper, StorageHelper } from "@root/utils";
import { Service } from "typedi";

import { LangManager } from "../langs";
import { ProfileConfig } from "./ProfileConfig";
import { resolve } from "path";
import { Profile } from "@aurora-launcher/core";

@Service()
export class ProfilesManager {
    private profiles: ProfileConfig[] = [];

    constructor(private readonly langManager: LangManager) {
        this.loadProfiles();
    }

    private async loadProfiles(): Promise<void> {
        const files = await fs.readdir(StorageHelper.profilesDir);

        if (files.length === 0) {
            LogHelper.info(this.langManager.getTranslate.ProfilesManager.syncSkip);
            return;
        }

        LogHelper.info(this.langManager.getTranslate.ProfilesManager.sync);

        for (const file of files) {

            try {
                const data = await fs.readFile(resolve(StorageHelper.profilesDir, file), "utf-8");
                this.profiles.push(ProfileConfig.fromJSON(data));
            } catch (e) {
                if (e instanceof SyntaxError) {
                    LogHelper.error(this.langManager.getTranslate.ProfilesManager.loadingErr, file);
                } else {
                    LogHelper.debug(e);
                }
            }
        }

        LogHelper.info(this.langManager.getTranslate.ProfilesManager.syncEnd);
    }

    async reloadProfiles(): Promise<void> {
        this.profiles = [];
        await this.loadProfiles();
    }

    /**
     * @returns The uuid of the created profile
     */
    async createProfile(parameters: Partial<Profile>): Promise<string> {
        const profile = new ProfileConfig(parameters);
        this.profiles.push(profile);
        await fs.writeFile(
            resolve(StorageHelper.profilesDir, `${profile.clientDir}.json`),
            profile.toJSON(),
        );
        return profile.uuid;
    }

    async editProfile(
        uuid: string,
        parameters: Partial<Profile> | ((profile: ProfileConfig) => Partial<Profile>),
    ): Promise<void> {
        const profile = this.profiles.find((p) => p.uuid === uuid);

        Object.assign(profile, typeof parameters === "object" ? parameters : parameters(profile));

        await fs.writeFile(
            resolve(StorageHelper.profilesDir, `${profile.clientDir}.json`),
            profile.toJSON(),
        );
    }

    getProfiles(): ProfileConfig[] {
        return this.profiles;
    }
}
