import { App } from "../LauncherServer"
import { WebServerManager } from "./WebServerManager"
import { WebSocketManager } from "./WebSocketManager"

export class SocketManager {
    webServerManager: WebServerManager = new WebServerManager()
    webSocketManager: WebSocketManager = new WebSocketManager()

    constructor() {
        const config = App.ConfigManager.getConfig().ws
        const serverConfig = {
            host: config.ip,
            port: config.port,
        }
        if (config.enableListing) {
            this.webServerManager.webServerInit()
            this.webSocketManager.webSocketServerInit({ server: this.webServerManager.webServer })
            this.webServerManager.webServer.listen(serverConfig)
        } else {
            this.webSocketManager.webSocketServerInit(serverConfig)
        }
    }
}
