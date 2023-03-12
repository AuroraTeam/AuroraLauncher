import { mkdir, readFile } from "fs/promises";
import { resolve } from "path";
import { URL } from "url";

import { ProfileConfig } from "@root/components/profiles/utils/ProfileConfig";
import {
    HttpHelper,
    JsonHelper,
    LogHelper,
    StorageHelper,
    ZipHelper,
} from "@root/utils";
import { injectable } from "tsyringe";

import { AbstractDownloadManager } from "./Abstract";

@injectable()
export class MirrorManager extends AbstractDownloadManager {
    /**
     * Скачивание клиена с зеркала
     * @param clientName - Название архива с файлами клиента
     * @param instanceName - Название инстанции
     */
    async downloadClient(
        clientName: string,
        instanceName: string
    ): Promise<void> {
        const mirrors: string[] = this.configManager.config.mirrors;

        const clientDirPath = resolve(StorageHelper.clientsDir, instanceName);

        try {
            await mkdir(clientDirPath);
        } catch (err) {
            return LogHelper.error(
                this.langManager.getTranslate.DownloadManager.dirExist
            );
        }

        const mirror = mirrors.find(async (mirror) => {
            await HttpHelper.existsResource(
                new URL(`${clientName}.zip`, mirror)
            );
        });

        if (!mirror) {
            return LogHelper.error(
                this.langManager.getTranslate.DownloadManager.MirrorManager
                    .client.notFound
            );
        }

        LogHelper.info(
            this.langManager.getTranslate.DownloadManager.MirrorManager.client
                .download
        );

        let client: string;
        try {
            client = await HttpHelper.downloadFile(
                new URL(`${clientName}.zip`, mirror),
                null,
                { saveToTempFile: true }
            );
        } catch (error) {
            LogHelper.error(
                this.langManager.getTranslate.DownloadManager.MirrorManager
                    .client.downloadErr
            );
            LogHelper.debug(error);
            return;
        }

        LogHelper.info(
            this.langManager.getTranslate.DownloadManager.MirrorManager.client
                .unpacking
        );

        try {
            ZipHelper.unzipArchive(client, clientDirPath);
        } catch (error) {
            await StorageHelper.rmdirRecursive(clientDirPath);
            LogHelper.error(
                this.langManager.getTranslate.DownloadManager.MirrorManager
                    .client.unpackingErr
            );
            LogHelper.debug(error);
            return;
        } finally {
            await StorageHelper.rmdirRecursive(client).catch();
        }

        let profile;
        try {
            profile = await JsonHelper.fromJson<ProfileConfig>(
                (
                    await readFile(resolve(clientDirPath, "profile.json"))
                ).toString()
            );
        } catch (error) {
            LogHelper.error(
                this.langManager.getTranslate.DownloadManager.MirrorManager
                    .client.profileErr
            );
        }

        this.profilesManager.createProfile({
            ...profile,
            clientDir: instanceName,
            servers: [
                {
                    title: instanceName,
                    ip: "127.0.0.1",
                    port: "25565",
                    whiteListType: "null",
                },
            ],
        } as ProfileConfig);
        LogHelper.info(
            this.langManager.getTranslate.DownloadManager.MirrorManager.client
                .success
        );
    }
}
