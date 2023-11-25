import { IncomingMessage, ServerResponse } from "http";

import { container } from "tsyringe";

import { AbstractRequest } from "./requests/AbstractRequest";
import { ProfilesRequest } from "./requests/authlib/accountsHost/ProfilesRequest";
import { HasJoinedRequest } from "./requests/authlib/sessionHost/HasJoinedRequest";
import { JoinRequest } from "./requests/authlib/sessionHost/JoinRequest";
import { ProfileRequest } from "./requests/authlib/sessionHost/ProfileRequest";
import { InjectorRequest } from "./requests/InjectorRequest";
import { WebRequest } from "./WebRequest";
import { WebResponse } from "./WebResponse";

export class WebRequestManager {
    private requests: AbstractRequest[] = [];

    constructor() {
        this.registerRequests([
            container.resolve(InjectorRequest),
            container.resolve(ProfilesRequest),
            container.resolve(ProfileRequest),
            container.resolve(JoinRequest),
            container.resolve(HasJoinedRequest),
        ]);
    }

    registerRequests(requests: AbstractRequest[]): void {
        requests.forEach((request) => {
            this.requests.push(request);
        });
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
