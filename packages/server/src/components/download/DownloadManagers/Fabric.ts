import { HttpHelper, LogHelper } from "@root/utils";
import { injectable } from "tsyringe";

import { ClientMeta, VersionMeta } from "../interfaces/IFabric";
import { MojangManager } from "./Mojang";

@injectable()
export class FabricManager extends MojangManager {
    fabricMetaLink = "https://meta.fabricmc.net/v2/versions/loader/";

    /**
     * Скачивание клиента с зеркала Mojang + Fabric
     * @param clientVer - Версия клиента
     * @param instanceName - Название инстанции
     */
    async downloadClient(clientVer: string, instanceName: string) {
        const fabricVersion = await this.getFabricClientInfo(clientVer);
        if (!fabricVersion) return;

        const profileUUID = await super.downloadClient(clientVer, instanceName);
        if (!profileUUID) return;

        this.profilesManager.editProfile(profileUUID, (profile) => ({
            mainClass: fabricVersion.mainClass,
            libraries: [
                ...profile.libraries,
                ...fabricVersion.libraries.map((lib) => {
                    const path = this.getLibPath(lib.name);
                    return { url: new URL(path, lib.url).toString() };
                }),
            ],
        }));
        LogHelper.info(
            this.langManager.getTranslate.DownloadManager.FabricManager.client
                .success
        );
    }

    // TODO!!!!!
    protected resolveFabricQuiltLibrary(library) {
        return {
            path: this.getLibPath(library.name),
            sha1: "", // TODO!!!!!
            type: "library",
        };
    }

    getFabricVersions(version: string): Promise<void | VersionMeta[]> {
        try {
            return HttpHelper.getResourceFromJson(
                `${this.fabricMetaLink}${version}`
            );
        } catch (error) {
            LogHelper.debug(error);
            LogHelper.error(
                this.langManager.getTranslate.DownloadManager.FabricManager.info
                    .errJsonParsing
            );
        }
    }

    async getFabricClientInfo(version: string) {
        const loaders = await this.getFabricVersions(version);
        if (!loaders) return;

        const stableLoader = loaders.find(({ loader }) => loader.stable);
        if (!stableLoader) {
            return LogHelper.error(
                this.langManager.getTranslate.DownloadManager.FabricManager.info
                    .verNotFound,
                version
            );
        }

        try {
            return await HttpHelper.getResourceFromJson<ClientMeta>(
                `${this.fabricMetaLink}${version}/${stableLoader.loader.version}/profile/json`
            );
        } catch (error) {
            LogHelper.debug(error);
            LogHelper.error(
                this.langManager.getTranslate.DownloadManager.FabricManager.info
                    .errClientParsing
            );
        }
    }
}
