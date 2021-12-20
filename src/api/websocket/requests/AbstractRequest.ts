import { wsClient } from "@root/api/WebSocketManager"

import { RequestData } from "../types/Request"
import { ResponseData } from "../types/Response"

export abstract class AbstractRequest {
    protected type: string

    getType(): string {
        return this.type
    }

    abstract invoke(data: RequestData, ws: wsClient): PromiseOr<ResponseData>
}
