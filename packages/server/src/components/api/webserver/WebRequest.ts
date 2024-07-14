import { IncomingMessage } from "http";

import { parse } from "fast-querystring";
import getRawBody from "raw-body";

export class WebRequest {
    readonly raw: IncomingMessage;
    readonly query: ReturnType<typeof parse>;
    readonly body: string;
    readonly file: Buffer;

    private constructor(request: IncomingMessage, body: string, file: Buffer) {
        this.raw = request;
        this.query = parse(this.raw.url.split("?")[1]);
        this.body = body;
        this.file = file
    }

    static async fromRaw(request: IncomingMessage) {
        let file:Buffer
        let body:string
        if (request.headers["content-type"] == 'buffer') {
            file = await getRawBody(request, {
                limit: "100mb",
            });
        }
        else{
            body = await getRawBody(request, {
                limit: "100kb",
                encoding: "utf-8",
            });
        }
        return new WebRequest(request, body, file);
    }
}
