import { App } from "@root/app"
import { JsonHelper } from "@root/utils"

import { WebRequest } from "../../../WebRequest"
import { WebResponse } from "../../../WebResponse"
import { AbstractRequest } from "../../AbstractRequest"

interface JoinRequestDto {
    accessToken: string
    selectedProfile: string
    serverId: string
}

export class JoinRequest extends AbstractRequest {
    method = "POST"
    url = /^\/authlib\/sessionserver\/session\/minecraft\/join$/
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

        const status = await App.AuthManager.getAuthProvider().join(
            data.accessToken,
            data.selectedProfile,
            data.serverId
        )
        if (!status)
            return res.sendError(
                400,
                "ForbiddenOperationException",
                "Invalid credentials. Invalid username or password."
            )

        res.raw.end()
    }
}
