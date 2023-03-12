export interface VersionManifest {
    versions: Version[];
}

export interface Version {
    id: string;
    url: string;
}

export interface Client {
    arguments: Arguments;
    assetIndex: AssetIndex;
    assets: string;
    complianceLevel: number;
    downloads: ClientDownloads;
    id: string;
    javaVersion: JavaVersion;
    libraries: Library[];
    logging: Logging;
    mainClass: string;
    minimumLauncherVersion: number;
    releaseTime: Date;
    time: Date;
    type: string;
}

export interface Arguments {
    game: Array<GameClass | string>;
    jvm: Array<JvmClass | string>;
}

export interface GameClass {
    rules: GameRule[];
    value: string[] | string;
}

export interface GameRule {
    action: Action;
    features: Features;
}

export enum Action {
    Allow = "allow",
}

export interface Features {
    is_demo_user?: boolean;
    has_custom_resolution?: boolean;
}

export interface JvmClass {
    rules: JvmRule[];
    value: string[] | string;
}

export interface JvmRule {
    action: Action;
    os: Purpleos;
}

export interface Purpleos {
    name?: Name;
    version?: string;
    arch?: string;
}

export enum Name {
    Linux = "linux",
    Osx = "osx",
    Windows = "windows",
}

export interface AssetIndex {
    id: string;
    sha1: string;
    size: number;
    totalSize: number;
    url: string;
}

export interface ClientDownloads {
    client: ServerClass;
    client_mappings: Mappings;
    server: ServerClass;
    server_mappings: Mappings;
}

export interface ServerClass {
    sha1: string;
    size: number;
    url: string;
}

export interface Mappings {
    sha1: string;
    size: number;
    url: string;
}

export interface JavaVersion {
    component: string;
    majorVersion: number;
}

export interface Library {
    downloads: LibraryDownloads;
    name: string;
    rules?: LibraryRule[];
}

export interface LibraryDownloads {
    artifact: Artifact;
}

export interface Artifact {
    path: string;
    sha1: string;
    size: number;
    url: string;
}

export interface LibraryRule {
    action: Action;
    os: Fluffyos;
}

export interface Fluffyos {
    name: Name;
}

export interface Logging {
    client: LoggingClient;
}

export interface LoggingClient {
    argument: string;
    file: File;
    type: string;
}

export interface File {
    id: string;
    sha1: string;
    size: number;
    url: string;
}
