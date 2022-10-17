import { App } from "@root/app"
import { JsonHelper } from "@root/utils"

import { WebRequest } from "../../../WebRequest"
import { WebResponse } from "../../../WebResponse"
import { AbstractRequest } from "../../AbstractRequest"

export class ProfilesRequest extends AbstractRequest {
    method = "POST"
    url = /^\/authlib\/api\/profiles\/minecraft$/

    async emit(req: WebRequest, res: WebResponse): Promise<void> {
        let data: string[]

        if (!req.isJsonPostData())
            return res.sendError(400, "BadRequestException")

        try {
            data = JsonHelper.fromJson(await req.parsePostData())
        } catch (error) {
            return res.sendError(400, "BadRequestException")
        }

        if (!Array.isArray(data) || data.length === 0)
            return res.sendError(400, "BadRequestException")

        if (data.length > 10)
            return res.sendError(
                400,
                "IllegalArgumentException",
                "Not more that 10 profile name per call is allowed."
            )

        res.sendJson(await App.AuthManager.getAuthProvider().profiles(data))
    }
}
