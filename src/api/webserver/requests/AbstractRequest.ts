import { IncomingMessage, ServerResponse } from "http"

export abstract class AbstractRequest {
    abstract readonly url: RegExp
    abstract readonly method: string

    abstract emit(req: IncomingMessage, res: ServerResponse): PromiseOr<void>

    protected isEmptyQuery(query: URLSearchParams): boolean {
        return query.toString().length === 0
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    protected isInvalidValue(param: any): boolean {
        return typeof param !== "string" || param.trim().length === 0
    }
}
