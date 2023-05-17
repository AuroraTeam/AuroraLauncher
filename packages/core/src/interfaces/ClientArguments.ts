export type ClientArguments = ProfileConfig

export type ProfileConfig = Required<PartialProfileConfig>

export interface PartialProfileConfig {
    //Don`t touch
    configVersion?: number

    // Profile information
    uuid?: string
    sortIndex?: number
    servers?: ProfileServerConfig[]

    // Client
    version: string
    clientDir: string

    // Assets
    assetsIndex: string
    libraries: ProfileLibrary[]

    // Updates
    update?: string[]
    updateVerify?: string[]
    updateExclusions?: string[]
    // updateOptional: ProfileOptional[]

    // Launch client
    mainClass?: string
    gameJar?: string
    jvmArgs?: string[]
    clientArgs?: string[]
}

export interface ProfileLibrary {
    path: string
    sha1: string
    type: "library" | "native"
    rules?: LibraryRule[]
}

export interface LibraryRule {
    action: Action
    os?: OS
}

export interface OS {
    name: Name
    arch?: string
    version?: string
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

export interface ProfileServerConfig {
    ip: string
    port: number
    title: string

    // Whitelist
    whiteListType: "null" | "users" | "uuids" | "permissions"
    whiteListPermisson?: number // permission в виде битового флага (пока только как возможный вариант)
    whiteListUUIDs?: string[] // Список игроков по uuid
    hideProfile?: boolean
    message?: string
}

// export interface ProfileOptional {
//     id: number
//     name: string
//     description: string
//     mark: boolean
//     filename: string
//     conflict: number[]
//     children: ProfileOptional[]
// }
