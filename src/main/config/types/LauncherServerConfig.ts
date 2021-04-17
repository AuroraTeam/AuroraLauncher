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

import { classToPlain, deserialize } from "class-transformer"

import { JsonHelper } from "../../helpers/JsonHelper"
import { AuthConfig } from "./AuthConfig"
import { WebSocketConfig } from "./WebSocketConfig"

// TODO Инфа на будущее, пригодится при версионировании конфигов
// https://github.com/typestack/class-transformer/tree/v0.4.0#using-versioning-to-control-exposed-and-excluded-properties
export class LauncherServerConfig {
    configVersion: number
    lang: "ru" | "en"
    env: Envirovement
    mirrors: string[]
    auth: AuthConfig
    ws: WebSocketConfig

    static getDefaults(): LauncherServerConfig {
        const config = new LauncherServerConfig()
        config.configVersion = 0
        config.lang = "ru"
        config.env = Envirovement.DEV
        config.mirrors = ["https://mirror.aurora-launcher.ru/"]
        config.auth = AuthConfig.getDefaults()
        config.ws = WebSocketConfig.getDefaults()
        return config
    }

    public toJSON(): string {
        return JsonHelper.toJSON(classToPlain(this), true)
    }

    public static fromJSON(json: string): LauncherServerConfig {
        return deserialize(LauncherServerConfig, json)
    }
}

export enum Envirovement {
    PRODUCTION = "prod",
    DEBUG = "debug",
    DEV = "dev",
}
