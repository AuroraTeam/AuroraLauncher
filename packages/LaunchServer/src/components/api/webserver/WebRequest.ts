import { IncomingMessage } from "http";

import { parse } from "fast-querystring";
import getRawBody from "raw-body";

export class WebRequest {
    raw: IncomingMessage;
    query: ReturnType<typeof parse>;

    constructor(request: IncomingMessage) {
        this.raw = request;
        this.query = parse(this.raw.url.split("?")[1]);
    }

    /**
     * It takes an incoming request, and returns a promise that resolves to the request body as a
     * string
     * @returns A promise that resolves to a string.
     */
    public async getRawBody() {
        return await getRawBody(this.raw, {
            limit: "100kb",
            encoding: "utf-8",
        });
    }
}
