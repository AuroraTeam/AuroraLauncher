import path from "path"

import { HttpHelper, LogHelper, StorageHelper, SystemHelper } from "@root/helpers"
import semver from "semver"

// currentVersion для читабельности кода
// TODO вынести выбор ветки обновлений в конфиг лаунчсервера
import { branch, version as currentVersion } from "../../package.json"

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

    public async checkAndInstallUpdate() {
        const latestVersion = await this.checkUpdate()
        if (!latestVersion) return

        LogHelper.info("Updating LauncherServer...")
        LogHelper.info("Downloading current version...")
        await HttpHelper.downloadFile(
            new URL(latestVersion.files[this.fileType]),
            path.resolve(StorageHelper.storageDir, this.execFileName)
        )

        LogHelper.info("Download complete! Please restart LauncherServer.")
        process.exit(0)
    }

    public async checkUpdate(): Promise<void | Version> {
        LogHelper.info("Checking for new version...")

        let versionsData: VersionsData
        try {
            versionsData = await this.getVersionsData()
        } catch (_) {
            return LogHelper.info("No updates available")
        }
        const latestVersion = versionsData[<"stable" | "dev">branch]

        if (!this.needUpdate(latestVersion)) return LogHelper.info("No updates available")

        LogHelper.info(`New version available: ${latestVersion}`)
        const latestVersionData = versionsData.versions.find(({ version }) => version === latestVersion)
        if (!latestVersionData) return LogHelper.error("Can't find version data")

        LogHelper.info(
            `The latest LauncherServer version is ${latestVersion}, but you have ${currentVersion}. The latest version was built on ${new Date(
                latestVersionData.date
            ).toLocaleString()}.`
        )
        return latestVersionData
    }

    // Две функции ниже оставил на случай использования извне (например для модулей)
    // мб позже вырежу если не пригодятся, либо оставлю для более простой читабельности кода
    public getVersionsData(): Promise<VersionsData> {
        return HttpHelper.getJson<VersionsData>(this.apiUrl)
    }

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
