import { AbstractRequest } from "./types/AbstractRequest"
import { PingRequest } from "./types/PingRequest"

export type RequestsMap = Map<string, AbstractRequest>

export class RequestsManager {
    requests: RequestsMap = new Map()

    constructor() {
        this.registerRequest(new PingRequest())
    }

    registerRequest(x: AbstractRequest): void {
        this.requests.set(x.getType(), x)
    }
}
