import { Service } from "@freshgum/typedi";

import { Request } from "../../Request";
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

    async emit(req: Request, res: WebResponse): Promise<void> {
        res.json({ token: this.tokenManager.getEncryptedToken() });
    }
}
