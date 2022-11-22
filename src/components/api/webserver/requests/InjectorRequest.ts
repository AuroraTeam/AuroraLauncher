import { App } from "@root/LauncherServer"

import { WebRequest } from "../WebRequest"
import { WebResponse } from "../WebResponse"
import { AbstractRequest } from "./AbstractRequest"

export class InjectorRequest extends AbstractRequest {
    method = "GET"
    url = /^\/authlib$/

    async emit(_: WebRequest, res: WebResponse): Promise<void> {
        res.sendJson({
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
