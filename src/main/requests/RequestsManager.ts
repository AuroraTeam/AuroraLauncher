import { AbstractRequest, wsErrorResponse, wsRequest, wsResponse } from "./types/AbstractRequest"
import { AuthRequest } from "./types/AuthRequest"
import { PingRequest } from "./types/PingRequest"
import { ProfilesRequest } from "./types/ProfilesRequest"
import { UnknownRequest } from "./types/UnknownRequest"

export class RequestsManager {
    requests: Map<string, AbstractRequest> = new Map()

    constructor() {
        this.registerRequest(new UnknownRequest())
        this.registerRequest(new PingRequest())
        this.registerRequest(new AuthRequest())
        this.registerRequest(new ProfilesRequest())
    }

    registerRequest(x: AbstractRequest): void {
        this.requests.set(x.getType(), x)
    }

    getRequest(data: wsRequest): wsResponse | wsErrorResponse {
        let res
        if (this.requests.has(data.type)) {
            res = this.requests.get(data.type).invoke(data)
        } else {
            res = this.requests.get("unknown").invoke(data)
        }
        return {
            ...res,
            uuid: data.uuid,
        }
    }
}
