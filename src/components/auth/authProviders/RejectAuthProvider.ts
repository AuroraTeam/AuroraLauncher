import { ConfigManager } from "@root/components/config"
import { AbstractAuthProvider, AbstractAuthProviderConfig } from "@root/utils"
import { ResponseError } from "aurora-rpc-server"

export class RejectAuthProvider implements AbstractAuthProvider {
    private message: string

    constructor(configManager: ConfigManager) {
        this.message =
            (<RejectAuthProviderConfig>configManager.config.auth).message ||
            "Auth rejected"
    }

    auth(): any {
        throw new ResponseError(this.message, 200)
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
