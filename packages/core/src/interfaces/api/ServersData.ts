import { ProfileServerConfig } from ".."

export type Server = ProfileServerConfig & {
    profileUUID: string
}

export type ServersResponseData = Server[]
