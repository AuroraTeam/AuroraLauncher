import { App } from "../LauncherServer"
import { WebServerManager } from "./WebserverManager"
import { WebSocketManager } from "./WebSocketManager"

export class SocketManager {
    webServerManager: WebServerManager = new WebServerManager()
    webSocketManager: WebSocketManager = new WebSocketManager()

    constructor() {
        const serverConfig = {
            host: App.ConfigManager.getProperty("ws.ip"),
            port: App.ConfigManager.getProperty("ws.port"),
        }
        if (App.ConfigManager.getProperty("ws.enableListing")) {
            this.webServerManager.webServerInit()
            this.webSocketManager.webSocketServerInit({ server: this.webServerManager.webServer })
            this.webServerManager.webServer.listen(serverConfig)
        } else {
            this.webSocketManager.webSocketServerInit(serverConfig)
        }
    }
}
