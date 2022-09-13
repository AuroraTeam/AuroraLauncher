import fs from "fs"

import { LogHelper, StorageHelper } from "@root/helpers"
import { set } from "lodash"

import { LauncherServerConfig } from "./types/LauncherServerConfig"

export class ConfigManager {
    private config: LauncherServerConfig

    constructor() {
        if (fs.existsSync(StorageHelper.configFile)) {
            LogHelper.info("Loading configuration")

            this.load()

            LogHelper.info("Configuration file loaded successfully.")
        } else {
            LogHelper.info("Configuration not found! Create default config")

            this.config = LauncherServerConfig.getDefaults()
            this.save()

            LogHelper.info(
                "The configuration file has been successfully created. Configure it and run LauncherServer again."
            )
            process.exit(0)
        }
    }

    public getConfig(): LauncherServerConfig {
        return this.config
    }

    public setProp(prop: string, value: string | number | boolean): void {
        set(this.config, prop, value)
        this.save()
    }

    private load(): void {
        try {
            this.config = LauncherServerConfig.fromJSON(fs.readFileSync(StorageHelper.configFile).toString())
        } catch (e) {
            if (e instanceof SyntaxError) {
                LogHelper.error(e)
                LogHelper.fatal("Json syntax broken. Try fix or delete LauncherServerConfig.json")
            }
            LogHelper.fatal(e)
        }
    }

    private save(): void {
        fs.writeFileSync(StorageHelper.configFile, this.config.toJSON())
    }
}
