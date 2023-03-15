import { mkdir } from "fs/promises";
import path, { resolve } from "path";

import { ProfileConfig } from "@root/components/profiles/utils/ProfileConfig";
import { HttpHelper, LogHelper, StorageHelper } from "@root/utils";
import { injectable } from "tsyringe";

import { AbstractDownloadManager } from "./AbstractManager";
import { Client, VersionManifest } from "../interfaces/IMojang";

@injectable()
export class MojangManager extends AbstractDownloadManager {
    versionManifestLink = new URL("https://piston-meta.mojang.com/mc/game/version_manifest_v2.json");

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

        const clientDirPath = resolve(StorageHelper.clientsDir, instanceName);

        try {
            await mkdir(clientDirPath);
        } catch (err) {
            return LogHelper.error(
                this.langManager.getTranslate.DownloadManager.dirExist
            );
        }

        LogHelper.info(
            this.langManager.getTranslate.DownloadManager.MojangManager.client
                .download
        );

        try {
            await HttpHelper.downloadFile(
                new URL(version.downloads.client.url),
                path.resolve(clientDirPath, "minecraft.jar")
            );
        } catch (error) {
            LogHelper.error(
                this.langManager.getTranslate.DownloadManager.MojangManager
                    .client.downloadErr
            );
            LogHelper.debug(error);
            return;
        }

        LogHelper.info(
            this.langManager.getTranslate.DownloadManager.MojangManager.client
                .success
        );

        // TODO REWORK PROFILES
        return this.profilesManager.createProfile({
            version: gameVersion,
            clientDir: instanceName,
            mainClass: version.mainClass,
            assetsDir: `assets${version.assets}`,
            assetsIndex: version.assets,
            servers: [
                {
                    title: instanceName,
                },
            ],
        } as ProfileConfig);
    }

    async getVersionsInfo(): Promise<VersionManifest | void> {
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
            return await HttpHelper.getResourceFromJson<Client>(new URL(version.url));
        } catch (error) {
            LogHelper.debug(error);
            LogHelper.error(
                this.langManager.getTranslate.DownloadManager.MojangManager.info
                    .errClientParsing
            );
        }
    }
}
