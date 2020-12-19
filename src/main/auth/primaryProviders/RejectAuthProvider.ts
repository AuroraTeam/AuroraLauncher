import { App } from "../../LauncherServer"
import { wsErrorResponseWithoutUUID } from "../../requests/types/AbstractRequest"
import { AbstractProvider } from "./AbstractProvider"

export class RejectAuthProvider extends AbstractProvider {
    type = "reject"
    config = new RejectAuthProviderConfig()

    emit(): wsErrorResponseWithoutUUID {
        return {
            code: 200,
            message: this.config.message,
        }
    }
}

export class RejectAuthProviderConfig {
    message: string = App.ConfigManager.getProperty("auth.primaryProvider.message", true) || "Auth rejected"
}
