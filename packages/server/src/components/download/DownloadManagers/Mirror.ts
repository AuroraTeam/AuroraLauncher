import { resolve } from "path";
import { URL } from "url";

import { HttpHelper, ZipHelper } from "@aurora-launcher/core";
import { Profile } from "@aurora-launcher/core";
import { LogHelper, ProgressHelper, StorageHelper } from "@root/utils";
import { Service } from "typedi";

import { MojangManager } from "./Mojang";

@Service()
export class MirrorManager extends MojangManager {
    /**
     * Скачивание клиена с зеркала
     * @param fileName - Название архива с файлами клиента
     * @param clientName - Название клиента
     */
    async downloadClient(fileName: string, clientName: string) {
        const mirror = await this.checkMirror(fileName);
        if (!mirror)
            return LogHelper.error(
                this.langManager.getTranslate.DownloadManager.MirrorManager.client.notFound,
            );
        const mirrorProfiles: Profile = await HttpHelper.getResourceFromJson(
            new URL(`/profiles/${fileName}.json`, mirror),
        );

        const profileUUID = await super.downloadClient(mirrorProfiles.version, clientName);
        if (!profileUUID) return;

        if (await HttpHelper.existsResource(new URL(`/clients/${fileName}.zip`, mirror))) {
            await this.installClient(fileName, clientName, mirror);
        }

        if (await HttpHelper.existsResource(new URL(`/libraries/${fileName}.zip`, mirror))) {
            await this.installLibraries(fileName, mirror);
        }

        this.profilesManager.editProfile(profileUUID, () => ({
            mainClass: mirrorProfiles.mainClass,
            libraries: mirrorProfiles.libraries,
            jvmArgs: mirrorProfiles.jvmArgs,
            clientArgs: mirrorProfiles.clientArgs,
        }));
        LogHelper.info(this.langManager.getTranslate.DownloadManager.MirrorManager.client.success);
    }

    async checkMirror(fileName: string) {
        const mirrors: string[] = this.configManager.config.mirrors;

        const mirror = await this.findAsync(mirrors, async (url) => {
            return await HttpHelper.existsResource(new URL(`/profiles/${fileName}.json`, url));
        });

        return mirror;
    }

    async installClient(fileName: string, clientName: string, mirror: string) {
        LogHelper.info(this.langManager.getTranslate.DownloadManager.MirrorManager.client.download);
        const progressBar = ProgressHelper.getDownloadProgressBar();
        progressBar.start(0, 0, { filename: `${fileName}.zip` });
        const clientDirPath = resolve(StorageHelper.clientsDir, clientName);

        try {
            const client = await HttpHelper.downloadFile(
                new URL(`/clients/${fileName}.zip`, mirror),
                null,
                {
                    saveToTempFile: true,
                    onProgress(progress) {
                        if (progress.total) {
                            progressBar.setTotal(progress.total);
                        }
                        progressBar.update(progress.transferred);
                    },
                },
            );

            LogHelper.info(
                this.langManager.getTranslate.DownloadManager.MirrorManager.client.unpacking,
            );
            ZipHelper.unzip(client, clientDirPath);

            return true;
        } catch (error) {
            LogHelper.error(
                this.langManager.getTranslate.DownloadManager.MirrorManager.client.unpackingErr,
            );
            LogHelper.debug(error);
            return;
        } finally {
            progressBar.stop();
        }
    }

    async installLibraries(fileName: string, mirror: string) {
        LogHelper.info(
            this.langManager.getTranslate.DownloadManager.MirrorManager.client.downloadLib,
        );
        const progressBar = ProgressHelper.getDownloadProgressBar();
        progressBar.start(0, 0, { filename: `${fileName}.zip` });

        try {
            const client = await HttpHelper.downloadFile(
                new URL(`/libraries/${fileName}.zip`, mirror),
                null,
                {
                    saveToTempFile: true,
                    onProgress(progress) {
                        if (progress.total) {
                            progressBar.setTotal(progress.total);
                        }
                        progressBar.update(progress.transferred);
                    },
                },
            );

            LogHelper.info(
                this.langManager.getTranslate.DownloadManager.MirrorManager.client.unpackingLib,
            );
            ZipHelper.unzip(client, StorageHelper.librariesDir);

            return true;
        } catch (error) {
            LogHelper.error(
                this.langManager.getTranslate.DownloadManager.MirrorManager.client.unpackingErr,
            );
            LogHelper.debug(error);
            return;
        } finally {
            progressBar.stop();
        }
    }

    async findAsync(
        array: string[],
        predicate: (item: string, index: number, items: string[]) => Promise<any>,
    ) {
        for (const [index, item] of array.entries()) {
            try {
                if (await predicate(item, index, array)) {
                    return item;
                }
            } catch {
                return undefined;
            }
        }
    }
}
