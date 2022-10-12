import { Lang } from "@root/components"
import { AbstractAuthProvider, AbstractAuthProviderConfig, JsonHelper } from "@root/utils"
import { instanceToPlain, plainToInstance } from "class-transformer"
import { v4 } from "uuid"

import { ApiConfig } from "./ApiConfig"
import { DatabaseConfig } from "./DatabaseConfig"

// TODO Инфа на будущее, пригодится при версионировании конфигов
// https://github.com/typestack/class-transformer/tree/v0.4.0#using-versioning-to-control-exposed-and-excluded-properties
export class LauncherServerConfig {
    configVersion: number
    projectID: string
    projectName: string
    lang: Lang
    branch: branch
    env: Envirovement
    mirrors: string[]
    auth: AbstractAuthProviderConfig
    api: ApiConfig
    db: DatabaseConfig

    static getDefaults(): LauncherServerConfig {
        const config = new LauncherServerConfig()
        config.configVersion = 0
        config.projectID = v4()
        config.projectName = ""
        config.lang = "ru"
        config.branch = "stable"
        config.env = Envirovement.DEV
        config.mirrors = []
        config.auth = AbstractAuthProvider.getDefaultConfig()
        config.api = ApiConfig.getDefaultConfig()
        config.db = DatabaseConfig.getDefaultConfig()
        return config
    }

    public toJSON(): string {
        return JsonHelper.toJson(instanceToPlain(this), true)
    }

    public static fromJSON(json: string): LauncherServerConfig {
        return plainToInstance(LauncherServerConfig, JSON.parse(json))
    }
}

export enum Envirovement {
    PRODUCTION = "prod",
    DEBUG = "debug",
    DEV = "dev",
}

type branch = "stable" | "latest" | "dev"
