export interface LauncherServerModule {
    name: string
    version: string
    description: string
    author: string

    getInfo(): ModuleInfo
    init(): void
}

export interface ModuleInfo {
    name: string
    version: string
    description: string
    author: string
}
