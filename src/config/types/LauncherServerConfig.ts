import { AbstractAuthProvider, AbstractAuthProviderConfig } from "@root/auth/AbstractAuthProvider"
import { classToPlain, deserialize } from "class-transformer"
import { v4 } from "uuid"

import { JsonHelper } from "../../helpers/JsonHelper"
import { Lang } from "../../langs/LangManager"
import { WebSocketConfig } from "./WebSocketConfig"

// TODO Инфа на будущее, пригодится при версионировании конфигов
// https://github.com/typestack/class-transformer/tree/v0.4.0#using-versioning-to-control-exposed-and-excluded-properties
export class LauncherServerConfig {
    configVersion: number
    projectID: string
    lang: Lang
    env: Envirovement
    mirrors: string[]
    auth: AbstractAuthProviderConfig
    ws: WebSocketConfig

    static getDefaults(): LauncherServerConfig {
        const config = new LauncherServerConfig()
        config.configVersion = 0
        config.projectID = v4()
        config.lang = "ru"
        config.env = Envirovement.DEV
        config.mirrors = []
        config.auth = AbstractAuthProvider.getDefaultConfig()
        config.ws = WebSocketConfig.getDefaultConfig()
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
