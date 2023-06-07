export interface ILauncherServerModule {
    name: string;
    version: string;
    description: string;
    author: string;
    dependencies: IDependencies;

    getInfo(): IModuleInfo;
    init(): void;
}

export interface IModuleInfo {
    name: string;
    version: string;
    description: string;
    author: string;
}

export interface IDependencies {
    [index: string]: string;
}
