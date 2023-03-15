import { ProfileConfig } from "@root/components/profiles/utils/ProfileConfig";
import { HttpHelper, LogHelper } from "@root/utils";
import { injectable } from "tsyringe";

import { ClientMeta, Loader, Library } from "../interfaces/IForge";
import { MojangManager } from "./Mojang";


//TODO TEST XD
@injectable()
export class ForgeManager extends MojangManager {
    forgeLink = "https://files.minecraftforge.net/maven/net/minecraftforge/forge/";
    forgeMetaLink = "https://meta.minecraftforge.net/v3/versions/";

    /**
     * Скачивание клиента с зеркала Mojang + Forge
     * @param clientVer - Версия клиента
     * @param instanceName - Название инстанции
     */
    async downloadClient(clientVer: string, instanceName: string) {
        const forgeVersion = await this.getForgeClientInfo(clientVer);
        if (!forgeVersion) return;

        const profileUUID = await super.downloadClient(clientVer, instanceName);
        if (!profileUUID) return;

        // TODO REWORK PROFILES
        this.profilesManager.editProfile(profileUUID, {
            mainClass: forgeVersion.mainClass,
            libraries: forgeVersion.libraries.map((library: Library) => ({
                name: library.name,
                url: library.url,
                serverreq: library.serverreq,
                clientreq: library.clientreq,
                checksums: library.checksums,
                size: library.size,
                comment: library.comment,
            })),
        } as unknown as ProfileConfig);

        LogHelper.info(
            this.langManager.getTranslate.DownloadManager.ForgeManager.client
                .success
        );
    }

    async getForgeVersions(version: string): Promise<void | Loader[]> {
        try {
            return HttpHelper.getResourceFromJson<Loader[]>(
                `${this.forgeMetaLink}versions/${version}.json`
            );
        } catch (error) {
            LogHelper.debug(error);
            LogHelper.error(
                this.langManager.getTranslate.DownloadManager.ForgeManager.info
                    .errJsonParsing
            );
        }
    }

    async getForgeClientInfo(version: string) {
        const loaders = await this.getForgeVersions(version);
        if (!loaders) return;

        const stableLoader = loaders.find(({ stable }) => stable);
        if (!stableLoader) {
            return LogHelper.error(
                this.langManager.getTranslate.DownloadManager.ForgeManager.info
                    .verNotFound,
                version
            );
        }

        try {
            return await HttpHelper.getResourceFromJson<ClientMeta>(
                `${this.forgeLink}${version}-${stableLoader.version}/forge-${version}-${stableLoader.version}-client.json`
            );
        } catch (error) {
            LogHelper.debug(error);
            LogHelper.error(
                this.langManager.getTranslate.DownloadManager.ForgeManager.info
                    .errClientParsing
            );
        }
    }
}