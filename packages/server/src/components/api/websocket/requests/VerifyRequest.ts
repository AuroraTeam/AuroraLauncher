import { VerifyRequestData, VerifyResponseData } from "@aurora-launcher/core";
import { VerifyManager } from "@root/components";
import { SecureHelper } from "@root/utils";
import { AbstractRequest, ResponseError } from "aurora-rpc-server";
import { Service } from "typedi";

import { ExtendedWebSocketClient } from "../ExtendedWebSocketClient";

@Service()
export class VerifyWsRequest extends AbstractRequest {
    method = "verify";

    constructor(private verifyManager: VerifyManager) {
        super();
    }

    invoke(request: VerifyRequestData, ws: ExtendedWebSocketClient): VerifyResponseData {
        switch (request.stage) {
            case 1:
                return this.firstStage(ws);
            case 2:
                return this.secondStage(request, ws);
            default:
                throw new ResponseError("Invalid stage", 400);
        }
    }

    // TODO DOS guard
    firstStage(ws: ExtendedWebSocketClient) {
        ws.verifyToken = SecureHelper.generateRandomToken(32);
        const encryptedToken = this.verifyManager.encryptToken(ws.verifyToken);

        return { token: encryptedToken };
    }

    secondStage(request: VerifyRequestData, ws: ExtendedWebSocketClient) {
        if (!request.token) {
            throw new ResponseError("Token required", 401);
        }

        if (!ws.verifyToken) {
            throw new ResponseError(
                "VerifyToken not found! You may have missed the first stage",
                402,
            );
        }

        const decryptedToken = this.verifyManager.decryptToken(request.token);

        if (decryptedToken !== ws.verifyToken) {
            throw new ResponseError("Not equal tokens", 403);
        }

        ws.isVerified = true;
        return {};
    }
}
