import { IncomingMessage, ServerResponse } from "node:http"

export abstract class AuthlibRequest {
    abstract readonly url: RegExp
    abstract readonly method: string

    abstract emit(req: IncomingMessage, res: ServerResponse, url: string): void

    parseQuery(url: string): URLSearchParams {
        return new URLSearchParams(url.split("?")[1])
    }

    isEmptyQuery(query: URLSearchParams): boolean {
        return query.toString().length === 0
    }
}
