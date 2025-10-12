import { randomUUID } from "crypto";

// import { Lang } from "@root/components";
import { HjsonCommented, HjsonHelper } from "@root/helpers";
import { instanceToPlain, plainToInstance } from "class-transformer";

import { AuthProviderConfig } from "../../auth/providers/AuthProvider";
import { Lang } from "../../langs/utils";
import { ApiConfig } from "./ApiConfig";

export class LauncherServerConfig extends HjsonCommented {
    configVersion: number;
    projectID: string;
    projectName: string;
    lang: Lang;
    branch: ReleaseBranch;
    env: Environment;
    mirrors: string[];
    auth: AuthProviderConfig;
    api: ApiConfig;

    constructor() {
        super();

        this.configVersion = 0;
        this.projectID = randomUUID();
        this.projectName = "";
        this.lang = "ru";
        this.branch = "stable";
        this.env = Environment.DEV;
        this.mirrors = [];
        this.auth = { type: "accept" };
        this.api = new ApiConfig();
    }

    override toString(): string {
        const object = instanceToPlain(this);

        HjsonHelper.defineComments(this, object);

        return HjsonHelper.toHjson(object);
    }

    static fromString(json: string): LauncherServerConfig {
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
