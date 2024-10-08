import type { AuthRequestData, AuthResponseData } from "@aurora-launcher/core";
import type { AuthProvider } from "@root/components/auth/providers";
import { JsonHelper } from "@aurora-launcher/core";
import { VerifyManager } from "@root/components";
import { AbstractRequest } from "aurora-rpc-server";
import { Inject, Service } from "typedi";

import type { ExtendedWebSocketClient } from "../ExtendedWebSocketClient";
import { VerifyMiddleware } from "./VerifyMiddleware";

@Service()
export class AuthWsRequest extends AbstractRequest {
    method = "auth";

    constructor(@Inject("AuthProvider") private authProvider: AuthProvider, private verifyManager: VerifyManager) {
        super();
    }

    /**
     * It takes a login and password, passes them to the auth provider, and returns the result
     * @param data - the data that was sent from the client
     * @param ws - the client that sent the request
     * @returns Promise<AuthResponseData>
     */
    @VerifyMiddleware()
    async invoke(data: AuthRequestData, ws: ExtendedWebSocketClient): Promise<AuthResponseData> {
        const res = await this.authProvider.auth(data.login, data.password);
        const authData = JsonHelper.toJson({"login":data.login, "password":data.password});
        res.token = this.verifyManager.encryptToken(Buffer.from(authData, 'utf8').toString('hex'));
        ws.isAuthed = true;
        return res;
    }
}
