import { ResponseData } from "../../api/websocket/types/Response"
import { AbstractProvider } from "../AbstractProvider"
import { AcceptAuthProvider } from "./AcceptAuthProvider"

export abstract class AbstractAuthProvider extends AbstractProvider {
    abstract auth(username: string, password: string): PromiseOr<AuthResponseData>

    abstract join(accessToken: string, userUUID: string, serverId: string): PromiseOr<void>

    abstract hasJoined(username: string, serverId: string): PromiseOr<HasJoinedResponseData>

    abstract profile(userUUID: string): PromiseOr<ProfileResponseData>

    abstract privileges(accessToken: string): PromiseOr<PrivilegesResponseData>

    abstract profiles(userUUIDs: string[]): PromiseOr<ProfilesResponseData[]>

    public static getDefaultConfig(): AbstractAuthProviderConfig {
        return {
            type: AcceptAuthProvider.getType(),
        }
    }
}

export interface AbstractAuthProviderConfig {
    type: string
}

export interface AuthResponseData extends ResponseData {
    username: string
    userUUID: string
    accessToken: string
}

export interface HasJoinedResponseData extends ResponseData {
    userUUID: string
    skinUrl?: string
    capeUrl?: string
}

export interface ProfileResponseData extends ResponseData {
    username: string
    skinUrl?: string
    capeUrl?: string
}

export interface PrivilegesResponseData extends ResponseData {
    onlineChat: boolean
    multiplayerServer: boolean
    multiplayerRealms: boolean
    telemetry: boolean
}

export interface ProfilesResponseData extends ResponseData {
    id: string
    name: string
}
