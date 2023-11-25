import type { AuthProvider } from "@root/components/auth/providers";
import { inject, injectable } from "tsyringe";

import { WebRequest } from "../../../WebRequest";
import { WebResponse } from "../../../WebResponse";
import { AbstractRequest } from "../../AbstractRequest";
import { JsonHelper } from "@aurora-launcher/core";

@injectable()
export class ProfilesRequest extends AbstractRequest {
    method = "POST";
    url = /^\/authlib\/api\/profiles\/minecraft$/;

    constructor(@inject("AuthProvider") private authProvider: AuthProvider) {
        super();
    }

    async emit(req: WebRequest, res: WebResponse): Promise<void> {
        let data: string[];

        try {
            data = JsonHelper.fromJson(await req.getRawBody());
        } catch (error) {
            return res.error(400, "BadRequestException");
        }

        if (!Array.isArray(data) || data.length === 0) return res.error(400, "BadRequestException");

        if (data.length > 10)
            return res.error(
                400,
                "IllegalArgumentException",
                "Not more that 10 profile name per call is allowed.",
            );

        res.json(await this.authProvider.profiles(data));
    }
}
