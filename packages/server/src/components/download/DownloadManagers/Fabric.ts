import { HttpHelper } from "@aurora-launcher/core";
import { Service } from "@freshgum/typedi";
import { LogHelper } from "@root/helpers";

import { ClientMeta, VersionMeta } from "../interfaces/IFabric";
import { FabricLikeManager } from "./FabricLike";

@Service([])
export class FabricManager extends FabricLikeManager {
    fabricMetaLink = "https://meta.fabricmc.net/v2/versions/loader/";

    /**
     * Скачивание клиента с зеркала Mojang + Fabric
     * @param clientVer - Версия клиента
     * @param clientName - Название клиента
     */
    override async downloadClient(clientVer: string, clientName: string) {
        const fabricVersion = await this.getFabricClientInfo(clientVer);
        if (!fabricVersion) return;

        const profileUUID = await super.downloadClient(clientVer, clientName);
        if (!profileUUID) return;

        const libraries = await this.resolveExtraLibraries(fabricVersion.libraries, "Fabric");
        if (!libraries) return;

        this.profilesManager.editProfile(profileUUID, (profile) => ({
            mainClass: fabricVersion.mainClass,
            libraries: [...profile.libraries, ...libraries],
        }));
        LogHelper.info(this.langManager.getTranslate.DownloadManager.FabricManager.client.success);
    }

    getFabricVersions(version: string) {
        try {
            return HttpHelper.getResourceFromJson<VersionMeta[]>(
                `${this.fabricMetaLink}${version}`,
            );
        } catch (error) {
            LogHelper.debug(error);
            LogHelper.error(
                this.langManager.getTranslate.DownloadManager.FabricManager.info.errJsonParsing,
            );
            return;
        }
    }

    async getFabricClientInfo(version: string) {
        const loaders = await this.getFabricVersions(version);
        if (!loaders) return;

        const stableLoader = loaders.find(({ loader }) => loader.stable);
        if (!stableLoader) {
            return LogHelper.error(
                this.langManager.getTranslate.DownloadManager.FabricManager.info.verNotFound,
                version,
            );
        }

        try {
            return await HttpHelper.getResourceFromJson<ClientMeta>(
                `${this.fabricMetaLink}${version}/${stableLoader.loader.version}/profile/json`,
            );
        } catch (error) {
            LogHelper.debug(error);
            LogHelper.error(
                this.langManager.getTranslate.DownloadManager.FabricManager.info.errClientParsing,
            );
        }
    }
}
