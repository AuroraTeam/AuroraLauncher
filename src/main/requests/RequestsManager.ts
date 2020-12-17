import { AbstractRequest, wsErrorResponse, wsRequest, wsResponse } from "./types/AbstractRequest"
import { AuthRequest } from "./types/AuthRequest"
import { PingRequest } from "./types/PingRequest"
import { UnknownRequest } from "./types/UnknownRequest"

export class RequestsManager {
    requests: Map<string, AbstractRequest> = new Map()

    constructor() {
        this.registerRequest(new UnknownRequest())
        this.registerRequest(new PingRequest())
        this.registerRequest(new AuthRequest())
    }

    registerRequest(x: AbstractRequest): void {
        this.requests.set(x.getType(), x)
    }

    // TODO вывести работу с uud сюда
    getRequest(data: wsRequest): wsResponse | wsErrorResponse {
        if (this.requests.has(data.type)) {
            return this.requests.get(data.type).invoke(data)
        } else {
            return this.requests.get("unknown").invoke(data)
        }
    }
}
