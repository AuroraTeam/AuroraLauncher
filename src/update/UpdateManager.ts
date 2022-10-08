import path from "path"

import { HttpHelper, LogHelper, StorageHelper, SystemHelper } from "@root/helpers"
import { App } from "@root/LauncherServer"
import semver from "semver"

import { version as currentVersion } from "../../package.json"

export class UpdateManager {
    private readonly apiUrl = new URL("latest", "https://api.aurora-launcher.ru/")
    private readonly fileType: "js" | "binary-win" | "binary-mac" | "binary-linux"
    private readonly execFileName: string

    constructor() {
        if (SystemHelper.isStandalone()) {
            switch (SystemHelper.getPlatform()) {
                case "win32":
                    this.fileType = "binary-win"
                    this.execFileName = "LauncherServer-win.exe"
                    break
                case "darwin":
                    this.fileType = "binary-mac"
                    this.execFileName = "LauncherServer-macos"
                    break
                case "linux":
                    this.fileType = "binary-linux"
                    this.execFileName = "LauncherServer-linux"
                    break
            }
        } else {
            this.fileType = "js"
            this.execFileName = "LauncherServer.js"
        }

        this.checkUpdate()
    }

    public async installUpdate() {
        const latestVersion = await this.checkUpdate()
        if (!latestVersion) return

        LogHelper.info(App.LangManager.getTranslate.UpdateManager.updating)
        LogHelper.info(App.LangManager.getTranslate.UpdateManager.downloadingLatestVer)
        await HttpHelper.downloadFile(
            new URL(latestVersion.files[this.fileType]),
            path.resolve(StorageHelper.storageDir, this.execFileName)
        )

        LogHelper.info(App.LangManager.getTranslate.UpdateManager.downloadEnd)
        process.exit(0)
    }

    /**
     * It checks if there's a new update available
     * @returns The latest version data or void
     */
    public async checkUpdate(): Promise<void | Version> {
        LogHelper.info(App.LangManager.getTranslate.UpdateManager.check)

        let versionsData: VersionsData
        try {
            versionsData = await this.getVersionsData()
        } catch (_) {
            return LogHelper.info(App.LangManager.getTranslate.UpdateManager.checkEnd)
        }
        const latestVersion = versionsData[<"stable" | "dev">App.ConfigManager.getConfig.branch]

        if (!this.needUpdate(latestVersion))
            return LogHelper.info(App.LangManager.getTranslate.UpdateManager.checkEnd)

        LogHelper.info(App.LangManager.getTranslate.UpdateManager.newUpdateAvaliable, latestVersion)
        const latestVersionData = versionsData.versions.find(({ version }) => version === latestVersion)
        if (!latestVersionData) return LogHelper.error(App.LangManager.getTranslate.UpdateManager.checkErr)

        LogHelper.info(
            App.LangManager.getTranslate.UpdateManager.newUpdate,
            latestVersion,
            currentVersion,
            new Date(latestVersionData.date).toLocaleString()
        )

        return latestVersionData
    }

    /**
     * It returns a promise that will resolve to a VersionsData object
     * @returns A promise of type VersionsData
     */
    public getVersionsData(): Promise<VersionsData> {
        return HttpHelper.getJson<VersionsData>(this.apiUrl)
    }

    /**
     * If the latest version is greater than the current version, then we need to update
     * @param {string} latestVersion - The latest version of the app.
     * @returns A boolean value.
     */
    public needUpdate(latestVersion: string): boolean {
        return semver.gt(latestVersion, currentVersion)
    }
}

export interface VersionsData {
    stable: string
    dev: string
    versions: Version[]
}

export interface Version {
    version: string
    date: number
    note: string
    files: Files
}

export interface Files {
    js: string
    "binary-win": string
    "binary-mac": string
    "binary-linux": string
}
