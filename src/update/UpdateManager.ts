/* eslint-disable no-useless-escape */
import * as fs from "fs"
import * as os from "os"
import * as path from "path"

import { HttpHelper } from "@auroralauncher/core"
import { LogHelper } from "@root/helpers/LogHelper"
import UnixHelper from "@root/helpers/UnixHelper"

import { version } from "../../package.json"

export class UpdateManager {
    private version: string
    private branch: string
    private data: any
    private api: URL

    constructor() {
        this.checkUpdate()
    }

    private async init() {
        this.api = new URL("versions.json", "https://api.aurora-launcher.ru/")
        this.version = version.match(/([0-9]\.[0-9]\.?[0-9]?)\-?([a-z]+)?/i)[1]
        this.branch = version.match(/([0-9]\.[0-9]\.?[0-9]?)\-?([a-z]+)?/i)[2] === undefined ? "stable" : "dev"
        this.data = JSON.parse(await HttpHelper.readFile(this.api))
    }

    async checkUpdate() {
        await this.init()

        LogHelper.info("Checking for new version...")

        return this.needUpdate() === true
            ? LogHelper.info(`No update found, latest version: ${version} current version: ${version}`)
            : LogHelper.info(
                  `The latest LauncherServer version is ${this.data[this.branch] + "-" + this.branch} but you have ${
                      version + "-" + this.branch
                  }. The latest version was built on ${UnixHelper.convertUnixToDate(this.data.versions[0].date)}.`
              )
    }
    public needUpdate(): boolean {
        return this.data[this.branch] == this.version
    }

    async installUpdate() {
        try {
            const launcherServerFileType = !fs.existsSync(path.resolve(__dirname, "LauncherServer.js"))
                ? String(os.platform()) === "windows"
                    ? "binary-win"
                    : String(os.platform()) === "darwin"
                    ? "binary-mac"
                    : String(os.platform()) === "linux"
                    ? "binary-linux"
                    : "js"
                : "js"

            /* Костыль сука!! */
            const launcherServerFile = !fs.existsSync(path.resolve(__dirname, "LauncherServer.js"))
                ? String(os.platform()) === "windows"
                    ? "LauncherServer_win64.exe"
                    : String(os.platform()) === "darwin"
                    ? "LauncherServer_mac64"
                    : String(os.platform()) === "linux"
                    ? "LauncherServer_linux64"
                    : "LauncherServer.js"
                : "LauncherServer.js"

            LogHelper.info("Updating LauncherServer...")

            LogHelper.info("Downloading current version...")
            await HttpHelper.downloadFile(
                new URL(this.data.versions[0].files[launcherServerFileType]),
                path.resolve(__dirname, launcherServerFile)
            )

            LogHelper.info("Download complete! Please restart LauncherServer.")

            process.exit(0)
        } catch (err) {
            LogHelper.error("An error occurred while updating LauncherServer: ", err)
        }
        return
    }
}
