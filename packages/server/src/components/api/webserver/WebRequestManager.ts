import { IncomingMessage, ServerResponse } from "http";

import { AbstractRequest } from "./requests/AbstractRequest";

import { WebRequest } from "./WebRequest";
import { WebResponse } from "./WebResponse";

export class WebRequestManager {
    private requests: AbstractRequest[] = [];

    registerRequest(request: AbstractRequest): void {
        this.requests.push(request);
    }

    async getRequest(req: IncomingMessage, res: ServerResponse) {
        res.setHeader("X-Authlib-Injector-API-Location", "/authlib");

        const request = this.requests.find((r) => r.url.test(req.url));

        const webResponse = WebResponse.fromRaw(res);
        if (request === undefined) return webResponse.error(404);

        WebRequest.fromRaw(req)
            .then((webRequest) => {
                request.emit(webRequest, webResponse);
            })
            .catch((error) => {
                webResponse.error(error.status || 400, error.message);
            });
    }
}
