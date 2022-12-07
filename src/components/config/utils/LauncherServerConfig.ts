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
        return JsonHelper.toJson(instanceToPlain(this), true)
    }

    public static fromJSON(json: string): LauncherServerConfig {
        return plainToInstance(LauncherServerConfig, JSON.parse(json))
    }
}

export enum Environment {
    PRODUCTION = "prod",
    DEBUG = "debug",
    DEV = "dev",
}

type branch = "stable" | "latest" | "dev"
