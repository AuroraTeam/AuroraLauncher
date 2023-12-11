import { AuthRequestData, AuthResponseData } from "@aurora-launcher/core";
import type { AuthProvider } from "@root/components/auth/providers";
import { AbstractRequest } from "aurora-rpc-server";
import { Inject, Service } from "typedi";

type WebSocketClient = Parameters<AbstractRequest["invoke"]>["1"];

export interface ExtendedWebSocketClient extends WebSocketClient {
    isAuthed: boolean;
}

@Service()
export class AuthWsRequest extends AbstractRequest {
    method = "auth";

    constructor(@Inject("AuthProvider") private authProvider: AuthProvider) {
        super();
    }

    /**
     * It takes a login and password, passes them to the auth provider, and returns the result
     * @param data - the data that was sent from the client
     * @param ws - the client that sent the request
     * @returns Promise<AuthResponseData>
     */
    async invoke(data: AuthRequestData, ws: ExtendedWebSocketClient): Promise<AuthResponseData> {
        const res = await this.authProvider.auth(data.login, data.password);
        ws.isAuthed = true;
        return res;
    }
}
