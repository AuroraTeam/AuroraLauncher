export interface VersionMeta {
    loader: Loader;
}

export interface Loader {
    version: string;
}

export interface ClientMeta {
    mainClass: string;
    libraries: Library[];
}

export interface Library {
    name: string;
    url: string;
}
