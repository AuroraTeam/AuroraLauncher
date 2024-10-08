import { Service } from "typedi";
import { VerifyManager } from "@root/components/secure/VerifyManager";

import { WebRequest } from "../../WebRequest";
import { WebResponse } from "../../WebResponse";
import { AbstractRequest } from "../AbstractRequest";
import { token } from "./Token";

@Service()
export class GetToken extends AbstractRequest {
    method = "GET";
    url = /^\/release\/get_token$/;

    constructor(private verifyManager: VerifyManager) {
        super();
    }

    async emit(req: WebRequest, res: WebResponse): Promise<void> {
        const encryptedToken = this.verifyManager.encryptToken(token)
        res.json({token: encryptedToken})
    }
}
