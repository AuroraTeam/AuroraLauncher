import { Profile } from "../Profile";

export const PROFILE_METHOD = "/profile";

export interface ProfileRequestData {
    uuid: string;
}

export type ProfileResponseData = Profile;
