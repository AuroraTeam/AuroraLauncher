import { IncomingMessage, ServerResponse } from "http"

import { App } from "@root/app"
import { HttpHelper, JsonHelper } from "@root/utils"

import { AbstractRequest } from "../../AbstractRequest"

export class JoinRequest extends AbstractRequest {
    method = "POST"
    url = /^\/authlib\/sessionserver\/session\/minecraft\/join$/
    async emit(req: IncomingMessage, res: ServerResponse): Promise<void> {
        let data

        if (!HttpHelper.isJsonPostData(req))
            return HttpHelper.sendError(res, 400, "BadRequestException")

        try {
            data = JsonHelper.fromJson<any>(await HttpHelper.parsePostData(req))
        } catch (error) {
            return HttpHelper.sendError(res, 400, "BadRequestException")
        }

        if (
            this.isInvalidValue(data.accessToken) ||
            this.isInvalidValue(data.selectedProfile) ||
            this.isInvalidValue(data.serverId)
        )
            return HttpHelper.sendError(res, 400, "BadRequestException")

        const status = await App.AuthManager.getAuthProvider().join(
            data.accessToken,
            data.selectedProfile,
            data.serverId
        )
        if (!status)
            return HttpHelper.sendError(
                res,
                400,
                "ForbiddenOperationException",
                "Invalid credentials. Invalid username or password."
            )

        res.end()
    }
}
