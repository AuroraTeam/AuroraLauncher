import { AbstractAuthProvider, AbstractAuthProviderConfig } from "@root/utils"
import { ResponseError } from "aurora-rpc-server"

export class RejectAuthProvider extends AbstractAuthProvider {
    private message =
        (<RejectAuthProviderConfig>this.configManager.config.auth).message ||
        "Auth rejected"

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
