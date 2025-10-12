import { rm } from "fs/promises";
import { resolve } from "path";
import { URL } from "url";

import { HttpHelper, ZipHelper } from "@aurora-launcher/core";
import { Profile } from "@aurora-launcher/core";
import { Service } from "@freshgum/typedi";
import { LogHelper, ProgressHelper, StorageHelper } from "@root/helpers";

import { MojangManager } from "./Mojang";

@Service([])
export class MirrorManager extends MojangManager {
    /**
     * Скачивание клиена с зеркала
     * @param fileName - Название архива с файлами клиента
     * @param clientName - Название клиента
     */
    override async downloadClient(fileName: string, clientName: string) {
        let mirror!: string;
        let profile: Profile | undefined;

        for (const selectedMirror of this.configManager.config.mirrors) {
            profile = await HttpHelper.getResourceFromJson<Profile>(
                new URL(`/profiles/${fileName}.json`, selectedMirror),
            ).catch<undefined>(() => undefined);
            if (profile) {
                mirror = selectedMirror;
                break;
            }
        }

        if (!profile)
            return LogHelper.error(
                this.langManager.getTranslate.DownloadManager.MirrorManager.client.notFound,
            );

        const profileUUID = await super.downloadClient(profile.version, clientName);
        if (!profileUUID) return;

        await this.installClient(fileName, clientName, mirror);
        await this.installLibraries(fileName, mirror);

        this.profilesManager.editProfile(profileUUID, () => ({
            mainClass: profile.mainClass,
            libraries: profile.libraries,
            jvmArgs: profile.jvmArgs,
            clientArgs: profile.clientArgs,
        }));
        LogHelper.info(this.langManager.getTranslate.DownloadManager.MirrorManager.client.success);
    }

    async installClient(fileName: string, clientName: string, mirror: string) {
        LogHelper.info(this.langManager.getTranslate.DownloadManager.MirrorManager.client.download);
        const progressBar = ProgressHelper.getDownloadProgressBar();
        progressBar.start(0, 0, { filename: `${fileName}.zip` });
        const clientDirPath = resolve(StorageHelper.clientsDir, clientName);

        let clientTempFilePath;
        try {
            clientTempFilePath = await HttpHelper.downloadFile(
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
            await ZipHelper.unzip(clientTempFilePath, clientDirPath);

            return true;
        } catch (error) {
            LogHelper.error(
                this.langManager.getTranslate.DownloadManager.MirrorManager.client.unpackingErr,
            );
            LogHelper.debug(error);
            return;
        } finally {
            if (clientTempFilePath) await rm(clientTempFilePath);
            progressBar.stop();
        }
    }

    async installLibraries(fileName: string, mirror: string) {
        LogHelper.info(
            this.langManager.getTranslate.DownloadManager.MirrorManager.client.downloadLib,
        );
        const progressBar = ProgressHelper.getDownloadProgressBar();
        progressBar.start(0, 0, { filename: `${fileName}.zip` });

        let librariesTempFilePath;
        try {
            librariesTempFilePath = await HttpHelper.downloadFile(
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
            await ZipHelper.unzip(librariesTempFilePath, StorageHelper.librariesDir);

            return true;
        } catch (error) {
            LogHelper.error(
                this.langManager.getTranslate.DownloadManager.MirrorManager.client.unpackingErr,
            );
            LogHelper.debug(error);
            return;
        } finally {
            if (librariesTempFilePath) await rm(librariesTempFilePath);
            progressBar.stop();
        }
    }
}
