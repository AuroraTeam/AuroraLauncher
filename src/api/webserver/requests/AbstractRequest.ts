import { IncomingMessage, ServerResponse } from "http"

import { JsonHelper } from "../../../helpers/JsonHelper"

export abstract class AbstractRequest {
    abstract readonly url: RegExp
    abstract readonly method: string

    abstract emit(req: IncomingMessage, res: ServerResponse): PromiseOr<void>

    protected parseQuery(url: string): URLSearchParams {
        return new URLSearchParams(url.split("?")[1])
    }

    protected isEmptyQuery(query: URLSearchParams): boolean {
        return query.toString().length === 0
    }

    public returnError(error: string, errorMessage?: string): string {
        return JsonHelper.toJSON({ error, errorMessage })
    }
    // КХЪ Похоже что нужно рефакторить некоторе говно
    public static returnError(error: string, errorMessage?: string): string {
        return JsonHelper.toJSON({ error, errorMessage })
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    protected isInvalidValue(param: any): boolean {
        return typeof param !== "string" || param.trim().length === 0
    }

    protected getPostData(req: IncomingMessage): Promise<string> {
        return new Promise((resolve, reject) => {
            let data = ""
            req.on("data", (chunk) => {
                data += chunk
            })
            req.on("end", () => {
                resolve(data)
            })
            req.on("error", (error) => {
                reject(error)
            })
        })
    }
}
