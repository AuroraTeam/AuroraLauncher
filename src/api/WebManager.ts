import { Server } from "aurora-rpc-server"

import { App } from "../LauncherServer"
import { WebServerManager } from "./WebServerManager"
import { AuthRequest } from "./websocket/requests/AuthRequest"
import { PingRequest } from "./websocket/requests/PingRequest"
import { ProfileRequest } from "./websocket/requests/ProfileRequest"
import { ServersRequest } from "./websocket/requests/ServersRequest"
import { UpdatesRequest } from "./websocket/requests/UpdatesRequest"

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
