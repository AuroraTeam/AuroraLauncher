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

        if (data.length === 0) {
            res.write(this.returnError("Bad Request"))
            return res.end()
        }

        data = JsonHelper.fromJSON(data)

        if (
            this.isInvalidValue(data.accessToken) ||
            this.isInvalidValue(data.selectedProfile) ||
            this.isInvalidValue(data.serverId)
        ) {
            res.write(this.returnError("Bad Request"))
            return res.end()
        }

        try {
            await App.AuthManager.getAuthProvider().join(
                data.accessToken,
                UUIDHelper.getWithDashes(data.selectedProfile),
                data.serverId
            )
        } catch (error) {
            res.write(
                this.returnError("ForbiddenOperationException", "Invalid credentials. Invalid username or password.")
            )
            return res.end()
        }

        res.statusCode = 204
        res.end()
    }
}
