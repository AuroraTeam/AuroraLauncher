export interface InstallProfile {
    _comment_: Array<string>
    spec: number
    profile: string
    version: string
    path: null
    minecraft: string
    serverJarPath: URL
    data: object
    processors: Array<object>
    libraries: Array<Libraries>
    icon: string
    json: URL
    logo: URL
    mirrorList: URL
    welcome: string
}

export interface VersionProfiles {
    _comment_: Array<string>
    id: string
    time: string
    releaseTime: string
    type: string
    mainClass: string
    inheritsFrom: string
    logging: object
    arguments: {
        game: Array<string>
        jvm: Array<string>
    }
    libraries: Array<Libraries>
}

export interface Libraries {
    name: string
    downloads: {
        artifact: {
            path: string
            url: URL
            sha1: string
            size: number
        }
    }
}

export interface Manifest {
    data: [{
        name: string
        gameVersion: string
        latest: boolean
        recommended: boolean
        dateModified: string
    }]
}

export interface NeoManifest {
    isSnapshot: boolean
    version: string
}