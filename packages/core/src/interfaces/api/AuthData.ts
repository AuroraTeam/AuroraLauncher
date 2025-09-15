import { AuthType } from "../AuthType";

export const AUTH_TYPE_METHOD = "/auth-type";
export const AUTH_METHOD = "/auth";

export interface AuthTypeResponseData {
    type: AuthType;
    extra: unknown;
}

export interface AuthRequestData {
    login: string;
    password: string;
}

export interface AuthResponseData {
    username: string;
    userUUID: string;
    accessToken: string;
    refreshToken: string;
    isAlex?: boolean;
    skinUrl?: string;
    capeUrl?: string;
}
