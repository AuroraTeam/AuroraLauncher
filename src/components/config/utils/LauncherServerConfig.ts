import { Lang } from "@root/components"
import { AbstractAuthProviderConfig, JsonHelper } from "@root/utils"
import { instanceToPlain, plainToInstance } from "class-transformer"
import { v4 } from "uuid"

import { ApiConfig } from "./ApiConfig"

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

    static getDefaults(): LauncherServerConfig {
        const config = new LauncherServerConfig()
        config.configVersion = 0
        config.projectID = v4()
        config.projectName = ""
        config.lang = "ru"
        config.branch = "stable"
        config.env = Envirovement.DEV
        config.mirrors = []
        config.auth = AbstractAuthProviderConfig.getDefaultConfig()
        config.api = ApiConfig.getDefaultConfig()
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
