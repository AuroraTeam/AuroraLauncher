/**
 * AuroraLauncher LauncherServer - Server for AuroraLauncher
 * Copyright (C) 2020 - 2021 AuroraTeam

 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.

 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.

 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { JsonHelper } from "../helpers/JsonHelper"
import { LogHelper } from "../helpers/LogHelper"
import { StorageHelper } from "../helpers/StorageHelper"
import { App } from "../LauncherServer"
import { AuthConfig, Envirovement, LauncherServerConfig, WebSocketConfig } from "./LauncherServerConfig"
import fs = require("fs")

export class ConfigManager {
    private config: LauncherServerConfig

    constructor() {
        if (fs.existsSync(StorageHelper.configFile)) {
            LogHelper.info("Loading configuration")
            this.load()
        } else {
            LogHelper.info("Configuration not found! Create default config")
            this.config = this.getDefaults()
            this.save()
        }
    }

    getProperty(property: string, raw = false): any {
        const path = property.split(".")
        let prop: any = this.config
        path.forEach((el) => {
            prop = prop[el]
            if (prop === undefined) {
                if (!raw) LogHelper.fatal(App.LangManager.getTranslate("ConfigManager.propNotFound"), property)
                return prop
            }
        })
        return prop
    }

    getDefaults(): LauncherServerConfig {
        const config = new LauncherServerConfig()
        config.configVersion = "0"
        config.lang = "ru"
        config.env = Envirovement.DEV
        config.updatesUrl = ["https://mirror.aurora-launcher.ru/"]
        config.auth = AuthConfig.getDefaults()
        config.ws = WebSocketConfig.getDefaults()
        return config
    }

    load(): void {
        const config = fs.readFileSync(StorageHelper.configFile)
        try {
            this.config = JsonHelper.toJSON(config.toString())
        } catch (e) {
            if (e instanceof SyntaxError) {
                LogHelper.error(e)
                LogHelper.fatal("Json syntax broken. Try fix or delete LauncherServerConfig.json")
            }
        }
    }

    save(): void {
        fs.writeFileSync(StorageHelper.configFile, JsonHelper.toString(this.config, true))
    }
}
