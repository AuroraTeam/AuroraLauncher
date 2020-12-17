import { AbstractRequest, wsResponseWithoutUUID } from "./AbstractRequest"

export class PingRequest extends AbstractRequest {
    type = "ping"

    invoke(): wsResponseWithoutUUID {
        return {
            data: {
                result: "pong",
            },
        }
    }
}
