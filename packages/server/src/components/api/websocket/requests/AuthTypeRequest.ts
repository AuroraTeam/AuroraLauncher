import { AuthTypeResponseData } from "@aurora-launcher/core";
import { AbstractRequest } from "@aurora-rpc/server";
import { Inject, Service } from "typedi";

import { AuthProvider } from "../../../auth";

@Service()
export class AuthTypeWsRequest extends AbstractRequest {
    method = "getAuthType";

    constructor(
        @Inject("AuthProvider")
        private authProvider: AuthProvider,
    ) {
        super();
    }

    invoke(): AuthTypeResponseData {
        return {
            type: this.authProvider.getAuthType(),
            extra: this.authProvider.getExtraAuthData(),
        };
    }
}
