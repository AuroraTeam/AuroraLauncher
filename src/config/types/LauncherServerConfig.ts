import { AbstractAuthProvider, AbstractAuthProviderConfig } from "@root/auth/AbstractAuthProvider"
import { classToPlain, deserialize } from "class-transformer"
import { v4 } from "uuid"

import { JsonHelper } from "../../helpers/JsonHelper"
import { Lang } from "../../langs/LangManager"
import { ApiConfig } from "./ApiConfig"

// TODO Инфа на будущее, пригодится при версионировании конфигов
// https://github.com/typestack/class-transformer/tree/v0.4.0#using-versioning-to-control-exposed-and-excluded-properties
export class LauncherServerConfig {
    configVersion: number
    projectID: string
    projectName: string
    lang: Lang
    env: Envirovement
    mirrors: string[]
    auth: AbstractAuthProviderConfig
    api: ApiConfig

    static getDefaults(): LauncherServerConfig {
        const config = new LauncherServerConfig()
        config.configVersion = 0
        config.projectID = v4()
        config.projectName = ""
        config.lang = "ru"
        config.env = Envirovement.DEV
        config.mirrors = []
        config.auth = AbstractAuthProvider.getDefaultConfig()
        config.api = ApiConfig.getDefaultConfig()
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
