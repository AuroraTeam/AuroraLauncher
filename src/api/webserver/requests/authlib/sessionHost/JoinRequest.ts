import { ExtendedIncomingMessage, ExtendedServerResponse } from "@root/api/webserver/WebRequestManager"
import { JsonHelper } from "@root/helpers/JsonHelper"
import { App } from "@root/LauncherServer"

import { AbstractRequest } from "../../AbstractRequest"

export class JoinRequest extends AbstractRequest {
    method = "POST"
    url = /^\/authlib\/session\/minecraft\/join$/

    async emit(req: ExtendedIncomingMessage, res: ExtendedServerResponse): Promise<void> {
        let data

        try {
            data = JsonHelper.fromJSON(req.body)
        } catch (error) {
            return res.error(400, "Bad Request")
        }

        if (
            this.isInvalidValue(data.accessToken) ||
            this.isInvalidValue(data.selectedProfile) ||
            this.isInvalidValue(data.serverId)
        )
            return res.error(400, "Bad Request")

        const status = await App.AuthManager.getAuthProvider().join(
            data.accessToken,
            data.selectedProfile,
            data.serverId
        )
        if (!status)
            return res.error(400, "ForbiddenOperationException", "Invalid credentials. Invalid username or password.")

        res.end()
    }
}
