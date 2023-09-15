export type Profile = Required<PartialProfile>

export interface PartialProfile {
    //Don`t touch
    configVersion?: number

    // Profile information
    uuid?: string
    sortIndex?: number
    servers?: ProfileServerConfig[]

    // Client
    version: string
    clientDir: string
    assetIndex: string
    libraries: ProfileLibrary[]
    // Launch client
    gameJar?: string
    mainClass?: string
    jvmArgs?: string[]
    clientArgs?: string[]

    // Updates
    update?: string[]
    updateVerify?: string[]
    updateExclusions?: string[]
    // TODO Продумать опционалки
    // updateOptional: ProfileOptional[]
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
