import { wsRequest, wsResponse } from "../RequestsManager"

export abstract class AbstractRequest {
    private readonly type: string
    // private requestUUID: string

    constructor(type: string) {
        this.type = type
    }

    getType(): string {
        return this.type
    }

    abstract invoke(data: wsRequest): wsResponse
}
