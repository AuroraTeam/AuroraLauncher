import { AuthManager } from "@root/components/auth"
import { JsonHelper } from "@root/utils"
import { injectable } from "tsyringe"

import { WebRequest } from "../../../WebRequest"
import { WebResponse } from "../../../WebResponse"
import { AbstractRequest } from "../../AbstractRequest"

interface JoinRequestDto {
    accessToken: string
    selectedProfile: string
    serverId: string
}

@injectable()
export class JoinRequest extends AbstractRequest {
    method = "POST"
    url = /^\/authlib\/sessionserver\/session\/minecraft\/join$/

    constructor(private authManager: AuthManager) {
        super()
    }

    async emit(req: WebRequest, res: WebResponse): Promise<void> {
        let data: JoinRequestDto

        try {
            data = JsonHelper.fromJson<JoinRequestDto>(await req.getRawBody())
        } catch (error) {
            return res.sendError(400, "BadRequestException")
        }

        if (
            this.isInvalidValue(data.accessToken) ||
            this.isInvalidValue(data.selectedProfile) ||
            this.isInvalidValue(data.serverId)
        )
            return res.sendError(400, "BadRequestException")

        const status = await this.authManager
            .getAuthProvider()
            .join(data.accessToken, data.selectedProfile, data.serverId)
        if (!status)
            return res.sendError(
                400,
                "ForbiddenOperationException",
                "Invalid credentials. Invalid username or password."
            )

        res.raw.end()
    }
}
