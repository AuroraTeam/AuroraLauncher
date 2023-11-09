import { mkdir, readFile } from "fs/promises";
import { resolve } from "path";
import { URL } from "url";

import { HttpHelper, JsonHelper, ZipHelper } from "@aurora-launcher/core";
import { LogHelper, ProgressHelper, StorageHelper } from "@root/utils";
import { injectable } from "tsyringe";

import { statSync } from "fs";
import { MojangManager } from "./Mojang";
import { Profile } from "@aurora-launcher/core";

@injectable()
export class MirrorManager extends MojangManager {
    /**
     * Скачивание клиена с зеркала
     * @param fileName - Название архива с файлами клиента
     * @param clientName - Название клиента
     */
    async downloadClient(fileName: string, clientName: string): Promise<void> {
        const mirrors: string[] = this.configManager.config.mirrors;

        const mirror = mirrors.find(async (mirror) => {
            await HttpHelper.existsResource(new URL(`${fileName}.zip`, mirror));
        });

        if (!mirror) {
            return LogHelper.error(
                this.langManager.getTranslate.DownloadManager.MirrorManager.client.notFound,
            );
        }

        const clientDirPath = resolve(StorageHelper.clientsDir, clientName);

        try {
            await mkdir(clientDirPath);
        } catch (err) {
            return LogHelper.error(this.langManager.getTranslate.DownloadManager.dirExist);
        }

        LogHelper.info(this.langManager.getTranslate.DownloadManager.MirrorManager.client.download);

        let progressBar = ProgressHelper.getDownloadProgressBar();
        progressBar.start(0, 0);

        let client: string;
        try {
            client = await HttpHelper.downloadFile(new URL(`${fileName}.zip`, mirror), null, {
                saveToTempFile: true,
                onProgress(progress) {
                    progress.total && progressBar.setTotal(progress.total);
                    progressBar.update(progress.transferred);
                },
            });
        } catch (error) {
            LogHelper.error(
                this.langManager.getTranslate.DownloadManager.MirrorManager.client.downloadErr,
            );
            LogHelper.debug(error);
            return;
        } finally {
            progressBar.stop();
        }

        LogHelper.info(
            this.langManager.getTranslate.DownloadManager.MirrorManager.client.unpacking,
        );

        progressBar = ProgressHelper.getLoadingProgressBar();
        const stat = statSync(client);
        progressBar.start(stat.size, 0);

        try {
            ZipHelper.unzip(client, clientDirPath, undefined, (size) => {
                progressBar.increment(size);
            });
        } catch (error) {
            await StorageHelper.rmdirRecursive(clientDirPath);
            LogHelper.error(
                this.langManager.getTranslate.DownloadManager.MirrorManager.client.unpackingErr,
            );
            LogHelper.debug(error);
            return;
        } finally {
            progressBar.stop();
            await StorageHelper.rmdirRecursive(client).catch();
        }

        // TODO rework getting profile
        let profile: Partial<Profile>;
        try {
            profile = JsonHelper.fromJson(
                (await readFile(resolve(clientDirPath, "profile.json"))).toString(),
            );
        } catch (error) {
            LogHelper.error(
                this.langManager.getTranslate.DownloadManager.MirrorManager.client.profileErr,
            );
        }

        const version = await this.getVersionInfo(profile.version);
        if (!version) return;

        if (!(await this.resolveAssets(version.assetIndex))) return;

        const libraries = await this.resolveLibraries(version.libraries);
        if (!libraries) return;

        await this.profilesManager.createProfile({
            ...profile,
            clientDir: clientName,
            libraries,
            servers: [
                {
                    title: clientName,
                    ip: "127.0.0.1",
                    port: 25565,
                },
            ],
        });
        LogHelper.info(this.langManager.getTranslate.DownloadManager.MirrorManager.client.success);
    }
}
