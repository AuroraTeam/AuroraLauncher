import { LauncherServerConfig } from "@root/components/config/utils/LauncherServerConfig";

import { AuthProvider, AuthProviderConfig } from "./AuthProvider";

export class RejectAuthProvider implements AuthProvider {
    protected message: string;

    constructor({ auth }: LauncherServerConfig) {
        const { message = "Access rejected" } = auth as RejectAuthProviderConfig;
        this.message = message;
    }

    authenticate(): never {
        throw new Error(this.message);
    }

    refresh(): never {
        throw new Error(this.message);
    }

    validate(): never {
        throw new Error(this.message);
    }

    invalidate(): never {
        throw new Error(this.message);
    }

    join(): never {
        throw new Error(this.message);
    }

    hasJoined(): never {
        throw new Error(this.message);
    }

    profile(): never {
        throw new Error(this.message);
    }

    profiles(): never {
        throw new Error(this.message);
    }
}

interface RejectAuthProviderConfig extends AuthProviderConfig {
    message: string;
}
