import { LauncherServerConfig } from "@root/components/config/utils/LauncherServerConfig";

import { AuthProvider, AuthProviderConfig } from "./AuthProvider";

export class RejectAuthProvider implements AuthProvider {
    private message: string;

    constructor({ auth }: LauncherServerConfig) {
        const { message = "Auth rejected" } = auth as RejectAuthProviderConfig;
        this.message = message;
    }

    auth(): never {
        throw new Error(this.message);
    }

    join(): never {
        throw new Error();
    }

    hasJoined(): never {
        throw new Error();
    }

    profile(): never {
        throw new Error();
    }

    profiles(): never {
        throw new Error();
    }
}

interface RejectAuthProviderConfig extends AuthProviderConfig {
    message: string;
}
