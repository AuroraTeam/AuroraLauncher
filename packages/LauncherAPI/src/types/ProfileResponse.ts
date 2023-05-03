import { Response } from "aurora-rpc-client"

export interface Profile {
    //Don`t touch
    configVersion: number

    // Profile information
    uuid: string
    sortIndex: number
    // servers: ProfileServerConfig[]

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
}

export interface ProfileResponseData {
    profile: Profile
}

export interface ProfileResponse extends Response {
    result: ProfileResponseData
}
