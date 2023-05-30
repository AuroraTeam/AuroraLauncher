import fs from "fs/promises";
import path from "path";

import { PartialProfileConfig } from "@aurora-launcher/core";
import { LogHelper, StorageHelper } from "@root/utils";
import { injectable, singleton } from "tsyringe";

import { LangManager } from "../langs";
import { ProfileConfig } from "./utils/ProfileConfig";

@singleton()
@injectable()
export class ProfilesManager {
    profiles: ProfileConfig[] = [];
    constructor(private readonly langManager: LangManager) {
        this.loadProfiles();
    }

    async loadProfiles(): Promise<void> {
        const files = await fs.readdir(StorageHelper.profilesDir);

        if (files.length === 0) {
            LogHelper.info(
                this.langManager.getTranslate.ProfilesManager.syncSkip
            );
            return;
        }

        LogHelper.info(this.langManager.getTranslate.ProfilesManager.sync);

        for (const file of files) {
            if (!file.endsWith(".json")) continue;

            try {
                const data = await fs.readFile(
                    path.resolve(StorageHelper.profilesDir, file),
                    "utf-8"
                );
                this.profiles.push(ProfileConfig.fromJSON(data));
            } catch (e) {
                if (e instanceof SyntaxError) {
                    LogHelper.error(
                        this.langManager.getTranslate.ProfilesManager
                            .loadingErr,
                        file
                    );
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

    async createProfile(parameters: PartialProfileConfig): Promise<string> {
        const profile = new ProfileConfig(parameters);
        this.profiles.push(profile);
        await fs.writeFile(
            path.resolve(
                StorageHelper.profilesDir,
                `${profile.clientDir}.json`
            ),
            profile.toJSON()
        );
        return profile.uuid;
    }

    async editProfile(
        uuid: string,
        parameters:
            | PartialProfileConfig
            | ((profile: ProfileConfig) => Partial<ProfileConfig>)
    ): Promise<void> {
        const profile = this.profiles.find((p) => p.uuid === uuid);

        if (typeof parameters === "object") {
            Object.assign(profile, parameters);
        } else {
            Object.assign(profile, parameters(profile));
        }
        await fs.writeFile(
            path.resolve(
                StorageHelper.profilesDir,
                `${profile.clientDir}.json`
            ),
            profile.toJSON()
        );
    }

    getProfiles(): ProfileConfig[] {
        return this.profiles;
    }
}
