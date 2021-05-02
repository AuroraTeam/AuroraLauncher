import { IncomingMessage } from "http"

import { JsonHelper } from "../../../helpers/JsonHelper"
import UUIDHelper from "../../../helpers/UUIDHelper"
import { App } from "../../../LauncherServer"
import { CustomServerResponse } from "../AuthlibManager"
import { AuthlibRequest } from "../AuthlibRequest"

export class JoinRequest extends AuthlibRequest {
    method = "POST"
    url = /^\/session\/minecraft\/join$/

    emit(req: IncomingMessage, res: CustomServerResponse): void {
        let data: any
        req.on("data", (chunk) => {
            data += chunk
        })
        req.on("end", async () => {
            data = JsonHelper.fromJSON(data)

            if (
                this.isInvalidValue(data.accessToken) ||
                this.isInvalidValue(data.selectedProfile) ||
                this.isInvalidValue(data.serverId)
            )
                return res.writeStatus(400)

            try {
                await App.AuthManager.getAuthProvider().join(
                    data.accessToken,
                    UUIDHelper.getWithDashes(data.selectedProfile),
                    data.serverId
                )
            } catch (error) {
                return res.writeStatus(400)
            }

            res.writeStatus(204)
        })
    }
}
