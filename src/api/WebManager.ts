import { App } from "../LauncherServer"
import { WebServerManager } from "./WebServerManager"
import { WebSocketManager } from "./WebSocketManager"

export class WebManager {
    private webServerManager: WebServerManager = new WebServerManager()
    private webSocketManager: WebSocketManager = new WebSocketManager()

    constructor() {
        const { ip, port } = App.ConfigManager.getConfig().ws
        const webServer = this.webServerManager.createWebServer()
        this.webSocketManager.createWebSocket({ server: webServer })
        webServer.listen({
            host: ip,
            port,
        })
    }
}
