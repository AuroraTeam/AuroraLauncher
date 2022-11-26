import { ConfigManager } from "@root/components/config"
import { LangManager } from "@root/components/langs"
import { Server } from "aurora-rpc-server"
import { injectable } from "tsyringe"

import { WebServerManager } from "../index"
import { AuthRequest } from "./requests/AuthRequest"
import { ProfileRequest } from "./requests/ProfileRequest"
import { ServersRequest } from "./requests/ServersRequest"
import { UpdatesRequest } from "./requests/UpdatesRequest"

@injectable()
export class WebManager {
    private webServerManager: WebServerManager
    private webSocketManager: Server

    constructor(configManager: ConfigManager, langManager: LangManager) {
        const { host, port } = configManager.config.api

        this.webServerManager = new WebServerManager(configManager, langManager)

        this.webSocketManager = new Server({
            server: this.webServerManager.server,
        })
        this.registerRequests()

        this.webServerManager.server.listen({ host, port })
    }

    private registerRequests(): void {
        this.webSocketManager.registerRequest(new AuthRequest())
        this.webSocketManager.registerRequest(new ServersRequest())
        this.webSocketManager.registerRequest(new ProfileRequest())
        this.webSocketManager.registerRequest(new UpdatesRequest())
    }
}
