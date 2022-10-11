import { IncomingMessage, ServerResponse } from "http"

import { App } from "@root/app"
import { HttpHelper } from "@root/utils"

import { AbstractRequest } from "./AbstractRequest"

export class InjectorRequest extends AbstractRequest {
    method = "GET"
    url = /^\/authlib$/

    async emit(_: IncomingMessage, res: ServerResponse): Promise<void> {
        HttpHelper.sendJson(res, {
            meta: {
                serverName:
                    App.ConfigManager.config.projectName || "Aurora Launcher",
                implementationName: "aurora-launchserver",
                implementationVersion: "0.0.1",
                "feature.no_mojang_namespace": true,
                "feature.privileges_api": true,
            },
            skinDomains: App.ConfigManager.config.api.injector.skinDomains,
            signaturePublickey: App.AuthlibManager.getPublicKey(),
        })
    }
}
