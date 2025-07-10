import { Service } from "@freshgum/typedi";

import { AbstractRequest } from "../AbstractRequest";

@Service([])
export class TestRequest implements AbstractRequest {
    method = "get";
    url = "/test";

    handler() {
        return {};
    }
}
