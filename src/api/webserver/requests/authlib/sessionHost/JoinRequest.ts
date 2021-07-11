import { IncomingMessage, ServerResponse } from "http"

import { JsonHelper } from "@root/helpers/JsonHelper"
import UUIDHelper from "@root/helpers/UUIDHelper"
import { App } from "@root/LauncherServer"

import { AbstractRequest } from "../../AbstractRequest"

export class JoinRequest extends AbstractRequest {
    method = "POST"
    url = /^\/authlib\/session\/minecraft\/join$/

    async emit(req: IncomingMessage, res: ServerResponse): Promise<void> {
        let data: any = await this.getPostData(req)
        res.statusCode = 400

        if (data.length === 0) return res.end(this.returnError("Bad Request"))

        data = JsonHelper.fromJSON(data)

        if (
            this.isInvalidValue(data.accessToken) ||
            this.isInvalidValue(data.selectedProfile) ||
            this.isInvalidValue(data.serverId)
        ) {
            return res.end(this.returnError("Bad Request"))
        }

        try {
            await App.AuthManager.getAuthProvider().join(
                data.accessToken,
                UUIDHelper.getWithDashes(data.selectedProfile),
                data.serverId
            )
        } catch (error) {
            return res.end(
                this.returnError("ForbiddenOperationException", "Invalid credentials. Invalid username or password.")
            )
        }

        res.statusCode = 204
        res.end()
    }
}
