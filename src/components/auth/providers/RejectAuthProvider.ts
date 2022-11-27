import { LauncherServerConfig } from "@root/components/config/utils/LauncherServerConfig"
import { ResponseError } from "aurora-rpc-server"

import { AuthProvider, AuthProviderConfig } from "./AuthProvider"

export class RejectAuthProvider implements AuthProvider {
    private message: string

    constructor({ auth }: LauncherServerConfig) {
        this.message =
            (<RejectAuthProviderConfig>auth).message || "Auth rejected"
    }

    auth(): any {
        throw new ResponseError(this.message, 110)
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

interface RejectAuthProviderConfig extends AuthProviderConfig {
    message: string
}
