import { IncomingMessage, ServerResponse } from "http"

import { HttpHelper } from "@root/helpers/HttpHelper"
import { App } from "@root/LauncherServer"

import { AbstractRequest } from "./AbstractRequest"

export class InjectorRequest extends AbstractRequest {
    method = "GET"
    url = /^\/authlib$/

    async emit(_: IncomingMessage, res: ServerResponse): Promise<void> {
        HttpHelper.sendJson(res, {
            meta: {
                serverName: "Aurora Launcher",
                implementationName: "aurora-launchserver",
                implementationVersion: "0.0.1",
                "feature.no_mojang_namespace": true,
                "feature.privileges_api": true,
            },
            // skinDomains: ["example.com", ".example.com"], // TODO config
            signaturePublickey: App.AuthlibManager.getPublicKey(),
        })
    }
}
