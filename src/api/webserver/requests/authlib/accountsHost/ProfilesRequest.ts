import { ExtendedIncomingMessage, ExtendedServerResponse } from "@root/api/webserver/WebRequestManager"
import { JsonHelper } from "@root/helpers/JsonHelper"
import { App } from "@root/LauncherServer"

import { AbstractRequest } from "../../AbstractRequest"

export class ProfilesRequest extends AbstractRequest {
    method = "POST"
    url = /^\/authlib\/profiles\/minecraft$/

    async emit(req: ExtendedIncomingMessage, res: ExtendedServerResponse): Promise<void> {
        let data: string[]

        try {
            data = JsonHelper.fromJSON(req.body)
        } catch (error) {
            return res.error(400, "BadRequestException")
        }

        if (!Array.isArray(data) || data.length === 0) return res.error(400, "BadRequestException")

        if (data.length > 10)
            return res.error(400, "IllegalArgumentException", "Not more that 10 profile name per call is allowed.")

        res.json(await App.AuthManager.getAuthProvider().profiles(data))
    }
}
