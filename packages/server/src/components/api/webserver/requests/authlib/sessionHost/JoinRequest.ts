import { JsonHelper } from "@aurora-launcher/core";
import type { AuthProvider } from "@root/components/auth/providers";
import { UUIDHelper } from "@root/utils";
import { Inject, Service } from "typedi";

import { WebRequest } from "../../../WebRequest";
import { WebResponse } from "../../../WebResponse";
import { AbstractRequest } from "../../AbstractRequest";

interface JoinRequestDto {
    accessToken: string;
    selectedProfile: string;
    serverId: string;
}

@Service()
export class JoinWebRequest extends AbstractRequest {
    method = "POST";
    url = /^\/authlib\/sessionserver\/session\/minecraft\/join$/;

    constructor(@Inject("AuthProvider") private authProvider: AuthProvider) {
        super();
    }

    async emit(req: WebRequest, res: WebResponse): Promise<void> {
        let data: JoinRequestDto;

        try {
            data = JsonHelper.fromJson<JoinRequestDto>(req.body);
        } catch (error) {
            return res.error(400, "BadRequestException", error.message);
        }

        if (
            this.isInvalidValue(data.accessToken) ||
            this.isInvalidValue(data.selectedProfile) ||
            this.isInvalidValue(data.serverId)
        )
            return res.error(400, "BadRequestException", "Empty values are not allowed.");

        const status = await this.authProvider.join(
            data.accessToken,
            UUIDHelper.getWithDashes(data.selectedProfile),
            data.serverId,
        );
        if (!status) return res.error(400, "ForbiddenOperationException", "Invalid credentials.");

        res.raw.end();
    }
}
