import { App } from "../LauncherServer"
import { WebServerManager } from "./WebserverManager"
import { WebSocketManager } from "./WebSocketManager"

export class SocketManager {
    webServerManager: WebServerManager = new WebServerManager()
    webSocketManager: WebSocketManager = new WebSocketManager()

    constructor() {
        if (App.ConfigManager.getProperty("ws.enableListing")) {
            this.webServerManager.webServerInit()
            this.webSocketManager.webSocketServerInit({ server: this.webServerManager.webServer })
            this.webServerManager.webServer.listen(App.ConfigManager.getProperty("ws.port"))
        } else {
            this.webSocketManager.webSocketServerInit({ port: App.ConfigManager.getProperty("ws.port") })
        }
    }
}
