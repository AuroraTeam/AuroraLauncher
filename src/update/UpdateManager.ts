import * as os from "os"
import * as path from "path"

import { HttpHelper } from "@auroralauncher/core"
import { LogHelper } from "@root/helpers/LogHelper"
import * as semver from "semver"

import { branch, version } from "../../package.json"

export class UpdateManager {
    private platform: string
    private versionMeta: string[]
    private apiMeta: any
    private fileType: string
    private execFileName: string

    constructor() {
        this.checkVersion()
    }
    async init() {
        this.platform = os.platform()
        this.apiMeta = JSON.parse(
            await HttpHelper.readFile(new URL("versions.json", "https://api.aurora-launcher.ru/"))
        )
        this.versionMeta = [String(semver.parse(version)), branch]

        this.fileType = process.pkg
            ? this.platform === "windows"
                ? "binary-win"
                : this.platform === "darwin"
                ? "binary-mac"
                : this.platform === "linux"
                ? "binary-linux"
                : "js"
            : "js"

        switch (this.fileType) {
            case "binary-win":
                this.execFileName = "LauncherServer_win64.exe"
                break
            case "binary-mac":
                this.execFileName = "LauncherServer_mac64"
                break
            case "binary-linux":
                this.execFileName = "LauncherServer_linux64"
                break
            default:
                this.execFileName = "LauncherServer.js"
        }
    }

    public async installUpdate() {
        LogHelper.info("Updating LauncherServer...")

        LogHelper.info("Downloading current version...")
        await HttpHelper.downloadFile(
            new URL(this.apiMeta.versions[0].files[this.fileType]),
            path.resolve(__dirname, this.execFileName)
        )

        LogHelper.info("Download complete! Please restart LauncherServer.")
        process.exit(0)
    }

    private async checkVersion(): Promise<any> {
        await this.init()

        LogHelper.info("Checking for new version...")

        return !this.checkUpdate()
            ? LogHelper.info(
                  `No update found, latest version: ${this.versionMeta.join(
                      "-"
                  )} current version: ${this.versionMeta.join("-")}`
              )
            : LogHelper.info(
                  `The latest LauncherServer version is ${
                      this.apiMeta[this.versionMeta[1]] + "-" + this.versionMeta[1]
                  }, but you have ${this.versionMeta.join("-")}. The latest version was built on ${new Date(
                      this.apiMeta.versions[0].date
                  ).toLocaleString()}.`
              )
    }

    public checkUpdate() {
        return semver.lt(this.versionMeta[0], this.apiMeta[this.versionMeta[1]])
    }
}
