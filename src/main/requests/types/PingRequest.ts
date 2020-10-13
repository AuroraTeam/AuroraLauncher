import { wsRequest, wsResponse } from "../RequestsManager"
import { AbstractRequest } from "./AbstractRequest"

export class PingRequest extends AbstractRequest {
    constructor() {
        super("ping")
    }

    invoke(data: wsRequest): wsResponse {
        return {
            requestUUID: data.requestUUID,
            response: "pong",
        }
    }
}
