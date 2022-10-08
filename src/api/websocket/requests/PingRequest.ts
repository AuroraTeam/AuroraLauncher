import { AbstractRequest, ResponseResult } from "aurora-rpc-server"

export class PingRequest extends AbstractRequest {
    method = "ping"

    invoke(): ResponseResult {
        return "pong"
    }
}
