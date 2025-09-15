export const VERIFY_METHOD = "/verify";

export interface VerifyRequestData {
    stage: number;
    token?: string;
}

export interface VerifyResponseData {
    token?: string;
}
