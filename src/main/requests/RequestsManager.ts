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

export interface wsRequest {
    type: string
    requestUUID: string
}

export interface wsResponse {
    requestUUID: string
    response?: string
    error?: string
    message?: string
}

// export interface wsErrorResponse {
//     requestUUID: string
//     error?: string
//     message?: string
// }
