import { IncomingMessage, ServerResponse } from "node:http"

import { RequestMeta } from "./AuthlibManager"

export abstract class AuthlibRequest {
    protected abstract url: RegExp
    protected abstract method: string

    abstract emit(req: IncomingMessage, res: ServerResponse): void

    public getMeta(): RequestMeta {
        return {
            url: this.url,
            method: this.method,
            handler: this,
        }
    }
}
