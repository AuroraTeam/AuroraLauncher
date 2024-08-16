import * as proto from "@aurora-launcher/proto";
export interface Profile extends proto.ProfileResponse {}

export interface ProfileLibrary {
    path: string
    sha1: string
    type: "library" | "native"
    rules: LibraryRule[]
    ignoreClassPath?: boolean
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

export type ProfileServerConfig = proto.ServerConfig;

// export interface ProfileOptional {
//     id: number
//     name: string
//     description: string
//     mark: boolean
//     filename: string
//     conflict: number[]
//     children: ProfileOptional[]
// }
