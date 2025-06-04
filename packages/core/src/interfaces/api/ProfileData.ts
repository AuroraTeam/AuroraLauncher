import { Profile } from "../Profile"

export const GET_PROFILE_METHOD = "getProfile"

export interface ProfileRequestData {
    uuid: string
}

export type ProfileResponseData = Profile
