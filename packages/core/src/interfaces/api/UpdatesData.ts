export const GET_UPDATES_METHOD = "getUpdates"

export interface UpdatesRequestData {
    dir: string
}

export interface HashedFile {
    path: string
    size: number
    sha1: string
}

export type UpdatesResponseData = HashedFile[]
