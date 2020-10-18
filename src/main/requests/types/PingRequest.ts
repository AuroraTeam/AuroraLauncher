import { AbstractRequest, wsRequest, wsResponse } from "./AbstractRequest"

export class PingRequest extends AbstractRequest {
    constructor() {
        super("ping")
    }

    invoke(data: wsRequest): wsResponse {
        return {
            uuid: data.uuid,
            data: {
                result: "pong"
            }                
        }
    }
}
