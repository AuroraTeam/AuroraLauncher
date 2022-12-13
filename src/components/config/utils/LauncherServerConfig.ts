import { Lang } from "@root/components"
import { AuthProviderConfig } from "@root/components/auth/providers"
import { JsonHelper } from "@root/utils"
import { instanceToPlain, plainToInstance } from "class-transformer"
import { v4 } from "uuid"

import { ApiConfig } from "./ApiConfig"

export class LauncherServerConfig {
    configVersion: number
    projectID: string
    projectName: string
    lang: Lang
    branch: branch
    env: Environment
    mirrors: string[]
    auth: AuthProviderConfig
    api: ApiConfig

    static getDefaults(): LauncherServerConfig {
        const config = new LauncherServerConfig()
        config.configVersion = 0
        config.projectID = v4()
        config.projectName = ""
        config.lang = "ru"
        config.branch = "stable"
        config.env = Environment.DEV
        config.mirrors = []
        config.auth = AuthProviderConfig.getDefaultConfig()
        config.api = ApiConfig.getDefaultConfig()
        return config
    }

    public toJSON(): string {
        const object = instanceToPlain(this)

        return JsonHelper.toJson(object, true)
    }

    public static fromJSON(json: string): LauncherServerConfig {
        const data = JsonHelper.fromJson(json)

        return plainToInstance(LauncherServerConfig, data)
    }
}

export enum Environment {
    PRODUCTION = "prod",
    DEBUG = "debug",
    DEV = "dev",
}

type branch = "stable" | "latest" | "dev"
