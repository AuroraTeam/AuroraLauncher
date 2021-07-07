import { ResponseData } from "../types/Response"
import { AbstractRequest } from "./AbstractRequest"

export class PingRequest extends AbstractRequest {
    type = "ping"

    invoke(): ResponseData {
        return {
            result: "pong",
        }
    }
}
