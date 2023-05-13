import { HttpHelper, LogHelper } from "@root/utils";
import { injectable } from "tsyringe";

import { ClientMeta, VersionMeta } from "../interfaces/IQuilt";
import { MojangManager } from "./Mojang";

@injectable()
export class QuiltManager extends MojangManager {
    fabricMetaLink = "https://meta.quiltmc.org/v3/versions/loader/";

    /**
     * Скачивание клиента с зеркала Mojang + Quilt
     * @param clientVer - Версия клиента
     * @param instanceName - Название инстанции
     */
    async downloadClient(clientVer: string, instanceName: string) {
        const fabricVersion = await this.getQuiltClientInfo(clientVer);
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
            this.langManager.getTranslate.DownloadManager.QuiltManager.client
                .success
        );
    }

    getQuiltVersions(version: string): Promise<void | VersionMeta[]> {
        try {
            return HttpHelper.getResourceFromJson(
                `${this.fabricMetaLink}${version}`
            );
        } catch (error) {
            LogHelper.debug(error);
            LogHelper.error(
                this.langManager.getTranslate.DownloadManager.QuiltManager.info
                    .errJsonParsing
            );
        }
    }

    async getQuiltClientInfo(version: string) {
        const loaders = await this.getQuiltVersions(version);
        if (!loaders) return;

        const { loader } = loaders[0];

        try {
            return await HttpHelper.getResourceFromJson<ClientMeta>(
                `${this.fabricMetaLink}${version}/${loader.version}/profile/json`
            );
        } catch (error) {
            LogHelper.debug(error);
            LogHelper.error(
                this.langManager.getTranslate.DownloadManager.QuiltManager.info
                    .errClientParsing
            );
        }
    }
}
