import { JsonHelper } from "@auroralauncher/core"
import { instanceToPlain, plainToInstance } from "class-transformer"
import { merge } from "lodash"
import { v4 } from "uuid"

import { ProfileServerConfig } from "./ProfileServerConfig"

export class ProfileConfig {
    //Don`t touch
    configVersion: number

    // Profile information
    uuid: string
    sortIndex: number
    servers: ProfileServerConfig[]

    // Client
    version: string
    clientDir: string

    // Assets
    assetsIndex: string
    assetsDir: string

    // Updates
    update: string[]
    updateVerify: string[]
    updateExclusions: string[]
    // updateOptional: ProfileOptional[]

    // Launch client
    mainClass: string
    classPath: string[]
    jvmArgs: string[]
    clientArgs: string[]

    constructor(config: ProfileConfig) {
        merge(this, ProfileConfig.defaults, config)
    }

    private static readonly defaults = {
        configVersion: 0,
        uuid: v4(),
        servers: [
            {
                ip: "127.0.0.1",
                port: "25565",
                title: "clientTitle",
                whiteListType: "null",
            },
        ],
        sortIndex: 0,
        version: "1.16.5",
        clientDir: "clientDir",
        assetsIndex: "1.16.5",
        assetsDir: "assetsDir",
        update: [] as string[],
        updateVerify: [] as string[],
        updateExclusions: [] as string[],
        mainClass: "net.minecraft.client.main.Main",
        classPath: ["libraries", "minecraft.jar"],
        jvmArgs: [] as string[],
        clientArgs: [] as string[],
    }

    toObject() {
        return instanceToPlain(this)
    }

    public toJSON(): string {
        return JsonHelper.toJson(this.toObject(), true)
    }

    public static fromJSON(json: string): ProfileConfig {
        return plainToInstance(ProfileConfig, JsonHelper.fromJSON<ProfileConfig>(json))
    }
}
