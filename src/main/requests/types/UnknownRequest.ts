import { AbstractRequest, wsErrorResponse, wsRequest } from "./AbstractRequest"

export class UnknownRequest extends AbstractRequest {
    type = "unknown"

    invoke(data: wsRequest): wsErrorResponse {
        return {
            uuid: data.uuid,
            code: 102,
            message: "Unknown request type",
        }
    }
}
