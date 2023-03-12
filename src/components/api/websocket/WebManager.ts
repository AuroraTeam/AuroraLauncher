import { ConfigManager } from "@root/components/config";
import { LangManager } from "@root/components/langs";
import { Server } from "aurora-rpc-server";
import { container, injectable } from "tsyringe";

import { WebServerManager } from "../index";
import {
    AuthRequest,
    ProfileRequest,
    ServersRequest,
    UpdatesRequest,
} from "./requests";

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

        this.registerRequests();

        this.webServerManager.server.listen({ host, port });
    }

    private registerRequests(): void {
        [
            container.resolve(AuthRequest),
            container.resolve(ProfileRequest),
            container.resolve(ServersRequest),
            container.resolve(UpdatesRequest),
        ].forEach((request) => this.webSocketManager.registerRequest(request));
    }
}
