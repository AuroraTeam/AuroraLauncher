import { JsonHelper } from "@root/utils";
import { instanceToPlain, plainToInstance } from "class-transformer";
import { merge } from "lodash-es";
import { v4 } from "uuid";

import { ProfileServerConfig } from "./ProfileServerConfig";

export type IProfileConfig = Required<IPartialProfileConfig>;

export interface IPartialProfileConfig {
    //Don`t touch
    configVersion?: number;

    // Profile information
    uuid?: string;
    sortIndex?: number;
    servers?: ProfileServerConfig[];

    // Client
    version: string;
    clientDir: string;

    // Assets
    assetsIndex: string;
    libraries: ProfileLibrary[];

    // Updates
    update?: string[];
    updateVerify?: string[];
    updateExclusions?: string[];
    // updateOptional: ProfileOptional[]

    // Launch client
    mainClass?: string;
    gameJar?: string;
    jvmArgs?: string[];
    clientArgs?: string[];
}

export interface ProfileLibrary {
    path: string;
    sha1: string;
    type: "library" | "native";
    rules?: LibraryRule[];
}

export interface LibraryRule {
    action: Action;
    os?: OS;
}

export interface OS {
    name: Name;
    arch?: string;
    version?: string;
}

export enum Action {
    Allow = "allow",
    Disallow = "disallow",
}

export enum Name {
    Linux = "linux",
    Osx = "osx",
    Windows = "windows",
}

export class ProfileConfig implements IProfileConfig {
    //Don`t touch
    configVersion: number;

    // Profile information
    uuid: string;
    sortIndex: number;
    servers: ProfileServerConfig[];

    // Client
    version: string;
    clientDir: string;

    // Assets
    assetsIndex: string;
    libraries: ProfileLibrary[];

    // Updates
    update: string[];
    updateVerify: string[];
    updateExclusions: string[];
    // updateOptional: ProfileOptional[]

    // Launch client
    mainClass: string;
    gameJar: string;
    jvmArgs: string[];
    clientArgs: string[];

    constructor(config: IPartialProfileConfig) {
        merge(this, ProfileConfig.defaults, config);
    }

    private static readonly defaults: IProfileConfig = {
        configVersion: 0,
        uuid: v4(),
        servers: [
            {
                ip: "127.0.0.1",
                port: 25565,
                title: "",
                whiteListType: "null",
            },
        ],
        sortIndex: 0,
        version: "",
        clientDir: "",
        assetsIndex: "",
        update: [],
        updateVerify: [],
        updateExclusions: [],
        mainClass: "net.minecraft.client.main.Main",
        gameJar: "minecraft.jar",
        libraries: [],
        jvmArgs: [],
        clientArgs: [],
    };

    toObject() {
        return instanceToPlain(this);
    }

    public toJSON() {
        return JsonHelper.toJson(this.toObject(), true);
    }

    public static fromJSON(json: string) {
        return plainToInstance(
            ProfileConfig,
            JsonHelper.fromJson<ProfileConfig>(json)
        );
    }
}
