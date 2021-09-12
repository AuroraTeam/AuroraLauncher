import { App } from "../LauncherServer"
import { WebServerManager } from "./WebServerManager"
import { WebSocketManager } from "./WebSocketManager"

export class WebManager {
    private webServerManager: WebServerManager = new WebServerManager()
    private webSocketManager: WebSocketManager = new WebSocketManager()

    constructor() {
        const { host, port } = App.ConfigManager.getConfig().api
        const webServer = this.webServerManager.createWebServer()
        this.webSocketManager.createWebSocket({ server: webServer })
        webServer.listen({ host, port })
    }
}
