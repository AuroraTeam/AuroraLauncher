export interface ILauncherServerModule {
    name: string;
    version: string;
    description: string;
    author: string;
    dependencies: Record<string, string>;

    getInfo(): IModuleInfo;
    init(): void;
}

export interface IModuleInfo {
    name: string;
    version: string;
    description: string;
    author: string;
}
