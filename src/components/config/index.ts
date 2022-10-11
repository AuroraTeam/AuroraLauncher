import fs from "fs"

import { LogHelper, StorageHelper } from "@root/utils"
import { set } from "lodash-es"

import { LauncherServerConfig } from "./utils/LauncherServerConfig"

export class ConfigManager {
    #config: LauncherServerConfig

    constructor() {
        if (fs.existsSync(StorageHelper.configFile)) {
            LogHelper.info("Loading configuration")

            this.load()

            LogHelper.info("Configuration file loaded successfully.")
        } else {
            LogHelper.info("Configuration not found! Create default config")

            this.#config = LauncherServerConfig.getDefaults()
            this.save()

            LogHelper.info(
                "The configuration file has been successfully created. Configure it and run LauncherServer again."
            )
            process.exit(0)
        }
    }

    /**
     * It returns the config object.
     * @returns The config object
     */
    get config(): LauncherServerConfig {
        return this.config
    }

    /**
     * It sets a property in the config object.
     * @param {string} prop - The property you want to set.
     * @param {string | number | boolean} value - The value to set the property to.
     */
    public setProp(prop: string, value: string | number | boolean): void {
        set(this.config, prop, value)
        this.save()
    }

    /**
     * It loads the config file
     */
    private load(): void {
        try {
            this.#config = LauncherServerConfig.fromJSON(fs.readFileSync(StorageHelper.configFile).toString())
        } catch (e) {
            if (e instanceof SyntaxError) {
                LogHelper.error(e)
                LogHelper.fatal("Json syntax broken. Try fix or delete LauncherServerConfig.json")
            }
            LogHelper.fatal(e)
        }
    }

    /**
     * It saves the config file
     */
    private save(): void {
        fs.writeFileSync(StorageHelper.configFile, this.config.toJSON())
    }
}
