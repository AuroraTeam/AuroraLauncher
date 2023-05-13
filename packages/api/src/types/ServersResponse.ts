import { Response } from "aurora-rpc-client"

export interface Server {
    ip: string
    port: number
    title: string
    profileUUID: string
}

export interface ServersResponseData {
    servers: Server[]
}

export interface ServersResponse extends Response {
    result: ServersResponseData
}
