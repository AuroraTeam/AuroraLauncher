export abstract class AbstractModule {
    abstract name: string
    abstract version: string
    abstract description: string
    abstract author: string

    abstract getInfo(): IGetInfo
    abstract init(): void
}

export interface IGetInfo {
    name: string
    version: string
    description: string
    author: string
}
