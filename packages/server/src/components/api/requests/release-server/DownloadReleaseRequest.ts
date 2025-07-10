import { writeFileSync } from "fs";
import { resolve } from "path";

import { Service } from "@freshgum/typedi";
import { VerifyManager } from "@root/components/secure/VerifyManager";
import { StorageHelper } from "@root/utils/helpers/StorageHelper";

import { Request } from "../../Request";
import { WebResponse } from "../../WebResponse";
import { AbstractRequest } from "../AbstractRequest";
import { TokenManager } from "./Token";

@Service()
export class DownloadRelease extends AbstractRequest {
    method = "POST";
    url = /^\/release\/upload/;

    constructor(
        private verifyManager: VerifyManager,
        private tokenManager: TokenManager,
    ) {
        super();
    }

    async emit(req: Request, res: WebResponse): Promise<void> {
        const { encryptedToken } = req.query;
        let decryptedToken: string;
        try {
            decryptedToken = this.verifyManager.decryptToken(encryptedToken);
        } catch {
            res.raw.statusCode = 500;
            res.raw.end();
        }
        if (decryptedToken == this.tokenManager.getToken()) {
            writeFileSync(
                resolve(StorageHelper.releaseDir, req.raw.headers["content-disposition"]),
                req.file,
            );
        }
        res.raw.end();
    }
}
