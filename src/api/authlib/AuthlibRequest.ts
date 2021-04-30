import { IncomingMessage, ServerResponse } from "node:http"

export abstract class AuthlibRequest {
    readonly abstract url: RegExp
    readonly abstract method: string

    abstract emit(req: IncomingMessage, res: ServerResponse, url: string): void
}
