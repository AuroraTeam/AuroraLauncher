import { Service } from "@freshgum/typedi";
import { AuthlibManager } from "@root/components/authlib";
import { ConfigManager } from "@root/components/config";

import { WebServerManager } from "../WebServerManager";

@Service([WebServerManager, ConfigManager, AuthlibManager])
export class InjectorWebRequest {
    constructor(
        private webServerManager: WebServerManager,
        private configManager: ConfigManager,
        private authlibManager: AuthlibManager,
    ) {
        this.webServerManager.server.get("/injector", this.run.bind(this));
    }

    async run() {
        return {
            meta: {
                serverName: this.configManager.config.projectName || "Aurora Launcher",
                implementationName: "aurora-launchserver",
                implementationVersion: "0.0.1",
            },
            skinDomains: this.configManager.config.auth.skinDomains || [],
            signaturePublickey: this.authlibManager.getPublicKey(),
        };
    }
}
