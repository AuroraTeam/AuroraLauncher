import { randomUUID } from "crypto";

import { JsonHelper, Profile, ProfileLibrary, ProfileServerConfig } from "@aurora-launcher/core";
import { instanceToPlain, plainToInstance } from "class-transformer";
import { merge } from "lodash-es";

export class ProfileConfig implements Profile {
    configVersion: number;
    uuid: string;
    sortIndex: number;
    servers: ProfileServerConfig[];
    javaVersion: number;
    version: string;
    clientDir: string;
    assetIndex: string;
    libraries: ProfileLibrary[];
    gameJar: string;
    mainClass: string;
    jvmArgs: string[];
    clientArgs: string[];
    update: string[];
    updateVerify: string[];
    updateExclusions: string[];
    whiteListType: "null" | "uuids" | "permissions";
    whiteListPermisson?: number;
    whiteListUUIDs?: string;

    constructor(config: Partial<Profile>) {
        merge(this, ProfileConfig.defaults, config);
        this.uuid = randomUUID();
    }

    private static readonly defaults: Profile = {
        configVersion: 0,
        uuid: "",
        servers: [
            {
                ip: "127.0.0.1",
                port: 25565,
                title: "Test Server",
            },
        ],
        sortIndex: 0,
        javaVersion: 8,
        version: "",
        clientDir: "",
        assetIndex: "",
        update: [],
        updateVerify: [],
        updateExclusions: [],
        gameJar: "minecraft.jar",
        mainClass: "net.minecraft.client.main.Main",
        libraries: [],
        jvmArgs: [],
        clientArgs: [],
        whiteListType: "null",
    };

    public toObject() {
        return <Profile>instanceToPlain(this);
    }

    public toJSON() {
        return JsonHelper.toJson(this.toObject(), true);
    }

    public static fromJSON(json: string) {
        return plainToInstance(ProfileConfig, JsonHelper.fromJson<ProfileConfig>(json));
    }
}
