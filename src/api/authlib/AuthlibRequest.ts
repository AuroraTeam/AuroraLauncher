import { IncomingMessage } from "http"

import { CustomServerResponse } from "./AuthlibManager"

export abstract class AuthlibRequest {
    abstract readonly url: RegExp
    abstract readonly method: string

    abstract emit(req: IncomingMessage, res: CustomServerResponse, url: string): PromiseOr<void>

    protected parseQuery(url: string): URLSearchParams {
        return new URLSearchParams(url.split("?")[1])
    }

    protected isEmptyQuery(query: URLSearchParams): boolean {
        return query.toString().length === 0
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    protected isInvalidValue(param: any): boolean {
        return typeof param !== "string" || param.trim().length === 0
    }
}
