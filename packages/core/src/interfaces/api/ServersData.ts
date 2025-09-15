import { ProfileServerConfig } from "..";

export const SERVERS_METHOD = "/servers";

export type Server = ProfileServerConfig & {
    profileUUID: string;
};

export type ServersResponseData = Server[];
