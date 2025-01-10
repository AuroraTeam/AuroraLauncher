import { randomUUID } from "crypto";

import { Lang } from "@root/components";
import { AuthProviderConfig } from "@root/components/auth/providers";
import { HjsonCommented, HjsonHelper } from "@root/utils";
import { instanceToPlain, plainToInstance } from "class-transformer";

import { ApiConfig } from "./ApiConfig";
import { SkinConfig } from "./SkinConfig";

export class LauncherServerConfig extends HjsonCommented {
    configVersion: number;
    projectID: string;
    projectName: string;
    lang: Lang;
    branch: ReleaseBranch;
    env: Environment;
    mirrors: string[];
    auth: AuthProviderConfig;
    skin: SkinConfig;
    api: ApiConfig;

    static getDefaults(): LauncherServerConfig {
        const config = new LauncherServerConfig();
        config.configVersion = 0;
        config.projectID = randomUUID();
        config.projectName = "";
        config.lang = "ru";
        config.branch = "stable";
        config.env = Environment.DEV;
        config.mirrors = [];
        config.auth = AuthProviderConfig.getDefaultConfig();
        config.skin = SkinConfig.getDefaultConfig();
        config.api = ApiConfig.getDefaultConfig();
        return config;
    }

    public toString(): string {
        const object = instanceToPlain(this);

        HjsonHelper.defineComments(this, object);

        return HjsonHelper.toHjson(object);
    }

    public static fromString(json: string): LauncherServerConfig {
        const data = HjsonHelper.fromHjson<LauncherServerConfig>(json);

        const _class = plainToInstance(LauncherServerConfig, data);

        HjsonHelper.defineComments(data, _class);

        return _class;
    }
}

export enum Environment {
    PRODUCTION = "prod",
    DEBUG = "debug",
    DEV = "dev",
}

type ReleaseBranch = "stable" | "dev";
