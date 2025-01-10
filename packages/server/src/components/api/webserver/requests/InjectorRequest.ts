import { AuthlibManager } from "@root/components/authlib";
import { ConfigManager } from "@root/components/config";
import { Service } from "typedi";

import { SkinManager } from "../../../skin";
import { WebRequest } from "../WebRequest";
import { WebResponse } from "../WebResponse";
import { AbstractRequest } from "./AbstractRequest";

@Service()
export class InjectorWebRequest extends AbstractRequest {
    method = "GET";
    url = /^\/authlib$/;

    constructor(
        private configManager: ConfigManager,
        private authlibManager: AuthlibManager,
    ) {
        super();
    }

    async emit(_: WebRequest, res: WebResponse): Promise<void> {
        const skinManeger = new SkinManager(this.configManager.config.skin);
        res.json({
            meta: {
                serverName: this.configManager.config.projectName || "Aurora Launcher",
                implementationName: "aurora-launchserver",
                implementationVersion: "0.0.1",
            },
            skinDomains: [skinManeger.getDomainUrl()],
            signaturePublickey: this.authlibManager.getPublicKey(),
        });
    }
}
