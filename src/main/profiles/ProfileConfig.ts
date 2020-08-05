export class ProfileConfig {
    //Don`t touch
    configVersion: string

    // Profile information
    version: string
    title: string
    uuid: string
    server: ProfileServer[]
    sortIndex: number

    // Assets
    assetsIndex: string
    assetsDir: string

    // Updates
    updatesDir: string
    update: string[]
    updateWath: string[]
    wathExclusions: string[]
    updateOptional: ProfileOptional[]

    // Launch client
    classPath: string[]
    jvmArgs: string[]
    clientArgs: string[]
    mainClass: string

    // Whitelist
    whiteListUsers: string[]
    hideProfile: boolean
    message: string
}

export class ProfileOptional {
    id: number
    name: string
    description: string
    mark: boolean
    filename: string
    conflict: number[]
    children: ProfileOptional[]
}

export class ProfileServer {
    ip: string
    port: string
    title: string
}
