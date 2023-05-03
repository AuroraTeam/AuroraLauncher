import { Response } from "aurora-rpc-client"

export interface AuthResponseData {
    username: string
    userUUID: string
    accessToken: string
}

export interface AuthResponse extends Response {
    result: AuthResponseData
}
