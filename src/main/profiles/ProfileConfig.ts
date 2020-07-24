export class ProfileConfig {
    //Don`t touch
    configVersion: string

    // Profile information
    version: string
    title: string
    uuid: string
    server: Array<ProfileServer>
    sortIndex: number

    // Assets
    assetsIndex: string
    assetsDir: string

    // Updates
    updatesDir: string
    update: Array<string>
    updateVerify: Array<string>
    updateExclusions: Array<string>
    updateOptional: ProfileOptional

    // Launch client
    classPath: Array<string>
    jvmArgs: Array<string>
    clientArgs: Array<string>
    mainClass: string

    // Whitelist
    whiteListUsers: Array<string>
    whiteListPermission: boolean
    hideProfile: boolean
    message: string
}

export class ProfileOptional {
    id: number
    name: string
    description: string
    mark: boolean
    filename: string
    conflict: Array<number>
    children: ProfileOptional
}

export class ProfileServer {
    ip: string
    port: string
    title: string
}
