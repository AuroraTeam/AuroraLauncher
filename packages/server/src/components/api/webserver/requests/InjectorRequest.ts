import { AuthlibManager } from "@root/components/authlib";
import { ConfigManager } from "@root/components/config";
import { injectable } from "tsyringe";

import { WebRequest } from "../WebRequest";
import { WebResponse } from "../WebResponse";
import { AbstractRequest } from "./AbstractRequest";

@injectable()
export class InjectorRequest extends AbstractRequest {
    method = "GET";
    url = /^\/authlib$/;

    constructor(private configManager: ConfigManager, private authlibManager: AuthlibManager) {
        super();
    }

    async emit(_: WebRequest, res: WebResponse): Promise<void> {
        res.sendJson({
            meta: {
                serverName: this.configManager.config.projectName || "Aurora Launcher",
                implementationName: "aurora-launchserver",
                implementationVersion: "0.0.1",
                "feature.no_mojang_namespace": true,
                "feature.privileges_api": true,
            },
            skinDomains: this.configManager.config.api.injector.skinDomains,
            signaturePublickey: this.authlibManager.getPublicKey(),
        });
    }
}
