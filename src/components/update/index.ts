import path from "path"

import { HttpHelper, LogHelper, StorageHelper, SystemHelper } from "@root/utils"
import semver from "semver"
import { injectable, singleton } from "tsyringe"

import { version as currentVersion } from "../../../package.json"
import { ConfigManager } from "../config"
import { LangManager } from "../langs"

@singleton()
@injectable()
export class UpdateManager {
    private readonly apiUrl = new URL(
        "latest",
        "https://api.aurora-launcher.ru/"
    )
    private readonly fileType:
        | "js"
        | "binary-win"
        | "binary-mac"
        | "binary-linux"
    private readonly execFileName: string

    constructor(
        private readonly configManager: ConfigManager,
        private readonly langManager: LangManager
    ) {
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

        LogHelper.info(this.langManager.getTranslate.UpdateManager.updating)
        LogHelper.info(
            this.langManager.getTranslate.UpdateManager.downloadingLatestVer
        )
        await HttpHelper.downloadFile(
            new URL(latestVersion.files[this.fileType]),
            path.resolve(StorageHelper.storageDir, this.execFileName)
        )

        LogHelper.info(this.langManager.getTranslate.UpdateManager.downloadEnd)
        process.exit(0)
    }

    /**
     * It checks if there's a new update available
     * @returns The latest version data or void
     */
    public async checkUpdate(): Promise<void | Version> {
        LogHelper.info(this.langManager.getTranslate.UpdateManager.check)

        let versionsData: VersionsData
        try {
            versionsData = await this.getVersionsData()
        } catch (_) {
            return LogHelper.info(
                this.langManager.getTranslate.UpdateManager.checkEnd
            )
        }
        const latestVersion =
            versionsData[<"stable" | "dev">this.configManager.config.branch]

        if (!this.needUpdate(latestVersion))
            return LogHelper.info(
                this.langManager.getTranslate.UpdateManager.checkEnd
            )

        LogHelper.info(
            this.langManager.getTranslate.UpdateManager.newUpdateAvaliable,
            latestVersion
        )
        const latestVersionData = versionsData.versions.find(
            ({ version }) => version === latestVersion
        )
        if (!latestVersionData)
            return LogHelper.error(
                this.langManager.getTranslate.UpdateManager.checkErr
            )

        LogHelper.info(
            this.langManager.getTranslate.UpdateManager.newUpdate,
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
        return HttpHelper.getResourceFromJson<VersionsData>(this.apiUrl)
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
