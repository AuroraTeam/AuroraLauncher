import { randomUUID } from "crypto";

import { JsonHelper, Profile, ProfileLibrary, ProfileServerConfig } from "@aurora-launcher/core";
import { instanceToPlain, plainToInstance } from "class-transformer";
import { merge } from "es-toolkit";

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
    whiteListUUIDs?: string[];

    constructor(config: Partial<Profile>) {
        this.configVersion = 0;
        this.uuid = randomUUID();
        this.servers = [
            {
                ip: "127.0.0.1",
                port: 25565,
                title: "Test Server",
            },
        ];
        this.sortIndex = 0;
        this.javaVersion = 8;
        this.version = "";
        this.clientDir = "";
        this.assetIndex = "";
        this.update = [];
        this.updateVerify = [];
        this.updateExclusions = [];
        this.gameJar = "minecraft.jar";
        this.mainClass = "net.minecraft.client.main.Main";
        this.libraries = [];
        this.jvmArgs = [];
        this.clientArgs = [];
        this.whiteListType = "null";

        merge(this, config);
    }

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
