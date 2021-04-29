import { IncomingMessage, ServerResponse } from "node:http"
import { RequestMeta } from "./AuthlibManager"

export abstract class AuthlibRequest {
    protected abstract url: string
    protected abstract method: string

    abstract emit(req: IncomingMessage, res: ServerResponse): void

    getMeta(): Omit<RequestMeta, "handler"> {
        return {
            url: this.url,
            method: this.method
        }
    }
}
