import { mkdir } from "fs/promises";
import path, { resolve } from "path";

import { HttpHelper, LogHelper, StorageHelper } from "@root/utils";
import { injectable } from "tsyringe";

import { Client, VersionManifest } from "../interfaces/IMojang";
import { AbstractDownloadManager } from "./AbstractManager";

@injectable()
export class MojangManager extends AbstractDownloadManager {
    versionManifestLink = new URL(
        "https://piston-meta.mojang.com/mc/game/version_manifest_v2.json"
    );

    /**
     * Скачивание клиента с зеркала Mojang
     * @param gameVersion - Версия игры
     * @param instanceName - Название сборки
     */
    async downloadClient(
        gameVersion: string,
        instanceName: string
    ): Promise<any> {
        const version = await this.getClientInfo(gameVersion);
        if (!version) return;

        // resolveAssets()
        // resolveClient()
        // resolvelibraries()
        // resolveNatives()

        // const clientDirPath = resolve(StorageHelper.clientsDir, instanceName);

        // try {
        //     await mkdir(clientDirPath);
        // } catch (err) {
        //     return LogHelper.error(
        //         this.langManager.getTranslate.DownloadManager.dirExist
        //     );
        // }

        // LogHelper.info(
        //     this.langManager.getTranslate.DownloadManager.MojangManager.client
        //         .download
        // );

        // try {
        //     await HttpHelper.downloadFile(
        //         version.downloads.client.url,
        //         path.resolve(clientDirPath, "minecraft.jar")
        //     );
        // } catch (error) {
        //     LogHelper.error(
        //         this.langManager.getTranslate.DownloadManager.MojangManager
        //             .client.downloadErr
        //     );
        //     LogHelper.debug(error);
        //     return;
        // }

        // LogHelper.info(
        //     this.langManager.getTranslate.DownloadManager.MojangManager.client
        //         .success
        // );

        // return this.profilesManager.createProfile({
        //     version: gameVersion,
        //     clientDir: instanceName,
        //     assetsIndex: version.assets,
        //     // libraries: version.libraries.map((lib) => ({
        //     //     url: lib.downloads.artifact.url,
        //     // })),
        //     libraries: version.libraries as any,
        //     servers: [
        //         {
        //             ip: "127.0.0.1",
        //             port: 25565,
        //             title: instanceName,
        //             whiteListType: "null",
        //         },
        //     ],
        // });
    }

    async getVersionsInfo() {
        try {
            return await HttpHelper.getResourceFromJson<VersionManifest>(
                this.versionManifestLink
            );
        } catch (error) {
            LogHelper.debug(error);
            LogHelper.error(
                this.langManager.getTranslate.DownloadManager.MojangManager.info
                    .errVerParsing
            );
        }
    }

    async getClientInfo(gameVersion: string) {
        const versionInfo = await this.getVersionsInfo();
        if (!versionInfo) return;

        const version = versionInfo.versions.find(
            ({ id }) => id === gameVersion
        );
        if (!version) {
            return LogHelper.error(
                this.langManager.getTranslate.DownloadManager.MojangManager.info
                    .verNotFound,
                gameVersion
            );
        }

        try {
            return await HttpHelper.getResourceFromJson<Client>(version.url);
        } catch (error) {
            LogHelper.debug(error);
            LogHelper.error(
                this.langManager.getTranslate.DownloadManager.MojangManager.info
                    .errClientParsing
            );
        }
    }
}
