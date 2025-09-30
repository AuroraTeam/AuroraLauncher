import { Service } from "@freshgum/typedi";

import { AbstractRequest } from "../AbstractRequest";
import { TokenManager } from "./Token";

@Service([TokenManager])
export class GetTokenRequest implements AbstractRequest {
    method = "GET";
    url = "/release/get_token/";

    constructor(private tokenManager: TokenManager) {}

    handler() {
        return { token: this.tokenManager.getEncryptedToken() };
    }
}
