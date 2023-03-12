import { LauncherServerConfig } from "@root/components/config/utils/LauncherServerConfig"
import { ResponseError } from "aurora-rpc-server"

import { AuthProvider, AuthProviderConfig } from "./AuthProvider"

export class RejectAuthProvider implements AuthProvider {
    private message: string

    constructor({ auth }: LauncherServerConfig) {
        const { message = "Auth rejected" } = auth as RejectAuthProviderConfig
        this.message = message
    }

    auth(): never {
        throw new ResponseError(this.message, 110)
    }

    // These methods don't need implementation
    join(): void {}
    hasJoined(): void {}
    profile(): void {}
    privileges(): void {}
    profiles(): void {}
}

interface RejectAuthProviderConfig extends AuthProviderConfig {
    message: string
}
