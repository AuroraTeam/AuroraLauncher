import { Service } from "@freshgum/typedi";
import { AuthlibManager } from "@root/components/authlib/AuthlibManager";
import { ConfigManager } from "@root/components/config/ConfigManager";

import { AbstractRequest } from "./AbstractRequest";

@Service([ConfigManager, AuthlibManager])
export class InjectorRequest implements AbstractRequest {
    readonly method = "get";
    readonly url = "/authlib";

    constructor(
        private configManager: ConfigManager,
        private authlibManager: AuthlibManager,
    ) {}

    async handler() {
        return {
            meta: {
                serverName: this.configManager.config.projectName || "Aurora Launcher",
                implementationName: "aurora-launchserver",
                implementationVersion: "1.0.0",
            },
            skinDomains: this.configManager.config.auth.skinDomains || [],
            signaturePublickey: this.authlibManager.getPublicKey(),
        };
    }
}
