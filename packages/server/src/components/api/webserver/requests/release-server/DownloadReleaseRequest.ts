import { Service } from "typedi";
import { VerifyManager } from "@root/components/secure/VerifyManager";

import { WebRequest } from "../../WebRequest";
import { WebResponse } from "../../WebResponse";
import { AbstractRequest } from "../AbstractRequest";
import { writeFileSync } from "fs";
import { token } from "./Token";

@Service()
export class DownloadRelease extends AbstractRequest {
    method = "POST";
    url = /^\/release\/upload/;

    constructor(private verifyManager: VerifyManager) {
        super();
    }

    async emit(req: WebRequest, res: WebResponse): Promise<void> {
        const {encryptedToken} = req.query
        let decryptedToken:string
        try{
            decryptedToken = this.verifyManager.decryptToken(encryptedToken)
        }
        catch{
            res.raw.statusCode = 500
            res.raw.end()
        }
        if ( decryptedToken == token){
            writeFileSync('./dist/gameFiles/release/' + req.raw.headers["content-disposition"], req.file)
        }
        res.raw.end()
    }
}
