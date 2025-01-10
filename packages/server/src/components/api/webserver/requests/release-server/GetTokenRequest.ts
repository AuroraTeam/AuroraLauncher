import { Service } from "typedi";

import { WebRequest } from "../../WebRequest";
import { WebResponse } from "../../WebResponse";
import { AbstractRequest } from "../AbstractRequest";
import { TokenManager } from "./Token";

@Service()
export class GetToken extends AbstractRequest {
    method = "GET";
    url = /^\/release\/get_token$/;

    constructor(private tokenManager: TokenManager) {
        super();
    }

    async emit(req: WebRequest, res: WebResponse): Promise<void> {
        res.json({token: this.tokenManager.getEncryptedToken()})
    }
}
