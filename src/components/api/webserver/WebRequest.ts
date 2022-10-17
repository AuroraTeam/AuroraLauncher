import { IncomingMessage } from "http"

import { parse } from "fast-querystring"
import getRawBody from "raw-body"

export class WebRequest {
    raw: IncomingMessage
    query: ReturnType<typeof parse>

    constructor(request: IncomingMessage) {
        this.raw = request
        this.query = parse(this.raw.url.split("?")[1])
    }

    /**
     * It returns true if the request has a content-type header and it includes the string
     * "application/json"
     * @returns A boolean value.
     */
    public isJsonPostData() {
        return (
            !!this.raw.headers["content-type"] ||
            this.raw.headers["content-type"].includes("application/json")
        )
    }

    /**
     * It takes an incoming request, and returns a promise that resolves to the request body as a
     * string
     * @returns A promise that resolves to a string.
     */
    public async parsePostData() {
        return await getRawBody(this.raw, { limit: "500kb", encoding: "utf-8" })
    }
}
