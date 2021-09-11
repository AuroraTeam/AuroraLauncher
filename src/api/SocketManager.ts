import { App } from "../LauncherServer"
import { WebServerManager } from "./WebServerManager"
import { WebSocketManager } from "./WebSocketManager"

export class SocketManager {
    webServerManager: WebServerManager = new WebServerManager()
    webSocketManager: WebSocketManager = new WebSocketManager()

    constructor() {
        const { ip, port } = App.ConfigManager.getConfig().ws
        this.webServerManager.webServerInit()
        this.webSocketManager.webSocketServerInit({ server: this.webServerManager.webServer })
        this.webServerManager.webServer.listen({
            host: ip,
            port,
        })
    }
}
