import { HttpHelper, JsonHelper } from "@aurora-launcher/core";
import { LauncherServerConfig } from "@root/components/config/utils/LauncherServerConfig";

import { AuthProvider, AuthProviderConfig } from "./AuthProvider";
import { MojangTextures, SkinableAuthProvider } from "./SkinableAuthProvider";

export class YggdrasilAuthProvider implements AuthProvider, SkinableAuthProvider {
    private config: YggdrasilAuthProviderConfig;

    constructor(config: LauncherServerConfig) {
        this.config = <YggdrasilAuthProviderConfig>config.auth;
        if (!this.config.url) {
            throw new Error("Yggdrasil auth url not set");
        }
    }

    authenticate(): never {
        throw new Error();
    }

    validate(): never {
        throw new Error();
    }

    refresh(): never {
        throw new Error();
    }

    invalidate(): never {
        throw new Error();
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

    async getSkinData(uuid: string) {
        let data: any;

        try {
            data = await HttpHelper.getResourceFromJson<any>(
                this.config.url + "/session/minecraft/profile/" + uuid,
            );
        } catch {
            return {};
        }

        const profile = JsonHelper.fromJson<MojangTextures>(
            Buffer.from(data.properties[0].value, "base64").toString("utf-8"),
        );

        return profile.textures;
    }
}

export interface YggdrasilAuthProviderConfig extends AuthProviderConfig {
    url: string;
}
