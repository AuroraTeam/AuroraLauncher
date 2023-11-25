import path from "path";

import { LogHelper, StorageHelper, SystemHelper } from "@root/utils";
import semver from "semver";
import { injectable, singleton } from "tsyringe";

import { version as currentVersion } from "../../../package.json";
import { ConfigManager } from "../config";
import { LangManager } from "../langs";
import { HttpHelper } from "@aurora-launcher/core";

@singleton()
@injectable()
export class UpdateManager {
    private readonly apiUrl = new URL("versions", "https://api.aurora-launcher.ru/");
    private readonly fileTypeMap: Record<string, string> = {
        win32: "binary-win",
        darwin: "binary-mac",
        linux: "binary-linux",
    };
    private readonly fileType: string = SystemHelper.isStandalone()
        ? this.fileTypeMap[SystemHelper.getPlatform()]
        : "js";
    private readonly execFileName: string = SystemHelper.isStandalone()
        ? `LauncherServer-${SystemHelper.getPlatform()}`
        : "LauncherServer.js";

    constructor(
        private readonly configManager: ConfigManager,
        private readonly langManager: LangManager,
    ) {
        this.checkUpdate();
    }

    public async installUpdate() {
        const latestVersion = await this.checkUpdate();
        if (!latestVersion) return;

        LogHelper.info(this.langManager.getTranslate.UpdateManager.updating);
        LogHelper.info(this.langManager.getTranslate.UpdateManager.downloadingLatestVer);

        const downloadUrl = latestVersion.files[this.fileType];
        const downloadPath = path.resolve(StorageHelper.storageDir, this.execFileName);

        await HttpHelper.downloadFile(new URL(downloadUrl), downloadPath);

        LogHelper.info(this.langManager.getTranslate.UpdateManager.downloadEnd);
        process.exit(0);
    }

    public async checkUpdate(): Promise<Version | void> {
        LogHelper.info(this.langManager.getTranslate.UpdateManager.check);
        const versionsData: VersionsData = await this.getVersionsData().catch(() => undefined);

        if (!versionsData) {
            return LogHelper.info(this.langManager.getTranslate.UpdateManager.checkEnd);
        }

        const latestVersion = versionsData[this.configManager.config.branch as "stable" | "dev"];

        if (!this.needUpdate(latestVersion)) {
            return LogHelper.info(this.langManager.getTranslate.UpdateManager.checkEnd);
        }

        const latestVersionData = versionsData.versions.find(
            (versionData: Version) => versionData.version === latestVersion,
        );

        if (!latestVersionData) {
            return LogHelper.error(this.langManager.getTranslate.UpdateManager.checkErr);
        }

        LogHelper.info(
            this.langManager.getTranslate.UpdateManager.newUpdateAvaliable,
            latestVersion,
        );
        LogHelper.info(
            this.langManager.getTranslate.UpdateManager.newUpdate,
            latestVersion,
            currentVersion,
            new Date(latestVersionData.date).toLocaleString(),
        );

        return latestVersionData;
    }

    public async getVersionsData(): Promise<VersionsData> {
        return await HttpHelper.getResourceFromJson<VersionsData>(this.apiUrl);
    }

    public needUpdate(latestVersion: string): boolean {
        return semver.gt(latestVersion, currentVersion);
    }
}

export interface VersionsData {
    stable: string;
    dev: string;
    versions: Version[];
}

export interface Version {
    version: string;
    date: number;
    note: string;
    files: Record<string, string>;
}
