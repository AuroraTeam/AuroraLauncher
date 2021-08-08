import { ResponseError } from "../../api/websocket/types/ErrorResponse"
import { App } from "../../LauncherServer"
import { AbstractAuthProvider, AbstractAuthProviderConfig } from "../AbstractAuthProvider"

export class RejectAuthProvider extends AbstractAuthProvider {
    static type = "reject"
    private config: RejectAuthProviderConfig = {
        type: "reject",
        message: (App.ConfigManager.getConfig().auth as RejectAuthProviderConfig).message || "Auth rejected",
    }

    auth(): any {
        throw new ResponseError(200, this.config.message)
    }

    join(): any {
        return // Doesn't need implementation
    }

    hasJoined(): any {
        return // Doesn't need implementation
    }

    profile(): any {
        return // Doesn't need implementation
    }

    privileges(): any {
        return // Doesn't need implementation
    }

    profiles(): any {
        return // Doesn't need implementation
    }
}

interface RejectAuthProviderConfig extends AbstractAuthProviderConfig {
    message: string
}
