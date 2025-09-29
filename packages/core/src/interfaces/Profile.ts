export interface Profile {
    //Don`t touch
    configVersion: number;

    // Profile information
    uuid: string;
    sortIndex: number;
    servers: ProfileServerConfig[];

    // Client
    javaVersion: number;
    version: string;
    clientDir: string;
    assetIndex: string;
    libraries: ProfileLibrary[];
    gameJar: string;
    mainClass: string;
    jvmArgs: string[];
    clientArgs: string[];

    // Updates
    update: string[];
    updateVerify: string[];
    updateExclusions: string[];
    // TODO Продумать опционалки
    // updateOptional: ProfileOptional[]

    // Whitelist
    whiteListType: "null" | "uuids" | "permissions";
    whiteListPermisson?: number; // TODO permission в виде чего?
    whiteListUUIDs?: string[]; // Список игроков по uuid
}

export interface ProfileLibrary {
    path: string;
    sha1: string;
    type: "library" | "native";
    rules?: LibraryRule[];
    ignoreClassPath?: boolean;
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

export interface ProfileServerConfigBase {
    title: string;
}

export interface ProfileServerHostnameConfig extends ProfileServerConfigBase {
    hostname: string;
}

export interface ProfileServerAddressConfig extends ProfileServerConfigBase {
    ip: string;
    port: number;
}

export type ProfileServerConfig = ProfileServerHostnameConfig | ProfileServerAddressConfig;

// export interface ProfileOptional {
//     id: number
//     name: string
//     description: string
//     mark: boolean
//     filename: string
//     conflict: number[]
//     children: ProfileOptional[]
// }
