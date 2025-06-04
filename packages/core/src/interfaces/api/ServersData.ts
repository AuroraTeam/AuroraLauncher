import { ProfileServerConfig } from ".."

export const GET_SERVERS_METHOD = "getServers"

export type Server = ProfileServerConfig & {
    profileUUID: string
}

export type ServersResponseData = Server[]
