import { VERIFY_METHOD, VerifyRequestData, VerifyResponseData } from "@aurora-launcher/core";
import { Service } from "@freshgum/typedi";
import { FastifyRequest } from "fastify";

import { AbstractRequest } from "../AbstractRequest";

@Service([])
export class VerifyRequest implements AbstractRequest {
    method = "get";
    url = VERIFY_METHOD;

    handler(req: FastifyRequest<{ Body: VerifyRequestData }>): VerifyResponseData {
        return {};
    }
}
