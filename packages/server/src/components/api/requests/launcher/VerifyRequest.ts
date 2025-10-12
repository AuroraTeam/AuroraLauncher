import { VERIFY_METHOD, VerifyResponseData } from "@aurora-launcher/core";
import { Service } from "@freshgum/typedi";

import { AbstractRequest } from "../AbstractRequest";
// import { FastifyRequest } from "fastify";

@Service([])
export class VerifyRequest implements AbstractRequest {
    method = "get";
    url = VERIFY_METHOD;

    handler(/* req: FastifyRequest<{ Body: VerifyRequestData }> */): VerifyResponseData {
        return {};
    }
}
