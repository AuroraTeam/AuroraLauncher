import { ConfigManager } from "@root/components/config";
import { LangManager } from "@root/components/langs";
import { AbstractRequest, Server } from "aurora-rpc-server";
import { injectable } from "tsyringe";

import { WebServerManager } from "../index";

@injectable()
export class WebManager {
    private webServerManager: WebServerManager;
    private webSocketManager: Server;

    constructor(configManager: ConfigManager, langManager: LangManager) {
        const { host, port } = configManager.config.api;

        this.webServerManager = new WebServerManager(
            configManager,
            langManager
        );
        this.webSocketManager = new Server({
            server: this.webServerManager.server,
        });

        this.webServerManager.server.listen({ host, port });
    }

    public registerRequests(requests: AbstractRequest[]): void {
        requests.forEach((request) =>
            this.webSocketManager.registerRequest(request)
        );
    }
}
