import { AUTH_TYPE_METHOD } from "@aurora-launcher/core";
import { Service } from "@freshgum/typedi";

import { AuthProvider } from "../../../auth";
import { AbstractRequest } from "../AbstractRequest";

@Service([])
export class AuthTypeRequest implements AbstractRequest {
    method = "get";
    url = AUTH_TYPE_METHOD;

    constructor(private authProvider: AuthProvider) {}

    handler() {
        return {
            type: this.authProvider.getAuthType(),
            extra: this.authProvider.getExtraAuthData(),
        };
    }
}
