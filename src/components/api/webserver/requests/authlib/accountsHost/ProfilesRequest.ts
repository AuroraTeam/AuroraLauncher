import { AuthManager } from "@root/components/auth"
import { JsonHelper } from "@root/utils"
import { injectable } from "tsyringe"

import { WebRequest } from "../../../WebRequest"
import { WebResponse } from "../../../WebResponse"
import { AbstractRequest } from "../../AbstractRequest"

@injectable()
export class ProfilesRequest extends AbstractRequest {
    method = "POST"
    url = /^\/authlib\/api\/profiles\/minecraft$/

    constructor(private authManager: AuthManager) {
        super()
    }

    async emit(req: WebRequest, res: WebResponse): Promise<void> {
        let data: string[]

        try {
            data = JsonHelper.fromJson(await req.getRawBody())
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

        res.sendJson(await this.authManager.getAuthProvider().profiles(data))
    }
}
