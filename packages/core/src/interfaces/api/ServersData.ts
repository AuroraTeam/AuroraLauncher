export interface Server {
    ip: string
    port: number
    title: string
    profileUUID: string
}

export type ServersResponseData = Server[]
