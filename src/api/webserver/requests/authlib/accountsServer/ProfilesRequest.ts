import { IncomingMessage, ServerResponse } from "http"

import { JsonHelper } from "@root/helpers/JsonHelper"
import { App } from "@root/LauncherServer"

import { AbstractRequest } from "../../AbstractRequest"

export class ProfilesRequest extends AbstractRequest {
    method = "POST"
    url = /^\/authlib\/profiles\/minecraft$/

    async emit(req: IncomingMessage, res: ServerResponse): Promise<void> {
        let data: any = await this.getPostData(req)
        res.statusCode = 400

        if (data.length === 0) {
            res.write(this.returnError("Bad Request"))
            return res.end()
        }

        data = JsonHelper.fromJSON(data)

        if ("object" !== typeof data || !Array.isArray(data) || data.length === 0) {
            return res.end()
        }

        if (data.length >= 10) {
            res.write(
                this.returnError("IllegalArgumentException", "Not more that 10 profile name per call is allowed.")
            )
            return res.end()
        }

        let users
        try {
            users = await App.AuthManager.getAuthProvider().profiles(data)
        } catch (error) {
            return res.end()
        }

        res.statusCode = 200
        res.write(JsonHelper.toJSON(users))
        res.end()
    }
}
