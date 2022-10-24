import fs from "fs"
import path from "path"
import { URL } from "url"

import { App } from "@root/app"
import { ProfileConfig } from "@root/components/profiles/utils/ProfileConfig"
import {
    HttpHelper,
    JsonHelper,
    LogHelper,
    StorageHelper,
    ZipHelper,
} from "@root/utils"

export class MirrorManager {
    /**
     * Скачивание клиена с зеркала
     * @param clientName - Название архива с файлами клиента
     * @param instanceName - Название инстанции
     */
    async downloadClient(
        clientName: string,
        instanceName: string
    ): Promise<void> {
        const mirrors: string[] = App.ConfigManager.config.mirrors
        const clientDir = path.resolve(StorageHelper.instancesDir, instanceName)
        if (fs.existsSync(clientDir))
            return LogHelper.error(
                App.LangManager.getTranslate.DownloadManager.dirExist
            )

        const mirror = mirrors.find(async (mirror) => {
            if (
                (await HttpHelper.existsResource(
                    new URL(`/clients/${clientName}.json`, mirror)
                )) &&
                (await HttpHelper.existsResource(
                    new URL(`/clients/${clientName}.zip`, mirror)
                ))
            )
                return true
        })
        if (mirror === undefined)
            return LogHelper.error(
                App.LangManager.getTranslate.DownloadManager.MirrorManager
                    .client.notFound
            )

        let profile: string
        let client: string

        try {
            LogHelper.info(
                App.LangManager.getTranslate.DownloadManager.MirrorManager
                    .client.download
            )
            profile = await HttpHelper.getResource(
                new URL(`/clients/${clientName}.json`, mirror)
            )
            client = await HttpHelper.downloadFile(
                new URL(`/clients/${clientName}.zip`, mirror),
                null,
                {
                    saveToTempFile: true,
                }
            )
        } catch (error) {
            LogHelper.error(
                App.LangManager.getTranslate.DownloadManager.MirrorManager
                    .client.downloadErr
            )
            LogHelper.debug(error)
            return
        }

        try {
            fs.mkdirSync(clientDir)
            LogHelper.info(
                App.LangManager.getTranslate.DownloadManager.MirrorManager
                    .client.unpacking
            )
            ZipHelper.unzipArchive(client, clientDir)
        } catch (error) {
            fs.rmSync(clientDir, { recursive: true, force: true })
            LogHelper.error(
                App.LangManager.getTranslate.DownloadManager.MirrorManager
                    .client.unpackingErr
            )
            LogHelper.debug(error)
            return
        } finally {
            await StorageHelper.rmdirRecursive(client).catch()
        }

        //Profiles
        App.ProfilesManager.createProfile({
            ...JsonHelper.fromJson(profile),
            clientDir: instanceName,
            servers: [
                {
                    title: instanceName,
                },
            ],
        } as ProfileConfig)
        LogHelper.info(
            App.LangManager.getTranslate.DownloadManager.MirrorManager.client
                .success
        )
    }

    /**
     * Скачивание ассетов с зеркала
     * @param assetsVer - Название архива с файлами ассетов
     */
    async downloadAssets(assetsVer: string): Promise<void> {
        const mirrors: string[] = App.ConfigManager.config.mirrors
        const assetsDir = path.resolve(StorageHelper.assetsDir, assetsVer)
        if (fs.existsSync(assetsDir))
            return LogHelper.error(
                App.LangManager.getTranslate.DownloadManager.dirExist
            )

        const mirror = mirrors.find(async (mirror) => {
            if (
                await HttpHelper.existsResource(
                    new URL(`/assets/${assetsVer}.zip`, mirror)
                )
            )
                return true
        })
        if (mirror === undefined)
            return LogHelper.error(
                App.LangManager.getTranslate.DownloadManager.MirrorManager
                    .assets.notFound
            )

        let assets: string

        try {
            LogHelper.info(
                App.LangManager.getTranslate.DownloadManager.MirrorManager
                    .assets.download
            )
            assets = await HttpHelper.downloadFile(
                new URL(`/assets/${assetsVer}.zip`, mirror),
                null,
                {
                    saveToTempFile: true,
                }
            )
        } catch (error) {
            LogHelper.error(
                App.LangManager.getTranslate.DownloadManager.MirrorManager
                    .assets.downloadErr
            )
            LogHelper.debug(error)
            return
        }

        try {
            fs.mkdirSync(assetsDir)
            LogHelper.info(
                App.LangManager.getTranslate.DownloadManager.MirrorManager
                    .assets.unpacking
            )
            ZipHelper.unzipArchive(assets, assetsDir)
        } catch (error) {
            fs.rmSync(assetsDir, { recursive: true, force: true })
            LogHelper.error(
                App.LangManager.getTranslate.DownloadManager.MirrorManager
                    .assets.unpackingErr
            )
            LogHelper.debug(error)
            return
        } finally {
            await StorageHelper.rmdirRecursive(assets).catch()
        }

        LogHelper.info(
            App.LangManager.getTranslate.DownloadManager.MirrorManager.assets
                .success
        )
    }
}
