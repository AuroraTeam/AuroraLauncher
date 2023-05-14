import { access, mkdir, writeFile } from "fs/promises";
import path, { resolve } from "path";

import {
    HttpHelper,
    JsonHelper,
    LogHelper,
    ProgressHelper,
    StorageHelper,
} from "@root/utils";
import { injectable } from "tsyringe";

import {
    AssetIndex,
    Assets,
    Client,
    VersionProfile,
    VersionsManifest,
} from "../interfaces/IMojang";
import { AbstractDownloadManager } from "./AbstractManager";

@injectable()
export class MojangManager extends AbstractDownloadManager {
    #versionManifestLink =
        "https://piston-meta.mojang.com/mc/game/version_manifest_v2.json";
    #assetsLink = "https://resources.download.minecraft.net/";

    /**
     * Скачивание клиента с зеркала Mojang
     * @param gameVersion - Версия игры
     * @param instanceName - Название сборки
     */
    async downloadClient(
        gameVersion: string,
        instanceName: string
    ): Promise<any> {
        const version = await this.#getVersionInfo(gameVersion);
        if (!version) return;

        if (
            !(await this.#resolveClient(instanceName, version.downloads.client))
        ) {
            return;
        }
        if (!(await this.#resolveAssets(version.assetIndex))) return;

        // await resolvelibraries()

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

    async #resolveClient(instanceName: string, client: Client) {
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

        const progressBar = ProgressHelper.getDownloadProgressBar();
        progressBar.start(client.size, 0, { filename: "minecraft.jar" });

        try {
            await HttpHelper.downloadFile(
                client.url,
                path.resolve(clientDirPath, "minecraft.jar"),
                {
                    onProgress: (progress) => {
                        progressBar.update(progress.transferred);
                    },
                }
            );
        } catch (error) {
            LogHelper.debug(error);
            return LogHelper.error(
                this.langManager.getTranslate.DownloadManager.MojangManager
                    .client.downloadErr
            );
        } finally {
            progressBar.stop();
        }

        LogHelper.info(
            this.langManager.getTranslate.DownloadManager.MojangManager.client
                .success
        );
        return true;
    }

    async #resolveAssets(assetIndex: AssetIndex) {
        const indexPath = resolve(
            StorageHelper.assetsIndexesDir,
            `${assetIndex.id}.json`
        );

        try {
            await access(indexPath);
            return LogHelper.info("Assets already downloaded");
        } catch {
            // Файл не существует (либо нет доступа)
        }

        const assetsFile = await HttpHelper.getResource(assetIndex.url);
        await writeFile(indexPath, assetsFile);

        const { objects } = JsonHelper.fromJson<Assets>(assetsFile);

        const assetsHashes = Object.values(objects)
            .sort((a, b) => b.size - a.size)
            .map(({ hash }) => `${hash.slice(0, 2)}/${hash}`);

        const progressBar = ProgressHelper.getProgress(
            "{bar} {percentage}% {value}/{total}",
            40
        );
        progressBar.start(assetsHashes.length, 0);

        // LogHelper.info(
        //     this.langManager.getTranslate.DownloadManager.MojangManager.assets
        //         .download
        // );
        LogHelper.info("Downloading assets");
        try {
            await HttpHelper.downloadFiles(
                assetsHashes,
                this.#assetsLink,
                StorageHelper.assetsObjectsDir,
                {
                    afterDownload() {
                        progressBar.increment();
                    },
                }
            );
        } catch (error) {
            // LogHelper.error(
            //     this.langManager.getTranslate.DownloadManager.MojangManager
            //         .assets.downloadErr
            // );
            LogHelper.info("Downloading assets failed");
            LogHelper.debug(error);
            return;
        } finally {
            progressBar.stop();
        }
        // LogHelper.info(
        //     this.langManager.getTranslate.DownloadManager.MojangManager.assets
        //         .success
        // );
        LogHelper.info("Assets downloaded");

        return true;
    }

    #resolvelibraries() {}

    async #getVersions() {
        try {
            return await HttpHelper.getResourceFromJson<VersionsManifest>(
                this.#versionManifestLink
            );
        } catch (error) {
            LogHelper.debug(error);
            LogHelper.error(
                this.langManager.getTranslate.DownloadManager.MojangManager.info
                    .errVerParsing
            );
        }
    }

    async #getVersionInfo(gameVersion: string) {
        const versionInfo = await this.#getVersions();
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
            return await HttpHelper.getResourceFromJson<VersionProfile>(
                version.url
            );
        } catch (error) {
            LogHelper.debug(error);
            LogHelper.error(
                this.langManager.getTranslate.DownloadManager.MojangManager.info
                    .errClientParsing
            );
        }
    }
}
