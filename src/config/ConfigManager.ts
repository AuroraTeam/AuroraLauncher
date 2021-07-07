import * as fs from "fs"

import { set } from "lodash"

import { LogHelper } from "../helpers/LogHelper"
import { StorageHelper } from "../helpers/StorageHelper"
import { LauncherServerConfig } from "./types/LauncherServerConfig"

export class ConfigManager {
    private config: LauncherServerConfig

    constructor() {
        if (fs.existsSync(StorageHelper.configFile)) {
            LogHelper.info("Loading configuration")
            this.load()
        } else {
            LogHelper.info("Configuration not found! Create default config")
            this.config = LauncherServerConfig.getDefaults()
            this.save()
        }
    }

    getConfig(): LauncherServerConfig {
        return this.config
    }

    // Аеее cас
    setProp(prop: string, value: string | number | boolean): void {
        set(this.config, prop, value)
        this.save()
    }

    private load(): void {
        const config = fs.readFileSync(StorageHelper.configFile).toString()
        try {
            this.config = LauncherServerConfig.fromJSON(config)
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
