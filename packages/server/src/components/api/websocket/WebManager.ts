import { ConfigManager } from "@root/components/config";
import { LangManager } from "@root/components/langs";
import { AbstractRequest as AbstractWsRequest, Server } from "aurora-rpc-server";
import { Service } from "typedi";

import { WebServerManager } from "../index";
import { AbstractRequest as AbstractWebRequest } from "../webserver/requests/AbstractRequest";

@Service()
export class WebManager {
    private webServerManager: WebServerManager;
    private webSocketManager: Server;

    constructor(configManager: ConfigManager, langManager: LangManager) {
        const { host, port } = configManager.config.api;

        this.webServerManager = new WebServerManager(configManager, langManager);
        this.webSocketManager = new Server({
            server: this.webServerManager.server,
        });

        this.webServerManager.server.listen({ host, port });
    }

    public registerWsRequests(requests: AbstractWsRequest[]): void {
        requests.forEach((request) => this.webSocketManager.registerRequest(request));
    }

    public registerWebRequests(requests: AbstractWebRequest[]): void {
        requests.forEach((request) => this.webServerManager.registerRequest(request));
    }
}
