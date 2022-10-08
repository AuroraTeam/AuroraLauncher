import { AbstractRequest, ResponseResult } from "aurora-rpc-server"

export class PingRequest extends AbstractRequest {
    method = "ping"

    /**
     * It returns a string "pong"
     * @returns A ResponseResult object.
     */
    invoke(): ResponseResult {
        return "pong"
    }
}
