import { IncomingMessage, ServerResponse } from "http"

import { HttpHelper } from "@root/helpers/HttpHelper"
import { JsonHelper } from "@root/helpers/JsonHelper"
import { App } from "@root/LauncherServer"

import { AbstractRequest } from "../../AbstractRequest"

export class ProfilesRequest extends AbstractRequest {
    method = "POST"
    url = /^\/authlib\/api\/profiles\/minecraft$/

    async emit(req: IncomingMessage, res: ServerResponse): Promise<void> {
        let data: string[]

        if (!HttpHelper.isJsonPostData(req)) return HttpHelper.sendError(res, 400, "BadRequestException")

        try {
            data = JsonHelper.fromJson(await HttpHelper.parsePostData(req))
        } catch (error) {
            return HttpHelper.sendError(res, 400, "BadRequestException")
        }

        if (!Array.isArray(data) || data.length === 0) return HttpHelper.sendError(res, 400, "BadRequestException")

        if (data.length > 10)
            return HttpHelper.sendError(
                res,
                400,
                "IllegalArgumentException",
                "Not more that 10 profile name per call is allowed."
            )

        HttpHelper.sendJson(res, await App.AuthManager.getAuthProvider().profiles(data)) // ??
    }
}
