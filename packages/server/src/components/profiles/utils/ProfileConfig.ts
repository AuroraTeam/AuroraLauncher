import { randomUUID } from "crypto";

import {
    PartialProfile,
    Profile,
    ProfileLibrary,
    ProfileServerConfig,
} from "@aurora-launcher/core";
import { JsonHelper } from "@root/utils";
import { instanceToPlain, plainToInstance } from "class-transformer";
import { merge } from "lodash-es";

export class ProfileConfig implements Profile {
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

    constructor(config: PartialProfile) {
        merge(this, ProfileConfig.defaults, config);
    }

    private static readonly defaults: Profile = {
        configVersion: 0,
        uuid: randomUUID(),
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
        return <Profile>instanceToPlain(this);
    }

    public toJSON() {
        return JsonHelper.toJson(this.toObject(), true);
    }

    public static fromJSON(json: string) {
        return plainToInstance(ProfileConfig, JsonHelper.fromJson<ProfileConfig>(json));
    }
}
