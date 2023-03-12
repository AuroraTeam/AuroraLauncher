import path from "path"
import { URL } from "url"

import { ProfileConfig } from "@root/components/profiles/utils/ProfileConfig"
import { HttpHelper, JsonHelper, LogHelper, StorageHelper } from "@root/utils"
import { injectable } from "tsyringe"

import { MojangManager } from "./Mojang"

@injectable()
export class FabricManager extends MojangManager {
    fabricLink = "https://maven.fabricmc.net/"

    /**
     * Скачивание клиента с зеркала Mojang + Fabric
     * @param clientVer - Версия клиента
     * @param instanceName - Название инстанции
     */
    async downloadClient(
        clientVer: string,
        instanceName: string
    ): Promise<void> {
        const fabricVersion: any = await this.getFabricVersionInfo(clientVer)
        if (fabricVersion === undefined) return

        const profileUUID = await super.downloadClient(
            clientVer,
            instanceName,
            true
        )
        if (profileUUID === undefined) return

        const librariesDir = path.resolve(StorageHelper.librariesDir, clientVer)

        LogHelper.info(
            this.langManager.getTranslate.DownloadManager.FabricManager.client
                .download
        )
        const librariesList: Set<string> = new Set()
        fabricVersion.libraries.forEach((lib: any) => {
            librariesList.add(this.getLibPath(lib.name))
        })
        try {
            await HttpHelper.downloadFiles(
                librariesList,
                this.fabricLink,
                librariesDir
            )
        } catch (error) {
            LogHelper.error(
                this.langManager.getTranslate.DownloadManager.FabricManager
                    .client.downloadErr
            )
            LogHelper.debug(error)
            return
        }

        //Profiles
        this.profilesManager.editProfile(profileUUID, {
            mainClass: fabricVersion.mainClass,
        } as ProfileConfig)
        LogHelper.info(
            this.langManager.getTranslate.DownloadManager.FabricManager.client
                .success
        )
    }

    async getFabricVersionInfo(version: string): Promise<any> {
        let loadersData
        try {
            loadersData = await HttpHelper.getResource(
                new URL(
                    `https://meta.fabricmc.net/v2/versions/loader/${version}`
                )
            )
        } catch (error) {
            LogHelper.debug(error)
            LogHelper.error(
                this.langManager.getTranslate.DownloadManager.FabricManager.info
                    .unavailableSite
            )
            return
        }

        let loaders: any[]
        try {
            loaders = JsonHelper.fromJson(loadersData)
        } catch (error) {
            LogHelper.debug(error)
            LogHelper.error(
                this.langManager.getTranslate.DownloadManager.FabricManager.info
                    .errJsonParsing
            )
            return
        }

        const data = loaders.find((data: any) => data.loader.stable === true)
        if (data === undefined) {
            LogHelper.error(
                this.langManager.getTranslate.DownloadManager.FabricManager.info
                    .verNotFound,
                version
            )
            return
        }

        let versionData
        try {
            versionData = await HttpHelper.getResource(
                new URL(
                    `https://meta.fabricmc.net/v2/versions/loader/${version}/${data.loader.version}/profile/json`
                )
            )
        } catch (error) {
            LogHelper.debug(error)
            LogHelper.error(
                this.langManager.getTranslate.DownloadManager.FabricManager.info
                    .clientDataNotFound
            )
            return
        }

        try {
            return JsonHelper.fromJson(versionData)
        } catch (error) {
            LogHelper.debug(error)
            LogHelper.error(
                this.langManager.getTranslate.DownloadManager.FabricManager.info
                    .errClientParsing
            )
            return
        }
    }

    getLibPath(name: string): string {
        const patterns = name.split(":")
        return `${patterns[0].replace(/\./g, "/")}/${patterns[1]}/${
            patterns[2]
        }/${patterns[1]}-${patterns[2]}.jar`
    }
}
