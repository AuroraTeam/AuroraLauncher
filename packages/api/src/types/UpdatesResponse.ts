import { Response } from "aurora-rpc-client"

export interface HashedFile {
    path: string
    size: number
    sha1: string
}

export interface UpdatesResponseData {
    hashes: HashedFile[]
}

export interface UpdatesResponse extends Response {
    result: UpdatesResponseData
}
