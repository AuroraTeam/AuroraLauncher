import { ProfileConfig } from "../ClientArguments"

export interface ProfileRequestData {
    uuid: string
}

export interface ProfileResponseData {
    profile: ProfileConfig
}
