import { LogHelper } from "@root/utils";
import { Service } from "typedi";

import { ClientMeta, VersionMeta } from "../interfaces/IQuilt";
import { FabricLikeManager } from "./FabricLike";
import { HttpHelper } from "@aurora-launcher/core";

@Service()
export class QuiltManager extends FabricLikeManager {
    quiltMetaLink = "https://meta.quiltmc.org/v3/versions/loader/";

    /**
     * Скачивание клиента с зеркала Mojang + Quilt
     * @param clientVer - Версия клиента
     * @param clientName - Название клиента
     */
    async downloadClient(clientVer: string, clientName: string) {
        const quiltVersion = await this.getQuiltClientInfo(clientVer);
        if (!quiltVersion) return;

        const profileUUID = await super.downloadClient(clientVer, clientName);
        if (!profileUUID) return;

        const libraries = await this.resolveExtraLibraries(quiltVersion.libraries, "Quilt");
        if (!libraries) return;

        await this.profilesManager.editProfile(profileUUID, (profile) => ({
            mainClass: quiltVersion.mainClass,
            libraries: [...profile.libraries, ...libraries],
        }));

        LogHelper.info(this.langManager.getTranslate.DownloadManager.QuiltManager.client.success);
    }

    getQuiltVersions(version: string): Promise<void | VersionMeta[]> {
        try {
            return HttpHelper.getResourceFromJson(`${this.quiltMetaLink}${version}`);
        } catch (error) {
            LogHelper.debug(error);
            LogHelper.error(
                this.langManager.getTranslate.DownloadManager.QuiltManager.info.errJsonParsing,
            );
        }
    }

    async getQuiltClientInfo(version: string) {
        const loaders = await this.getQuiltVersions(version);
        if (!loaders) return;

        const { loader } = loaders[0];

        try {
            return await HttpHelper.getResourceFromJson<ClientMeta>(
                `${this.quiltMetaLink}${version}/${loader.version}/profile/json`,
            );
        } catch (error) {
            LogHelper.debug(error);
            LogHelper.error(
                this.langManager.getTranslate.DownloadManager.QuiltManager.info.errClientParsing,
            );
        }
    }
}
