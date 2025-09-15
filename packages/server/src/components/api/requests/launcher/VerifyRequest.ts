import { VERIFY_METHOD } from "@aurora-launcher/core";
import { Service } from "@freshgum/typedi";

import { AbstractRequest } from "../AbstractRequest";

@Service([])
export class VerifyRequest implements AbstractRequest {
    method = "get";
    url = VERIFY_METHOD;

    handler() {
        return {};
    }
}
