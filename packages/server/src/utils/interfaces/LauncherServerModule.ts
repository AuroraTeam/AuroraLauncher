export interface ILauncherServerModule {
    name: string;
    version: string;
    description: string;
    author: string;

    getInfo(): IModuleInfo;
    init(): void;
}

export interface IModuleInfo {
    name: string;
    version: string;
    description: string;
    author: string;
}
