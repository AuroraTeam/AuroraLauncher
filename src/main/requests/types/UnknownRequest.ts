import { AbstractRequest, wsErrorResponseWithoutUUID } from "./AbstractRequest"

export class UnknownRequest extends AbstractRequest {
    type = "unknown"

    invoke(): wsErrorResponseWithoutUUID {
        return {
            code: 102,
            message: "Unknown request type",
        }
    }
}
