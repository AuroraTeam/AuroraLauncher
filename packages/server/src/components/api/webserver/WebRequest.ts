import { IncomingMessage } from "http";

import { parse } from "fast-querystring";
import getRawBody from "raw-body";

export class WebRequest {
    readonly raw: IncomingMessage;
    readonly query: ReturnType<typeof parse>;
    readonly body: string;

    private constructor(request: IncomingMessage, body: string) {
        this.raw = request;
        this.query = parse(this.raw.url.split("?")[1]);
        this.body = body;
    }

    static async fromRaw(request: IncomingMessage) {
        const body = await getRawBody(request, {
            limit: "100kb",
            encoding: "utf-8",
        });

        return new WebRequest(request, body);
    }
}
