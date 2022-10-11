import { Server } from "aurora-rpc-server"

import { App } from "@root/app"
import { WebServerManager } from "../index"
import { AuthRequest } from "./requests/AuthRequest"
import { PingRequest } from "./requests/PingRequest"
import { ProfileRequest } from "./requests/ProfileRequest"
import { ServersRequest } from "./requests/ServersRequest"
import { UpdatesRequest } from "./requests/UpdatesRequest"

export class WebManager {
    private webServerManager = new WebServerManager()
    private webSocketManager: Server

    constructor() {
        const { host, port } = App.ConfigManager.getConfig.api
        const webServer = this.webServerManager.createWebServer()

        this.webSocketManager = new Server({ server: webServer })
        this.registerRequests()

        webServer.listen({ host, port })
    }

    private registerRequests(): void {
        this.webSocketManager.registerRequest(new PingRequest())
        this.webSocketManager.registerRequest(new AuthRequest())
        this.webSocketManager.registerRequest(new ServersRequest())
        this.webSocketManager.registerRequest(new ProfileRequest())
        this.webSocketManager.registerRequest(new UpdatesRequest())
    }
}
